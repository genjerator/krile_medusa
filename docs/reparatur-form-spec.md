# Reparaturformular (Repair Form) — Feature Spec

Digitises `public/Reparaturformular_fi.pdf`: a public web form customers fill in
and submit, stored in a new `reparatur` DB table and listed in the Medusa admin
as a new extension.

Modelled 1:1 on the existing **Product Inquiry** feature
(`src/modules/productInquiry`, `/store/inquiries`, `src/admin/routes/inquiries`)
— same shape: storefront form → validated `/store` route → workflow → module
service → `admin` list page.

## 1. Fields (from the PDF → `reparatur` table)

The PDF's **Firma** field is split into **Name** + **Vorname** per request.

| PDF label            | Column               | Type    | Required | Notes |
|----------------------|----------------------|---------|----------|-------|
| Kd. Nr.              | `kd_nr`              | text    | no       | customer number (top of form) |
| Firma → **Name**     | `name`               | text    | **yes**  | replaces "Firma" |
| Firma → **Vorname**  | `vorname`            | text    | **yes**  | new, split from "Firma" |
| Kontakt              | `kontakt`            | text    | no       | contact person |
| Strasse/Nr.          | `strasse_nr`         | text    | **yes**  | street + number |
| PLZ                  | `plz`                | text    | **yes**  | postal code |
| Ort                  | `ort`                | text    | **yes**  | city |
| Land                 | `land`               | text    | **yes**  | country |
| Tel.                 | `tel`                | text    | no       | phone |
| Email                | `email`              | text    | **yes**  | validated email |
| Kunden-nummer        | `kunden_nummer`      | text    | no       | bottom-row field (see note) |
| Geräte-nummer        | `geraete_nummer`     | text    | no       | device / serial number |
| anderer Empfänger    | `anderer_empfaenger` | boolean | no       | checkbox, default `false` |
| Datum                | `datum`              | text    | no       | form date (ISO string) |
| Beschreibung         | `beschreibung`       | text    | **yes**  | fault description (long text) |
| Ort (signature)      | `unterschrift_ort`   | text    | no       | signature block |
| Datum (signature)    | `unterschrift_datum` | text    | no       | signature block |
| Unterschrift         | `unterschrift`       | text    | no       | typed signature / name |

**Meta columns** (not on the PDF, follow the inquiry pattern):

| Column             | Type | Notes |
|--------------------|------|-------|
| `id`               | id   | primary key (auto) |
| `sales_channel_id` | text nullable | resolved from the publishable key |
| `source_url`       | text nullable | storefront page the form was sent from |
| `locale`           | text nullable | storefront UI locale (de/en/…) |
| `created_at`/`updated_at` | auto | from `model.define` |

**Note — `kd_nr` vs `kunden_nummer`:** the PDF shows both "Kd. Nr." (top) and
"Kunden-nummer" (bottom). They are likely the same value; both are kept to stay
faithful to the PDF. Easy to merge later if confirmed redundant.

**Page 2** of the PDF is a shipping label (Absender = the form's own address,
Empfänger = fixed Planeta address) — it adds no new data fields, so it is not
modelled. The storefront page can still offer the printable PDF for the label.

## 2. Backend (repo: `krile_medusa`)

### 2.1 Module `reparatur`
- `src/modules/reparatur/models/reparatur.ts` — `model.define("reparatur", { … })`
  with the columns above.
- `src/modules/reparatur/service.ts` — `MedusaService({ Reparatur })`.
- `src/modules/reparatur/index.ts` — `REPARATUR_MODULE = "reparatur"`.
- Register in `medusa-config.ts` `modules` (`resolve: "./src/modules/reparatur"`).
- Generate migration via the module's db:generate (snapshot + `MigrationXXXX.ts`).

### 2.2 Workflow
- `src/workflows/create-reparatur.ts` + `src/workflows/steps/create-reparatur.ts`
  — single create step with a compensation (delete) that returns the row.
  (No customer-link/email step unless requested — see §5.)

### 2.3 Store API (public submit)
- `POST /store/reparatur` (`src/api/store/reparatur/route.ts`) — reads
  `req.validatedBody`, adds `sales_channel_ids` from `req.publishable_key_context`,
  runs the workflow, returns `201 { reparatur }`.
- Validation `CreateReparaturSchema` (zod) + a rate limiter (3/min, reuse the
  inquiry limiter config) wired in `src/api/middlewares.ts` for
  `matcher: "/store/reparatur", method: "POST"`. Text fields are tag-stripped;
  `email` validated; long fields length-capped.

### 2.4 Admin API (list)
- `GET /admin/reparatur?limit&offset` (`src/api/admin/reparatur/route.ts`) —
  `listAndCount` newest-first, enriches each row with `sales_channel_name`.
  Returns `{ reparaturen, count, limit, offset }`.

## 3. Admin extension (repo: `krile_medusa`)
- `src/admin/routes/reparatur/page.tsx` — sidebar route labelled **"Reparaturen"**
  (icon e.g. `Tools`/`Wrench` from `@medusajs/icons`). Mirrors the Inquiries page:
  paginated table (Name, Vorname, Ort, Geräte-nr., E-Mail, Date) + a `Drawer`
  showing every field of the selected submission, with `mailto:` on the email.

## 4. Storefront page (repo: TBD — see §5)
- Route `/[countryCode]/(main)/reparatur/page.tsx` + a client form component.
- All PDF fields rendered, grouped: **Auftraggeber** (address block),
  **Gerät** (Kunden-/Geräte-nummer), **Beschreibung**, **Unterschrift**.
  German labels; required fields marked. `anderer Empfänger` is a checkbox.
- Submits to `/store/reparatur` with the publishable key + `locale` +
  `source_url`; shows success / error + rate-limit handling. On success, offer
  the printable PDF/label.

## 5. Decisions (confirmed)
1. **Storefront:** `krile_medusa-storefront` (planetaindustries.de) only.
2. **Emails on submit:** BOTH — a best-effort German **customer confirmation**
   ("Reparaturanfrage erhalten") and a **staff notification** ("Neue
   Reparaturanfrage") to the Planeta mailbox. Sent via the Notification module +
   `smtp-notification` provider, account resolved from the sales-channel name
   (`src/lib/store-email-identity.ts`), exactly like order/inquiry mails. Errors
   are logged, never thrown (never rolls back the saved submission).
3. **Required-field set:** as marked in §1.

## 6. Out of scope
- Editing/deleting submissions from the admin (list + detail view only, like Inquiries).
- Auto-filling the address into the page-2 shipping label.
- Merging `kd_nr`/`kunden_nummer` (kept separate pending confirmation).
