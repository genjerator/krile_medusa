import { z } from "zod"

/** Body for POST /store/cookie-consent. */
export const PostCookieConsentSchema = z.object({
  event: z.enum(["shown", "accept", "decline"]),
})

export type PostCookieConsentSchema = z.infer<typeof PostCookieConsentSchema>
