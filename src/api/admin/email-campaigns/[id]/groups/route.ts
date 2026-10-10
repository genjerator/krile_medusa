import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../../../modules/marketing"
import { SES_BATCH_MODULE } from "../../../../../modules/sesBatch"
import { groupSendAudience, parseGroupSendAudience } from "../../../../../lib/ses/campaign-groups"

type Body = { group_ids?: string[] }

/**
 * POST /admin/email-campaigns/:id/groups  { group_ids: string[] }
 * Sets the campaign's assigned customer groups (idempotent — send the full desired
 * set each time). Diffs against the existing group-sends:
 *   - newly added group → create a draft `ses_batch` (one group-send). No outbox
 *     rows yet; call …/generate to fill them.
 *   - removed group     → delete its batch + outbox rows, UNLESS it has already
 *     sent mail (then it is retained and reported).
 *   - unchanged group   → left as-is (keeps any generated rows).
 *
 * The batch carries source_type/source_id = the campaign's weekly action so the
 * ref-based outbox renders, campaign_id = this campaign, and audience
 * `cmp:<campaignId>:<groupId>` (a namespace the prototype never touches).
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const sesBatch: any = req.scope.resolve(SES_BATCH_MODULE)
  const id = req.params.id

  const campaign = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!campaign) return res.status(404).json({ message: "Campaign not found" })

  const desired = Array.from(
    new Set((Array.isArray(req.body?.group_ids) ? req.body!.group_ids! : []).map((g) => String(g).trim()).filter(Boolean))
  )

  // Validate the requested groups exist.
  if (desired.length) {
    const found = await pg("customer_group").whereIn("id", desired).whereNull("deleted_at").select("id")
    const foundIds = new Set((found as any[]).map((g) => g.id))
    const missing = desired.filter((g) => !foundIds.has(g))
    if (missing.length) {
      return res.status(404).json({ message: `Customer group(s) not found: ${missing.join(", ")}` })
    }
  }

  // Current group-sends for this campaign.
  const existing = await pg("ses_batch").where({ campaign_id: id }).whereNull("deleted_at").select("id", "audience")
  const currentByGroup = new Map<string, string>() // groupId → batchId
  for (const b of existing as any[]) {
    const gid = parseGroupSendAudience(b.audience)?.groupId
    if (gid) currentByGroup.set(gid, b.id)
  }

  const desiredSet = new Set(desired)
  const toAdd = desired.filter((g) => !currentByGroup.has(g))
  const toRemove = [...currentByGroup.keys()].filter((g) => !desiredSet.has(g))

  // Add batches for new groups.
  const added: Array<{ group_id: string; batch_id: string }> = []
  for (const gid of toAdd) {
    const [batch] = await sesBatch.createSesBatches([
      {
        source_type: "weekly_action",
        source_id: campaign.weekly_action_id,
        campaign_id: id,
        audience: groupSendAudience(id, gid),
        status: "draft",
        total: 0,
      },
    ])
    added.push({ group_id: gid, batch_id: batch.id })
  }

  // Remove batches for de-selected groups — unless already sent.
  const removed: string[] = []
  const retained: string[] = []
  for (const gid of toRemove) {
    const batchId = currentByGroup.get(gid)!
    const sentCount = await pg("ses_emails").where("batch_id", batchId).where("status", "sent").count("* as c").first()
    if (Number(sentCount?.c ?? 0) > 0) {
      retained.push(gid)
      continue
    }
    await pg("ses_emails").where("batch_id", batchId).del()
    await sesBatch.deleteSesBatches([batchId])
    removed.push(gid)
  }

  logger.info(
    `[campaigns/groups] campaign=${id} desired=${desired.length} added=${added.length} removed=${removed.length} retained=${retained.length}`
  )
  res.json({ ok: true, added, removed, retained })
}
