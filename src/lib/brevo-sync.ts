import { ICustomerModuleService, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const BREVO_API = "https://api.brevo.com/v3"
// Brevo allows ~10 req/s; stay under it.
const THROTTLE_MS = 150

/**
 * Sync per-contact email-engagement statistics from Brevo into
 * customer.metadata.brevo. Requires BREVO_API_KEY in the environment.
 *
 * Stored shape (metadata.brevo):
 *   campaigns_sent, sent_campaign_ids (Brevo campaign IDs the contact was sent),
 *   campaigns_opened, total_opens, campaigns_clicked,
 *   hard_bounces, soft_bounces, open_rate, click_rate, bounce_rate (in %),
 *   unsubscribed, blacklisted, last_email_at, synced_at
 */

export type BrevoSyncOptions = {
  dryRun?: boolean
  /** Only sync this many customers (for testing). */
  limit?: number
  /** Only sync a single email address. */
  email?: string
}

export type BrevoSyncStats = {
  customersWithEmail: number
  processed: number
  synced: number
  notInBrevo: number
  /** Terminal-state contacts (unsubscribed/blacklisted/hard-bounced) not re-fetched. */
  skipped: number
  failed: number
  dryRun: boolean
  issues: string[]
}

/**
 * A contact is "terminal" once Brevo suppresses it — unsubscribed, blacklisted,
 * or hard-bounced. It won't receive or engage with anything further, so the
 * nightly poll skips re-fetching it (a hard bounce/unsubscribe is permanent).
 * NOT terminal: merely "clicked" — those contacts stay active for future campaigns.
 */
const isTerminalBrevoState = (brevo: unknown): boolean => {
  const b = brevo as
    | { unsubscribed?: boolean; blacklisted?: boolean; hard_bounces?: number }
    | null
    | undefined
  return Boolean(b && (b.unsubscribed || b.blacklisted || (b.hard_bounces ?? 0) > 0))
}

type BrevoContact = {
  email: string
  emailBlacklisted?: boolean
  attributes?: Record<string, unknown>
  statistics?: {
    messagesSent?: { campaignId: number; eventTime?: string }[]
    opened?: { campaignId: number; count?: number; eventTime?: string }[]
    clicked?: { campaignId: number }[]
    hardBounces?: { campaignId: number }[]
    softBounces?: { campaignId: number }[]
    unsubscriptions?: {
      userUnsubscription?: unknown[]
      adminUnsubscription?: unknown[]
    }
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const uniqueCampaignIds = (events?: { campaignId: number }[]) =>
  Array.from(new Set((events ?? []).map((e) => e.campaignId))).sort((a, b) => a - b)

const uniqueCampaigns = (events?: { campaignId: number }[]) =>
  uniqueCampaignIds(events).length

const pct = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 1000) / 10 : 0

export const buildBrevoStats = (contact: BrevoContact) => {
  const s = contact.statistics ?? {}
  const sentCampaignIds = uniqueCampaignIds(s.messagesSent)
  const sent = sentCampaignIds.length
  const openedCampaigns = uniqueCampaigns(s.opened)
  const clickedCampaigns = uniqueCampaigns(s.clicked)
  const hardBounces = (s.hardBounces ?? []).length
  const softBounces = (s.softBounces ?? []).length
  const unsubscribed =
    (s.unsubscriptions?.userUnsubscription?.length ?? 0) +
      (s.unsubscriptions?.adminUnsubscription?.length ?? 0) >
    0
  const lastEmailAt = (s.messagesSent ?? [])
    .map((e) => e.eventTime)
    .filter(Boolean)
    .sort()
    .pop()

  return {
    campaigns_sent: sent,
    // The actual Brevo campaign IDs this contact was sent (i.e. which campaigns
    // the customer is part of), not just the count.
    sent_campaign_ids: sentCampaignIds,
    campaigns_opened: openedCampaigns,
    total_opens: (s.opened ?? []).reduce((sum, e) => sum + (e.count ?? 1), 0),
    campaigns_clicked: clickedCampaigns,
    hard_bounces: hardBounces,
    soft_bounces: softBounces,
    open_rate: pct(openedCampaigns, sent),
    click_rate: pct(clickedCampaigns, sent),
    bounce_rate: pct(hardBounces + softBounces, sent),
    unsubscribed,
    blacklisted: Boolean(contact.emailBlacklisted),
    last_email_at: lastEmailAt ?? null,
    synced_at: new Date().toISOString(),
  }
}

const fetchBrevoContact = async (
  apiKey: string,
  email: string
): Promise<BrevoContact | null> => {
  const res = await fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
    headers: { "api-key": apiKey, accept: "application/json" },
  })
  if (res.status === 404) return null
  if (res.status === 429) {
    // Rate limited — back off once and retry.
    await sleep(2000)
    return fetchBrevoContact(apiKey, email)
  }
  if (!res.ok) {
    throw new Error(`Brevo API ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  return (await res.json()) as BrevoContact
}

export async function runBrevoSync(
  container: MedusaContainer,
  options: BrevoSyncOptions = {}
): Promise<BrevoSyncStats> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const { dryRun = false, limit, email } = options

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set in the environment.")
  }

  const customerModule: ICustomerModuleService = container.resolve(Modules.CUSTOMER)

  // Collect customers that have an email address.
  const targets: { id: string; email: string; metadata: Record<string, unknown> | null }[] = []
  let skip = 0
  const take = 500
  for (;;) {
    const page = await customerModule.listCustomers(
      email ? { email } : {},
      { select: ["id", "email", "metadata"], take, skip }
    )
    for (const c of page) {
      if (c.email) targets.push({ id: c.id, email: c.email, metadata: c.metadata ?? null })
    }
    if (page.length < take) break
    skip += take
  }

  const stats: BrevoSyncStats = {
    customersWithEmail: targets.length,
    processed: 0,
    synced: 0,
    notInBrevo: 0,
    skipped: 0,
    failed: 0,
    dryRun,
    issues: [],
  }

  const toProcess = limit ? targets.slice(0, limit) : targets
  logger.info(
    `[brevo-sync] Syncing ${toProcess.length} of ${targets.length} customers with email...`
  )

  for (const customer of toProcess) {
    stats.processed++

    // Skip contacts Brevo has permanently suppressed — no point spending an
    // API call + throttle on someone who can't engage further. Bypassed when a
    // single `email` was explicitly requested (targeted re-sync wants fresh data).
    if (!email && isTerminalBrevoState(customer.metadata?.brevo)) {
      stats.skipped++
      continue
    }

    try {
      const contact = await fetchBrevoContact(apiKey, customer.email)
      if (!contact) {
        stats.notInBrevo++
      } else {
        const brevo = buildBrevoStats(contact)
        // Customers who already clicked keep their previous synced_at — the
        // "Brevo aktualisiert" column then marks when the data last mattered,
        // not every nightly touch.
        const prev = (customer.metadata?.brevo ?? null) as {
          campaigns_clicked?: number
          synced_at?: string
        } | null
        if (prev && (prev.campaigns_clicked ?? 0) > 0 && prev.synced_at) {
          brevo.synced_at = prev.synced_at
        }
        if (dryRun) {
          logger.info(`[brevo-sync] DRY ${customer.email}: ${JSON.stringify(brevo)}`)
        } else {
          await customerModule.updateCustomers(customer.id, {
            metadata: { ...(customer.metadata ?? {}), brevo },
          })
        }
        stats.synced++
      }
    } catch (err) {
      stats.failed++
      const message = `[brevo-sync] ${customer.email}: ${(err as Error).message}`
      logger.error(message)
      if (stats.issues.length < 50) stats.issues.push(message)
    }
    if (stats.processed % 100 === 0) {
      logger.info(`[brevo-sync] ${stats.processed}/${toProcess.length} processed...`)
    }
    await sleep(THROTTLE_MS)
  }

  logger.info(
    `[brevo-sync] ✅ Done. ${stats.synced} synced, ${stats.skipped} skipped (terminal), ${stats.notInBrevo} not in Brevo, ${stats.failed} failed (of ${stats.processed} processed).`
  )
  return stats
}

// ─── Webhook-driven "dirty" sync (Option C: hybrid) ─────────────────────────
//
// A Brevo Marketing webhook can't safely trigger a per-event API call back
// (a 3500-contact blast would mean thousands of throttled calls). Instead the
// webhook just flags the contact dirty (metadata.brevo.dirty_at), and the
// scheduled `sync-brevo-dirty` job re-fetches dirty contacts in a throttled,
// deduped batch — accurate full-fetch stats, near-real-time, blast-safe.
//
// The flag lives inside customer.metadata (no extra DB table) on purpose: a new
// module + generated migration would drop core tables on this shared database.

/**
 * Mark every customer with this email dirty so the next dirty-sync pass
 * re-fetches their Brevo stats. Merges into metadata.brevo without touching
 * other keys. Case-insensitive on email. Returns rows affected.
 */
export async function markContactDirty(
  container: MedusaContainer,
  email: string
): Promise<number> {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const now = new Date().toISOString()
  const affected = await pg("customer")
    .whereNull("deleted_at")
    .whereRaw("lower(email) = ?", [email.toLowerCase()])
    .update({
      metadata: pg.raw(
        "coalesce(metadata, '{}'::jsonb) || jsonb_build_object('brevo', coalesce(metadata -> 'brevo', '{}'::jsonb) || jsonb_build_object('dirty_at', ?::text))",
        [now]
      ),
    })
  return typeof affected === "number" ? affected : 0
}

export type BrevoDirtySyncStats = {
  dirtyFound: number
  processed: number
  synced: number
  notInBrevo: number
  failed: number
  issues: string[]
}

/**
 * Re-sync customers flagged dirty by the webhook. Capped per run so it never
 * overlaps its own 5-minute schedule (500 × 150ms ≈ 75s); leftover dirty
 * contacts are picked up on the next pass. On success the fresh stats overwrite
 * metadata.brevo (dropping dirty_at); on a Brevo error the flag is LEFT so the
 * contact retries next cycle. Terminal-state contacts are NOT skipped here — a
 * webhook event means something changed, so we always refresh.
 */
export async function runBrevoDirtySync(
  container: MedusaContainer,
  options: { limit?: number } = {}
): Promise<BrevoDirtySyncStats> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("BREVO_API_KEY is not set in the environment.")

  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const customerModule: ICustomerModuleService = container.resolve(Modules.CUSTOMER)
  const cap = options.limit ?? 500

  const dirty = (await pg("customer")
    .whereNull("deleted_at")
    .whereRaw("metadata -> 'brevo' ->> 'dirty_at' is not null")
    .select("id", "email", "metadata")
    .orderByRaw("metadata -> 'brevo' ->> 'dirty_at' asc")
    .limit(cap)) as { id: string; email: string; metadata: Record<string, unknown> | null }[]

  const stats: BrevoDirtySyncStats = {
    dirtyFound: dirty.length,
    processed: 0,
    synced: 0,
    notInBrevo: 0,
    failed: 0,
    issues: [],
  }

  if (dirty.length === 0) return stats
  logger.info(`[brevo-dirty] Re-syncing ${dirty.length} dirty contact(s) (cap ${cap})...`)

  for (const customer of dirty) {
    stats.processed++
    const baseMeta = customer.metadata ?? {}
    const prevBrevo = (baseMeta.brevo ?? {}) as Record<string, unknown>
    try {
      const contact = await fetchBrevoContact(apiKey, customer.email)
      if (!contact) {
        // Not a Brevo contact — clear the flag so it isn't reprocessed forever.
        const { dirty_at, ...rest } = prevBrevo
        const nextMeta = { ...baseMeta } as Record<string, unknown>
        if (Object.keys(rest).length > 0) nextMeta.brevo = rest
        else delete nextMeta.brevo
        await customerModule.updateCustomers(customer.id, { metadata: nextMeta })
        stats.notInBrevo++
      } else {
        const brevo = buildBrevoStats(contact)
        // Preserve the "last mattered" synced_at for contacts who already clicked.
        if ((prevBrevo.campaigns_clicked as number ?? 0) > 0 && prevBrevo.synced_at) {
          brevo.synced_at = prevBrevo.synced_at as string
        }
        // Fresh stats have no dirty_at, so writing the whole object clears it.
        await customerModule.updateCustomers(customer.id, {
          metadata: { ...baseMeta, brevo },
        })
        stats.synced++
      }
    } catch (err) {
      // Leave dirty_at in place so this contact retries next cycle.
      stats.failed++
      const message = `[brevo-dirty] ${customer.email}: ${(err as Error).message}`
      logger.error(message)
      if (stats.issues.length < 50) stats.issues.push(message)
    }
    await sleep(THROTTLE_MS)
  }

  logger.info(
    `[brevo-dirty] ✅ Done. ${stats.synced} synced, ${stats.notInBrevo} not in Brevo, ${stats.failed} failed (of ${stats.processed}).`
  )
  return stats
}

// ─── Create Medusa customers from deliverable Brevo contacts ────────────────
//
// Goal: an email we sent to that did NOT bounce (Brevo reports `delivered`, and
// for a bad address it reports `hard_bounce` instead — never delivered) proves
// the address exists. If that email isn't already a Medusa customer, create it.
//
// Driven off the webhook audit log (brevo_webhook_log): candidates are emails
// with a delivered/opened/click event that did NOT match a customer at receive
// time. For each we re-check existence (cheap), then confirm against Brevo
// (contact exists and is not blacklisted/bounced) before creating — so the
// heavy work is throttled and deferred, never on the webhook hot path.

// Marketing events that prove the address exists and did not bounce.
const BREVO_EXISTENCE_EVENTS = ["delivered", "opened", "click"]

export type BrevoCustomerCreationStats = {
  candidates: number
  created: number
  alreadyExists: number
  notInBrevo: number
  blacklisted: number
  failed: number
  issues: string[]
}

export async function createMissingCustomersFromBrevo(
  container: MedusaContainer,
  options: { limit?: number; sinceHours?: number } = {}
): Promise<BrevoCustomerCreationStats> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("BREVO_API_KEY is not set in the environment.")

  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const customerModule: ICustomerModuleService = container.resolve(Modules.CUSTOMER)
  const cap = options.limit ?? 500
  const sinceHours = Math.max(1, Math.floor(options.sinceHours ?? 2))

  const rows = (await pg("brevo_webhook_log")
    .whereRaw("matched = false")
    .whereIn("event", BREVO_EXISTENCE_EVENTS)
    .whereNotNull("email")
    .where("created_at", ">", pg.raw(`now() - interval '${sinceHours} hours'`))
    .distinct("email")
    .limit(cap)) as { email: string }[]

  const emails = Array.from(
    new Set(rows.map((r) => String(r.email).trim()).filter(Boolean))
  )

  const stats: BrevoCustomerCreationStats = {
    candidates: emails.length,
    created: 0,
    alreadyExists: 0,
    notInBrevo: 0,
    blacklisted: 0,
    failed: 0,
    issues: [],
  }
  if (emails.length === 0) return stats
  logger.info(`[brevo-create] Evaluating ${emails.length} candidate email(s)...`)

  for (const email of emails) {
    try {
      // Already a customer? (case-insensitive) — cheap check, no Brevo call.
      const existing = await pg("customer")
        .whereNull("deleted_at")
        .whereRaw("lower(email) = ?", [email.toLowerCase()])
        .select("id")
        .first()
      if (existing) {
        stats.alreadyExists++
        continue
      }

      const contact = await fetchBrevoContact(apiKey, email)
      if (!contact) {
        stats.notInBrevo++
        await sleep(THROTTLE_MS)
        continue
      }
      // Blacklisted covers hard bounces / unsubscribes — don't create those.
      if (contact.emailBlacklisted) {
        stats.blacklisted++
        await sleep(THROTTLE_MS)
        continue
      }

      const attrs = (contact.attributes ?? {}) as Record<string, unknown>
      const firstName = (attrs.FIRSTNAME ?? attrs.FIRST_NAME) as string | undefined
      const lastName = (attrs.LASTNAME ?? attrs.LAST_NAME) as string | undefined

      await customerModule.createCustomers({
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        metadata: { brevo: buildBrevoStats(contact), created_from_brevo: true },
      })
      stats.created++
      logger.info(`[brevo-create] Created customer for ${email}`)
      await sleep(THROTTLE_MS)
    } catch (err) {
      stats.failed++
      const message = `[brevo-create] ${email}: ${(err as Error).message}`
      logger.error(message)
      if (stats.issues.length < 50) stats.issues.push(message)
      await sleep(THROTTLE_MS)
    }
  }

  logger.info(
    `[brevo-create] ✅ Done. ${stats.created} created, ${stats.alreadyExists} already existed, ${stats.notInBrevo} not in Brevo, ${stats.blacklisted} blacklisted, ${stats.failed} failed (of ${stats.candidates}).`
  )
  return stats
}
