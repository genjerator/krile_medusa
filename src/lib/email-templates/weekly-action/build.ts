import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"
import { renderWeeklyActionEmail, WeeklyEmailProduct } from "./render"

/**
 * Assembles a weekly-action email (subject + HTML) from a weekly action id,
 * in-container (no HTTP). Mirrors the mapping in generate.mts but resolves prices
 * via query.graph + QueryContext instead of the store API. Product links always
 * point at www.planeta.de (same as generate.mts).
 */

// Product links always target the live storefront.
const STOREFRONT_URL = "https://www.planeta.de"
const LOGO_URL = process.env.WEEKLY_LOGO_URL || "https://www.planeta.de/planeta_logo_blue.png"

function toEmailProduct(product: any): WeeklyEmailProduct | null {
  const priced = (product.variants || [])
    .map((v: any) => v.calculated_price)
    .filter((p: any) => p && p.calculated_amount != null)
  if (!priced.length) return null
  priced.sort((a: any, b: any) => a.calculated_amount - b.calculated_amount)
  const p = priced[0]
  const now = Number(p.calculated_amount)
  const was = Number(p.original_amount ?? p.calculated_amount)
  const pct = was > now ? Math.round((1 - now / was) * 100) : 0
  return {
    title: product.title ?? product.id,
    handle: product.handle ?? "",
    image: product.thumbnail ?? product.images?.[0]?.url ?? "",
    was,
    now,
    pct,
    currency: p.currency_code,
  }
}

export async function buildWeeklyActionEmail(
  container: MedusaContainer,
  opts: { weeklyActionId: string; country?: string }
): Promise<{ subject: string; html: string; productCount: number }> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const country = (opts.country ?? "de").toLowerCase()

  // 1) Weekly action + its items (ordered by rank → the email/product order).
  const { data: actions } = await query.graph({
    entity: "weekly_action",
    filters: { id: opts.weeklyActionId },
    fields: ["id", "title", "email_subject", "ends_at", "iso_week", "year", "items.product_id", "items.rank"],
  })
  const wa: any = actions[0]
  if (!wa) throw new Error(`Weekly action ${opts.weeklyActionId} not found`)

  const productIds: string[] = (wa.items ?? [])
    .slice()
    .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((i: any) => i.product_id)
    .filter(Boolean)
  if (!productIds.length) throw new Error("Weekly action has no products")

  // 2) Region for pricing (match the country, else first).
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "countries.iso_2"],
  })
  const region: any =
    regions.find((r: any) =>
      (r.countries ?? []).some((c: any) => String(c.iso_2).toLowerCase() === country)
    ) ?? regions[0]
  if (!region) throw new Error("No region configured")

  // 3) Products with calculated (sale) price for that region.
  const { data: products } = await query.graph({
    entity: "product",
    filters: { id: productIds },
    fields: ["id", "title", "handle", "thumbnail", "images.url", "variants.calculated_price.*"],
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region.id,
          currency_code: region.currency_code,
        }),
      },
    },
  })
  const byId = new Map(products.map((p: any) => [p.id, p]))
  const emailProducts = productIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map(toEmailProduct)
    .filter((p): p is WeeklyEmailProduct => !!p)
  if (!emailProducts.length) throw new Error("No resolvable products with prices")

  const utmCampaign =
    wa.iso_week && wa.year ? `wochenaktion-kw${wa.iso_week}-${wa.year}` : `weekly-action-${wa.id}`

  const html = renderWeeklyActionEmail({
    weeklyAction: { title: wa.title, ends_at: wa.ends_at },
    products: emailProducts,
    storefrontUrl: STOREFRONT_URL,
    locale: country,
    country,
    logoUrl: LOGO_URL,
    utm: {
      source: "newsletter",
      medium: "email",
      campaign: utmCampaign,
      id: wa.id, // GA4 campaign id — matches the SES campaign_id tag
    },
  })

  const subject = (wa.email_subject && String(wa.email_subject).trim()) || wa.title || "Wochenaktion"
  return { subject, html, productCount: emailProducts.length }
}
