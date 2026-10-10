import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { spawnSync } from "child_process"

import { OUTREACH_MODULE } from "../modules/outreach"

/**
 * Import scraped B2B leads from the krile project (Go scraper, local Postgres
 * `krile`, table `companies`) into Medusa's `outreach_company` table.
 *
 * Only companies WITH an email are imported (no-email rows can't be emailed).
 * Idempotent: rows already present (matched by `external_id` = krile id) are
 * skipped, so re-running after a fresh scrape only inserts the new ones.
 *
 * Reads from the krile DB via `psql` (COPY-free `SELECT row_to_json(...)`), so no
 * extra dependency and no cross-DB coupling in Medusa. Local auth needs no
 * password; override connection with env vars if needed:
 *   KRILE_DB_HOST (localhost) · KRILE_DB_PORT (5432) · KRILE_DB_NAME (krile)
 *   KRILE_DB_USER (genjerator) · KRILE_DB_PASSWORD (unset → local trust/peer)
 *
 * This is a LOCAL loader. Prod gets the same data via a raw SQL dump handed over
 * separately (see docs/company-outreach-system.md §8) — never run this on prod.
 *
 * Usage (medusa exec args are POSITIONAL — no leading dashes):
 *   pnpm medusa exec ./src/scripts/import-outreach-companies.ts             # all ~52k
 *   pnpm medusa exec ./src/scripts/import-outreach-companies.ts limit=100   # test run
 */

const COLUMNS = [
  "id",
  "name",
  "category",
  "street",
  "postal_code",
  "city",
  "phone",
  "website",
  "email",
  "source_url",
  "scraped_at",
  "website_status",
  "website_http_code",
  "website_detail",
  "website_checked_at",
] as const

type KrileRow = Record<(typeof COLUMNS)[number], unknown>

const CREATE_BATCH = 1000

function emptyToNull(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v)
  return s.trim() === "" ? null : s
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default async function importOutreachCompanies({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const outreach: any = container.resolve(OUTREACH_MODULE)

  // ── args (positional, e.g. "limit=100") ───────────────────────────────────
  let limit: number | null = null
  for (const a of args ?? []) {
    const m = /^limit=(\d+)$/.exec(a)
    if (m) limit = toNumberOrNull(m[1])
  }

  // ── pull rows from the krile DB via psql ──────────────────────────────────
  const select = `
    select row_to_json(t) from (
      select ${COLUMNS.join(", ")}
      from companies
      where email is not null and btrim(email) <> ''
      order by id
      ${limit ? `limit ${limit}` : ""}
    ) t
  `.trim()

  const env = { ...process.env }
  if (process.env.KRILE_DB_PASSWORD) env.PGPASSWORD = process.env.KRILE_DB_PASSWORD

  logger.info(`📥 import-outreach-companies: reading from krile DB${limit ? ` (limit ${limit})` : ""}…`)
  const psql = spawnSync(
    "psql",
    [
      "-h", process.env.KRILE_DB_HOST ?? "localhost",
      "-p", process.env.KRILE_DB_PORT ?? "5432",
      "-U", process.env.KRILE_DB_USER ?? "genjerator",
      "-d", process.env.KRILE_DB_NAME ?? "krile",
      "-t", "-A", "-c", select,
    ],
    { env, encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 }
  )
  if (psql.status !== 0) {
    throw new Error(`psql failed (status ${psql.status}): ${psql.stderr || psql.stdout}`)
  }

  const rows: KrileRow[] = psql.stdout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l) as KrileRow)
  logger.info(`   ${rows.length} compan${rows.length === 1 ? "y" : "ies"} with email in source`)

  // ── skip ones already imported (idempotent) ───────────────────────────────
  const existing = new Set<string>()
  const pageSize = 10000
  for (let offset = 0; ; offset += pageSize) {
    const page = await outreach.listOutreachCompanies(
      {},
      { select: ["external_id"], take: pageSize, skip: offset }
    )
    for (const r of page) existing.add(String(r.external_id))
    if (page.length < pageSize) break
  }

  const toCreate = rows
    .filter((r) => !existing.has(String(r.id)))
    .map((r) => ({
      external_id: String(r.id),
      name: String(r.name ?? ""),
      category: emptyToNull(r.category),
      street: emptyToNull(r.street),
      postal_code: emptyToNull(r.postal_code),
      city: emptyToNull(r.city),
      phone: emptyToNull(r.phone),
      website: emptyToNull(r.website),
      email: String(r.email),
      source_url: emptyToNull(r.source_url),
      scraped_at: r.scraped_at ? new Date(String(r.scraped_at)) : null,
      website_status: emptyToNull(r.website_status),
      website_http_code: toNumberOrNull(r.website_http_code),
      website_detail: emptyToNull(r.website_detail),
      website_checked_at: r.website_checked_at ? new Date(String(r.website_checked_at)) : null,
    }))

  const skipped = rows.length - toCreate.length
  logger.info(`   ${toCreate.length} to insert, ${skipped} already present`)

  // ── batch insert ──────────────────────────────────────────────────────────
  let created = 0
  for (let i = 0; i < toCreate.length; i += CREATE_BATCH) {
    const batch = toCreate.slice(i, i + CREATE_BATCH)
    await outreach.createOutreachCompanies(batch)
    created += batch.length
    logger.info(`   …inserted ${created}/${toCreate.length}`)
  }

  console.log(
    `IMPORT-OUTREACH-COMPANIES DONE: source=${rows.length} inserted=${created} skipped=${skipped}`
  )
}
