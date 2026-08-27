import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COOKIE_CONSENT_MODULE } from "../../../modules/cookieConsent"
import { readLiveConsent, type ConsentBrand } from "../../../lib/cookie-consent"
import { parseRange } from "../../../lib/seo/range"

/**
 * Cookie-banner interaction tallies for a brand over a range. Past days come from
 * the DB; today's still-in-Redis counts are merged in so the view is live.
 * "no_click" (banner shown but no button pressed) = shown − accepted − declined.
 *   GET /admin/cookie-consent?brand=industries&from=&to=
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: any = req.scope.resolve(COOKIE_CONSENT_MODULE)
  const brand = (String(req.query.brand ?? "industries") as ConsentBrand)
  const { from, to } = parseRange(req.query)

  const dbRows: any[] = await svc.listCookieConsentDailies(
    { brand, date: { $gte: from, $lte: to } },
    { take: 100_000 }
  )

  const byDate = new Map<string, { date: string; shown: number; accepted: number; declined: number }>()
  for (const r of dbRows) {
    byDate.set(r.date, { date: r.date, shown: r.shown, accepted: r.accepted, declined: r.declined })
  }

  // Merge today's live Redis bucket (today isn't flushed to the DB yet).
  const live = await readLiveConsent(brand)
  if (live.date >= from && live.date <= to) {
    const existing = byDate.get(live.date)
    byDate.set(live.date, {
      date: live.date,
      shown: (existing?.shown ?? 0) + live.shown,
      accepted: (existing?.accepted ?? 0) + live.accepted,
      declined: (existing?.declined ?? 0) + live.declined,
    })
  }

  const rows = [...byDate.values()]
    .map((r) => ({ ...r, no_click: Math.max(0, r.shown - r.accepted - r.declined) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  const totals = rows.reduce(
    (t, r) => ({
      shown: t.shown + r.shown,
      accepted: t.accepted + r.accepted,
      declined: t.declined + r.declined,
      no_click: t.no_click + r.no_click,
    }),
    { shown: 0, accepted: 0, declined: 0, no_click: 0 }
  )

  res.json({ brand, from, to, rows, totals })
}
