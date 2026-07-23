import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STOREFRONT_BRANDING_MODULE } from "../../../modules/storefrontBranding"

/**
 * GET /store/branding
 *
 * Returns the branding for the caller's storefront — resolved from the sales
 * channel(s) linked to the publishable API key, so each domain automatically
 * gets its own hero + accent color with no host detection. Public (needs a
 * valid publishable key like all /store routes).
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(STOREFRONT_BRANDING_MODULE)

  const scIds = (req as any).publishable_key_context?.sales_channel_ids as string[] | undefined
  if (!scIds || scIds.length === 0) {
    return res.json({ branding: null })
  }

  const rows = await service.listStorefrontBrandings(
    { sales_channel_id: scIds },
    { take: 1 }
  )
  res.json({ branding: rows[0] ?? null })
}
