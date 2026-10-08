import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Assigns a campaign to one or more previously-built (campaign-agnostic) batches:
 * stamps `source_type` / `source_id` onto the matching `ses_batch` rows AND all
 * their `ses_emails` outbox rows, so they become sendable. Safe to re-run — it's a
 * plain update (to re-point a segment at a different campaign, just run it again).
 *
 * Batches are selected by segment label; `batches` optionally narrows to a range
 * (e.g. 1-3 to assign only the first three ramp batches).
 *
 * Usage:
 *   npx medusa exec ./src/scripts/assign-campaign-to-batches.ts \
 *     source_id=<id> [source_type=weekly_action] [audience=ramp] [batches=1-3]
 */
export default async function assignCampaignToBatches({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const opts: Record<string, string> = {}
  for (const a of args) {
    const i = a.indexOf("=")
    if (i > 0) opts[a.slice(0, i).trim()] = a.slice(i + 1).trim()
  }
  const sourceId = opts.source_id ? opts.source_id.trim() : ""
  const sourceType = (opts.source_type ?? "weekly_action").trim()
  const audience = opts.audience ?? "ramp"
  const range = opts.batches // "1-3" or "5"

  if (!sourceId) {
    logger.error(
      "Usage: medusa exec ./src/scripts/assign-campaign-to-batches.ts source_id=<id> " +
        "[source_type=weekly_action] [audience=ramp] [batches=1-3]"
    )
    return
  }

  // Resolve which segment labels to assign (e.g. ramp#01 … ramp#03).
  let labels: string[] | null = null
  if (range) {
    const [a, b] = range.split("-").map((x) => Number(x.trim()))
    const lo = a
    const hi = Number.isFinite(b) ? b : a
    if (!Number.isFinite(lo)) {
      logger.error(`Invalid batches range: "${range}"`)
      return
    }
    labels = []
    for (let n = lo; n <= hi; n++) labels.push(`${audience}#${String(n).padStart(2, "0")}`)
  }

  const batchQuery = pg("ses_batch").where("audience", "like", `${audience}#%`).whereNull("deleted_at")
  if (labels) batchQuery.whereIn("audience", labels)
  const batches = await batchQuery.select("id", "audience")

  if (!batches.length) {
    logger.warn(`[assign-campaign] no batches match segment "${audience}"${range ? ` range ${range}` : ""}.`)
    return
  }

  const batchIds = batches.map((b: any) => b.id)

  // Stamp the campaign onto the batches …
  await pg("ses_batch").whereIn("id", batchIds).update({ source_type: sourceType, source_id: sourceId })
  // … and every outbox row that belongs to them.
  const affected = await pg("ses_emails")
    .whereIn("batch_id", batchIds)
    .update({ source_type: sourceType, source_id: sourceId })

  const labelList = batches.map((b: any) => b.audience).sort().join(", ")
  logger.info(
    `[assign-campaign] ${sourceType}:${sourceId} → ${batches.length} batch(es) [${labelList}], ${affected} outbox rows updated.`
  )
}
