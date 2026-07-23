import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Adds EN + IT translations for the Vakuumbeutel products (title + subtitle),
 * derived from their German fields. Only creates a translation where one is
 * MISSING — existing ones are left untouched. Idempotent and prod-portable
 * (finds products by handle, writes via the Translation module).
 *
 * Run: pnpm medusa exec ./src/scripts/translate-vakuumbeutel.js
 */
const LOCALES = ["en-US", "it-IT"]

const buildFields = (locale: string, w: string, h: string, pack: string) => {
  if (locale.startsWith("en")) {
    return {
      title: `Vacuum bag ${w} x ${h} mm`,
      subtitle: `Packaging unit: ${pack} pieces`,
    }
  }
  if (locale.startsWith("it")) {
    return {
      title: `Sacchetto sottovuoto ${w} x ${h} mm`,
      subtitle: `Unità di imballaggio: ${pack} pezzi`,
    }
  }
  return null
}

export default async function run({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const translationModule: any = container.resolve(Modules.TRANSLATION)

  const products = await productModule.listProducts(
    { handle: { $like: "vakuumbeutel-%" } },
    { take: 500, select: ["id", "title", "subtitle", "handle"] }
  )

  let created = 0
  let skipped = 0
  for (const p of products) {
    const dim = /(\d+)\s*x\s*(\d+)/i.exec(p.title ?? "")
    const packM = /(\d+)\s*Stück/i.exec(p.subtitle ?? "")
    if (!dim) {
      logger.warn(`  ⚠ ${p.handle}: no WxH in title "${p.title}" — skipped`)
      continue
    }
    const [w, h] = [dim[1], dim[2]]
    const pack = packM?.[1] ?? "1000"

    for (const locale_code of LOCALES) {
      const fields = buildFields(locale_code, w, h, pack)
      if (!fields) continue

      const existing = await translationModule.listTranslations({
        reference: "product",
        reference_id: p.id,
        locale_code,
      })
      if (existing[0]) {
        skipped++ // already translated — leave it
        continue
      }
      await translationModule.createTranslations({
        reference: "product",
        reference_id: p.id,
        locale_code,
        translations: fields,
      })
      created++
    }
  }

  console.log(
    `TRANSLATE DONE: created=${created} skipped=${skipped} across ${products.length} products (${LOCALES.join(", ")})`
  )
}
