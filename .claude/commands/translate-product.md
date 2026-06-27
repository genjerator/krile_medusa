---
description: Generate a translation-table upsert with a full translation of a product's translatable fields into a target locale.
argument-hint: <product_id> [locale-code]
allowed-tools: Bash(./translation-source.sh:*)
---

Fetch the product's translatable source fields (runs against the local DB, or
prod if `DATABASE_URL` is exported):

!`./translation-source.sh $1`

Using the JSON above, translate the `title`, `subtitle`, `description`, and
`material` fields from German into the target locale **`$2`** (if `$2` is empty,
use `en-US`). Then output **one** ready-to-run SQL upsert into the `translation`
table, following these rules exactly:

- `reference` = `'product'`, `reference_id` = the product's id, `locale_code` = the target locale.
- Put **only the non-null** translated fields into the `translations` jsonb.
- `translated_field_count` = number of fields actually translated.
- `id` = `'trans_' || upper(substr(md5(random()::text), 1, 26))`.
- Conflict clause: `ON CONFLICT (reference_id, locale_code) WHERE deleted_at IS NULL DO UPDATE SET translations = EXCLUDED.translations, translated_field_count = EXCLUDED.translated_field_count, updated_at = now()`.
- Do NOT translate tech data / metadata — only the four product fields above.

If `existing_locales` already contains the target locale, note that this upsert
will overwrite it.

Output only the SQL in a single ```sql code block, then one line reminding to
revalidate the storefront afterward (direct DB writes don't fire Medusa events).
