# Vakuumiertüten-Konfigurator — Design (Vorschlag / Diskussion)

Status: **DRAFT for discussion** — nothing implemented yet.
Scope: a configurable vacuum-bag product on a new storefront page `/vakuumiertuten-rollen`
where the customer picks **colour, thickness, width, height** and gets a live price +
add-to-cart. Backing data lives in a **separate custom module** (own tables) linked to
the Medusa `product`.

---

## 1. Starting point (today)

- Vacuum bags are currently **17 separate products** (`vakuumbeutel-100x300`,
  `vakuumbeutel-400x600`, …), one per **W×H** dimension, **1 variant each**,
  sold **per pack of 1000**, priced by size (e.g. 120×550 mm = €69).
- There is **no colour and no thickness** dimension today.
- Category: **Vakuumiertüten & Rollen**; sales channel **IndustriesWebshop**
  (→ the Planeta Industries storefront, `krile_medusa-storefront`).

**Implication:** price already tracks area. The configurator generalises this to
`price = f(area, thickness, colour, pack)`.

---

## 2. Why NOT plain Medusa variants

Modelling every combination as a product variant explodes:

```
colours (≈5) × thickness (≈4) × width (10: 150–400) × height (10: 150–400)
  = up to ~2000 variants PER product
```

That is unmanageable for the admin UI, per-variant pricing, and inventory. The price
is **formulaic**, not a hand-set SKU price, so variants add no value. → Confirmed: use a
**separate table (custom module)** for the option catalog + pricing, as requested.

---

## 3. Recommended architecture

```
vacuumBag module (own tables: colours, thicknesses, sizes, pricing, config)
  └─ module link ─► product   (the single "configurable" product)

Storefront /vakuumiertuten-rollen
  ├─ GET  /store/vacuum-bags/options   → dropdown data (colours w/ images, thicknesses, sizes)
  ├─ GET  /store/vacuum-bags/price     → live price for a chosen combination
  └─ POST /store/vacuum-bags/add-to-cart → adds a line item w/ computed price + config metadata
```

- **One Medusa product** represents the configurable bag (e.g. handle
  `vakuumiertueten`) with 4 options (Colour/Thickness/Width/Height). Its **variants are
  created lazily** — only when a customer first buys a given combination (see §5) —
  priced from the matrix. So the catalog stays clean and there's no upfront variant
  explosion.
- All option data + prices live in the `vacuumBag` module (own tables), kept in sync by
  the merchant via a small **admin page**; the matrix is the single source of truth.
- **The configurable product is hidden from all normal sale pages.** It stays
  `published` + in the sales channel (so it's purchasable/checkout works), but:
  - **no category** → never on category pages;
  - a **flag** (`configurator` tag or `metadata.hidden = true`) that the storefront's
    **listing, search, related-products, home, and sitemap** queries exclude;
  - only `/vakuumiertuten-rollen` fetches it (by handle). Lazily-created variants inherit
    this, so nothing leaks into normal listings.
  - (Can't use `status = draft` to hide it — draft products aren't returned by the store
    API and couldn't be bought.)

### Module data models (own tables)

| Model | Fields (draft) |
|---|---|
| `VacuumBagColor` | `id, name, slug, hex, image_url, rank, is_default, active` — dropdown + **hover preview image** |
| `VacuumBagPrice` (**the matrix — the main table**) | `id, color_id (→ VacuumBagColor), thickness_um, width_mm, height_mm, price, currency, active` |
| `VacuumBagConfig` | `id, pack_size (1000), default_color_id, active` — **linked to `product`** |

- **Pricing = explicit matrix** (see §4): one `VacuumBagPrice` row per full combination.
- Thickness / width / height dropdown values are **derived from the DISTINCT values
  present in `VacuumBagPrice`** (optionally cascading — see §6) — so the offered range
  and the price are the *same single source of truth*, nothing to maintain twice.
- Only **colours** get a dedicated table (they carry the preview `image_url` + hex).
- Notes: module name is **camelCase** (`vacuumBag`); links live in `src/links/`;
  `.linkable()` is auto-added (don't add it).

---

## 4. Pricing model — DECIDED: explicit price matrix

Prices are **stored in the table, merchant-editable, seeded with defaults** — no hidden
formula. Each row of `VacuumBagPrice` is a full combination with an exact price:

```
color_id  thickness_um  width_mm  height_mm  price
transp    120           200       300        69.00
blau      120           200       300        74.00
…
```

- **Live price = exact lookup** by the 4 chosen keys (`color_id, thickness_um,
  width_mm, height_mm`) → `price`. Fast, deterministic, no computation.
- The matrix also **defines what is sellable**: only listed combinations are offered.
  A combo with no row = **not available** (surface as disabled option / "auf Anfrage").
- `price` is the price for one **pack** (`VacuumBagConfig.pack_size`, default 1000),
  matching today's per-1000 pricing. Stored **as-is** (69.00 = €69.00, never cents).

**Scale & maintenance:** colours(≈5) × thickness(≈4) × W(≤10) × H(≤10) ⇒ up to ~2000
rows. That's fine as *data* (unlike variants), but hand-entry is impractical → we need a
good way to fill/edit it:
- **Seed** with defaults (a script or CSV) for the initial range, and/or
- an **admin grid + CSV import/export** to bulk-edit (recommended; see §7).

Not every W×H needs a row — the matrix can be sparse (only real, sellable sizes), which
keeps it small and the dropdowns honest.

---

## 5. Cart / checkout mechanics — DECIDED: lazy find-or-create **variant**

On add-to-cart we materialise the chosen configuration as a **real variant under the one
configurable product** (created on demand, only if it doesn't exist yet), then add it to
the cart natively. This gives real prices, real SKUs, and native checkout/orders/tax —
**no custom line-item price needed**.

`POST /store/vacuum-bags/add-to-cart` with `{color, thickness_um, width_mm, height_mm, quantity}` runs a workflow that:

1. **Validates** the combo exists in `VacuumBagPrice` (else 400 "not available").
2. **Find-or-create the variant** on the configurable product, keyed by a **deterministic
   SKU** e.g. `VB-<color>-<um>-<w>x<h>` (`VB-TR-120-200x300`):
   - exists → reuse it;
   - missing → create it (title *"200×300 mm · 120 µm · transparent (1000 Stk.)"*, option
     values Colour/Thickness/Width/Height, registering any new option value).
3. **Refresh its price from the current matrix row** (matrix stays the single source of
   truth, even for previously-created variants).
4. **Add the variant to the cart** with the normal cart flow (native pricing).

Design points to get right (all standard):
- **Idempotency/concurrency:** unique index on `sku`; find→create→on-conflict-refetch so
  two simultaneous shoppers can't duplicate a new combo.
- **No explosion:** creation is **lazy** — only combos actually purchased become variants
  (realistically dozens–hundreds, not the full ~2000). This is the whole reason we don't
  pre-create variants.
- **Inventory:** made/cut to order → likely `manage_inventory = false` (or track raw film).
- **Reporting bonus:** orders reference a real SKU, so history/reorder/analytics are clean.

---

## 6. Storefront page `/vakuumiertuten-rollen`

- Route in `krile_medusa-storefront` under `[countryCode]/(main)/vakuumiertuten-rollen`.
- **4 dropdowns:**
  1. **Farbe** — default **Transparent**. Each option has an image; **on hover over an
     option the main product image swaps** to that colour's `image_url`; on select it
     stays. (Images come from `VacuumBagColor.image_url`.)
  2. **Stärke** — thickness values (90 µm, 120 µm, …) from the matrix.
  3. **Breite** — width values from the matrix.
  4. **Höhe** — height values from the matrix.
- **Availability is matrix-driven / cascading:** the dropdowns only offer values that
  have a matching `VacuumBagPrice` row. As the user narrows selections, remaining
  dropdowns filter to combinations that actually exist (no dead-ends). A combo with no
  row shows as unavailable.
- **Live price** = exact lookup via `GET /store/vacuum-bags/price?color=&thickness=&width=&height=`
  (returns the matrix row's price, or "not available").
- **In den Warenkorb** → `POST /store/vacuum-bags/add-to-cart`.
- All data fetched via the **Medusa JS SDK** (`sdk.client.fetch`), never raw `fetch`.

---

## 7. Admin (merchant management)

A small custom admin page for the `vacuumBag` module to manage colours (+ upload the
preview image), thicknesses, sizes, and the price rule — so the range/prices aren't
code-bound. (Could be phase 2; phase 1 could seed the data via a script.)

---

## 8. Migration of the existing 17 products — decision needed

Options:
- **A. Replace** the 17 `vakuumbeutel-*` products with the configurator; **301-redirect**
  the old handles to `/vakuumiertuten-rollen` (preserves SEO/links).
- **B. Keep** them as quick-buy presets **and** add the configurator (both coexist).
- **C. Hide/deprecate** the 17, configurator only.

Recommendation: **A** (single source of truth), with redirects.

---

## 9. Rolls ("Rollen") — scope note

The page name includes *Rollen*. Rolls are usually **width × roll-length**, not W×H, so
the 4-dropdown model fits **bags**. For v1, suggest **bags only**; add a "Rollen" tab
later (width + length, own price rule). To confirm.

---

## 10. Open questions (please confirm)

1. ~~Pricing rule~~ — **DECIDED: explicit price matrix, merchant-editable, seeded with defaults (§4).**
2. **Colours & thicknesses** — exact list + which is default (assumed Transparent / lowest µm).
3. **Width/height value set** — the values to seed (even steps 150–400? specific sizes? sparse OK).
4. **Matrix seeding & editing** (§4/§7) — provide initial defaults via script/CSV; is an
   admin grid + CSV import/export the right editing tool for the merchant?
5. **Pack size** — always 1000, or selectable quantity too?
6. ~~Cart price mechanism~~ — **DECIDED: lazy find-or-create variant under one product, priced from the matrix (§5).**
7. **Existing 17 products** (§8) — replace + redirect, or coexist?
8. **Rolls** (§9) — in scope for v1 or later?
9. **Storefront** — Industries only, or also Planeta GmbH?

---

## 11. Suggested phased plan

- **Phase 0 (this doc):** agree architecture + answer §10.
- **Phase 1 — backend:** `vacuumBag` module + models + link to product; seed colours/
  thickness/sizes; `GET /store/vacuum-bags/options` and `/price`.
- **Phase 2 — cart:** `POST …/add-to-cart` workflow with server-side price + line-item
  metadata; prototype the custom line-item price first (main risk).
- **Phase 3 — storefront:** `/vakuumiertuten-rollen` page with the 4 dropdowns, colour
  hover-preview, live price, add-to-cart.
- **Phase 4 — admin + migration:** admin management page; migrate/redirect the 17 products.
```
