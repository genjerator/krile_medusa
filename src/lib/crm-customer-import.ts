import { ICustomerModuleService, ISalesChannelModuleService, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import * as XLSX from "xlsx"

const BATCH_SIZE = 200
const MAX_REPORTED_ISSUES = 50

/**
 * Shared CRM customer import (used by the exec script and the admin
 * "Import from CSV" route). Reads an Excel/CSV export with the columns:
 *   Anrede, Firma, Vorname, Nachname, Strasse, Hausnummer, PLZ, Ort, Land,
 *   Telefon, Fax, EMail, Homepage, Mobil, Kategorie, Bemerkung, Kundennummer,
 *   UStIdNr, Anrede2, TitelPrefix, TitelSuffix, Abteilung, Position
 *
 * Upsert behavior (never deletes anything):
 *   - existing customer with the same email → updated (non-empty fields
 *     overwrite, metadata is merged, address added only if none exists)
 *   - otherwise matched by Kundennummer (stored in metadata) → updated
 *   - no match → new customer is created
 */

export type CrmImportOptions = {
  dryRun?: boolean
  /** Only import rows that have a valid email address. */
  onlyEmail?: boolean
  /** Only import rows with a full postal address (street + PLZ + city). */
  requireAddress?: boolean
  /** Link imported customers (with email) to this sales channel. */
  channelName?: string
}

export type CrmImportStats = {
  rowsRead: number
  skippedUnusable: number
  skippedByFilter: number
  duplicatesInFile: number
  toCreate: number
  toUpdate: number
  created: number
  updated: number
  failed: number
  dryRun: boolean
  issues: string[]
}

type CrmRow = Record<string, string>

const COUNTRY_CODES: Record<string, string> = {
  deutschland: "de",
  germany: "de",
  brd: "de",
  d: "de",
  österreich: "at",
  oesterreich: "at",
  austria: "at",
  a: "at",
  schweiz: "ch",
  switzerland: "ch",
  suisse: "ch",
  niederlande: "nl",
  holland: "nl",
  netherlands: "nl",
  belgien: "be",
  belgium: "be",
  frankreich: "fr",
  france: "fr",
  italien: "it",
  italy: "it",
  luxemburg: "lu",
  luxembourg: "lu",
  polen: "pl",
  poland: "pl",
  tschechien: "cz",
  dänemark: "dk",
  daenemark: "dk",
  schweden: "se",
  spanien: "es",
  portugal: "pt",
  griechenland: "gr",
  ungarn: "hu",
  kroatien: "hr",
  slowenien: "si",
  slowakei: "sk",
  rumänien: "ro",
  bulgarien: "bg",
  finnland: "fi",
  norwegen: "no",
  irland: "ie",
  liechtenstein: "li",
  großbritannien: "gb",
  grossbritannien: "gb",
  england: "gb",
  uk: "gb",
  türkei: "tr",
  tuerkei: "tr",
  usa: "us",
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v).trim())

const chunk = <T,>(items: T[], size: number): T[][] => {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

const mapCountry = (land: string): string | undefined => {
  if (!land) return undefined
  const key = land.toLowerCase()
  if (COUNTRY_CODES[key]) return COUNTRY_CODES[key]
  if (/^[a-z]{2}$/.test(key)) return key
  return undefined
}

const buildCustomer = (row: CrmRow) => {
  // Row keys normalized to lowercase to be robust against header casing.
  const get = (key: string) => str(row[key.toLowerCase()])

  const rawEmail = get("EMail").toLowerCase()
  const email = EMAIL_RE.test(rawEmail) ? rawEmail : null

  const firstName = get("Vorname")
  const lastName = get("Nachname")
  const company = get("Firma")
  const phone = get("Telefon") || get("Mobil")

  const street = [get("Strasse"), get("Hausnummer")].filter(Boolean).join(" ")
  const postalCode = get("PLZ")
  const city = get("Ort")
  const land = get("Land")
  const countryCode = mapCountry(land)

  const metadata: Record<string, string> = { source: "crm-import" }
  const metaFields: [string, string][] = [
    ["anrede", get("Anrede")],
    ["anrede2", get("Anrede2")],
    ["titel", get("TitelPrefix")],
    ["fax", get("Fax")],
    ["homepage", get("Homepage")],
    ["mobil", get("Mobil")],
    ["kategorie", get("Kategorie")],
    ["bemerkung", get("Bemerkung")],
    ["kundennummer", get("Kundennummer")],
    ["ust_idnr", get("UStIdNr")],
    ["titel_suffix", get("TitelSuffix")],
    ["abteilung", get("Abteilung")],
    ["position", get("Position")],
  ]
  for (const [key, value] of metaFields) {
    if (value) metadata[key] = value
  }
  if (rawEmail && !email) metadata.email_raw = rawEmail
  if (land && !countryCode) metadata.land = land

  const hasAddress = Boolean(street || postalCode || city)

  return {
    email,
    first_name: firstName || null,
    last_name: lastName || null,
    company_name: company || null,
    phone: phone || null,
    has_account: false,
    metadata,
    ...(hasAddress && {
      addresses: [
        {
          first_name: firstName || null,
          last_name: lastName || null,
          company: company || null,
          address_1: street || null,
          postal_code: postalCode || null,
          city: city || null,
          country_code: countryCode || null,
          phone: phone || null,
          is_default_billing: true,
          is_default_shipping: true,
        },
      ],
    }),
  }
}

export async function runCrmCustomerImport(
  container: MedusaContainer,
  fileBuffer: Buffer,
  options: CrmImportOptions = {}
): Promise<CrmImportStats> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const { dryRun = false, onlyEmail = false, requireAddress = false, channelName } = options

  const issues: string[] = []
  const reportIssue = (message: string) => {
    logger.warn(message)
    if (issues.length < MAX_REPORTED_ISSUES) issues.push(message)
  }

  // ─── READ EXCEL / CSV ─────────────────────────────────────────────────────
  const workbook = XLSX.read(fileBuffer, { type: "buffer" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  const rows: CrmRow[] = rawRows.map((raw) => {
    const normalized: CrmRow = {}
    for (const [key, value] of Object.entries(raw)) {
      normalized[key.trim().toLowerCase()] = str(value)
    }
    return normalized
  })

  logger.info(`📄 Read ${rows.length} rows (sheet "${workbook.SheetNames[0]}")`)

  let skippedUnusable = 0
  let skippedByFilter = 0
  const candidates = rows
    .map((row, i) => ({ line: i + 2, customer: buildCustomer(row) }))
    .filter(({ customer }) => {
      const usable =
        customer.email || customer.last_name || customer.company_name || customer.first_name
      if (!usable) {
        skippedUnusable++
        return false
      }
      if (onlyEmail && !customer.email) {
        skippedByFilter++
        return false
      }
      const addr = customer.addresses?.[0]
      if (requireAddress && !(addr?.address_1 && addr?.postal_code && addr?.city)) {
        skippedByFilter++
        return false
      }
      return true
    })

  // ─── DEDUPE WITHIN THE FILE ───────────────────────────────────────────────
  let duplicatesInFile = 0
  const seenEmails = new Set<string>()
  const seenKdnr = new Set<string>()
  const fileUnique = candidates.filter(({ line, customer }) => {
    if (customer.email) {
      if (seenEmails.has(customer.email)) {
        duplicatesInFile++
        reportIssue(`Row ${line}: skipped — duplicate email in file (${customer.email})`)
        return false
      }
      seenEmails.add(customer.email)
    }
    const kdnr = customer.metadata.kundennummer
    if (kdnr) {
      if (seenKdnr.has(kdnr)) {
        duplicatesInFile++
        reportIssue(`Row ${line}: skipped — duplicate Kundennummer in file (${kdnr})`)
        return false
      }
      seenKdnr.add(kdnr)
    }
    return true
  })

  // ─── MATCH AGAINST EXISTING CUSTOMERS (BY EMAIL, THEN KUNDENNUMMER) ───────
  const customerModule: ICustomerModuleService = container.resolve(Modules.CUSTOMER)

  type ExistingCustomer = {
    id: string
    metadata: Record<string, unknown> | null
    hasAddress: boolean
  }

  const existingByEmail = new Map<string, ExistingCustomer>()
  const emailsInFile = fileUnique.filter((c) => c.customer.email).map((c) => c.customer.email!)
  for (const batch of chunk(emailsInFile, 500)) {
    const found = await customerModule.listCustomers(
      { email: batch },
      { select: ["id", "email", "metadata"], relations: ["addresses"] }
    )
    found.forEach((c) => {
      if (c.email) {
        existingByEmail.set(c.email.toLowerCase(), {
          id: c.id,
          metadata: c.metadata ?? null,
          hasAddress: (c.addresses?.length ?? 0) > 0,
        })
      }
    })
  }

  const existingByKdnr = new Map<string, ExistingCustomer>()
  if (fileUnique.some((c) => c.customer.metadata.kundennummer)) {
    let skip = 0
    const take = 500
    for (;;) {
      const page = await customerModule.listCustomers(
        {},
        { select: ["id", "metadata"], relations: ["addresses"], take, skip }
      )
      page.forEach((c) => {
        const kdnr = (c.metadata as Record<string, unknown> | null)?.kundennummer
        if (kdnr) {
          existingByKdnr.set(String(kdnr), {
            id: c.id,
            metadata: c.metadata ?? null,
            hasAddress: (c.addresses?.length ?? 0) > 0,
          })
        }
      })
      if (page.length < take) break
      skip += take
    }
  }

  const toCreate: typeof fileUnique = []
  const toUpdate: { line: number; customer: ReturnType<typeof buildCustomer>; existing: ExistingCustomer }[] = []
  for (const entry of fileUnique) {
    // Match by email first; fall back to Kundennummer so a contact that was
    // imported without email earlier gets updated instead of duplicated.
    const existing =
      (entry.customer.email && existingByEmail.get(entry.customer.email)) ||
      (entry.customer.metadata.kundennummer &&
        existingByKdnr.get(entry.customer.metadata.kundennummer)) ||
      undefined
    if (existing) {
      toUpdate.push({ ...entry, existing })
    } else {
      toCreate.push(entry)
    }
  }

  logger.info(`Will create ${toCreate.length} and update ${toUpdate.length} customers.`)

  const stats: CrmImportStats = {
    rowsRead: rows.length,
    skippedUnusable,
    skippedByFilter,
    duplicatesInFile,
    toCreate: toCreate.length,
    toUpdate: toUpdate.length,
    created: 0,
    updated: 0,
    failed: 0,
    dryRun,
    issues,
  }

  if (dryRun) {
    logger.info("✅ Dry run — nothing written.")
    return stats
  }

  // ─── CREATE IN BATCHES ────────────────────────────────────────────────────
  for (const batch of chunk(toCreate, BATCH_SIZE)) {
    try {
      await customerModule.createCustomers(batch.map((c) => c.customer))
      stats.created += batch.length
    } catch (e) {
      // Batch failed — retry one by one so a single bad row doesn't kill the import.
      for (const { line, customer } of batch) {
        try {
          await customerModule.createCustomers([customer])
          stats.created++
        } catch (err) {
          stats.failed++
          reportIssue(
            `Row ${line} (${customer.email ?? customer.company_name ?? customer.last_name}): ${(err as Error).message}`
          )
        }
      }
    }
    logger.info(`Created ${stats.created}/${toCreate.length} customers...`)
  }

  // ─── UPDATE EXISTING (NON-EMPTY FIELDS WIN, METADATA MERGED) ──────────────
  for (const { line, customer, existing } of toUpdate) {
    try {
      await customerModule.updateCustomers(existing.id, {
        ...(customer.email && { email: customer.email }),
        ...(customer.first_name && { first_name: customer.first_name }),
        ...(customer.last_name && { last_name: customer.last_name }),
        ...(customer.company_name && { company_name: customer.company_name }),
        ...(customer.phone && { phone: customer.phone }),
        metadata: { ...(existing.metadata ?? {}), ...customer.metadata },
      })
      if (!existing.hasAddress && customer.addresses?.length) {
        await customerModule.createCustomerAddresses([
          { customer_id: existing.id, ...customer.addresses[0] },
        ])
      }
      stats.updated++
      if (stats.updated % 200 === 0) {
        logger.info(`Updated ${stats.updated}/${toUpdate.length} customers...`)
      }
    } catch (err) {
      stats.failed++
      reportIssue(
        `Row ${line} update (${customer.email ?? customer.metadata.kundennummer}): ${(err as Error).message}`
      )
    }
  }

  logger.info(
    `✅ Done. Created ${stats.created}, updated ${stats.updated}, failed ${stats.failed}.`
  )

  // ─── OPTIONAL: LINK TO SALES CHANNEL ──────────────────────────────────────
  if (channelName) {
    const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

    const [salesChannel] = await salesChannelModule.listSalesChannels({ name: channelName })
    if (!salesChannel) {
      reportIssue(`Sales channel "${channelName}" not found — skipping channel linking.`)
      return stats
    }

    let linked = 0
    for (const batch of chunk(emailsInFile, 500)) {
      const found = await customerModule.listCustomers({ email: batch }, { select: ["id"] })
      for (const customer of found) {
        await remoteLink
          .create({
            [Modules.CUSTOMER]: { customer_id: customer.id },
            [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
          })
          .catch(() => {})
      }
      linked += found.length
    }
    logger.info(`✅ Linked ${linked} customers to the "${channelName}" sales channel.`)
  }

  return stats
}
