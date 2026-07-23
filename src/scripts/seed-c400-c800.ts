import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Seeds the MULTIVAC C 400 and C 800 floor chamber machines ("Standkammer-
 * maschinen, groß"), with technical data from the C 400 / C 800 spec PDF.
 * Modelled on seed-p400.ts. Idempotent (upsert by handle). Prices are
 * placeholders — update before going live.
 */
export default async function seedC400C800({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC C 400 / C 800 seed...")

  const allRegions = await regionModule.listRegions()
  const region = allRegions[0] ?? (await regionModule.createRegions([{
    name: "Europe", currency_code: "eur", countries: ["de", "at", "ch", "rs", "hr", "si"],
  }]))[0]

  const existingLocales = await translationModule.listLocales()
  const existingLocaleCodes = existingLocales.map((l: any) => l.code)
  for (const locale of [{ code: "de-DE", name: "Deutsch" }, { code: "en-US", name: "English" }, { code: "it-IT", name: "Italiano" }]) {
    if (!existingLocaleCodes.includes(locale.code)) await translationModule.createLocales([locale])
  }

  const existingChannels = await salesChannelModule.listSalesChannels({ name: "IndustriesWebshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "IndustriesWebshop", description: "MULTIVAC machinery webshop",
  }]))[0]

  const existingParent = await productModule.listProductCategories({ handle: ["chamber-machines"] })
  const parentCategory = existingParent[0] ?? (await productModule.createProductCategories([{
    name: "Chamber Machines", handle: "chamber-machines",
    description: "MULTIVAC vacuum chamber machines for food and non-food packaging",
    is_active: true, is_internal: false,
  }]))[0]

  const existingFloor = await productModule.listProductCategories({ handle: ["floor-chamber-machines"] })
  const floorCategory = existingFloor[0] ?? (await productModule.createProductCategories([{
    name: "Floor Chamber Machines", handle: "floor-chamber-machines",
    description: "MULTIVAC floor-standing chamber machines — high throughput for production environments.",
    parent_category_id: parentCategory.id, is_active: true, is_internal: false,
  }]))[0]

  const tagValues = ["vacuum-packaging", "chamber-machine", "standkammermaschine", "floor-standing", "MULTIVAC", "C-Series", "c400", "c800", "high-throughput"]
  const existingTags = await productModule.listProductTags({ value: tagValues })
  const existingTagValues = existingTags.map((t) => t.value)
  const toCreate = tagValues.filter((v) => !existingTagValues.includes(v))
  const newTags = toCreate.length > 0 ? await productModule.createProductTags(toCreate.map((value) => ({ value }))) : []
  const tagIds = [...existingTags, ...newTags].map((t) => ({ id: t.id }))

  const upsertProduct = async (data: CreateProductDTO & Record<string, unknown>): Promise<any> => {
    const { data: found } = await query.graph({ entity: "product", filters: { handle: data.handle! }, fields: ["id", "variants.*"] })
    if (found[0]) {
      await productModule.updateProducts({ id: (found[0] as any).id }, {
        title: (data as any).title, subtitle: (data as any).subtitle, description: (data as any).description,
        status: (data as any).status, metadata: (data as any).metadata, weight: (data as any).weight,
        height: (data as any).height, length: (data as any).length, width: (data as any).width,
        origin_country: (data as any).origin_country, material: (data as any).material,
      })
      return found[0]
    }
    const [created] = await productModule.createProducts([data])
    return created
  }

  const upsertTranslation = async (reference_id: string, locale_code: string, translations: Record<string, string>) => {
    const existing = await translationModule.listTranslations({ reference_id, reference: "product", locale_code })
    if (existing[0]) { await translationModule.updateTranslations({ id: existing[0].id, translations }) }
    else { await translationModule.createTranslations({ reference_id, reference: "product", locale_code, translations }) }
  }

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:9000/static"

  // Technical data goes into the product's "Technische Daten" feature — rich-text
  // HTML stored in metadata keys technische_daten_html[_en|_it] (see the
  // product-technical-data-editor widget). We do NOT use structured
  // ausstattung__* metadata keys: those drive the storefront's auto spec table,
  // which needs a translated label per field and errors on unknown fields.
  const techTable = (rows: [string, string][]) =>
    `<table><tbody>${rows
      .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`)
      .join("")}</tbody></table>`

  const techData = (
    de: [string, string][],
    en: [string, string][],
    it: [string, string][]
  ) => ({
    technische_daten_html: techTable(de),
    technische_daten_html_en: techTable(en),
    technische_daten_html_it: techTable(it),
  })

  // ── C 400 ──────────────────────────────────────────────────────────────────
  // English copy — used for the base product AND the explicit en-US translation.
  const c400En = {
    title: "MULTIVAC C 400",
    subtitle: "Pack larger batches faster — a flexible floor chamber machine that grows with your production",
    description:
      "The MULTIVAC C 400 is a floor-standing vacuum chamber machine (Standkammermaschine) for " +
      "small to medium batches and larger products. A wide range of equipment options makes it " +
      "highly configurable: 4 chamber-lid heights, 4 sealing-bar arrangements, 5 sealing systems, " +
      "automatic lid movement, gas flushing for MAP packaging, and vacuum pumps up to 150 m³/h.\n\n" +
      "Standard usable sealing length front 700 mm / right 450 mm, chamber depth/width 475 mm, " +
      "chamber height 170 mm (optional 250 / 330 / 380 mm). Doppelnaht-Trennsiegelung sealing and " +
      "the digital MC 06 control with auto-stop, 18 operating languages and 29 program slots. " +
      "GS-certified (DGUV), MULTIVAC Hygienic Design and fully washdown-capable.\n\n" +
      "Specifications: Usable sealing length front 700 / right 450 mm | Chamber depth/width 475 mm | " +
      "Chamber height 170 mm (opt. 250/330/380) | Machine dimensions (closed) 880 × 785 × 1035 mm | " +
      "(open) 880 × 785 × 1480 mm | Weight 250 kg | Vacuum pump 100 / 150 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  }

  const c400 = await upsertProduct({
    title: c400En.title,
    handle: "multivac-c400",
    subtitle: c400En.subtitle,
    images: [
      { url: `${BASE}/products/floor/c400-overview.jpg` },
      { url: `${BASE}/products/floor/c400-spec.jpg` },
    ],
    description: c400En.description,
    status: "published",
    weight: 250000,
    length: 785,
    width: 880,
    height: 1035,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [floorCategory.id],
    tags: tagIds,
    metadata: techData(
      [
        ["Bauform", "Standkammermaschine (groß)"],
        ["Nutzbare Siegellänge", "vorn 700 mm / rechts 450 mm"],
        ["Kammertiefe / -breite", "475 mm"],
        ["Kammerhöhe", "170 mm (optional 250 / 330 / 380 mm)"],
        ["Anzahl der Siegelschienen", "1 × vorne, 1 × rechts"],
        ["Siegelung", "Doppelnaht-Trennsiegelung"],
        ["Vakuumpumpe", "100 / 150 m³/h (optional)"],
        ["Maschinenmaße (geschlossener Deckel)", "880 × 785 × 1035 mm"],
        ["Maschinenmaße (geöffneter Deckel)", "880 × 785 × 1480 mm"],
        ["Gewicht", "250 kg"],
        ["Steuerung", "MC 06 (Auto-Stopp, 18 Sprachen, 29 Speicherplätze)"],
        ["Spannung", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Automatischer Deckelhub", "optional"],
        ["Schutzgaseinrichtung", "optional (inkl. Beutelklemmung)"],
      ],
      [
        ["Type", "Floor chamber machine (large)"],
        ["Usable sealing length", "front 700 mm / right 450 mm"],
        ["Chamber depth / width", "475 mm"],
        ["Chamber height", "170 mm (optional 250 / 330 / 380 mm)"],
        ["Number of sealing bars", "1 × front, 1 × right"],
        ["Sealing", "Double-seam separating seal"],
        ["Vacuum pump", "100 / 150 m³/h (optional)"],
        ["Machine dimensions (lid closed)", "880 × 785 × 1035 mm"],
        ["Machine dimensions (lid open)", "880 × 785 × 1480 mm"],
        ["Weight", "250 kg"],
        ["Control", "MC 06 (auto-stop, 18 languages, 29 program slots)"],
        ["Voltage", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Automatic lid lift", "optional"],
        ["Gas flushing device", "optional (incl. bag clamp)"],
      ],
      [
        ["Tipo", "Macchina a campana da pavimento (grande)"],
        ["Lunghezza utile di saldatura", "anteriore 700 mm / destra 450 mm"],
        ["Profondità / larghezza camera", "475 mm"],
        ["Altezza camera", "170 mm (opzionale 250 / 330 / 380 mm)"],
        ["Numero di barre saldanti", "1 × anteriore, 1 × destra"],
        ["Saldatura", "Saldatura di separazione a doppia cucitura"],
        ["Pompa per vuoto", "100 / 150 m³/h (opzionale)"],
        ["Dimensioni macchina (coperchio chiuso)", "880 × 785 × 1035 mm"],
        ["Dimensioni macchina (coperchio aperto)", "880 × 785 × 1480 mm"],
        ["Peso", "250 kg"],
        ["Controllo", "MC 06 (auto-stop, 18 lingue, 29 programmi)"],
        ["Tensione", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Sollevamento automatico del coperchio", "opzionale"],
        ["Dispositivo per gas protettivo", "opzionale (incl. morsetto sacchetto)"],
      ]
    ),
    options: [{ title: "Schutzgaseinrichtung", values: ["Ohne Schutzgaseinrichtung", "Mit Schutzgaseinrichtung"] }],
    variants: [
      { title: "C 400 – Ohne Schutzgaseinrichtung", sku: "MULTIVAC-C400-STD", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Ohne Schutzgaseinrichtung" } },
      { title: "C 400 – Mit Schutzgaseinrichtung", sku: "MULTIVAC-C400-MAP", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Mit Schutzgaseinrichtung" } },
    ],
  })

  await upsertTranslation(c400.id, "de-DE", {
    title: "MULTIVAC C 400",
    subtitle: "Größere Chargen schneller verpacken – die flexible Standkammermaschine, die mit Ihrer Produktion mitwächst",
    description:
      "Die MULTIVAC C 400 ist eine Standkammermaschine für kleine bis mittlere Chargen und größere " +
      "Produkte. Durch ein großes Spektrum an Ausstattungsoptionen ist sie individuell konfigurierbar: " +
      "4 Kammerdeckelhöhen, 4 Siegelschienenanordnungen, 5 Siegelsysteme, automatische Deckelbewegung, " +
      "Schutzgaseinrichtung für MAP-Packungen und Vakuumpumpen bis zu 150 m³/h.\n\n" +
      "Nutzbare Siegellänge vorn 700 mm / rechts 450 mm, Kammertiefe/-breite 475 mm, Kammerhöhe 170 mm " +
      "(optional 250 / 330 / 380 mm). Doppelnaht-Trennsiegelung und die digitale Steuerung MC 06 mit " +
      "Auto-Stopp, 18 Bediensprachen und 29 Produktspeicherplätzen. GS-geprüft (DGUV), MULTIVAC Hygienic " +
      "Design und komplett washdownfähig.\n\n" +
      "Technische Daten: Nutzbare Siegellänge vorn 700 / rechts 450 mm | Kammertiefe/-breite 475 mm | " +
      "Kammerhöhe 170 mm (opt. 250/330/380) | Maschinenmaße (geschlossen) 880 × 785 × 1035 mm | " +
      "(geöffnet) 880 × 785 × 1480 mm | Gewicht 250 kg | Vakuumpumpe 100 / 150 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  await upsertTranslation(c400.id, "en-US", c400En)

  await upsertTranslation(c400.id, "it-IT", {
    title: "MULTIVAC C 400",
    subtitle: "Confezionare lotti più grandi più velocemente – la flessibile macchina a campana da pavimento che cresce con la vostra produzione",
    description:
      "La MULTIVAC C 400 è una macchina sottovuoto a campana da pavimento (Standkammermaschine) per " +
      "lotti piccoli e medi e prodotti di grandi dimensioni. Un'ampia gamma di opzioni di equipaggiamento " +
      "la rende configurabile individualmente: 4 altezze del coperchio della camera, 4 disposizioni delle " +
      "barre saldanti, 5 sistemi di saldatura, movimento automatico del coperchio, dispositivo per gas " +
      "protettivo per confezioni MAP e pompe per vuoto fino a 150 m³/h.\n\n" +
      "Lunghezza utile di saldatura anteriore 700 mm / destra 450 mm, profondità/larghezza camera 475 mm, " +
      "altezza camera 170 mm (opzionale 250 / 330 / 380 mm). Saldatura di separazione a doppia cucitura e " +
      "controllo digitale MC 06 con auto-stop, 18 lingue e 29 programmi memorizzabili. Certificata GS " +
      "(DGUV), MULTIVAC Hygienic Design e completamente lavabile (washdown).\n\n" +
      "Dati tecnici: Lunghezza utile di saldatura anteriore 700 / destra 450 mm | Profondità/larghezza " +
      "camera 475 mm | Altezza camera 170 mm (opz. 250/330/380) | Dimensioni macchina (chiusa) " +
      "880 × 785 × 1035 mm | (aperta) 880 × 785 × 1480 mm | Peso 250 kg | Pompa per vuoto 100 / 150 m³/h | " +
      "3×400V 50Hz / 3×220V 60Hz",
  })

  // ── C 800 ──────────────────────────────────────────────────────────────────
  // English copy — used for the base product AND the explicit en-US translation.
  const c800En = {
    title: "MULTIVAC C 800",
    subtitle: "Vacuum-pack long products with ease — for slicer logs, salami sticks and whole fish",
    description:
      "The MULTIVAC C 800 is a floor-standing vacuum chamber machine developed for packaging " +
      "especially long products such as slicer log/caliber ware, salami sticks or whole fish. " +
      "It can be equipped with automatic lid movement, roller conveyors for ergonomic product " +
      "handling, gas flushing for MAP packaging, and vacuum pumps up to 300 m³/h.\n\n" +
      "Two usable sealing bars of 780 mm (left and right), chamber depth/width 780 mm, chamber " +
      "height 170 mm. Doppelnaht-Trennsiegelung sealing and the digital MC 06 control with auto-stop, " +
      "18 operating languages and 29 program slots. GS-certified (DGUV), MULTIVAC Hygienic Design and " +
      "fully washdown-capable.\n\n" +
      "Specifications: Usable sealing length 2 × 780 mm | Chamber depth/width 780 mm | Chamber height " +
      "170 mm | Machine dimensions (closed) 1650 × 1050 × 1070 mm | (open) 1650 × 1050 × 1670 mm | " +
      "Weight 350 kg | Vacuum pump 250 / 300 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  }

  const c800 = await upsertProduct({
    title: c800En.title,
    handle: "multivac-c800",
    subtitle: c800En.subtitle,
    images: [
      { url: `${BASE}/products/floor/c800-overview.jpg` },
      { url: `${BASE}/products/floor/c800-spec.jpg` },
    ],
    description: c800En.description,
    status: "published",
    weight: 350000,
    length: 1050,
    width: 1650,
    height: 1070,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [floorCategory.id],
    tags: tagIds,
    metadata: techData(
      [
        ["Bauform", "Standkammermaschine (groß)"],
        ["Nutzbare Siegellänge", "2 × 780 mm"],
        ["Kammertiefe / -breite", "780 mm"],
        ["Kammerhöhe", "170 mm"],
        ["Anzahl der Siegelschienen", "1 × links, 1 × rechts"],
        ["Siegelung", "Doppelnaht-Trennsiegelung"],
        ["Vakuumpumpe", "250 / 300 m³/h (optional)"],
        ["Maschinenmaße (geschlossener Deckel)", "1650 × 1050 × 1070 mm"],
        ["Maschinenmaße (geöffneter Deckel)", "1650 × 1050 × 1670 mm"],
        ["Gewicht", "350 kg"],
        ["Steuerung", "MC 06 (Auto-Stopp, 18 Sprachen, 29 Speicherplätze)"],
        ["Spannung", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Automatischer Deckelhub", "optional"],
        ["Rollenbahnen", "optional"],
        ["Schutzgaseinrichtung", "optional (inkl. Beutelklemmung)"],
      ],
      [
        ["Type", "Floor chamber machine (large)"],
        ["Usable sealing length", "2 × 780 mm"],
        ["Chamber depth / width", "780 mm"],
        ["Chamber height", "170 mm"],
        ["Number of sealing bars", "1 × left, 1 × right"],
        ["Sealing", "Double-seam separating seal"],
        ["Vacuum pump", "250 / 300 m³/h (optional)"],
        ["Machine dimensions (lid closed)", "1650 × 1050 × 1070 mm"],
        ["Machine dimensions (lid open)", "1650 × 1050 × 1670 mm"],
        ["Weight", "350 kg"],
        ["Control", "MC 06 (auto-stop, 18 languages, 29 program slots)"],
        ["Voltage", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Automatic lid lift", "optional"],
        ["Roller conveyors", "optional"],
        ["Gas flushing device", "optional (incl. bag clamp)"],
      ],
      [
        ["Tipo", "Macchina a campana da pavimento (grande)"],
        ["Lunghezza utile di saldatura", "2 × 780 mm"],
        ["Profondità / larghezza camera", "780 mm"],
        ["Altezza camera", "170 mm"],
        ["Numero di barre saldanti", "1 × sinistra, 1 × destra"],
        ["Saldatura", "Saldatura di separazione a doppia cucitura"],
        ["Pompa per vuoto", "250 / 300 m³/h (opzionale)"],
        ["Dimensioni macchina (coperchio chiuso)", "1650 × 1050 × 1070 mm"],
        ["Dimensioni macchina (coperchio aperto)", "1650 × 1050 × 1670 mm"],
        ["Peso", "350 kg"],
        ["Controllo", "MC 06 (auto-stop, 18 lingue, 29 programmi)"],
        ["Tensione", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Sollevamento automatico del coperchio", "opzionale"],
        ["Rulliere", "opzionale"],
        ["Dispositivo per gas protettivo", "opzionale (incl. morsetto sacchetto)"],
      ]
    ),
    options: [{ title: "Schutzgaseinrichtung", values: ["Ohne Schutzgaseinrichtung", "Mit Schutzgaseinrichtung"] }],
    variants: [
      { title: "C 800 – Ohne Schutzgaseinrichtung", sku: "MULTIVAC-C800-STD", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Ohne Schutzgaseinrichtung" } },
      { title: "C 800 – Mit Schutzgaseinrichtung", sku: "MULTIVAC-C800-MAP", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Mit Schutzgaseinrichtung" } },
    ],
  })

  await upsertTranslation(c800.id, "de-DE", {
    title: "MULTIVAC C 800",
    subtitle: "Lange Produkte mühelos vakuumieren – für Kaliberware, Salami-Stangen und ganze Fische",
    description:
      "Die MULTIVAC C 800 wurde für das Verpacken von besonders langen Produkten entwickelt, wie " +
      "Kaliberware für Slicer, Salami-Stangen oder ganze Fische. Sie ist unter anderem ausstattbar mit " +
      "automatischer Deckelbewegung, Rollenbahnen für ergonomischen Produkttransport, Schutzgaseinrichtung " +
      "für MAP-Packungen und Vakuumpumpen bis zu 300 m³/h.\n\n" +
      "Zwei nutzbare Siegelschienen mit 780 mm (links und rechts), Kammertiefe/-breite 780 mm, " +
      "Kammerhöhe 170 mm. Doppelnaht-Trennsiegelung und die digitale Steuerung MC 06 mit Auto-Stopp, " +
      "18 Bediensprachen und 29 Produktspeicherplätzen. GS-geprüft (DGUV), MULTIVAC Hygienic Design und " +
      "komplett washdownfähig.\n\n" +
      "Technische Daten: Nutzbare Siegellänge 2 × 780 mm | Kammertiefe/-breite 780 mm | Kammerhöhe 170 mm | " +
      "Maschinenmaße (geschlossen) 1650 × 1050 × 1070 mm | (geöffnet) 1650 × 1050 × 1670 mm | Gewicht 350 kg | " +
      "Vakuumpumpe 250 / 300 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  await upsertTranslation(c800.id, "en-US", c800En)

  await upsertTranslation(c800.id, "it-IT", {
    title: "MULTIVAC C 800",
    subtitle: "Confezionare sottovuoto prodotti lunghi senza sforzo – per prodotti calibrati per affettatrici, salami e pesci interi",
    description:
      "La MULTIVAC C 800 è una macchina sottovuoto a campana da pavimento sviluppata per il " +
      "confezionamento di prodotti particolarmente lunghi, come prodotti calibrati per affettatrici, " +
      "salami o pesci interi. Può essere equipaggiata con movimento automatico del coperchio, rulliere " +
      "per una movimentazione ergonomica del prodotto, dispositivo per gas protettivo per confezioni MAP " +
      "e pompe per vuoto fino a 300 m³/h.\n\n" +
      "Due barre saldanti utili da 780 mm (sinistra e destra), profondità/larghezza camera 780 mm, " +
      "altezza camera 170 mm. Saldatura di separazione a doppia cucitura e controllo digitale MC 06 con " +
      "auto-stop, 18 lingue e 29 programmi memorizzabili. Certificata GS (DGUV), MULTIVAC Hygienic " +
      "Design e completamente lavabile (washdown).\n\n" +
      "Dati tecnici: Lunghezza utile di saldatura 2 × 780 mm | Profondità/larghezza camera 780 mm | " +
      "Altezza camera 170 mm | Dimensioni macchina (chiusa) 1650 × 1050 × 1070 mm | (aperta) " +
      "1650 × 1050 × 1670 mm | Peso 350 kg | Pompa per vuoto 250 / 300 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  // ── Sales channel links + placeholder prices ────────────────────────────────
  for (const { product, price } of [
    { product: c400, price: 15000 },
    { product: c800, price: 28000 },
  ]) {
    await remoteLink.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    }).catch(() => {})

    for (const variant of product.variants ?? []) {
      if (!variant?.id) continue
      const [priceSet] = await pricingModule.createPriceSets([{ prices: [{ amount: price, currency_code: "eur" }] }])
      await remoteLink.create({ [Modules.PRODUCT]: { variant_id: variant.id }, [Modules.PRICING]: { price_set_id: priceSet.id } }).catch(() => {})
    }
  }

  logger.info("✅ C 400 / C 800 seed complete!")
  logger.info(`   Sales Channel: ${salesChannel.name} (${salesChannel.id})`)
  logger.info(`   Category:      Chamber Machines > Floor Chamber Machines`)
  logger.info("⚠️  Prices are placeholders (C 400 €15.000, C 800 €28.000) — update before going live!")
}
