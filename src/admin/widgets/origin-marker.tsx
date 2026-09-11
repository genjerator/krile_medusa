import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

/**
 * Discreet migration marker on the admin login screen.
 *
 * Only shown when the URL carries `?source=true` — otherwise the login screen
 * looks completely normal. When enabled it reads the `X-Served-By` response
 * header that the Strato Caddy adds (see the backend Caddyfile) and prints
 * "strato" or "aws", so we can confirm which stack answered even though both
 * respond on the same hostname during the DNS switch.
 *
 *   header present ("strato-vps") → "strato"
 *   header absent                → "aws" (old stack, or Caddy marker removed)
 *
 * Remove this widget once the migration is verified.
 */
const OriginMarkerWidget = () => {
  const enabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("source") === "true"

  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    // Same-origin HEAD: reads the header off the admin's own response. Plain
    // fetch is correct here (no admin auth involved) and runs pre-login.
    fetch(window.location.href, { method: "HEAD", cache: "no-store" })
      .then((res) => {
        const servedBy = res.headers.get("x-served-by") || ""
        if (!cancelled) setSource(/strato/i.test(servedBy) ? "strato" : "aws")
      })
      .catch(() => {
        if (!cancelled) setSource("aws")
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  if (!enabled || !source) return null

  return (
    <div className="flex justify-center pt-2">
      <Text size="xsmall" className="text-ui-fg-muted font-mono">
        {source}
      </Text>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.after",
})

export default OriginMarkerWidget
