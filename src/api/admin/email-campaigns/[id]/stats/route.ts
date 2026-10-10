import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../../../modules/marketing"
import { parseGroupSendAudience } from "../../../../../lib/ses/campaign-groups"

type Metrics = {
  sent: number
  delivered: number
  opened: number
  clicked: number
  unsubscribed: number
  bounced: number
  complained: number
  failed: number
  skipped: number
  queued: number
  pending: number
  total: number
}

function rate(num: number, den: number): number {
  if (den <= 0) return 0
  return Math.round((num / den) * 1000) / 10 // one decimal percent
}

function withRates(m: Metrics) {
  return {
    ...m,
    rates: {
      delivered: rate(m.delivered, m.sent),
      // Open/click rates are quoted against delivered (the standard denominator).
      opened: rate(m.opened, m.delivered || m.sent),
      clicked: rate(m.clicked, m.delivered || m.sent),
      click_to_open: rate(m.clicked, m.opened),
      unsubscribed: rate(m.unsubscribed, m.sent),
      bounced: rate(m.bounced, m.sent),
    },
  }
}

/**
 * GET /admin/email-campaigns/:id/stats
 * Per-group and rolled-up engagement for the campaign's graphs. Outbox truth
 * (sent/failed/skipped/queued/pending) comes from `ses_emails`; engagement
 * (delivered/opened/clicked/unsubscribed/bounced/complained) from `customer_campaign`
 * keyed on each group-send's tracking id (= its `ses_batch.id`). Rates are percents
 * (one decimal). NOTE: opens are inflated by Apple Mail Privacy Protection — lead
 * with clicks/unsubscribes.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const id = req.params.id

  const campaign = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!campaign) return res.status(404).json({ message: "Campaign not found" })

  const batches = await pg("ses_batch")
    .where({ campaign_id: id })
    .whereNull("deleted_at")
    .select("id", "audience")
    .orderBy("created_at", "asc")

  const batchIds: string[] = batches.map((b: any) => b.id)
  const groupIds = batches
    .map((b: any) => parseGroupSendAudience(b.audience)?.groupId)
    .filter(Boolean) as string[]

  const nameById: Record<string, string> = {}
  if (groupIds.length) {
    const groups = await pg("customer_group").whereIn("id", groupIds).select("id", "name")
    for (const g of groups as any[]) nameById[g.id] = g.name
  }

  // Outbox status counts per batch.
  const outbox: Record<string, Record<string, number>> = {}
  if (batchIds.length) {
    const rows = await pg("ses_emails")
      .whereIn("batch_id", batchIds)
      .groupBy("batch_id", "status")
      .select("batch_id", "status")
      .count("* as c")
    for (const r of rows as any[]) (outbox[r.batch_id] ??= {})[r.status] = Number(r.c)
  }

  // Engagement per batch (tracking id = batch id).
  const engage: Record<string, any> = {}
  if (batchIds.length) {
    const rows = await pg("customer_campaign")
      .where("source", "ses")
      .whereIn("campaign_id", batchIds)
      .whereNull("deleted_at")
      .groupBy("campaign_id")
      .select("campaign_id")
      .select(
        pg.raw(`COUNT(*) FILTER (WHERE delivered_at IS NOT NULL) as delivered`),
        pg.raw(`COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened`),
        pg.raw(`COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked`),
        pg.raw(`COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) as unsubscribed`),
        pg.raw(`COUNT(*) FILTER (WHERE bounced_at IS NOT NULL) as bounced`),
        pg.raw(`COUNT(*) FILTER (WHERE complained_at IS NOT NULL) as complained`)
      )
    for (const r of rows as any[]) engage[r.campaign_id] = r
  }

  const groups = batches.map((b: any) => {
    const gid = parseGroupSendAudience(b.audience)?.groupId ?? null
    const ob = outbox[b.id] ?? {}
    const eg = engage[b.id] ?? {}
    const m: Metrics = {
      sent: Number(ob.sent ?? 0),
      delivered: Number(eg.delivered ?? 0),
      opened: Number(eg.opened ?? 0),
      clicked: Number(eg.clicked ?? 0),
      unsubscribed: Number(eg.unsubscribed ?? 0),
      bounced: Number(eg.bounced ?? 0),
      complained: Number(eg.complained ?? 0),
      failed: Number(ob.failed ?? 0),
      skipped: Number(ob.skipped ?? 0),
      queued: Number(ob.queued ?? 0),
      pending: Number(ob.pending ?? 0) + Number(ob.sending ?? 0),
      total: Object.values(ob).reduce((s: number, n: any) => s + Number(n), 0),
    }
    return { batch_id: b.id, group_id: gid, group_name: gid ? nameById[gid] ?? null : null, ...withRates(m) }
  })

  // Totals = sum across groups.
  const sum = (k: keyof Metrics) => groups.reduce((s, g) => s + (g as any)[k], 0)
  const totals: Metrics = {
    sent: sum("sent"),
    delivered: sum("delivered"),
    opened: sum("opened"),
    clicked: sum("clicked"),
    unsubscribed: sum("unsubscribed"),
    bounced: sum("bounced"),
    complained: sum("complained"),
    failed: sum("failed"),
    skipped: sum("skipped"),
    queued: sum("queued"),
    pending: sum("pending"),
    total: sum("total"),
  }

  res.json({
    campaign: { id: campaign.id, name: campaign.name, status: campaign.status },
    totals: withRates(totals),
    groups,
  })
}
