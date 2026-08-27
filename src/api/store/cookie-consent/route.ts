import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  recordConsentEvent,
  consentBrandFromChannels,
} from "../../../lib/cookie-consent"
import { PostCookieConsentSchema } from "./validators"

/**
 * Records one cookie-banner interaction (shown / accept / decline) into Redis.
 * Brand is derived from the storefront's sales channel (via publishable key).
 * Always 204 — tracking is best-effort and must never surface an error to the UI.
 *   POST /store/cookie-consent  { event }
 */
export async function POST(
  req: MedusaStoreRequest<PostCookieConsentSchema>,
  res: MedusaResponse
) {
  try {
    const ids = req.publishable_key_context?.sales_channel_ids ?? []
    let names: string[] = []
    if (ids.length) {
      const scm: any = req.scope.resolve(Modules.SALES_CHANNEL)
      const scs = await scm.listSalesChannels({ id: ids }, { take: ids.length, select: ["name"] })
      names = scs.map((s: any) => s.name)
    }
    const brand = consentBrandFromChannels(names)
    await recordConsentEvent(brand, req.validatedBody.event)
  } catch {
    // best-effort — swallow everything
  }
  res.status(204).send()
}
