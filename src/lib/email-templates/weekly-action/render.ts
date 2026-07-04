/**
 * Renderer for the weekly-action email.
 *
 * The HTML lives in separate template files under `./templates/*.html` with
 * `{{placeholder}}` tokens; this module loads them and fills in the dynamic
 * bits (prices, product cards, headings). Shared by the admin "Generate email
 * HTML" button (`src/api/admin/weekly-actions/[id]/email/route.ts`) and the CLI
 * generator (`generate.mts`).
 *
 * Templates:
 *   templates/email.html         – the outer email (placeholder {{rows}})
 *   templates/product-row.html   – a row of two cards ({{left}} / {{right}})
 *   templates/product-card.html  – one product ({{link}} {{image}} {{title}} …)
 *
 * They are resolved relative to the process CWD (works from the built server
 * image and from the repo root for the CLI). A postbuild step copies them into
 * the compiled server output — see `scripts/copy-email-templates.mjs`.
 */

import { readFileSync } from "node:fs"
import { join } from "node:path"

export type WeeklyEmailProduct = {
  title: string
  handle: string
  image: string
  /** original price (major units, e.g. 12.9) */
  was: number
  /** sale price (major units) */
  now: number
  /** whole-number discount percent, 0 when there is no reduction */
  pct: number
  currency: string
}

export type WeeklyEmailData = {
  weeklyAction: { title?: string | null; ends_at?: string | null }
  products: WeeklyEmailProduct[]
  storefrontUrl: string
  locale: string
  country: string
  logoUrl: string
}

const TEMPLATE_DIR = join(
  process.cwd(),
  "src",
  "lib",
  "email-templates",
  "weekly-action",
  "templates"
)

const templateCache = new Map<string, string>()

function template(name: string): string {
  let tpl = templateCache.get(name)
  if (tpl === undefined) {
    tpl = readFileSync(join(TEMPLATE_DIR, name), "utf8")
    templateCache.set(name, tpl)
  }
  return tpl
}

/**
 * Replace `{{key}}` tokens with the given values. Unknown tokens (e.g. the
 * ESP's `{{unsubscribe_url}}`) are intentionally left untouched. Uses split/join
 * so values may safely contain `$`, backslashes, etc.
 */
function fill(tpl: string, vars: Record<string, string>): string {
  let out = tpl
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value ?? "")
  }
  return out
}

const escapeHtml = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const money = (amount: number, currency: string, locale: string, country: string): string =>
  new Intl.NumberFormat(`${locale}-${country.toUpperCase()}`, {
    style: "currency",
    currency: (currency || "EUR").toUpperCase(),
  }).format(Number(amount || 0))

function renderCard(p: WeeklyEmailProduct, d: WeeklyEmailData): string {
  const badge = p.pct
    ? `<span style="display:inline-block;background-color:#fee2e2;color:#e11d48;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;padding:3px 8px;border-radius:6px;">−${p.pct}&nbsp;%</span>`
    : ""
  const price =
    p.was > p.now
      ? `<span style="color:#98a2b3;text-decoration:line-through;">${money(p.was, p.currency, d.locale, d.country)}</span>
         &nbsp;<span style="color:#e11d48;font-weight:bold;font-size:16px;">${money(p.now, p.currency, d.locale, d.country)}</span>`
      : `<span style="color:#1e3a5f;font-weight:bold;font-size:16px;">${money(p.now, p.currency, d.locale, d.country)}</span>`

  return fill(template("product-card.html"), {
    link: `${d.storefrontUrl}/${d.locale}/product/${encodeURIComponent(p.handle)}`,
    image: escapeHtml(p.image),
    title: escapeHtml(p.title),
    badge,
    price,
  })
}

function renderRows(d: WeeklyEmailData): string {
  const row = template("product-row.html")
  let out = ""
  for (let i = 0; i < d.products.length; i += 2) {
    const left = d.products[i]
    const right = d.products[i + 1]
    out += fill(row, {
      left: renderCard(left, d),
      right: right ? renderCard(right, d) : "&nbsp;",
    })
  }
  return out
}

export function renderWeeklyActionEmail(d: WeeklyEmailData): string {
  const maxPct = Math.max(0, ...d.products.map((p) => p.pct || 0))
  const heading = escapeHtml(d.weeklyAction?.title || "Unsere Wochenaktion")
  const validity = d.weeklyAction?.ends_at
    ? `Gültig bis ${new Intl.DateTimeFormat(`${d.locale}-${d.country.toUpperCase()}`, {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(d.weeklyAction.ends_at))}`
    : "Gültig bis Sonntag"
  const savingsLine = maxPct
    ? `Jetzt <strong style="color:#e11d48;">bis zu ${maxPct}&nbsp;%</strong> sparen auf ausgewählte Produkte.`
    : "Unsere Angebote der Woche – nur solange der Vorrat reicht."
  const preheader = `${heading} – ${maxPct ? `bis zu ${maxPct}&nbsp;% sparen. ` : ""}Nur diese Woche.`

  return fill(template("email.html"), {
    lang: escapeHtml(d.locale),
    title: heading,
    preheader,
    heading,
    savingsLine,
    validity: escapeHtml(validity),
    footerValidity: escapeHtml(validity.replace(/^Gültig /, "")),
    storefrontUrl: d.storefrontUrl,
    locale: d.locale,
    logoUrl: escapeHtml(d.logoUrl),
    rows: renderRows(d),
  })
}
