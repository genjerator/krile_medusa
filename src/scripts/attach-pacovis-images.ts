import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { uploadFilesWorkflow, updateProductsWorkflow } from "@medusajs/core-flows"
import * as fs from "fs"
import * as path from "path"

/**
 * Attach cleaned product images to their matching products by handle.
 *
 * Reads every image file in a folder (default: /Users/genjerator/Downloads/pacovis-clean,
 * override with an absolute path arg). The filename WITHOUT extension is treated
 * as the product handle, e.g. `ahorn-gewuerzmix.jpg` → handle `ahorn-gewuerzmix`.
 * Each image is uploaded through the configured File module (S3) and set as the
 * product's thumbnail + sole image.
 *
 * Idempotent: if a product's thumbnail already points at an uploaded copy of the
 * same handle (…/<handle>-<ULID>.<ext>), the file is skipped — so re-running does
 * not create duplicate S3 objects.
 *
 * Run:  pnpm medusa exec ./src/scripts/attach-pacovis-images.js [ /abs/path/to/folder ]
 */
const DEFAULT_DIR = "/Users/genjerator/Downloads/pacovis-clean"
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"])
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}
// Medusa appends -<ULID>.<ext> (26 uppercase alphanumerics) on upload.
const ulidSuffix = (handle: string) =>
  new RegExp(`/${handle}-[0-9A-Z]{26}\\.[^./]+$`)

export default async function attachPacovisImages({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)

  const dir = args?.[0] || DEFAULT_DIR
  if (!fs.existsSync(dir)) throw new Error(`Image folder not found: ${dir}`)

  const files = fs
    .readdirSync(dir)
    .filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()))
    .sort()

  logger.info(`🖼  Attaching ${files.length} images from ${dir}`)

  let attached = 0
  let skipped = 0
  const missing: string[] = []

  for (const file of files) {
    const ext = path.extname(file).toLowerCase()
    const handle = path.basename(file, path.extname(file))

    const [product] = await productModule.listProducts(
      { handle },
      { select: ["id", "handle", "thumbnail"], take: 1 }
    )
    if (!product) {
      missing.push(handle)
      logger.warn(`  ✗ no product for handle "${handle}" — skipping`)
      continue
    }

    if (product.thumbnail && ulidSuffix(handle).test(product.thumbnail)) {
      logger.info(`  • ${handle}: already has an uploaded image — skipping`)
      skipped++
      continue
    }

    const content = fs.readFileSync(path.join(dir, file)).toString("base64")
    const { result: uploaded } = await uploadFilesWorkflow(container).run({
      input: {
        files: [
          {
            filename: file,
            mimeType: MIME[ext] ?? "application/octet-stream",
            content,
            access: "public",
          },
        ],
      },
    })
    const url = (uploaded as any[])[0].url

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: { thumbnail: url, images: [{ url }] },
      },
    })

    logger.info(`  ✓ ${handle} → ${url}`)
    attached++
  }

  console.log(
    `ATTACH DONE: attached=${attached} skipped=${skipped} no_product=${missing.length}` +
      (missing.length ? `\n  missing handles: ${missing.join(", ")}` : "")
  )
}
