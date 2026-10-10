import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../modules/marketing"

type CreateBody = { name?: string; weekly_action_id?: string; subject?: string }

/**
 * GET /admin/email-campaigns
 * Lists campaigns (newest first) for the admin Campaigns page, each enriched with
 * the owning weekly action's title and a count of its assigned group-sends.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)

  const [campaigns, count] = await marketing.listAndCountEmailCampaigns(
    {},
    { order: { created_at: "DESC" }, take: 200 }
  )

  const ids = campaigns.map((c: any) => c.id)
  const waIds: string[] = Array.from(
    new Set(campaigns.map((c: any) => c.weekly_action_id).filter(Boolean) as string[])
  )

  // Weekly-action titles (for display) + group-send counts, in one pass each.
  const waTitle: Record<string, string> = {}
  if (waIds.length) {
    const was = await pg("weekly_action").whereIn("id", waIds).select("id", "title")
    for (const w of was as any[]) waTitle[w.id] = w.title
  }
  const groupCount: Record<string, number> = {}
  if (ids.length) {
    const rows = await pg("ses_batch")
      .whereIn("campaign_id", ids)
      .whereNull("deleted_at")
      .groupBy("campaign_id")
      .select("campaign_id")
      .count("* as c")
    for (const r of rows as any[]) groupCount[r.campaign_id] = Number(r.c)
  }

  const result = campaigns.map((c: any) => ({
    ...c,
    weekly_action_title: waTitle[c.weekly_action_id] ?? null,
    group_count: groupCount[c.id] ?? 0,
  }))
  res.json({ campaigns: result, count })
}

/**
 * POST /admin/email-campaigns  { name, weekly_action_id, subject? }
 * Creates a draft campaign bound to one weekly action. Subject is optional — the
 * send path falls back to the weekly action's email_subject, then its title.
 */
export async function POST(req: AuthenticatedMedusaRequest<CreateBody>, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)

  const name = (req.body?.name ?? "").trim()
  const weeklyActionId = (req.body?.weekly_action_id ?? "").trim()
  const subject = (req.body?.subject ?? "").trim() || null
  if (!name) return res.status(400).json({ message: "name is required" })
  if (!weeklyActionId) return res.status(400).json({ message: "weekly_action_id is required" })

  const wa = await pg("weekly_action").where({ id: weeklyActionId }).whereNull("deleted_at").first()
  if (!wa) return res.status(404).json({ message: "Weekly action not found" })

  const [campaign] = await marketing.createEmailCampaigns([
    { name, weekly_action_id: weeklyActionId, subject, status: "draft" },
  ])
  res.status(201).json({ campaign })
}
