import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../modules/marketing"

/**
 * Population of the `customer_campaign` table (the normalized per-customer /
 * per-campaign membership). Two sources feed it:
 *   - going forward: a synced Brevo contact's per-campaign statistics
 *     (`syncCustomerCampaignsFromContact`, called from the Brevo sync)
 *   - one-time backfill: the campaign ids already stored in
 *     `customer.metadata.brevo.sent_campaign_ids` (`backfill…FromMetadata`)
 *
 * Uniqueness is (source, campaign_id, customer_id); events are recorded once —
 * we only ever FILL a missing timestamp, never overwrite one.
 */

export type CampaignEvent = {
  campaign_id: string
  sent_at?: string | null
  opened_at?: string | null
  clicked_at?: string | null
  bounced_at?: string | null
}

const TIMESTAMP_KEYS = ["sent_at", "opened_at", "clicked_at", "bounced_at"] as const

/** Insert the (customer, campaign) row, or fill in any not-yet-recorded events. */
export async function upsertCustomerCampaign(
  marketing: any,
  customerId: string,
  source: string,
  row: CampaignEvent
): Promise<"created" | "updated" | "unchanged"> {
  const [existing] = await marketing.listCustomerCampaigns(
    { customer_id: customerId, source, campaign_id: row.campaign_id },
    { take: 1 }
  )

  if (!existing) {
    await marketing.createCustomerCampaigns({
      customer_id: customerId,
      source,
      campaign_id: row.campaign_id,
      sent_at: row.sent_at ?? null,
      opened_at: row.opened_at ?? null,
      clicked_at: row.clicked_at ?? null,
      bounced_at: row.bounced_at ?? null,
    })
    return "created"
  }

  const patch: Record<string, string> = {}
  for (const k of TIMESTAMP_KEYS) {
    if (!existing[k] && row[k]) patch[k] = row[k] as string
  }
  if (Object.keys(patch).length === 0) return "unchanged"

  await marketing.updateCustomerCampaigns({ id: existing.id, ...patch })
  return "updated"
}

// ── Going-forward feed: from a Brevo contact's per-campaign statistics ───────

type BrevoStatistics = {
  messagesSent?: { campaignId: number; eventTime?: string }[]
  opened?: { campaignId: number; eventTime?: string }[]
  clicked?: { campaignId: number; eventTime?: string }[]
  hardBounces?: { campaignId: number; eventTime?: string }[]
  softBounces?: { campaignId: number; eventTime?: string }[]
}

/**
 * Collapse a contact's statistics into one row per campaign. Brevo timestamps
 * events inconsistently (sent/opened carry `eventTime`, clicked/bounces often
 * don't), so where a timestamp is missing we record the observation time — the
 * NOT-NULL presence is what the priority tiers rely on, not the exact instant.
 */
export function campaignRowsFromContact(statistics?: BrevoStatistics): CampaignEvent[] {
  const rows = new Map<string, CampaignEvent>()
  const at = (t?: string) => t ?? new Date().toISOString()
  const touch = (id: number) => {
    const k = String(id)
    let r = rows.get(k)
    if (!r) {
      r = { campaign_id: k }
      rows.set(k, r)
    }
    return r
  }
  for (const e of statistics?.messagesSent ?? []) {
    const r = touch(e.campaignId)
    if (!r.sent_at) r.sent_at = at(e.eventTime)
  }
  for (const e of statistics?.opened ?? []) {
    const r = touch(e.campaignId)
    if (!r.opened_at) r.opened_at = at(e.eventTime)
  }
  for (const e of statistics?.clicked ?? []) {
    const r = touch(e.campaignId)
    if (!r.clicked_at) r.clicked_at = at(e.eventTime)
  }
  for (const e of [...(statistics?.hardBounces ?? []), ...(statistics?.softBounces ?? [])]) {
    const r = touch(e.campaignId)
    if (!r.bounced_at) r.bounced_at = at(e.eventTime)
  }
  return [...rows.values()]
}

/** Upsert all of a customer's Brevo campaigns from their contact statistics. */
export async function syncCustomerCampaignsFromContact(
  container: MedusaContainer,
  customerId: string,
  statistics?: BrevoStatistics
): Promise<number> {
  const marketing: any = container.resolve(MARKETING_MODULE)
  const rows = campaignRowsFromContact(statistics)
  for (const row of rows) {
    await upsertCustomerCampaign(marketing, customerId, "brevo", row)
  }
  return rows.length
}

// ── One-time backfill from customer.metadata.brevo.sent_campaign_ids ──────────

export type CampaignBackfillStats = {
  customers: number
  rowsCreated: number
  rowsUpdated: number
}

/**
 * Move the campaign ids already stored in metadata into customer_campaign rows.
 * Metadata only knows which campaigns were *sent* (sent_campaign_ids) and the
 * aggregate last_email_at — so these rows carry sent_at only; open/click/bounce
 * detail arrives later from the Brevo sync feed.
 */
export async function backfillCustomerCampaignsFromMetadata(
  container: MedusaContainer,
  options: { limit?: number } = {}
): Promise<CampaignBackfillStats> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerModule: any = container.resolve(Modules.CUSTOMER)
  const marketing: any = container.resolve(MARKETING_MODULE)

  const stats: CampaignBackfillStats = { customers: 0, rowsCreated: 0, rowsUpdated: 0 }
  let skip = 0
  const take = 500

  for (;;) {
    const page = await customerModule.listCustomers(
      {},
      { select: ["id", "metadata"], take, skip }
    )
    for (const c of page) {
      const brevo = (c.metadata?.brevo ?? null) as
        | { sent_campaign_ids?: number[]; last_email_at?: string | null }
        | null
      const ids = brevo?.sent_campaign_ids ?? []
      if (ids.length === 0) continue

      stats.customers++
      const sentAt = brevo?.last_email_at ?? null
      for (const id of ids) {
        const res = await upsertCustomerCampaign(marketing, c.id, "brevo", {
          campaign_id: String(id),
          sent_at: sentAt,
        })
        if (res === "created") stats.rowsCreated++
        else if (res === "updated") stats.rowsUpdated++
      }

      if (options.limit && stats.customers >= options.limit) {
        logger.info(
          `[campaign-backfill] hit limit ${options.limit}: ${stats.rowsCreated} created, ${stats.rowsUpdated} updated`
        )
        return stats
      }
    }
    if (page.length < take) break
    skip += take
  }

  logger.info(
    `[campaign-backfill] ✅ ${stats.customers} customers, ${stats.rowsCreated} rows created, ${stats.rowsUpdated} updated`
  )
  return stats
}
