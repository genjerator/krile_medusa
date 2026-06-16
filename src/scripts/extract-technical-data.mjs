#!/usr/bin/env node
/**
 * One-off data tool: extracts each product's WooCommerce attribute set
 * (Artikelnummer, Inhalt, Abmessung, ...) from a WordPress/WooCommerce SQL dump
 * and enriches products.json with a `technical_data` map, keyed by the attribute
 * taxonomy (without the `pa_` prefix). Also emits the field→label map for i18n.
 *
 * Usage: node extract-technical-data.mjs /path/to/dump.sql
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SQL_PATH = process.argv[2] || "/Users/genjerator/Downloads/dbs12792319_2026-05-22.sql"
const PRODUCTS_JSON = path.join(__dirname, "products.json")

const sql = fs.readFileSync(SQL_PATH, "utf8")

// ── Generic parser: returns all rows (arrays of string|null fields) for a table ──
// Quote/paren/escape-aware so commas and semicolons inside values are respected.
function parseTableRows(table) {
  const rows = []
  const marker = "INSERT INTO `" + table + "` VALUES"
  let idx = 0
  while ((idx = sql.indexOf(marker, idx)) !== -1) {
    let i = idx + marker.length
    let field = ""
    let cur = null // current row (array) when inside parens
    let inString = false
    let quoteChar = "'"
    for (; i < sql.length; i++) {
      const ch = sql[i]
      if (inString) {
        if (ch === "\\") { field += ch + sql[i + 1]; i++; continue }
        if (ch === quoteChar) { inString = false; continue }
        field += ch
        continue
      }
      if (ch === "'") { inString = true; quoteChar = "'"; cur.__quoted = true; continue }
      if (ch === "(") { cur = []; field = ""; cur.__quoted = false; continue }
      if (ch === ",") {
        if (cur) { cur.push(finalizeField(field, cur.__quoted)); field = ""; cur.__quoted = false }
        continue
      }
      if (ch === ")") {
        if (cur) { cur.push(finalizeField(field, cur.__quoted)); rows.push(cur); cur = null; field = "" }
        continue
      }
      if (ch === ";") { if (!cur) break } // end of this INSERT statement
      if (cur) field += ch
    }
    idx = i
  }
  return rows
}

function finalizeField(raw, quoted) {
  const v = raw.trim()
  if (!quoted && v === "NULL") return null
  // Unescape common mysqldump escapes
  return raw
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\\\/g, "\\")
}

// ── Build lookup tables ──
console.error("Parsing wp_terms ...")
const termName = new Map() // term_id -> name
for (const r of parseTableRows("wp_terms")) termName.set(r[0], r[1])

console.error("Parsing wp_term_taxonomy ...")
const taxByTTID = new Map() // term_taxonomy_id -> { termId, taxonomy }
for (const r of parseTableRows("wp_term_taxonomy")) {
  taxByTTID.set(r[0], { termId: r[1], taxonomy: r[2] })
}

console.error("Parsing wp_term_relationships ...")
const ttidsByObject = new Map() // object_id -> [term_taxonomy_id...]
for (const r of parseTableRows("wp_term_relationships")) {
  const objId = r[0]
  if (!ttidsByObject.has(objId)) ttidsByObject.set(objId, [])
  ttidsByObject.get(objId).push(r[1])
}

// ── Attribute labels from _transient_wc_attribute_taxonomies (name -> human label) ──
const labelByName = new Map()
const labelRe = /attribute_name\\";s:\d+:\\"([a-z0-9_-]+)\\";s:15:\\"attribute_label\\";s:\d+:\\"([^\\"]+)\\"/g
let m
while ((m = labelRe.exec(sql)) !== null) labelByName.set(m[1], m[2])

// Canonical display order: identity → dimensions → weight → material →
// performance → electrical → accessories → free-text notes last.
const FIELD_ORDER = [
  "artikelnummer", "inhalt",
  "abmessung", "lange", "breite", "hohe", "durchmesser", "dicke",
  "fullmenge", "max_kapazitat_des_kessels",
  "gewicht", "kg_netto", "kg_brutto",
  "material", "bugeltischoberflache",
  "motor", "motor_mit_doppelschaltung", "pumpe", "pumpvolumen",
  "vakuumier_leistung", "umdrehung", "dampfdruck",
  "leistung_dampferzeuger", "leistung_bugeltisch", "leistung_bugeleisen",
  "steuerung", "trafo",
  "zubehor_in_der_verpackung", "zusatzliche_information",
]
const orderIndex = (k) => {
  const i = FIELD_ORDER.indexOf(k)
  return i === -1 ? FIELD_ORDER.length : i
}

const fieldKey = (taxonomy) => taxonomy.replace(/^pa_/, "").replace(/-/g, "_")
const labelFor = (taxonomy) => {
  const name = taxonomy.replace(/^pa_/, "")
  if (labelByName.has(name)) return labelByName.get(name)
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Enrich products.json ──
const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8"))
const fieldLabels = {} // field -> label, for i18n
let withData = 0

for (const p of products) {
  const ttids = ttidsByObject.get(String(p.external_id)) || []
  const td = {}
  for (const ttid of ttids) {
    const tax = taxByTTID.get(ttid)
    if (!tax || !tax.taxonomy.startsWith("pa_")) continue
    const key = fieldKey(tax.taxonomy)
    const value = termName.get(tax.termId)
    if (value == null || value === "") continue
    td[key] = value
    fieldLabels[key] = labelFor(tax.taxonomy)
  }
  const keys = Object.keys(td)
  if (keys.length > 0) {
    keys.sort((a, b) => orderIndex(a) - orderIndex(b))
    p.technical_data = Object.fromEntries(keys.map((k) => [k, td[k]]))
    withData++
  } else {
    delete p.technical_data
  }
}

fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2) + "\n")
fs.writeFileSync(path.join(__dirname, "technical-data-labels.json"), JSON.stringify(fieldLabels, null, 2) + "\n")

// ── Report ──
const pv = products.find((x) => x.external_id === 1582)
console.error(`\nProducts with technical_data: ${withData}/${products.length}`)
console.error(`Distinct attribute fields: ${Object.keys(fieldLabels).length}`)
console.error(`\nPV 9000 (1582) technical_data:`)
console.error(JSON.stringify(pv?.technical_data, null, 2))
