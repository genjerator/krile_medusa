import Redis from "ioredis"

/**
 * Shared ioredis client (from REDIS_URL) for lightweight atomic counters — e.g.
 * cookie-consent tallies via HINCRBY. Separate from Medusa's event-bus/cache/
 * locking connections; returns null when REDIS_URL is unset so callers degrade
 * gracefully instead of crashing.
 */
let client: Redis | null | undefined

export function getRedis(): Redis | null {
  if (client !== undefined) return client
  const url = process.env.REDIS_URL
  if (!url) {
    client = null
    return client
  }
  const c = new Redis(url)
  // Prevent an unhandled 'error' from crashing the process if Redis blips.
  c.on("error", () => {})
  client = c
  return client
}
