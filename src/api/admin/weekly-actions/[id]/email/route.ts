import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { WEEKLY_ACTION_MODULE } from "../../../../../modules/weeklyAction"
import {
  renderWeeklyActionEmail,
  type WeeklyEmailProduct,
} from "../../../../../lib/email-templates/weekly-action/render"
import {
  EMAIL_DIR,
  emailExists,
  emailFileName,
  emailFilePath,
} from "../../../../../lib/email-templates/weekly-action/storage"

// Prices are stored as-is in Medusa (49.99 is 49.99, NOT cents). Round to 2dp.
const roundMoney = (n: number): number => Math.round(n * 100) / 100

/**
 * Renders the weekly-action email HTML for THIS action from its stored per-item
 * discount rules — pricing mirrors `sync-weekly-action-prices`, so the "was/now"
 * here matches the sale prices the shop renders.
 */
async function buildHtml(req: MedusaRequest, id: string): Promise<string> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const waService: any = req.scope.resolve(WEEKLY_ACTION_MODULE)

  const action: any = await waService.retrieveWeeklyAction(id, { relations: ["items"] })
  const items: any[] = action?.items ?? []
  if (!items.length) throw new Error("This weekly action has no products yet.")

  const productIds = items.map((i) => i.product_id)
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "images.url",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.prices.price_rules.value",
    ],
    filters: { id: productIds },
  })

  const CURRENCY = (process.env.WEEKLY_EMAIL_CURRENCY || "eur").toLowerCase()
  const ruleByProduct = new Map<string, any>(items.map((i) => [i.product_id, i]))
  const productById = new Map<string, any>((products as any[]).map((p) => [p.id, p]))

  const emailProducts: WeeklyEmailProduct[] = []
  for (const pid of productIds) {
    const product: any = productById.get(pid)
    const rule: any = ruleByProduct.get(pid)
    if (!product || !rule) continue

    const basePrices: { amount: number; currency: string }[] = []
    for (const variant of product.variants ?? []) {
      for (const price of variant.prices ?? []) {
        if ((price.price_rules?.length ?? 0) > 0) continue // base (currency-only) prices only
        basePrices.push({
          amount: Number(price.amount),
          currency: String(price.currency_code).toLowerCase(),
        })
      }
    }
    const inCurrency = basePrices.filter((p) => p.currency === CURRENCY)
    const pool = inCurrency.length ? inCurrency : basePrices
    if (!pool.length) continue
    pool.sort((a, b) => a.amount - b.amount) // cheapest variant → the "from" price
    const base = pool[0]

    const was = roundMoney(base.amount)
    let now =
      rule.discount_type === "percentage"
        ? roundMoney(was * (1 - rule.discount_value / 100))
        : roundMoney(rule.discount_value)
    if (now < 0) now = 0
    const pct = was > now ? Math.round((1 - now / was) * 100) : 0

    emailProducts.push({
      title: product.title ?? pid,
      handle: product.handle ?? "",
      image: product.thumbnail ?? product.images?.[0]?.url ?? "",
      was,
      now,
      pct,
      currency: base.currency,
    })
  }

  if (!emailProducts.length) throw new Error("No priced products to render for this action.")

  const storefrontUrl = (
    process.env.WEEKLY_STOREFRONT_URL ||
    process.env.STOREFRONT_URL ||
    process.env.STORE_URL ||
    "https://www.planeta.de"
  ).replace(/\/$/, "")

  return renderWeeklyActionEmail({
    weeklyAction: { title: action.title, ends_at: action.ends_at },
    products: emailProducts,
    storefrontUrl,
    locale: "de",
    country: "de",
    logoUrl: process.env.WEEKLY_LOGO_URL || "https://www.planeta.de/planeta_logo_blue.png",
  })
}

/** Generate the email HTML for this action and save it to disk. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  try {
    const html = await buildHtml(req, id)
    mkdirSync(EMAIL_DIR, { recursive: true })
    writeFileSync(emailFilePath(id), html, "utf8")
    return res.json({ ok: true, filename: emailFileName(id) })
  } catch (e: any) {
    return res.status(400).json({ message: e?.message ?? "Could not generate email HTML" })
  }
}

/** Return the previously generated email HTML for this action, if it exists. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  if (!emailExists(id)) {
    return res.json({ exists: false })
  }
  const html = readFileSync(emailFilePath(id), "utf8")
  return res.json({ exists: true, filename: emailFileName(id), html })
}
