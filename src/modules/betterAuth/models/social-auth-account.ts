import { model } from "@medusajs/framework/utils"

/**
 * Link / audit record between a Better Auth identity and a Medusa customer.
 *
 * Better Auth owns the authentication identity (in its own `ba_*` tables);
 * Medusa owns the customer. This table is the explicit, queryable bridge the
 * admin can inspect ("which customers signed in with Google?") and the place
 * where the "link on verified email" policy is recorded when a Better Auth
 * session is first exchanged for a Medusa customer (wired in Phase 2).
 */
const SocialAuthAccount = model.define("social_auth_account", {
  id: model.id().primaryKey(),
  // The social/login provider as Better Auth reports it: "google", "facebook",
  // or "credential" for email+password.
  provider: model.text(),
  // Better Auth user id (ba_user.id).
  ba_user_id: model.text(),
  email: model.text().nullable(),
  email_verified: model.boolean().default(false),
  // The linked Medusa customer id, once resolved.
  customer_id: model.text().nullable(),
})

export default SocialAuthAccount
