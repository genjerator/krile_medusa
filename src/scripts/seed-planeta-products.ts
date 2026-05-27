import path from "path"
import fs from "fs"
import {
  ExecArgs,
  IFileModuleService,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
} from "@medusajs/framework/types"
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
  slug: string
  description: string
  long_description?: string
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

const IMAGES_DIR  = path.resolve(process.cwd(), "../mysql/woo-exporter/images")
const PRODUCTS_JSON = path.resolve(process.cwd(), "../mysql/woo-exporter/products.json")

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
}

function toHandle(slug: string, id: number): string {
  return `planeta-${slug}-${id}`
}

function mimeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  return MIME[ext] ?? "application/octet-stream"
}

export default async function seedPlanetaProducts({ container }: ExecArgs) {
  const logger            = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService     = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService     = container.resolve(Modules.PRICING)
  const fileModule: IFileModuleService           = container.resolve(Modules.FILE)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query      = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting Planeta full product seed...")

  // ─── SALES CHANNEL ──────────────────────────────────────────────────────────
  const existingChannels = await salesChannelModule.listSalesChannels({ name: "PlanetaWebshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "PlanetaWebshop",
    description: "Planeta GmbH Webshop",
  }]))[0]
  logger.info(`  Sales channel: ${salesChannel.name} (${salesChannel.id})`)

  // ─── PRE-LOAD CATEGORIES ────────────────────────────────────────────────────
  const allCategories = await productModule.listProductCategories({}, { select: ["id", "handle"] })
  const categoryByHandle = new Map(allCategories.map(c => [c.handle, c.id]))

  // ─── LOAD PRODUCTS ──────────────────────────────────────────────────────────
  const allProducts: ProductEntry[] = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf-8"))
  logger.info(`  Loaded ${allProducts.length} products from JSON`)

  // ─── IMAGE UPLOAD CACHE ─────────────────────────────────────────────────────
  const uploadedCache = new Map<string, string>()

  const uploadImage = async (img: ImageEntry): Promise<string | null> => {
    if (uploadedCache.has(img.filename)) {
      return uploadedCache.get(img.filename)!
    }
    const localPath = path.join(IMAGES_DIR, img.filename)
    if (!fs.existsSync(localPath)) {
      return null
    }
    const content  = fs.readFileSync(localPath).toString("base64")
    const mimeType = mimeFromFilename(img.filename)
    try {
      const [uploaded] = await fileModule.createFiles([{
        filename: img.filename,
        mimeType,
        content,
        access: "public",
      }])
      uploadedCache.set(img.filename, uploaded.url)
      return uploaded.url
    } catch (err: any) {
      logger.warn(`    upload failed for ${img.filename}: ${err.message}`)
      return null
    }
  }

  // ─── UPSERT HELPER ──────────────────────────────────────────────────────────
  const upsertProduct = async (woo: ProductEntry, index: number, total: number) => {
    const handle = toHandle(woo.slug, woo.external_id)
    logger.info(`  [${index}/${total}] ${woo.title}`)

    // Resolve category IDs from pre-loaded map
    const categoryIds: string[] = []
    for (const cat of woo.categories ?? []) {
      const id = categoryByHandle.get(cat.slug)
      if (id) {
        categoryIds.push(id)
      } else {
        logger.warn(`    category not found: ${cat.slug} — run seed:planeta-categories first`)
      }
    }

    // Upload images
    const imageUrls: string[] = []
    if (woo.thumbnail) {
      const url = await uploadImage(woo.thumbnail)
      if (url) imageUrls.push(url)
    }
    for (const img of woo.images ?? []) {
      if (woo.thumbnail && img.filename === woo.thumbnail.filename) continue
      const url = await uploadImage(img)
      if (url) imageUrls.push(url)
    }

    // Check existing by handle first, then fall back to SKU
    const sku = woo.sku || `PLANETA-WOO-${woo.external_id}`
    const { data: found } = await query.graph({
      entity: "product",
      filters: { handle },
      fields: ["id", "variants.*"],
    })

    // SKU fallback — catches products created by the test seeder with a different handle
    if (!found[0]) {
      const existingVariants = await productModule.listProductVariants({ sku: [sku] }, { select: ["id", "product_id"] })
      if (existingVariants[0]) {
        const existingProduct = await productModule.listProducts(
          { id: [existingVariants[0].product_id!] },
          { select: ["id"], relations: ["variants"] }
        )
        if (existingProduct[0]) {
          found.push(existingProduct[0] as any)
        }
      }
    }

    let product: any
    if (found[0]) {
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
      logger.info(`    ↺ updated`)
    } else {
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
      logger.info(`    ✓ created`)
    }

    // Sales channel link
    await remoteLink.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    }).catch(() => {})

    // Price set (only if not already linked)
    const variants = product.variants ?? []
    const variant  = variants[0]
    if (variant && woo.price > 0) {
      const { data: variantData } = await query.graph({
        entity: "product_variant",
        filters: { id: variant.id },
        fields: ["id", "price_set.*"],
      })
      const hasPriceSet = (variantData[0] as any)?.price_set?.id
      if (!hasPriceSet) {
        const [priceSet] = await pricingModule.createPriceSets([{
          prices: [{ amount: woo.price, currency_code: "eur" }],
        }])
        await remoteLink.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.PRICING]: { price_set_id: priceSet.id },
        }).catch(() => {})
        logger.info(`    price: ${woo.price} EUR`)
      }
    }

    return product
  }

  // ─── SEED ALL PRODUCTS ──────────────────────────────────────────────────────
  let created = 0
  let updated = 0
  let skipped = 0

  for (let i = 0; i < allProducts.length; i++) {
    const woo = allProducts[i]
    if (!woo.categories?.length) {
      logger.info(`  [${i + 1}/${allProducts.length}] SKIP (no category): ${woo.title}`)
      skipped++
      continue
    }
    await upsertProduct(woo, i + 1, allProducts.length)
    // Count by checking log — simplest: just count all attempted
    created++ // updated counter is tracked inside upsertProduct via logger
  }

  logger.info("\n✅ Planeta product seed complete!")
  logger.info(`   Total in JSON:    ${allProducts.length}`)
  logger.info(`   Processed:        ${created}`)
  logger.info(`   Skipped (no cat): ${skipped}`)
  logger.info(`   Sales channel:    ${salesChannel.name}`)
  logger.info(`   Images uploaded:  ${uploadedCache.size} unique files`)
}
