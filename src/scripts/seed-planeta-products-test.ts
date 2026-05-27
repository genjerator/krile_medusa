import path from "path"
import fs from "fs"
import { ExecArgs, IFileModuleService, IProductModuleService, ISalesChannelModuleService, IPricingModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

interface ImageEntry {
  attachment_id: number
  original_url: string
  local_path?: string
  filename: string
}

interface ProductEntry {
  external_id: number
  title: string
  description: string
  status: string
  sku: string
  price: number
  regular_price: number
  sale_price?: number
  stock_status: string
  manage_stock: boolean
  stock?: number
  categories: { name: string; slug: string }[]
  thumbnail?: ImageEntry
  images: ImageEntry[]
}

const IMAGES_DIR    = path.resolve(process.cwd(), "../mysql/woo-exporter/images")
const PRODUCTS_JSON = path.resolve(process.cwd(), "products.json")
const IMAGES_BASE_URL = process.env.IMAGES_BASE_URL
  ?? (process.env.S3_FILE_URL ? `${process.env.S3_FILE_URL}/planeta_admin` : "")

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
}

function toHandle(title: string, id: number): string {
  return (
    "planeta-" +
    title
      .toLowerCase()
      .replace(/[äÄ]/g, "ae")
      .replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue")
      .replace(/[ß]/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" + id
  )
}

function mimeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  return MIME[ext] ?? "application/octet-stream"
}

export default async function seedPlanetaProductsTest({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const fileModule: IFileModuleService = container.resolve(Modules.FILE)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting Planeta products test seed (2 products)...")

  // ─── SALES CHANNEL ────────────────────────────────────────────────────────
  const existingChannels = await salesChannelModule.listSalesChannels({ name: "PlanetaWebshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "PlanetaWebshop",
    description: "Planeta GmbH Webshop",
  }]))[0]
  logger.info(`  Sales channel: ${salesChannel.name} (${salesChannel.id})`)

  // ─── LOAD JSON ────────────────────────────────────────────────────────────
  const allProducts: ProductEntry[] = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf-8"))
  const testProducts = allProducts
    .filter(p => p.price > 0 && p.categories?.length > 0)
    .slice(0, 2)

  logger.info(`  Selected ${testProducts.length} test products`)

  // ─── IMAGE UPLOAD HELPER ─────────────────────────────────────────────────
  // Cache url → medusa url to avoid re-uploading the same file
  const uploadedCache = new Map<string, string>()

  const uploadImage = async (img: ImageEntry): Promise<string | null> => {
    if (uploadedCache.has(img.filename)) {
      return uploadedCache.get(img.filename)!
    }
    if (IMAGES_BASE_URL) {
      const url = `${IMAGES_BASE_URL}/${img.filename}`
      uploadedCache.set(img.filename, url)
      return url
    }
    const localPath = path.join(IMAGES_DIR, img.filename)
    if (!fs.existsSync(localPath)) {
      logger.info(`    skip image (not on disk): ${img.filename}`)
      return null
    }
    const content = fs.readFileSync(localPath).toString("base64")
    const mimeType = mimeFromFilename(img.filename)
    try {
      const [uploaded] = await fileModule.createFiles([{
        filename: img.filename,
        mimeType,
        content,
        access: "public",
      }])
      logger.info(`    uploaded: ${img.filename} → ${uploaded.url}`)
      uploadedCache.set(img.filename, uploaded.url)
      return uploaded.url
    } catch (err: any) {
      logger.warn(`    upload failed for ${img.filename}: ${err.message}`)
      return null
    }
  }

  // ─── PRODUCT UPSERT HELPER ────────────────────────────────────────────────
  const upsertProduct = async (woo: ProductEntry) => {
    const handle = toHandle(woo.title, woo.external_id)
    logger.info(`\n  Processing: ${woo.title} (handle: ${handle})`)

    // ── Resolve category IDs ────────────────────────────────────────────────
    const categoryIds: string[] = []
    for (const cat of woo.categories ?? []) {
      const found = await productModule.listProductCategories({ handle: [cat.slug] })
      if (found[0]) {
        categoryIds.push(found[0].id)
      } else {
        logger.warn(`    category not found: ${cat.slug} — run seed:planeta-categories first`)
      }
    }

    // ── Upload images ───────────────────────────────────────────────────────
    const imageUrls: string[] = []

    // thumbnail first (appears first in the images array)
    if (woo.thumbnail) {
      const url = await uploadImage(woo.thumbnail)
      if (url) imageUrls.push(url)
    }

    for (const img of woo.images ?? []) {
      // skip if same filename as thumbnail (already uploaded)
      if (woo.thumbnail && img.filename === woo.thumbnail.filename) continue
      const url = await uploadImage(img)
      if (url) imageUrls.push(url)
    }

    // ── Check if product exists ─────────────────────────────────────────────
    const { data: found } = await query.graph({
      entity: "product",
      filters: { handle },
      fields: ["id", "variants.*"],
    })

    let product: any
    if (found[0]) {
      logger.info(`    ↺ updating existing product`)
      await productModule.updateProducts(
        { id: (found[0] as any).id },
        {
          title: woo.title,
          description: woo.description || undefined,
          status: woo.status as any,
          images: imageUrls.map(url => ({ url })),
          category_ids: categoryIds,
        }
      )
      product = found[0]
    } else {
      logger.info(`    ✓ creating product`)
      const [created] = await productModule.createProducts([{
        title: woo.title,
        handle,
        description: woo.description || undefined,
        status: woo.status as any,
        images: imageUrls.map(url => ({ url })),
        category_ids: categoryIds,
        options: [{ title: "Default", values: ["Default"] }],
        variants: [{
          title: woo.title,
          sku: woo.sku || `PLANETA-WOO-${woo.external_id}`,
          manage_inventory: woo.manage_stock,
          allow_backorder: !woo.manage_stock,
          options: { Default: "Default" },
          metadata: {
            woo_external_id: woo.external_id,
            woo_stock_status: woo.stock_status,
          },
        }],
        metadata: {
          woo_external_id: woo.external_id,
          woo_stock_status: woo.stock_status,
        },
      }])
      product = created
    }

    // ── Sales channel link ──────────────────────────────────────────────────
    await remoteLink.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    }).catch(() => logger.info(`    sales channel link already exists`))

    // ── Price set ───────────────────────────────────────────────────────────
    const variants = product.variants ?? []
    const variant = variants[0]
    if (variant) {
      // Check if price link already exists before creating a new one
      const { data: existingLinks } = await query.graph({
        entity: "product_variant",
        filters: { id: variant.id },
        fields: ["id", "price_set.*"],
      })

      const hasPriceSet = (existingLinks[0] as any)?.price_set?.id

      if (!hasPriceSet) {
        const [priceSet] = await pricingModule.createPriceSets([{
          prices: [{ amount: woo.price, currency_code: "eur" }],
        }])
        await remoteLink.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.PRICING]: { price_set_id: priceSet.id },
        }).catch(() => logger.info(`    price link already exists`))
        logger.info(`    price set: ${woo.price} EUR`)
      } else {
        logger.info(`    price set already linked, skipping`)
      }
    }

    return product
  }

  // ─── SEED PRODUCTS ────────────────────────────────────────────────────────
  for (const woo of testProducts) {
    await upsertProduct(woo)
  }

  logger.info("\n✅ Planeta products test seed complete!")
  logger.info(`   Sales channel: ${salesChannel.name}`)
  logger.info(`   Products seeded: ${testProducts.length}`)
}
