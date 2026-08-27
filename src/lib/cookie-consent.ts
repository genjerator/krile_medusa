import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getRedis } from "./redis"
import { COOKIE_CONSENT_MODULE } from "../modules/cookieConsent"
import { SHOP_CHANNEL_NAME } from "./store-email-identity"

/**
 * Cookie-banner interaction tracking. Events are counted in Redis (atomic
 * HINCRBY per day+brand) on every hit — cheap and write-heavy — then a nightly
 * job flushes completed days into `cookie_consent_daily` and clears the keys.
 */

export type ConsentEvent = "shown" | "accept" | "decline"
export type ConsentBrand = "industries" | "planeta"

const FIELD: Record<ConsentEvent, "shown" | "accepted" | "declined"> = {
  shown: "shown",
  accept: "accepted",
  decline: "declined",
}

const PENDING_SET = "cookie:consent:pending"
const keyFor = (date: string, brand: string) => `cookie:consent:${date}:${brand}`
const isoDayUTC = () => new Date().toISOString().slice(0, 10)

/** Map the storefront's sales channel(s) to a brand key. */
export function consentBrandFromChannels(names?: string[] | null): ConsentBrand {
  return names?.some((n) => n === SHOP_CHANNEL_NAME) ? "planeta" : "industries"
}

/**
 * Record one banner interaction into Redis (best-effort — silently no-ops when
 * Redis isn't configured or unreachable, so the storefront never sees an error).
 */
export async function recordConsentEvent(brand: ConsentBrand, event: ConsentEvent): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  const date = isoDayUTC()
  const key = keyFor(date, brand)
  try {
    await redis
      .multi()
      .hincrby(key, FIELD[event], 1)
      .sadd(PENDING_SET, `${date}|${brand}`)
      .expire(key, 14 * 86_400) // safety TTL so unflushed keys can't linger forever
      .exec()
  } catch {
    // best-effort
  }
}

/**
 * Read today's still-in-Redis bucket for a brand (zeros when absent). Lets the
 * admin view show live current-day counts before the nightly flush.
 */
export async function readLiveConsent(
  brand: ConsentBrand
): Promise<{ date: string; shown: number; accepted: number; declined: number }> {
  const date = isoDayUTC()
  const redis = getRedis()
  if (!redis) return { date, shown: 0, accepted: 0, declined: 0 }
  try {
    const h = await redis.hgetall(keyFor(date, brand))
    return {
      date,
      shown: Number(h.shown ?? 0),
      accepted: Number(h.accepted ?? 0),
      declined: Number(h.declined ?? 0),
    }
  } catch {
    return { date, shown: 0, accepted: 0, declined: 0 }
  }
}

/**
 * Flush all Redis day-buckets strictly before today into the DB (today's bucket
 * keeps accumulating). Idempotent: DB upsert adds counts, then the Redis key +
 * pending marker are removed. Returns how many (brand, date) buckets moved.
 */
export async function flushConsentToDb(
  container: MedusaContainer,
  opts: { includeToday?: boolean } = {}
): Promise<{ flushed: number }> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const redis = getRedis()
  if (!redis) {
    logger.info("[cookie-consent] REDIS_URL not set — nothing to flush.")
    return { flushed: 0 }
  }
  const svc: any = container.resolve(COOKIE_CONSENT_MODULE)
  const today = isoDayUTC()

  const members = await redis.smembers(PENDING_SET)
  let flushed = 0

  for (const member of members) {
    const [date, brand] = member.split("|")
    // Normally leave the running day alone; `includeToday` forces it (manual run).
    if (!date || !brand || (!opts.includeToday && date >= today)) continue

    const key = keyFor(date, brand)
    const h = await redis.hgetall(key)
    const shown = Number(h.shown ?? 0)
    const accepted = Number(h.accepted ?? 0)
    const declined = Number(h.declined ?? 0)

    if (shown || accepted || declined) {
      const [existing] = await svc.listCookieConsentDailies({ brand, date }, { take: 1 })
      if (existing) {
        await svc.updateCookieConsentDailies({
          id: existing.id,
          shown: existing.shown + shown,
          accepted: existing.accepted + accepted,
          declined: existing.declined + declined,
        })
      } else {
        await svc.createCookieConsentDailies([{ brand, date, shown, accepted, declined }])
      }
    }

    await redis.del(key)
    await redis.srem(PENDING_SET, member)
    flushed++
  }

  logger.info(`[cookie-consent] flushed ${flushed} day-bucket(s) to DB.`)
  return { flushed }
}
