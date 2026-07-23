import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Exports customers that have an email address as a CSV file, downloaded by the
 * "Export CSV" button on the admin Customers list
 * (`src/admin/widgets/customers-export-csv.tsx`).
 *
 * Pages through the full customer list (no admin-side row cap) and streams a
 * UTF-8 CSV with a BOM so Excel renders umlauts correctly.
 */

/**
 * A column either reads a top-level customer field by `key`, or derives its
 * value from the full row via `value` (used for nested metadata like Brevo stats).
 */
type Column = { label: string; key?: string; value?: (row: any) => unknown }

const COLUMNS: Column[] = [
  { key: "id", label: "ID" },
  { key: "email", label: "Email" },
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "company_name", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "has_account", label: "Has account" },
  { key: "created_at", label: "Created at" },
  {
    label: "Campaigns sent",
    value: (row) => row.metadata?.brevo?.campaigns_sent ?? 0,
  },
]

// Fields to request from the graph: every column's `key`, plus `metadata` for
// the derived Brevo columns.
const GRAPH_FIELDS = Array.from(
  new Set([...COLUMNS.map((c) => c.key).filter(Boolean), "metadata"])
) as string[]

const cellValue = (col: Column, row: any): unknown =>
  col.value ? col.value(row) : col.key ? row[col.key] : ""

/** RFC-4180 field: quote when it contains a comma, quote, CR or LF; double inner quotes. */
const escapeCsv = (value: unknown): string => {
  const s = value === null || value === undefined ? "" : String(value)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  // Never export unsubscribed customers. Soft-deleting them (nightly job)
  // already removes them from query.graph, but this also covers the window
  // between an unsubscribe and that cleanup.
  const unsubRows = (await pg("marketing_profile")
    .whereNull("deleted_at")
    .where("priority", "unsubscribed")
    .select("customer_id")) as { customer_id: string }[]
  const unsubscribed = new Set(unsubRows.map((r) => r.customer_id))

  const take = 1000
  let skip = 0
  let fetched = 0
  const rows: any[] = []
  // Page through all customers until we've collected the reported total.
  for (;;) {
    const { data, metadata } = await query.graph({
      entity: "customer",
      fields: GRAPH_FIELDS,
      pagination: { take, skip, order: { created_at: "DESC" } } as any,
    })
    const page = data as any[]
    fetched += page.length
    // Only export customers with an email address who are not unsubscribed.
    rows.push(
      ...page.filter(
        (r) =>
          typeof r.email === "string" &&
          r.email.trim() !== "" &&
          !unsubscribed.has(r.id)
      )
    )
    const total = metadata?.count ?? fetched
    skip += take
    if (page.length === 0 || fetched >= total) break
  }

  const header = COLUMNS.map((c) => escapeCsv(c.label)).join(",")
  const body = rows.map((r) => COLUMNS.map((c) => escapeCsv(cellValue(c, r))).join(",")).join("\r\n")
  // Leading BOM (﻿) => Excel opens it as UTF-8 (correct umlauts).
  const csv = `﻿${header}\r\n${body}\r\n`

  const filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`
  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
  return res.send(csv)
}
