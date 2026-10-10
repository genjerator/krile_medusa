/**
 * Helpers for campaign GROUP-SENDS — the `ses_batch` rows a campaign owns, one per
 * assigned customer group.
 *
 * Audience namespace: `cmp:<campaignId>:<groupId>`. Deliberately distinct from the
 * prototype's `test` / `ramp#NN` / `group:<id>` audiences so the prototype's
 * audience-keyed listing and REPLACE-delete never touch campaign batches. The
 * owning campaign is also stamped on `ses_batch.campaign_id` for indexed lookups.
 */

export const GROUP_SEND_PREFIX = "cmp:"

export function groupSendAudience(campaignId: string, groupId: string): string {
  return `${GROUP_SEND_PREFIX}${campaignId}:${groupId}`
}

export function parseGroupSendAudience(
  audience: string | null | undefined
): { campaignId: string; groupId: string } | null {
  if (!audience || !audience.startsWith(GROUP_SEND_PREFIX)) return null
  const rest = audience.slice(GROUP_SEND_PREFIX.length)
  const sep = rest.indexOf(":")
  if (sep <= 0 || sep >= rest.length - 1) return null
  return { campaignId: rest.slice(0, sep), groupId: rest.slice(sep + 1) }
}

export type GroupRecipient = {
  customer_id: string
  to_email: string
  unsubscribed: boolean
  user_type: string | null
}

/** A test customer (user_type="test") is exempt from one-per-campaign dedupe. */
export function isTestRecipient(r: { user_type: string | null }): boolean {
  return r.user_type === "test"
}

/**
 * The mailable members of a customer group: a real email, not deleted. The
 * `unsubscribed` flag is carried so the generator can insert suppressed recipients
 * as `skipped` up front (the send path re-checks it authoritatively anyway), and
 * `user_type` so the generator can exempt test customers from dedupe.
 * Mirrors the recipient SQL in `POST /admin/ses-emails/generate`.
 */
export async function resolveGroupRecipients(pg: any, groupId: string): Promise<GroupRecipient[]> {
  const rows = await pg("customer_group_customer as cgc")
    .join("customer as c", "c.id", "cgc.customer_id")
    .leftJoin("marketing_profile as mp", "mp.customer_id", "c.id")
    .where("cgc.customer_group_id", groupId)
    .whereNull("cgc.deleted_at")
    .whereNull("c.deleted_at")
    .whereNotNull("c.email")
    .select("c.id as customer_id", "c.email as to_email", "mp.user_type as user_type")
    .select(pg.raw("COALESCE(mp.unsubscribed, false) as unsubscribed"))
    .orderBy("c.email")
  return rows as GroupRecipient[]
}
