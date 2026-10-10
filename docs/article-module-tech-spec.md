# Article / "Magazin" module — Technical Specification

Companion to `article-blog-module-design.md`. This is the concrete, implementation-level
spec (schemas, migration, API contracts, files, SEO markup) plus the **Author decision**
laid out so you can choose. Conventions follow the existing `contentBlock` module.

## Locked decisions
- Section/URL: **`magazin`** → `/<locale>/magazin` and `/<locale>/magazin/<slug>`
- Storefronts: **both**, build **Planeta GmbH first** (`planetagmbh_medusa-storefront`)
- Categories/tags: **flat v1** (optional `category` text)
- Slug: **one shared slug**
- Related products: **later**
- Rich text: **reuse the content-blocks editor**
- i18n: **inline `_en`/`_it` columns** (German on base column), like `contentBlock`
- Admin CRUD: **direct module-service calls** in routes (matches `content-blocks`)

---

## 1. Module

- Path: `src/modules/article/`
- Name (camelCase): `article`; constant `ARTICLE_MODULE = "article"`
- Register in `medusa-config.ts` alongside `contentBlock`.

```
src/modules/article/
├── index.ts                     # Module(ARTICLE_MODULE, { service })
├── service.ts                   # MedusaService({ Article })
├── models/article.ts            # model.define("article", { … })
└── migrations/MigrationXXopenetc.ts   # hand-written (NEVER db:generate)
```

### models/article.ts (data model)

```ts
import { model } from "@medusajs/framework/utils"

const Article = model.define("article", {
  id: model.id().primaryKey(),
  slug: model.text(),                                   // unique (published-scoped)
  status: model.enum(["draft", "published"]).default("draft"),
  published_at: model.dateTime().nullable(),
  cover_image: model.text().nullable(),                 // S3 URL
  category: model.text().nullable(),                    // flat v1 (optional)
  author: model.text().nullable(),                      // ← Author = Option A (see §6)

  // i18n: German on base column, EN/IT alongside (contentBlock pattern)
  title: model.text(),
  title_en: model.text().nullable(),
  title_it: model.text().nullable(),

  excerpt: model.text().nullable(),
  excerpt_en: model.text().nullable(),
  excerpt_it: model.text().nullable(),

  body: model.text().nullable(),        // rich-text HTML
  body_en: model.text().nullable(),
  body_it: model.text().nullable(),

  meta_title: model.text().nullable(),
  meta_title_en: model.text().nullable(),
  meta_title_it: model.text().nullable(),

  meta_description: model.text().nullable(),
  meta_description_en: model.text().nullable(),
  meta_description_it: model.text().nullable(),
})

export default Article
```

### Migration (hand-written, `IF NOT EXISTS` — mirrors content_block)

```sql
create table if not exists "article" (
  "id" text not null,
  "slug" text not null,
  "status" text not null default 'draft',
  "published_at" timestamptz null,
  "cover_image" text null,
  "category" text null,
  "author" text null,
  "title" text not null,
  "title_en" text null, "title_it" text null,
  "excerpt" text null, "excerpt_en" text null, "excerpt_it" text null,
  "body" text null, "body_en" text null, "body_it" text null,
  "meta_title" text null, "meta_title_en" text null, "meta_title_it" text null,
  "meta_description" text null, "meta_description_en" text null, "meta_description_it" text null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  "deleted_at" timestamptz null,
  constraint "article_pkey" primary key ("id")
);
create index if not exists "IDX_article_deleted_at" on "article" ("deleted_at") where "deleted_at" is null;
create unique index if not exists "UQ_article_slug" on "article" ("slug") where "deleted_at" is null;
create index if not exists "IDX_article_status_published_at" on "article" ("status","published_at") where "deleted_at" is null;
```

---

## 2. Backend API

### Store (public, read-only) — `src/api/store/articles/`
`GET /store/articles?limit=12&offset=0&locale=de`
- Filters: `status = published` AND `published_at <= now()`; order `published_at DESC`.
- Response (fields localised by `locale`, fallback to German):
```json
{ "articles": [
    { "id":"...", "slug":"vakuumieren-tipps", "title":"…", "excerpt":"…",
      "cover_image":"https://…", "author":"…", "category":"…", "published_at":"2026-08-11T…" }
  ],
  "count": 42, "limit": 12, "offset": 0 }
```

`GET /store/articles/:slug?locale=de` → `{ "article": { …all localised fields incl. body, meta_title, meta_description… } }` or `404`.

### Admin (protected) — `src/api/admin/articles/` (direct service, content-block style)
- `GET /admin/articles` — list all (any status), newest first.
- `POST /admin/articles` — create `{ slug?, title, status?, … }`; auto-slugify from title if slug omitted; **409** if slug exists.
- `GET /admin/articles/:id`
- `POST /admin/articles/:id` — update any fields (incl. per-locale + meta + publish).
- `DELETE /admin/articles/:id` — soft delete.

Locale resolution helper (shared): given `locale ∈ {de,en,it}` return `field_<locale>` or fall back to base (`de`) when empty.

---

## 3. Admin UI — `src/admin/routes/articles/`
- **List page** (`page.tsx`): table — Title, Status badge, Published date, Author; "New article".
- **Create/Edit** form:
  - `slug` (auto from title, editable) · `status` · `published_at` · `category` · `author`
  - `cover_image` upload (reuse product image upload flow → S3)
  - **de / en / it tabs** for: title, excerpt, **body** (reuse content-blocks rich-text editor), meta_title, meta_description
- Uses `sdk.client.fetch("/admin/articles…")`.

---

## 4. Storefront — Planeta GmbH first (`planetagmbh_medusa-storefront`)
Routes under `src/app/[countryCode]/(main)/magazin/`:
- `page.tsx` — index grid (cover, title, excerpt, date), pagination.
- `[slug]/page.tsx` — article: cover, title, author, date, `body` HTML.
- Data: `src/lib/data/articles.ts` via `sdk.client.fetch("/store/articles…")` (never raw fetch).

### SEO (per article, in `generateMetadata`)
- `<title>` = `meta_title` || `title`; description = `meta_description` || `excerpt`
- **Open Graph / Twitter**: title, description, `cover_image`, type=article
- **Canonical** + **hreflang** alternates (de/en/it) via `alternates.languages`
- **JSON-LD `Article`** `<script type="application/ld+json">` (headline, image, datePublished, author)
- **Sitemap**: add published `/<locale>/magazin/<slug>` to `sitemap.ts`
- ISR/`revalidate` so publishes appear without redeploy

Industries storefront: same components/routes copied over in a later step.

---

## 5. Deliverables by phase
- **P1 backend:** module + model + migration + config registration + store & admin routes. Build passes.
- **P2 admin UI:** list + editor (de/en/it, cover upload, publish).
- **P3 storefront (Planeta):** index + article pages + full SEO + sitemap.
- **P4:** replicate to Industries storefront.
- **P5 (optional/future):** categories/tags, related-products link, **Author entity** (§6 Option B).

---

## 6. DECISION — **CHOSEN: B, author entity with LinkedIn**

`article_author` table: `id, name, slug (unique), role, bio/bio_en/bio_it, photo_url,
linkedin_url, website_url, xing_url, active`. `article.author` is a nullable
`belongsTo` → `author_id` FK (weeklyAction ↔ item pattern). Storefront byline + author
page `/<locale>/magazin/autor/<slug>`; SEO uses JSON-LD `Person` with `url` (author page)
+ `sameAs: [linkedin_url, …]`. (Original A/B comparison kept below for reference.)

---

## 6b. (reference) Author — plain text (A) vs entity (B)

### Option A — plain text (in the spec above) ✅ recommended for v1
- Schema: one column `author text null` on `article`.
- UX: type a name per article → byline "von …". No photo/bio/author page.
- Effort: **0 extra** (already included).
- Migration to B later: trivial — add the entity, backfill names from this column.

### Option B — author entity
- New table `article_author`:
  ```
  id, name, slug (unique), role, bio, bio_en, bio_it, photo_url, active, timestamps
  ```
  + article gains `author_id` (or a module link `article ↔ article_author`).
- UX: reusable author profiles — **photo + bio** byline, **author page**
  `/<locale>/magazin/autor/<slug>` listing that author's articles.
- Extra work vs A: +1 table & migration, +admin author CRUD page, +storefront author page,
  +join in article queries. Roughly **+1 phase**.
- Worth it only if you'll feature **named writers** with profiles.

| | A: plain text | B: entity |
|---|---|---|
| Byline name | ✅ | ✅ |
| Author photo + bio | ❌ | ✅ |
| Author profile page | ❌ | ✅ |
| Reuse author across articles | ❌ (retype) | ✅ |
| Extra build effort | none | ~+1 phase |
| Upgrade A→B later | — | easy (backfill) |

**Recommendation:** ship **A** now; add **B** later if you want writer profiles. Nothing
is lost by starting with A.

---

## 7. Remaining micro-decisions (optional)
- Page size for the index (default 12)?
- Show `category` as a simple label in v1 even though there's no filtering yet? (default: yes, just display)
- Author label wording: "von {author}" (default)?
```
