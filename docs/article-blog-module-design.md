# Article / Blog module — Design (Vorschlag / Diskussion)

Status: **DRAFT for discussion** — nothing implemented yet.
Goal: a small **custom `article` module** for a blog / magazine ("Ratgeber"/"Magazin")
section, fully under our control for **i18n (de/en/it)** and **SEO**, consistent with
how the rest of this shop is built.

---

## 1. Why a custom module (not a plugin / CMS)

This repo already builds content exactly this way — the **`contentBlock`** module:
`model.define`, a **hand-written migration**, **inline per-locale columns**
(`body` / `body_en` / `body_it`), `status` draft/published, and an admin route at
`src/admin/routes/content-blocks`. An `article` module mirrors that precedent, so it fits
the existing admin, i18n, and deploy patterns — no dependency on an unmaintained
community blog plugin, and full control over SEO markup the two storefronts need.

> Convention reminder: create the table with a **hand-written migration** — never run
> `medusa db:generate article` on the shared DB (it drops core tables).

---

## 2. Data model (mirrors contentBlock's inline-i18n pattern)

Module `article` (camelCase name). Table `article`:

| Field | Type | Notes |
|---|---|---|
| `id` | id pk | |
| `slug` | text, unique | URL slug, e.g. `vakuumieren-richtig-gemacht` |
| `status` | enum(draft, published) default `draft` | drafts hidden from storefront |
| `published_at` | dateTime, nullable | listing order + "not before" gate |
| `cover_image` | text, nullable | S3 URL (same upload flow as products) |
| `author` | text, nullable | simple string for v1 |
| `title` / `title_en` / `title_it` | text | German = base column |
| `excerpt` / `excerpt_en` / `excerpt_it` | text, nullable | short summary (listing + og:description fallback) |
| `body` / `body_en` / `body_it` | text (rich HTML) | admin editor emits HTML; storefront renders it |
| `meta_title` / `_en` / `_it` | text, nullable | SEO `<title>` (falls back to `title`) |
| `meta_description` / `_en` / `_it` | text, nullable | SEO meta (falls back to `excerpt`) |

- **i18n**: inline `_en` / `_it` columns like `contentBlock` (German on the base column).
  Simpler than the product `translation` table and consistent with content here.
- **Categories/tags**: v1 keep it flat (optional single `category` text). A separate
  `ArticleCategory`/tags table can come later — see §7.

Optional (later): module **link to `product`** for "related products" on an article
(cross-sell + internal linking for SEO).

---

## 3. Backend: workflows + API routes

Follow the standard flow (Module → Workflow → API route; GET/POST/DELETE only; mutations
in workflows).

**Store (public):**
- `GET /store/articles` — published only, `published_at <= now`, paginated, locale-aware
  fields, newest first. For the blog index.
- `GET /store/articles/:slug` — single published article (locale-aware). For the article page.

**Admin (protected):**
- `GET /admin/articles`, `GET /admin/articles/:id`
- `POST /admin/articles` (create), `POST /admin/articles/:id` (update), `DELETE /admin/articles/:id`
- all mutations via workflows (create/update/delete article).

Locale handling: routes accept a `locale`/`countryCode` and return the right
title/excerpt/body/meta (base vs `_en`/`_it`), with fallback to German if a translation is empty.

---

## 4. Admin UI

New admin route `src/admin/routes/articles` (mirrors `content-blocks`):
- **List**: title, status, published_at, author.
- **Create/Edit form**:
  - rich-text editor (reuse the content-blocks editor) with **de/en/it tabs** for
    title / excerpt / body / meta,
  - `slug` (auto-suggested from title, editable),
  - `status` + `published_at`,
  - `cover_image` upload (same S3 upload flow used for products),
  - author, optional category.

---

## 5. Storefront (both shops?) + SEO

Pages (Next.js, per `[countryCode]`):
- **Index**: `/<locale>/<section>` — grid of published articles (cover, title, excerpt,
  date), paginated. Section name = decision (see §7): `blog` / `magazin` / `ratgeber`.
- **Article**: `/<locale>/<section>/<slug>` — renders `body` HTML, cover, author, date.
- Data via the **Medusa JS SDK** (`sdk.client.fetch("/store/articles…")`), never raw fetch.

**Full SEO control (the main reason for custom):**
- `<title>` = `meta_title` || `title`; meta description = `meta_description` || `excerpt`.
- **Open Graph + Twitter card** (title, description, `cover_image`).
- **JSON-LD `Article`** structured data (headline, image, datePublished, author).
- **Canonical** URL + **hreflang** alternates for de/en/it.
- **Sitemap**: add published article URLs (per locale).
- ISR/revalidate so new/edited articles appear without a redeploy (matches your cache setup).

---

## 6. What we reuse (low risk)

- `model.define` + hand-written migration (contentBlock precedent).
- Inline `_en`/`_it` i18n (contentBlock precedent).
- Admin rich-text editor + route pattern (content-blocks).
- S3 image upload (product image flow).
- SDK data fetching + ISR (existing storefront patterns).

---

## 7. Decisions (locked)

1. **Section name & URL** — **`magazin`** → `/<locale>/magazin` + `/<locale>/magazin/<slug>`.
2. **Storefronts** — **both**, but **build Planeta GmbH first**, Industries after.
3. **Categories/tags** — **flat in v1** (optional `category` text), tags later.
4. **Slug** — **one shared slug** for v1 (per-locale slugs can come later).
5. **Author** — **plain text** in v1.
6. **Related products** — **later** (optional module link to `product`).
7. **Rich text** — reuse the content-blocks editor as-is.

---

## 8. Suggested phased plan

- **Phase 0 (this doc):** agree §7.
- **Phase 1 — backend:** `article` module + model + hand-written migration; create/update/
  delete workflows; `GET /store/articles` + `/:slug`; admin CRUD routes.
- **Phase 2 — admin UI:** list + editor (de/en/it tabs, slug, cover upload, status, publish).
- **Phase 3 — storefront:** index + article pages with full SEO (OG, JSON-LD, hreflang,
  sitemap) on the chosen storefront(s).
- **Phase 4 (optional):** categories/tags, related-products link, author entity.
```
