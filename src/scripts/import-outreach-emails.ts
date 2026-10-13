import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { spawnSync } from "child_process"

import { OUTREACH_MODULE } from "../modules/outreach"

/**
 * Import crafted cold-outreach emails from the krile project (Go scraper, local
 * Postgres `krile`, table `company_emails`) into Medusa's `outreach_email` table.
 *
 * Each email is linked to its `outreach_company` by resolving krile's
 * `company_id` → the Medusa company id (via `external_id`). `to_email` is copied
 * from the company. Emails whose company isn't in `outreach_company` (e.g. the
 * company had no email, so it was never imported) are still stored, with
 * `company_id`/`to_email` left null and flagged — they can't be sent until a
 * recipient is known.
 *
 * Idempotent: rows already present (matched by `external_id` = krile uuid) are
 * skipped, so re-running after krile generates more emails only inserts the new ones.
 *
 * Reads the krile DB via `psql` (same pattern as import-outreach-companies).
 * Connection overridable with KRILE_DB_HOST/PORT/NAME/USER/PASSWORD.
 *
 * LOCAL loader only — prod gets this data via a raw SQL dump (see
 * docs/company-outreach-system.md §8). Never run it on prod.
 *
 * Usage (medusa exec args are POSITIONAL — no leading dashes):
 *   pnpm medusa exec ./src/scripts/import-outreach-emails.ts
 *   pnpm medusa exec ./src/scripts/import-outreach-emails.ts limit=5
 */

const COLUMNS = [
  "id",
  "company_id",
  "relevant_products",
  "reasoning",
  "subject",
  "email_body",
  "email_status",
  "email_sent_at",
  "email_error",
  "created_at",
] as const

type KrileRow = Record<(typeof COLUMNS)[number], unknown>

const CREATE_BATCH = 500

function emptyToNull(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v)
  return s.trim() === "" ? null : s
}

function deriveStatus(row: KrileRow): string {
  if (row.email_sent_at) return "sent"
  if (emptyToNull(row.email_error)) return "failed"
  const s = emptyToNull(row.email_status)
  return s ? s.toLowerCase() : "pending"
}

export default async function importOutreachEmails({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const outreach: any = container.resolve(OUTREACH_MODULE)

  let limit: number | null = null
  for (const a of args ?? []) {
    const m = /^limit=(\d+)$/.exec(a)
    if (m) limit = Number(m[1])
  }

  // ── pull crafted emails from the krile DB via psql ────────────────────────
  const select = `
    select row_to_json(t) from (
      select ${COLUMNS.join(", ")}
      from company_emails
      order by created_at
      ${limit ? `limit ${limit}` : ""}
    ) t
  `.trim()

  const env = { ...process.env }
  if (process.env.KRILE_DB_PASSWORD) env.PGPASSWORD = process.env.KRILE_DB_PASSWORD

  logger.info(`📥 import-outreach-emails: reading company_emails from krile DB${limit ? ` (limit ${limit})` : ""}…`)
  const psql = spawnSync(
    "psql",
    [
      "-h", process.env.KRILE_DB_HOST ?? "localhost",
      "-p", process.env.KRILE_DB_PORT ?? "5432",
      "-U", process.env.KRILE_DB_USER ?? "genjerator",
      "-d", process.env.KRILE_DB_NAME ?? "krile",
      "-t", "-A", "-c", select,
    ],
    { env, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 }
  )
  if (psql.status !== 0) {
    throw new Error(`psql failed (status ${psql.status}): ${psql.stderr || psql.stdout}`)
  }

  const rows: KrileRow[] = psql.stdout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l) as KrileRow)
  logger.info(`   ${rows.length} crafted email(s) in source`)

  // ── resolve companies: krile company id → Medusa id + email ───────────────
  const companyByExternal = new Map<string, { id: string; email: string | null }>()
  const pageSize = 10000
  for (let offset = 0; ; offset += pageSize) {
    const page = await outreach.listOutreachCompanies(
      {},
      { select: ["id", "external_id", "email"], take: pageSize, skip: offset }
    )
    for (const c of page) {
      companyByExternal.set(String(c.external_id), { id: c.id, email: c.email ?? null })
    }
    if (page.length < pageSize) break
  }

  // ── skip ones already imported (idempotent) ───────────────────────────────
  const existing = new Set<string>()
  for (let offset = 0; ; offset += pageSize) {
    const page = await outreach.listOutreachEmails(
      {},
      { select: ["external_id"], take: pageSize, skip: offset }
    )
    for (const r of page) existing.add(String(r.external_id))
    if (page.length < pageSize) break
  }

  let unresolved = 0
  const toCreate = rows
    .filter((r) => !existing.has(String(r.id)))
    .map((r) => {
      const companyExternalId = String(r.company_id)
      const company = companyByExternal.get(companyExternalId)
      if (!company) unresolved++
      return {
        external_id: String(r.id),
        company_id: company?.id ?? null,
        company_external_id: companyExternalId,
        to_email: company?.email ?? null,
        relevant_products: emptyToNull(r.relevant_products),
        reasoning: emptyToNull(r.reasoning),
        subject: emptyToNull(r.subject),
        email_body: emptyToNull(r.email_body),
        status: deriveStatus(r),
        sent_at: r.email_sent_at ? new Date(String(r.email_sent_at)) : null,
        error: emptyToNull(r.email_error),
        generated_at: r.created_at ? new Date(String(r.created_at)) : null,
      }
    })

  const skipped = rows.length - toCreate.length
  logger.info(`   ${toCreate.length} to insert, ${skipped} already present, ${unresolved} with no matching company`)

  let created = 0
  for (let i = 0; i < toCreate.length; i += CREATE_BATCH) {
    const batch = toCreate.slice(i, i + CREATE_BATCH)
    await outreach.createOutreachEmails(batch)
    created += batch.length
  }

  console.log(
    `IMPORT-OUTREACH-EMAILS DONE: source=${rows.length} inserted=${created} skipped=${skipped} unresolved_company=${unresolved}`
  )
}
