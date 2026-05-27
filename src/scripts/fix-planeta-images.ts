import { ExecArgs, IProductModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

const PREFIX      = "planeta_admin/"
const S3_BUCKET   = process.env.S3_BUCKET!
const S3_FILE_URL = process.env.S3_FILE_URL!
const S3_REGION   = process.env.S3_REGION ?? "eu-central-1"

// Matches the -<ULID>.<ext> suffix Medusa appends on upload
// ULID = 26 uppercase alphanumeric chars
const ULID_SUFFIX = /-[0-9A-Z]{26}(\.[^.]+)$/

export default async function fixPlanetaImages({ container }: ExecArgs) {
  const logger        = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve<IProductModuleService>(Modules.PRODUCT)

  logger.info("🔧 Fixing Planeta product image URLs...")

  // ─── LIST ALL S3 OBJECTS UNDER planeta_admin/ ────────────────────────────
  const s3 = new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId:     process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  })

  const s3Keys: string[] = []
  let token: string | undefined
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: PREFIX,
      ContinuationToken: token,
    }))
    for (const obj of res.Contents ?? []) {
      if (obj.Key) s3Keys.push(obj.Key)
    }
    token = res.NextContinuationToken
  } while (token)

  logger.info(`  Found ${s3Keys.length} S3 objects under ${PREFIX}`)

  // Build map: "Planeta-PX4500-06.jpg" → "planeta_admin/Planeta-PX4500-06-01KXXX.jpg"
  // If the same base exists multiple times (re-uploads), keep the last (highest ULID = newest)
  const keyMap = new Map<string, string>()
  for (const key of s3Keys) {
    const filename = key.slice(PREFIX.length)
    const match    = filename.match(ULID_SUFFIX)
    if (!match) continue
    const ext      = match[1]                          // ".jpg"
    const baseName = filename.replace(ULID_SUFFIX, ext) // "Planeta-PX4500-06.jpg"
    const existing = keyMap.get(baseName)
    // ULIDs are lexicographically sortable — keep the larger one (more recent)
    if (!existing || key > existing) {
      keyMap.set(baseName, key)
    }
  }
  logger.info(`  Mapped ${keyMap.size} unique base filenames`)

  // ─── LOAD ALL PLANETA PRODUCTS ────────────────────────────────────────────
  const allProducts: any[] = []
  const PAGE = 100
  let offset  = 0
  while (true) {
    const page = await productModule.listProducts(
      {},
      { select: ["id", "handle"], relations: ["images"], skip: offset, take: PAGE }
    )
    allProducts.push(...page.filter((p: any) => p.handle?.startsWith("planeta-")))
    if (page.length < PAGE) break
    offset += PAGE
  }
  logger.info(`  Found ${allProducts.length} planeta products`)

  let fixed   = 0
  let skipped = 0

  for (const product of allProducts) {
    const images: any[] = product.images ?? []

    // A URL is "wrong" if it doesn't have the ULID suffix
    const hasWrong = images.some((img: any) => !ULID_SUFFIX.test(img.url))
    if (!hasWrong) { skipped++; continue }

    const newImages = images.map((img: any) => {
      if (ULID_SUFFIX.test(img.url)) return { url: img.url }

      // Extract basename from wrong URL
      // Wrong URL can be like: https://.../planeta_admin/Planeta-PX4500-06.jpg
      const decoded  = decodeURIComponent(img.url)
      const parts    = decoded.split("/")
      const basename = parts[parts.length - 1]

      const correctKey = keyMap.get(basename)
      if (correctKey) {
        const correctUrl = `${S3_FILE_URL}/${encodeURIComponent(correctKey)}`
        logger.info(`  ✓ ${product.handle}: ${basename} → ${correctKey}`)
        return { url: correctUrl }
      }

      logger.warn(`  ✗ ${product.handle}: no S3 match for ${basename}`)
      return { url: img.url }
    })

    await productModule.updateProducts({ id: product.id }, { images: newImages })
    fixed++
  }

  logger.info(`\n✅ Done! Fixed: ${fixed} products, skipped: ${skipped} (already correct)`)
}
