import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productCategoryModule = container.resolve(Modules.PRODUCT)
  const translationModule = container.resolve(Modules.TRANSLATION)

  logger.info("🚀 Starting category seed...")

  // ─── LOCALES ──────────────────────────────────────────────────────────────
  const existingLocales = await translationModule.listLocales()
  const existingLocaleCodes = existingLocales.map((l: any) => l.code)
  for (const locale of [
    { code: "de-DE", name: "Deutsch" },
    { code: "en-US", name: "English" },
  ]) {
    if (!existingLocaleCodes.includes(locale.code)) {
      await translationModule.createLocales([locale])
      logger.info(`Created locale: ${locale.code}`)
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const toHandle = (name: string) =>
    name
      .toLowerCase()
      .replace(/[äÄ]/g, "ae")
      .replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue")
      .replace(/[ß]/g, "ss")
      .replace(/[()]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

  const upsertTranslation = async (
    reference_id: string,
    locale_code: string,
    translations: Record<string, string>
  ) => {
    const existing = await translationModule.listTranslations({
      reference_id,
      reference: "product_category",
      locale_code,
    })
    if (existing[0]) {
      await translationModule.updateTranslations({ id: existing[0].id, translations })
    } else {
      await translationModule.createTranslations({
        reference_id,
        reference: "product_category",
        locale_code,
        translations,
      })
    }
  }

  const createCategory = async (
    nameDE: string,
    nameEN: string,
    parentId?: string
  ) => {
    const handle = toHandle(nameDE)
    const existing = await productCategoryModule.listProductCategories({ handle: [handle] })
    let category = existing[0]
    if (!category) {
      const [created] = await productCategoryModule.createProductCategories([{
        name: nameDE,
        handle,
        is_active: true,
        is_internal: false,
        ...(parentId && { parent_category_id: parentId }),
      }])
      category = created
      logger.info(`  ✓ created: ${nameDE}`)
    } else {
      logger.info(`  ↩ exists: ${nameDE}`)
    }

    await upsertTranslation(category.id, "de-DE", { name: nameDE })
    await upsertTranslation(category.id, "en-US", { name: nameEN })

    return category
  }

  // ─── TOP-LEVEL CATEGORIES ─────────────────────────────────────────────────
  const vakuumMaschinen       = await createCategory("Vakuum Maschinen",          "Vacuum Machines")
  const vakuumBeutel          = await createCategory("Vakuum Beutel",             "Vacuum Bags")
  const strukturierteRollen   = await createCategory("Strukturierte Rollen",      "Structured Rolls")
  const vakuumBehaelter       = await createCategory("Vakuum Behälter",           "Vacuum Containers")
  const vakuumFlaschenVentile = await createCategory("Vakuum Flaschen Ventile",   "Vacuum Bottle Valves")
  const vakuumDeckel          = await createCategory("Vakuum Topf Vakuum Deckel", "Vacuum Pot Lid")
  const marinierGewuerz       = await createCategory("Marinier Gewürzmischungen", "Marinating Spice Blends")

  // ─── VAKUUM BEUTEL ────────────────────────────────────────────────────────
  await createCategory("Siegelrandbeutel",     "Seal Edge Bags",    vakuumBeutel.id)
  await createCategory("Strukturierte Beutel", "Structured Bags",   vakuumBeutel.id)

  // ─── VAKUUM BEHÄLTER ──────────────────────────────────────────────────────
  await createCategory("Tritan (BPA FREI) Vakuum Behälter", "Tritan (BPA FREE) Vacuum Containers", vakuumBehaelter.id)
  await createCategory("Glas Vakuumbehälter Set",           "Glass Vacuum Container Set",          vakuumBehaelter.id)
  await createCategory("Edelstahl Vakuumbehälter",          "Stainless Steel Vacuum Container",    vakuumBehaelter.id)

  // ─── MARINIER GEWÜRZMISCHUNGEN ────────────────────────────────────────────
  await createCategory("Rind",     "Beef",    marinierGewuerz.id)
  await createCategory("Schwein",  "Pork",    marinierGewuerz.id)
  await createCategory("Geflügel", "Poultry", marinierGewuerz.id)
  await createCategory("Vegan",    "Vegan",   marinierGewuerz.id)

  logger.info("✅ Category seed complete!")
}
