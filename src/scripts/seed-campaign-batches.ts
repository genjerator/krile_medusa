import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_EMAILS_MODULE } from "../modules/sesEmails"
import { SES_BATCH_MODULE } from "../modules/sesBatch"

/**
 * Builds the batches for a full-list campaign send, ordered so the most engaged
 * recipients go out first (warm-up ramp). Creates one `ses_batch` row per batch
 * (the "send run") and one `ses_emails` outbox row per recipient tagged with that
 * batch id. Ref-based: no HTML is stored — the email renders at send time from
 * source_type/source_id, so re-running later re-selects the audience, not the copy.
 *
 * Audience tiers (best first → fill the first batches):
 *   1 clicked  — clicked a Brevo campaign
 *   2 opened   — opened a Brevo campaign (no click)
 *   3 buyer    — placed an order
 *   4 rest     — everyone else
 * Unsubscribed customers and customers without an email are excluded.
 *
 * Idempotent: re-running for the same (source_id, audience) first deletes the
 * previous batches + their outbox rows, then rebuilds.
 *
 * The campaign is OPTIONAL: omit source_id to build a campaign-agnostic segment
 * (batches + recipients, no campaign), then assign a campaign later with
 * assign-campaign-to-batches.ts. Pass source_id to create them already assigned.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/seed-campaign-batches.ts \
 *     [source_id=<id>] [source_type=weekly_action] [batch_size=200] \
 *     [max_batches=20] [audience=ramp] [guest_orders=false]
 *
 * NOTE: the ses_batch table must be migrated first (npx medusa db:migrate).
 */
export default async function seedCampaignBatches({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const sesEmails: any = container.resolve(SES_EMAILS_MODULE)
  const sesBatch: any = container.resolve(SES_BATCH_MODULE)

  // --- parse key=value args -------------------------------------------------
  const opts: Record<string, string> = {}
  for (const a of args) {
    const i = a.indexOf("=")
    if (i > 0) opts[a.slice(0, i).trim()] = a.slice(i + 1).trim()
  }
  // Campaign is OPTIONAL — omit it to build a campaign-agnostic segment and assign
  // a campaign later with assign-campaign-to-batches.ts. If source_id is given,
  // the batches are created already assigned.
  const sourceId = opts.source_id ? opts.source_id.trim() : null
  const sourceType = sourceId ? (opts.source_type ?? "weekly_action").trim() : null
  const batchSize = Math.max(1, Number(opts.batch_size ?? 200))
  const maxBatches = opts.max_batches ? Math.max(1, Number(opts.max_batches)) : null
  const audience = opts.audience ?? "ramp"
  const includeGuestOrders = (opts.guest_orders ?? "false").toLowerCase() === "true"

  // --- rank the audience ----------------------------------------------------
  // tier 1 clicked, 2 opened, 3 buyer, 4 rest. Unsubscribed excluded.
  const buyerJoin = includeGuestOrders
    ? `LEFT JOIN (
         SELECT DISTINCT customer_id FROM "order" WHERE customer_id IS NOT NULL
         UNION
         SELECT c2.id AS customer_id FROM "order" o2
           JOIN customer c2 ON lower(c2.email) = lower(o2.email)
          WHERE o2.email IS NOT NULL
       ) b ON b.customer_id = c.id`
    : `LEFT JOIN (
         SELECT DISTINCT customer_id FROM "order" WHERE customer_id IS NOT NULL
       ) b ON b.customer_id = c.id`

  const ranked: Array<{ customer_id: string; to_email: string; tier: number }> =
    await pg.raw(
      `
      WITH engagement AS (
        SELECT customer_id,
               bool_or(clicked_at IS NOT NULL) AS clicked,
               bool_or(opened_at  IS NOT NULL) AS opened
        FROM customer_campaign
        WHERE source = 'brevo'
        GROUP BY customer_id
      )
      SELECT c.id AS customer_id, c.email AS to_email,
        CASE
          WHEN COALESCE(e.clicked, false) THEN 1
          WHEN COALESCE(e.opened,  false) THEN 2
          WHEN b.customer_id IS NOT NULL  THEN 3
          ELSE 4
        END AS tier
      FROM customer c
      LEFT JOIN engagement e         ON e.customer_id  = c.id
      ${buyerJoin}
      LEFT JOIN marketing_profile mp ON mp.customer_id = c.id
      WHERE c.deleted_at IS NULL
        AND c.email IS NOT NULL
        AND COALESCE(mp.unsubscribed, false) = false
      ORDER BY tier ASC, c.email ASC
      `
    ).then((r: any) => r.rows ?? r)

  if (!ranked.length) {
    logger.warn("[seed-campaign-batches] no eligible recipients — nothing to do.")
    return
  }

  // Optional cap (e.g. first 20 batches = first 4000 recipients).
  const limit = maxBatches ? maxBatches * batchSize : ranked.length
  const audienceList = ranked.slice(0, limit)
  const totalBatches = Math.ceil(audienceList.length / batchSize)

  const tierCounts = audienceList.reduce<Record<number, number>>((m, r) => {
    m[r.tier] = (m[r.tier] ?? 0) + 1
    return m
  }, {})
  logger.info(
    `[seed-campaign-batches] ${audienceList.length} recipients → ${totalBatches} batches of ${batchSize} | ` +
      `tiers: clicked=${tierCounts[1] ?? 0} opened=${tierCounts[2] ?? 0} buyer=${tierCounts[3] ?? 0} rest=${tierCounts[4] ?? 0}`
  )

  // --- idempotency: clear previous batches for this SEGMENT ------------------
  // Batches are campaign-agnostic; the segment label ("<audience>#NN") is their
  // identity. Re-running rebuilds the whole family regardless of any assigned campaign.
  const prior = await pg("ses_batch")
    .where("audience", "like", `${audience}#%`)
    .select("id")
  if (prior.length) {
    const ids = prior.map((p: any) => p.id)
    await pg("ses_emails").whereIn("batch_id", ids).del()
    await sesBatch.deleteSesBatches(ids)
    logger.info(`[seed-campaign-batches] cleared ${ids.length} previous batch(es) for segment "${audience}"`)
  }

  // --- create batches + outbox rows ----------------------------------------
  const now = new Date()
  for (let n = 0; n < totalBatches; n++) {
    const slice = audienceList.slice(n * batchSize, (n + 1) * batchSize)
    const label = `${audience}#${String(n + 1).padStart(2, "0")}`

    const [batch] = await sesBatch.createSesBatches([
      {
        source_type: sourceType,
        source_id: sourceId,
        audience: label,
        status: "draft", // not scheduled yet — send/schedule per batch later
        total: slice.length,
      },
    ])

    await sesEmails.createSesEmails(
      slice.map((r) => ({
        batch_id: batch.id,
        source_type: sourceType,
        source_id: sourceId,
        customer_id: r.customer_id,
        to_email: r.to_email,
        status: "pending",
        generated_at: now,
      }))
    )

    const from = slice[0]?.tier
    const to = slice[slice.length - 1]?.tier
    logger.info(`  ${label}: ${slice.length} recipients (tiers ${from}–${to}) batch_id=${batch.id}`)
  }

  const assignment = sourceId ? `assigned to ${sourceType}:${sourceId}` : "UNASSIGNED (assign a campaign later)"
  logger.info(`[seed-campaign-batches] done — ${totalBatches} batches for segment "${audience}", ${assignment}.`)
}
