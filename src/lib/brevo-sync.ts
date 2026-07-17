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
 *   campaigns_sent, campaigns_opened, total_opens, campaigns_clicked,
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
  failed: number
  dryRun: boolean
  issues: string[]
}

type BrevoContact = {
  email: string
  emailBlacklisted?: boolean
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

const uniqueCampaigns = (events?: { campaignId: number }[]) =>
  new Set((events ?? []).map((e) => e.campaignId)).size

const pct = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 1000) / 10 : 0

export const buildBrevoStats = (contact: BrevoContact) => {
  const s = contact.statistics ?? {}
  const sent = uniqueCampaigns(s.messagesSent)
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
    try {
      const contact = await fetchBrevoContact(apiKey, customer.email)
      if (!contact) {
        stats.notInBrevo++
      } else {
        const brevo = buildBrevoStats(contact)
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
    `[brevo-sync] ✅ Done. ${stats.synced} synced, ${stats.notInBrevo} not in Brevo, ${stats.failed} failed (of ${stats.processed} processed).`
  )
  return stats
}
