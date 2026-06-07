import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"
import NewsletterModuleService from "../../../modules/newsletter/service"

export const PostNewsletterSchema = z.object({
  customer_id: z.string(),
  subscribed:  z.boolean(),
})

type PostNewsletterBody = z.infer<typeof PostNewsletterSchema>

export async function POST(
  req: MedusaRequest<PostNewsletterBody>,
  res: MedusaResponse
) {
  const { customer_id, subscribed } = req.validatedBody

  const service = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE)

  const existing = await service.listNewsletterPreferences({ customer_id })

  if (existing.length) {
    await service.updateNewsletterPreferences({
      id: existing[0].id,
      subscribed,
    })
  } else {
    await service.createNewsletterPreferences({ customer_id, subscribed })
  }

  res.json({ success: true })
}
