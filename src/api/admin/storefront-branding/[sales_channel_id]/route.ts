import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STOREFRONT_BRANDING_MODULE } from "../../../../modules/storefrontBranding"

/**
 * GET/POST /admin/storefront-branding/:sales_channel_id
 *
 * Read or upsert the branding row for one sales channel. Backs the branding
 * editor widget on the admin sales-channel detail page.
 */

const FIELDS = ["hero_image_url", "hero_title", "hero_subtitle", "primary_color"] as const

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(STOREFRONT_BRANDING_MODULE)
  const scId = req.params.sales_channel_id
  const [branding] = await service.listStorefrontBrandings({ sales_channel_id: scId }, { take: 1 })
  res.json({ branding: branding ?? null })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(STOREFRONT_BRANDING_MODULE)
  const scId = req.params.sales_channel_id
  const body = (req.body ?? {}) as Record<string, unknown>

  const patch: Record<string, string | null> = {}
  for (const f of FIELDS) {
    if (f in body) {
      const v = body[f]
      patch[f] = typeof v === "string" && v.trim() !== "" ? v.trim() : null
    }
  }

  const [existing] = await service.listStorefrontBrandings({ sales_channel_id: scId }, { take: 1 })

  let branding
  if (existing) {
    branding = await service.updateStorefrontBrandings({ id: existing.id, ...patch })
  } else {
    branding = await service.createStorefrontBrandings({ sales_channel_id: scId, ...patch })
  }
  res.json({ branding })
}
