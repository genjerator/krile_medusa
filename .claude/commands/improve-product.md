---
description: Audit a product's copy (title, subtitle, description) and propose SEO-friendly, customer-focused rewrites, then apply them via a Medusa exec script after approval.
argument-hint: <product_id>
---

# Improve product copy — `/improve-product`

Improve the marketing copy of a single product so it is **customer-friendly**
(answers "why should I buy this?") and **SEO-friendly**.

**Always start by showing a comparison table of all suggested changes — never
write any files or apply changes on the first pass.** Only produce the apply
artifacts when the user explicitly asks (e.g. "give me SQL", "apply it",
"build the script"). Until then, keep iterating on the table.

Product to work on: **$ARGUMENTS**

> Status: working end-to-end. Apply path = `src/scripts/improve-product.ts` +
> per-product payload JSON (see "Applying changes"). A couple of style defaults
> under "Still to confirm" can still be tuned.

## Decisions (confirmed)

- **Reads:** inspect data with the read-only fetch script (see Workflow step 1).
- **Writes:** apply changes through the **Medusa exec script**
  `src/scripts/improve-product.ts`, which goes through the module services
  (so domain events fire → search reindex + cache/ISR invalidation) instead of
  raw SQL. The copy is baked into the script's `PAYLOADS[]` array (one entry per
  product) so it can't be corrupted by copy-paste; the script ships in the image
  and is run in the prod container after deploy. Raw SQL is a fallback only when
  a field has no service method (e.g. physically deleting `woo_*` metadata keys,
  which the metadata *merge* can't remove — the script does that via the pg
  connection).
- **Languages:** rewrite **German + English** for every in-scope field.
- **Fields in scope:** `title`, `subtitle`, `description`, **`handle` (URL slug)**,
  **SEO metadata** (meta title / meta description), and **tags / keywords**.
- **Subtitle:** generated when missing.
- **Handle:** rewrite to a clean, human + SEO friendly slug. Rules: lowercase,
  hyphen-separated, **drop the brand prefix** (no `planeta-`) and **drop legacy
  WooCommerce id suffixes** (e.g. `-1590`); fold umlauts (`ä→ae`, `ö→oe`,
  `ü→ue`, `ß→ss`); include the primary keyword + key differentiator (size,
  shape), e.g. `planeta-vakuumbehalter-30l-1590` → `vakuumbehaelter-3l-rechteckig`.
  Check the new slug is unique before applying. ⚠️ A changed handle 404s the old
  URL — flag that a storefront `301` old→new redirect is needed if the old URL
  may be indexed.
- **Legacy cleanup:** always **remove WooCommerce metadata keys** (any key
  prefixed `woo_`, e.g. `woo_external_id`, `woo_stock_status`) from
  `product.metadata` as part of the update. Keep all other metadata
  (`technische_daten__*`, etc.) intact.

## Goal

For the given product id, propose better:
1. **Title** — clearer, more compelling, keyword-aware.
2. **Subtitle** — improve it, or **generate one if it doesn't exist**.
3. **Description** — rewrite to be human-friendly and persuasive (benefits +
   "why buy"), while staying accurate.
4. **Handle** — a clean, human + SEO friendly URL slug (see the Handle rule under
   "Decisions").

These must read naturally for real people first, and be SEO-friendly second
(no keyword stuffing).

## Inputs

- A single **product id** (e.g. `prod_01KSMD62WY5ABZP0TTZWFN2XDN`), passed as the
  command argument.

## Workflow

1. **Fetch** all the data in one shot by running the extraction script
   `.claude/scripts/improve-product-fetch.sql` against the local DB:

   ```
   psql "postgres://postgres:postgres@localhost:5432/medusa-v2" -v pid="$ARGUMENTS" -f .claude/scripts/improve-product-fetch.sql
   ```

   It pulls the base product row, metadata (flagging `woo_*` keys to strip and any
   existing SEO keys), categories, variants, current tags, existing translations,
   and the store-enabled locales — everything needed for the table. Do not run
   ad-hoc queries; if a field is missing, extend the script.
2. **Analyse** the current copy: what's missing, vague, or not benefit-led.
3. **Propose** improvements and present a **comparison table** (current vs.
   suggested for **every** in-scope field, both 🇩🇪 German and 🇬🇧 English, plus
   tags), then stop and let the user **verify**:

   | Field | Current | Suggested | Why it's better |
   |-------|---------|-----------|-----------------|
   | Title | … | … | clarity / keyword / length |
   | Subtitle | *(empty)* | … | adds value prop |
   | Description | … | … | benefits, scannable, SEO |
   | Handle | … | … | drops brand/woo-id, keyword slug |

   - Keep current values verbatim in the "Current" column (mark empty fields).
   - Note character counts for title/subtitle where SEO limits matter.
4. **Discuss / iterate** — the user reviews the table and either requests changes
   (refine and re-show the **table**) or is happy with it. **Nothing else is
   produced at this stage — no script edit, ever, until step 5 is triggered.**
5. **Only when the user explicitly asks to apply** (e.g. "apply it", "build the
   script", "give me SQL"), add the per-product entry to `PAYLOADS[]` and apply it
   with the exec script (see "Applying changes"). Approving or praising the
   table is **not** a request to apply — wait for an explicit ask.

## Copywriting guidelines

- **Audience:** B2B + prosumer buyers of vacuum-packing / ironing equipment
  (Planeta GmbH). Professional but approachable.
- **Why-buy focus:** lead with benefits and outcomes, not just specs.
- **Accuracy:** never invent specs, certifications, materials, or numbers. Only
  rephrase/expand what's supported by existing data. Preserve model numbers,
  SKUs, capacities, and any compliance terms exactly.
- **SEO:** include the primary product term and natural variations; avoid
  keyword stuffing. (Target lengths TBD — see Open Questions.)
- **Structure for descriptions:** short intro that answers "why buy", then
  scannable benefit bullets, then details/specs.
- **Tone & language:** TBD (see Open Questions — language/locale, formal "Sie").

## Applying changes (only after explicit approval)

Changes are applied by the **self-contained exec script**
`src/scripts/improve-product.ts` — built exactly like the seed scripts
(`seed-*.ts`): the approved copy is baked into the `PAYLOADS[]` array near the top
of the file (one entry per product), there are no external data files, and it
runs via `medusa exec`. Do NOT hand-write SQL and do NOT paste copy through the
terminal (line-wrapping corrupts HTML — editing the file directly avoids that).

1. **Append a new entry to `PAYLOADS[]`** in `src/scripts/improve-product.ts`
   with the approved values (only include what changed). Append — don't overwrite
   existing entries, so one `medusa exec` applies every pending product:

   ```ts
   {
     productId: "prod_…",
     handle: "vakuumbehaelter-3l-rechteckig",   // lowercase, no brand/woo-id, umlauts folded
     base: { title: "…", subtitle: "…", description: "<p>…</p>" },
     metadata: {
       stripPrefixes: ["woo_"],
       set: { meta_title: "…", meta_description: "…",
              meta_title_en: "…", meta_description_en: "…",
              meta_title_it: "…", meta_description_it: "…" },
     },
     translations: {
       "en-US": { title: "…", subtitle: "…", description: "<p>…</p>" },
       "it-IT": { title: "…", subtitle: "…", description: "<p>…</p>" },
     },
     tags: ["…", "…"],
   },
   ```

2. **Run on LOCAL and verify** (no args — product ids come from `PAYLOADS`):

   ```
   medusa exec ./src/scripts/improve-product.ts
   ```

3. **Deploy, then run on PROD manually.** RDS is private (only reachable from
   EC2), so this can't run from a laptop. Commit + push to `main` → CI builds &
   deploys the image. After the deploy, run it inside the container exactly like
   the seeders (the user does this step):

   ```
   docker exec app-medusa-1 sh -c 'pnpm medusa exec ./src/scripts/improve-product.js'
   ```
   (`.js`, not `.ts`, in the container — the built image.)

What the script does (so behaviour is predictable):
- Writes `base.*` (and `handle`, if set) to the `product` row (default locale = German).
- `metadata`: merges `metadata.set` (SEO) via the service, then **physically
  deletes** every key matching `stripPrefixes` (e.g. all `woo_*`) with a jsonb `-`
  over the pg connection — because the service *merges* metadata and can't remove
  keys. All other keys (`technische_daten__*`, …) are kept.
- `translations`: upserts each locale via the translation module
  (English = `en-US`, Italian = `it-IT`).
- `tags`: ensures each value exists, then links it **in addition** to the
  product's current tags (never removes existing ones).
- Idempotent — safe to re-run; re-running also repairs a previously corrupted row.

**Note:** going through the module services means search reindex + storefront
cache invalidation happen automatically (unlike raw SQL). It's a real write —
snapshot first (fetch script / `pg_dump -t product …`) if you want a rollback.

## Out of scope (for now)

- Images, pricing, variants, categories.
- **Auto-creating the storefront redirect** for a changed handle — the script
  renames the slug, but the `301` old→new redirect must still be added in the
  storefront(s) separately if the old URL may be indexed.

## Data model (confirmed — used by the SQL)

- **Base / German** copy lives on the `product` row (`title`, `subtitle`,
  `description`, `metadata`). German is the default locale.
- **Translations** live in the `translation` table, keyed by
  `(reference='product', reference_id=<product id>, locale_code)`, with the
  translated fields in a `translations` jsonb (`title`, `subtitle`,
  `description`, `material`). Upsert on the
  `(reference_id, locale_code)` unique index. **English is stored as `en-US`**
  by existing convention (even though the store also enables `en-GB`).
- **SEO metadata** has no native columns and no existing convention in the data —
  store it in `product.metadata` jsonb as `meta_title` / `meta_description`
  (German). Add `meta_title_en` / `meta_description_en` only if the user wants
  English meta. ⚠️ The storefront does not render these until wired up.
- **Tags** live in `product_tag` (`value`) + the `product_tags` link table.

## Still to confirm

1. **Length / SEO limits** — Proposed defaults: title ≤ ~60 chars, meta
   description ≤ ~160 chars, subtitle ≤ ~120 chars. OK, or different caps?
2. **Brand voice** — Proposed default: **formal German "Sie"**, professional but
   approachable; keep model numbers/SKUs verbatim; no unverified claims. Any
   words/claims to avoid or required phrases (warranty, "Made in …")?
