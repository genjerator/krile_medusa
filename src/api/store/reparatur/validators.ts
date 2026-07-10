import { z } from "zod"

const stripTags = (value: string) => value.replace(/<[^>]*>/g, "").trim()

/** Required free-text field: trimmed, tag-stripped, must still contain text. */
const requiredText = (max = 200) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .transform(stripTags)
    .refine((v) => v.length > 0, { message: "Field must contain text" })

/** Optional free-text field: trimmed + tag-stripped, empty allowed. */
const optionalText = (max = 200) =>
  z.string().trim().max(max).transform(stripTags).optional().or(z.literal(""))

export const CreateReparaturSchema = z.object({
  kd_nr: optionalText(100),
  name: requiredText(150),
  vorname: requiredText(150),
  kontakt: optionalText(150),
  strasse_nr: requiredText(200),
  plz: requiredText(20),
  ort: requiredText(120),
  land: requiredText(120),
  tel: z
    .string()
    .trim()
    .max(60)
    .regex(/^[+a-zA-Z0-9\s()/-]*$/, "Phone may only contain letters, numbers, spaces, ( ) / - and +")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().toLowerCase().email(),
  kunden_nummer: optionalText(100),
  geraete_nummer: optionalText(100),
  anderer_empfaenger: z.boolean().optional().default(false),
  datum: optionalText(40),
  beschreibung: requiredText(4000),
  unterschrift_ort: optionalText(120),
  unterschrift_datum: optionalText(40),
  unterschrift: optionalText(150),
  // Storefront UI locale (de/en/…); picks the confirmation-email language.
  locale: z.string().trim().max(10).optional(),
  // The storefront page URL the form was submitted from (shown in the emails).
  source_url: z.string().trim().max(500).optional(),
})

export type CreateReparaturSchema = z.infer<typeof CreateReparaturSchema>
