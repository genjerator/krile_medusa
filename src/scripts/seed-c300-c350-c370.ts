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
 * Seeds the MULTIVAC C 300, C 350 and C 370 compact floor chamber machines
 * ("Standkammermaschinen, kompakt"), with technical data from the
 * C 300 / C 350 / C 370 spec PDF. Modelled on seed-c400-c800.ts.
 * Idempotent (upsert by handle). Prices are placeholders — update before
 * going live.
 */
export default async function seedC300C350C370({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC C 300 / C 350 / C 370 seed...")

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

  const tagValues = ["vacuum-packaging", "chamber-machine", "standkammermaschine", "floor-standing", "MULTIVAC", "C-Series", "c300", "c350", "c370", "compact"]
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

  // ── C 300 ──────────────────────────────────────────────────────────────────
  // English copy — used for the base product AND the explicit en-US translation.
  const c300En = {
    title: "MULTIVAC C 300",
    subtitle: "MULTIVAC's most compact floor chamber machine — high cycle rates on a minimal footprint",
    description:
      "The MULTIVAC C 300 is the most compact floor-standing vacuum chamber machine " +
      "(Standkammermaschine) from MULTIVAC. It delivers high cycle rates on a minimal footprint, " +
      "making it the ideal packaging solution for butchers, cheese dairies, restaurants, hotels, " +
      "direct marketers and supermarkets. It can be equipped with vacuum pumps up to 63 m³/h, a " +
      "connection for an external vacuum pump, and a gas flushing device for MAP packaging.\n\n" +
      "One usable sealing bar of 440 mm at the front, chamber depth/width 470 mm, chamber height " +
      "160 mm (optional 230 mm). Doppelnaht-Trennsiegelung sealing as standard, stainless-steel " +
      "chamber lid with safety-glass viewing window, and the digital MC 06 control with auto-stop, " +
      "18 operating languages and 29 program slots. GS-certified (DGUV), MULTIVAC Hygienic Design " +
      "and fully washdown-capable.\n\n" +
      "Specifications: Usable sealing length 1 × 440 mm | Chamber depth/width 470 mm | Chamber " +
      "height 160 mm (opt. 230) | Machine dimensions (closed) 550 × 660 × 900 mm | (open) " +
      "550 × 660 × 1390 mm | Weight 160 kg | Vacuum pump 40 / 63 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  }

  const c300 = await upsertProduct({
    title: c300En.title,
    handle: "multivac-c300",
    subtitle: c300En.subtitle,
    images: [
      { url: `${BASE}/products/floor/c300-overview.jpg` },
      { url: `${BASE}/products/floor/c300-spec.jpg` },
    ],
    description: c300En.description,
    status: "published",
    weight: 160000,
    length: 660,
    width: 550,
    height: 900,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [floorCategory.id],
    tags: tagIds,
    metadata: techData(
      [
        ["Bauform", "Standkammermaschine (kompakt)"],
        ["Nutzbare Siegellänge", "1 × 440 mm"],
        ["Kammertiefe / -breite", "470 mm"],
        ["Kammerhöhe", "160 mm (optional 230 mm)"],
        ["Anzahl der Siegelschienen", "1 × vorne"],
        ["Siegelung", "Doppelnaht-Trennsiegelung"],
        ["Sichtfenster aus Sicherheitsglas", "Standard"],
        ["Vakuumpumpe", "40 / 63 m³/h (optional)"],
        ["Anschluss für externe Vakuumpumpe", "optional"],
        ["Maschinenmaße (geschlossener Deckel)", "550 × 660 × 900 mm"],
        ["Maschinenmaße (geöffneter Deckel)", "550 × 660 × 1390 mm"],
        ["Gewicht", "160 kg"],
        ["Steuerung", "MC 06 (Auto-Stopp, 18 Sprachen, 29 Speicherplätze)"],
        ["Spannung", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Absaugdrossel", "optional"],
        ["Schutzgaseinrichtung", "optional (inkl. Beutelklemmung)"],
      ],
      [
        ["Type", "Floor chamber machine (compact)"],
        ["Usable sealing length", "1 × 440 mm"],
        ["Chamber depth / width", "470 mm"],
        ["Chamber height", "160 mm (optional 230 mm)"],
        ["Number of sealing bars", "1 × front"],
        ["Sealing", "Double-seam separating seal"],
        ["Safety-glass viewing window", "Standard"],
        ["Vacuum pump", "40 / 63 m³/h (optional)"],
        ["Connection for external vacuum pump", "optional"],
        ["Machine dimensions (lid closed)", "550 × 660 × 900 mm"],
        ["Machine dimensions (lid open)", "550 × 660 × 1390 mm"],
        ["Weight", "160 kg"],
        ["Control", "MC 06 (auto-stop, 18 languages, 29 program slots)"],
        ["Voltage", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Suction throttle", "optional"],
        ["Gas flushing device", "optional (incl. bag clamp)"],
      ],
      [
        ["Tipo", "Macchina a campana da pavimento (compatta)"],
        ["Lunghezza utile di saldatura", "1 × 440 mm"],
        ["Profondità / larghezza camera", "470 mm"],
        ["Altezza camera", "160 mm (opzionale 230 mm)"],
        ["Numero di barre saldanti", "1 × anteriore"],
        ["Saldatura", "Saldatura di separazione a doppia cucitura"],
        ["Finestra in vetro di sicurezza", "Standard"],
        ["Pompa per vuoto", "40 / 63 m³/h (opzionale)"],
        ["Attacco per pompa per vuoto esterna", "opzionale"],
        ["Dimensioni macchina (coperchio chiuso)", "550 × 660 × 900 mm"],
        ["Dimensioni macchina (coperchio aperto)", "550 × 660 × 1390 mm"],
        ["Peso", "160 kg"],
        ["Controllo", "MC 06 (auto-stop, 18 lingue, 29 programmi)"],
        ["Tensione", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Valvola di aspirazione", "opzionale"],
        ["Dispositivo per gas protettivo", "opzionale (incl. morsetto sacchetto)"],
      ]
    ),
    options: [{ title: "Schutzgaseinrichtung", values: ["Ohne Schutzgaseinrichtung", "Mit Schutzgaseinrichtung"] }],
    variants: [
      { title: "C 300 – Ohne Schutzgaseinrichtung", sku: "MULTIVAC-C300-STD", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Ohne Schutzgaseinrichtung" } },
      { title: "C 300 – Mit Schutzgaseinrichtung", sku: "MULTIVAC-C300-MAP", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Mit Schutzgaseinrichtung" } },
    ],
  })

  await upsertTranslation(c300.id, "de-DE", {
    title: "MULTIVAC C 300",
    subtitle: "Die kompakteste Standkammermaschine von MULTIVAC – hohe Taktleistung auf kleinster Fläche",
    description:
      "Die MULTIVAC C 300 ist die kompakteste Standkammermaschine von MULTIVAC. Sie bietet hohe " +
      "Taktleistung auf kleinster Fläche und ist damit die ideale Verpackungslösung für Metzgereien, " +
      "Käsereien, Restaurants, Hotels, Direktvermarkter und Supermärkte. Sie ist ausstattbar mit " +
      "Vakuumpumpen bis zu 63 m³/h, einem Anschluss für eine externe Vakuumpumpe und einer " +
      "Schutzgaseinrichtung für MAP-Packungen.\n\n" +
      "Eine nutzbare Siegelschiene mit 440 mm vorne, Kammertiefe/-breite 470 mm, Kammerhöhe 160 mm " +
      "(optional 230 mm). Doppelnaht-Trennsiegelung als Standardausstattung, Kammerdeckel aus " +
      "Edelstahl mit Sichtfenster aus Sicherheitsglas und die digitale Steuerung MC 06 mit Auto-Stopp, " +
      "18 Bediensprachen und 29 Produktspeicherplätzen. GS-geprüft (DGUV), MULTIVAC Hygienic Design " +
      "und komplett washdownfähig.\n\n" +
      "Technische Daten: Nutzbare Siegellänge 1 × 440 mm | Kammertiefe/-breite 470 mm | Kammerhöhe " +
      "160 mm (opt. 230) | Maschinenmaße (geschlossen) 550 × 660 × 900 mm | (geöffnet) " +
      "550 × 660 × 1390 mm | Gewicht 160 kg | Vakuumpumpe 40 / 63 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  await upsertTranslation(c300.id, "en-US", c300En)

  await upsertTranslation(c300.id, "it-IT", {
    title: "MULTIVAC C 300",
    subtitle: "La macchina a campana da pavimento più compatta di MULTIVAC – alta produttività su una superficie minima",
    description:
      "La MULTIVAC C 300 è la macchina sottovuoto a campana da pavimento più compatta di MULTIVAC. " +
      "Offre un'alta produttività su una superficie minima ed è quindi la soluzione di confezionamento " +
      "ideale per macellerie, caseifici, ristoranti, hotel, vendita diretta e supermercati. Può essere " +
      "equipaggiata con pompe per vuoto fino a 63 m³/h, un attacco per una pompa per vuoto esterna e un " +
      "dispositivo per gas protettivo per confezioni MAP.\n\n" +
      "Una barra saldante utile da 440 mm sul lato anteriore, profondità/larghezza camera 470 mm, " +
      "altezza camera 160 mm (opzionale 230 mm). Saldatura di separazione a doppia cucitura di serie, " +
      "coperchio della camera in acciaio inox con finestra in vetro di sicurezza e controllo digitale " +
      "MC 06 con auto-stop, 18 lingue e 29 programmi memorizzabili. Certificata GS (DGUV), MULTIVAC " +
      "Hygienic Design e completamente lavabile (washdown).\n\n" +
      "Dati tecnici: Lunghezza utile di saldatura 1 × 440 mm | Profondità/larghezza camera 470 mm | " +
      "Altezza camera 160 mm (opz. 230) | Dimensioni macchina (chiusa) 550 × 660 × 900 mm | (aperta) " +
      "550 × 660 × 1390 mm | Peso 160 kg | Pompa per vuoto 40 / 63 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  // ── C 350 ──────────────────────────────────────────────────────────────────
  // English copy — used for the base product AND the explicit en-US translation.
  const c350En = {
    title: "MULTIVAC C 350",
    subtitle: "Two sealing bars for more flexibility — pack several smaller products in one cycle",
    description:
      "The MULTIVAC C 350 is a compact floor-standing vacuum chamber machine (Standkammermaschine) " +
      "with two sealing bars — left and right — offering extra flexibility, especially for packing " +
      "several smaller products in a single cycle. It can be equipped with vacuum pumps up to " +
      "63 m³/h, a connection for an external vacuum pump, and a gas flushing device for MAP " +
      "packaging.\n\n" +
      "Two usable sealing bars of 440 mm (left and right), chamber depth/width 430 mm, chamber " +
      "height 160 mm. Doppelnaht-Trennsiegelung sealing as standard, stainless-steel chamber lid " +
      "with safety-glass viewing window, and the digital MC 06 control with auto-stop, 18 operating " +
      "languages and 29 program slots. GS-certified (DGUV), MULTIVAC Hygienic Design and fully " +
      "washdown-capable.\n\n" +
      "Specifications: Usable sealing length 2 × 440 mm | Chamber depth/width 430 mm | Chamber " +
      "height 160 mm | Machine dimensions (closed) 690 × 590 × 1020 mm | (open) 690 × 590 × 1390 mm | " +
      "Weight 160 kg | Vacuum pump 40 / 63 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  }

  const c350 = await upsertProduct({
    title: c350En.title,
    handle: "multivac-c350",
    subtitle: c350En.subtitle,
    images: [
      { url: `${BASE}/products/floor/c350-overview.jpg` },
      { url: `${BASE}/products/floor/c350-spec.jpg` },
    ],
    description: c350En.description,
    status: "published",
    weight: 160000,
    length: 590,
    width: 690,
    height: 1020,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [floorCategory.id],
    tags: tagIds,
    metadata: techData(
      [
        ["Bauform", "Standkammermaschine (kompakt)"],
        ["Nutzbare Siegellänge", "2 × 440 mm"],
        ["Kammertiefe / -breite", "430 mm"],
        ["Kammerhöhe", "160 mm"],
        ["Anzahl der Siegelschienen", "1 × links, 1 × rechts"],
        ["Siegelung", "Doppelnaht-Trennsiegelung"],
        ["Sichtfenster aus Sicherheitsglas", "Standard"],
        ["Vakuumpumpe", "40 / 63 m³/h (optional)"],
        ["Anschluss für externe Vakuumpumpe", "optional"],
        ["Maschinenmaße (geschlossener Deckel)", "690 × 590 × 1020 mm"],
        ["Maschinenmaße (geöffneter Deckel)", "690 × 590 × 1390 mm"],
        ["Gewicht", "160 kg"],
        ["Steuerung", "MC 06 (Auto-Stopp, 18 Sprachen, 29 Speicherplätze)"],
        ["Spannung", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Absaugdrossel", "optional"],
        ["Schutzgaseinrichtung", "optional (inkl. Beutelklemmung)"],
      ],
      [
        ["Type", "Floor chamber machine (compact)"],
        ["Usable sealing length", "2 × 440 mm"],
        ["Chamber depth / width", "430 mm"],
        ["Chamber height", "160 mm"],
        ["Number of sealing bars", "1 × left, 1 × right"],
        ["Sealing", "Double-seam separating seal"],
        ["Safety-glass viewing window", "Standard"],
        ["Vacuum pump", "40 / 63 m³/h (optional)"],
        ["Connection for external vacuum pump", "optional"],
        ["Machine dimensions (lid closed)", "690 × 590 × 1020 mm"],
        ["Machine dimensions (lid open)", "690 × 590 × 1390 mm"],
        ["Weight", "160 kg"],
        ["Control", "MC 06 (auto-stop, 18 languages, 29 program slots)"],
        ["Voltage", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Suction throttle", "optional"],
        ["Gas flushing device", "optional (incl. bag clamp)"],
      ],
      [
        ["Tipo", "Macchina a campana da pavimento (compatta)"],
        ["Lunghezza utile di saldatura", "2 × 440 mm"],
        ["Profondità / larghezza camera", "430 mm"],
        ["Altezza camera", "160 mm"],
        ["Numero di barre saldanti", "1 × sinistra, 1 × destra"],
        ["Saldatura", "Saldatura di separazione a doppia cucitura"],
        ["Finestra in vetro di sicurezza", "Standard"],
        ["Pompa per vuoto", "40 / 63 m³/h (opzionale)"],
        ["Attacco per pompa per vuoto esterna", "opzionale"],
        ["Dimensioni macchina (coperchio chiuso)", "690 × 590 × 1020 mm"],
        ["Dimensioni macchina (coperchio aperto)", "690 × 590 × 1390 mm"],
        ["Peso", "160 kg"],
        ["Controllo", "MC 06 (auto-stop, 18 lingue, 29 programmi)"],
        ["Tensione", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Valvola di aspirazione", "opzionale"],
        ["Dispositivo per gas protettivo", "opzionale (incl. morsetto sacchetto)"],
      ]
    ),
    options: [{ title: "Schutzgaseinrichtung", values: ["Ohne Schutzgaseinrichtung", "Mit Schutzgaseinrichtung"] }],
    variants: [
      { title: "C 350 – Ohne Schutzgaseinrichtung", sku: "MULTIVAC-C350-STD", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Ohne Schutzgaseinrichtung" } },
      { title: "C 350 – Mit Schutzgaseinrichtung", sku: "MULTIVAC-C350-MAP", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Mit Schutzgaseinrichtung" } },
    ],
  })

  await upsertTranslation(c350.id, "de-DE", {
    title: "MULTIVAC C 350",
    subtitle: "Zwei Siegelschienen für mehr Flexibilität – mehrere kleine Produkte in einem Takt verpacken",
    description:
      "Die MULTIVAC C 350 ist eine kompakte Standkammermaschine mit zwei Siegelschienen – links und " +
      "rechts. Das bietet mehr Flexibilität, insbesondere für das Verpacken mehrerer kleiner Produkte " +
      "in einem Takt. Sie ist ausstattbar mit Vakuumpumpen bis zu 63 m³/h, einem Anschluss für eine " +
      "externe Vakuumpumpe und einer Schutzgaseinrichtung für MAP-Packungen.\n\n" +
      "Zwei nutzbare Siegelschienen mit 440 mm (links und rechts), Kammertiefe/-breite 430 mm, " +
      "Kammerhöhe 160 mm. Doppelnaht-Trennsiegelung als Standardausstattung, Kammerdeckel aus " +
      "Edelstahl mit Sichtfenster aus Sicherheitsglas und die digitale Steuerung MC 06 mit Auto-Stopp, " +
      "18 Bediensprachen und 29 Produktspeicherplätzen. GS-geprüft (DGUV), MULTIVAC Hygienic Design " +
      "und komplett washdownfähig.\n\n" +
      "Technische Daten: Nutzbare Siegellänge 2 × 440 mm | Kammertiefe/-breite 430 mm | Kammerhöhe " +
      "160 mm | Maschinenmaße (geschlossen) 690 × 590 × 1020 mm | (geöffnet) 690 × 590 × 1390 mm | " +
      "Gewicht 160 kg | Vakuumpumpe 40 / 63 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  await upsertTranslation(c350.id, "en-US", c350En)

  await upsertTranslation(c350.id, "it-IT", {
    title: "MULTIVAC C 350",
    subtitle: "Due barre saldanti per maggiore flessibilità – confezionare più prodotti piccoli in un unico ciclo",
    description:
      "La MULTIVAC C 350 è una macchina sottovuoto a campana da pavimento compatta con due barre " +
      "saldanti – a sinistra e a destra. Ciò offre maggiore flessibilità, in particolare per il " +
      "confezionamento di più prodotti piccoli in un unico ciclo. Può essere equipaggiata con pompe " +
      "per vuoto fino a 63 m³/h, un attacco per una pompa per vuoto esterna e un dispositivo per gas " +
      "protettivo per confezioni MAP.\n\n" +
      "Due barre saldanti utili da 440 mm (sinistra e destra), profondità/larghezza camera 430 mm, " +
      "altezza camera 160 mm. Saldatura di separazione a doppia cucitura di serie, coperchio della " +
      "camera in acciaio inox con finestra in vetro di sicurezza e controllo digitale MC 06 con " +
      "auto-stop, 18 lingue e 29 programmi memorizzabili. Certificata GS (DGUV), MULTIVAC Hygienic " +
      "Design e completamente lavabile (washdown).\n\n" +
      "Dati tecnici: Lunghezza utile di saldatura 2 × 440 mm | Profondità/larghezza camera 430 mm | " +
      "Altezza camera 160 mm | Dimensioni macchina (chiusa) 690 × 590 × 1020 mm | (aperta) " +
      "690 × 590 × 1390 mm | Peso 160 kg | Pompa per vuoto 40 / 63 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  // ── C 370 ──────────────────────────────────────────────────────────────────
  // English copy — used for the base product AND the explicit en-US translation.
  const c370En = {
    title: "MULTIVAC C 370",
    subtitle: "Extra-wide sealing bar spacing for long products — whole fish, salami sticks and more",
    description:
      "The MULTIVAC C 370 is a compact floor-standing vacuum chamber machine (Standkammermaschine) " +
      "with an especially wide distance between its two sealing bars — designed for long products " +
      "such as whole fish or salami sticks. It can be equipped with vacuum pumps up to 150 m³/h, a " +
      "connection for an external vacuum pump, and a gas flushing device for MAP packaging.\n\n" +
      "Two usable sealing bars of 440 mm (left and right), chamber depth/width 900 mm, chamber " +
      "height 160 mm. Doppelnaht-Trennsiegelung sealing as standard, stainless-steel chamber lid " +
      "with safety-glass viewing window, and the digital MC 06 control with auto-stop, 18 operating " +
      "languages and 29 program slots. GS-certified (DGUV), MULTIVAC Hygienic Design and fully " +
      "washdown-capable.\n\n" +
      "Specifications: Usable sealing length 2 × 440 mm | Chamber depth/width 900 mm | Chamber " +
      "height 160 mm | Machine dimensions (closed) 1100 × 585 × 900 mm | (open) 1100 × 585 × 1340 mm | " +
      "Weight 200 kg | Vacuum pump 63 / 100 / 150 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  }

  const c370 = await upsertProduct({
    title: c370En.title,
    handle: "multivac-c370",
    subtitle: c370En.subtitle,
    images: [
      { url: `${BASE}/products/floor/c370-overview.jpg` },
      { url: `${BASE}/products/floor/c370-spec.jpg` },
    ],
    description: c370En.description,
    status: "published",
    weight: 200000,
    length: 585,
    width: 1100,
    height: 900,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [floorCategory.id],
    tags: tagIds,
    metadata: techData(
      [
        ["Bauform", "Standkammermaschine (kompakt)"],
        ["Nutzbare Siegellänge", "2 × 440 mm"],
        ["Kammertiefe / -breite", "900 mm"],
        ["Kammerhöhe", "160 mm"],
        ["Anzahl der Siegelschienen", "1 × links, 1 × rechts"],
        ["Siegelung", "Doppelnaht-Trennsiegelung"],
        ["Sichtfenster aus Sicherheitsglas", "Standard"],
        ["Vakuumpumpe", "63 / 100 / 150 m³/h (optional)"],
        ["Anschluss für externe Vakuumpumpe", "optional"],
        ["Maschinenmaße (geschlossener Deckel)", "1100 × 585 × 900 mm"],
        ["Maschinenmaße (geöffneter Deckel)", "1100 × 585 × 1340 mm"],
        ["Gewicht", "200 kg"],
        ["Steuerung", "MC 06 (Auto-Stopp, 18 Sprachen, 29 Speicherplätze)"],
        ["Spannung", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Absaugdrossel", "optional"],
        ["Schutzgaseinrichtung", "optional (inkl. Beutelklemmung)"],
      ],
      [
        ["Type", "Floor chamber machine (compact)"],
        ["Usable sealing length", "2 × 440 mm"],
        ["Chamber depth / width", "900 mm"],
        ["Chamber height", "160 mm"],
        ["Number of sealing bars", "1 × left, 1 × right"],
        ["Sealing", "Double-seam separating seal"],
        ["Safety-glass viewing window", "Standard"],
        ["Vacuum pump", "63 / 100 / 150 m³/h (optional)"],
        ["Connection for external vacuum pump", "optional"],
        ["Machine dimensions (lid closed)", "1100 × 585 × 900 mm"],
        ["Machine dimensions (lid open)", "1100 × 585 × 1340 mm"],
        ["Weight", "200 kg"],
        ["Control", "MC 06 (auto-stop, 18 languages, 29 program slots)"],
        ["Voltage", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Suction throttle", "optional"],
        ["Gas flushing device", "optional (incl. bag clamp)"],
      ],
      [
        ["Tipo", "Macchina a campana da pavimento (compatta)"],
        ["Lunghezza utile di saldatura", "2 × 440 mm"],
        ["Profondità / larghezza camera", "900 mm"],
        ["Altezza camera", "160 mm"],
        ["Numero di barre saldanti", "1 × sinistra, 1 × destra"],
        ["Saldatura", "Saldatura di separazione a doppia cucitura"],
        ["Finestra in vetro di sicurezza", "Standard"],
        ["Pompa per vuoto", "63 / 100 / 150 m³/h (opzionale)"],
        ["Attacco per pompa per vuoto esterna", "opzionale"],
        ["Dimensioni macchina (coperchio chiuso)", "1100 × 585 × 900 mm"],
        ["Dimensioni macchina (coperchio aperto)", "1100 × 585 × 1340 mm"],
        ["Peso", "200 kg"],
        ["Controllo", "MC 06 (auto-stop, 18 lingue, 29 programmi)"],
        ["Tensione", "3×400 V 50 Hz / 3×220 V 60 Hz"],
        ["Valvola di aspirazione", "opzionale"],
        ["Dispositivo per gas protettivo", "opzionale (incl. morsetto sacchetto)"],
      ]
    ),
    options: [{ title: "Schutzgaseinrichtung", values: ["Ohne Schutzgaseinrichtung", "Mit Schutzgaseinrichtung"] }],
    variants: [
      { title: "C 370 – Ohne Schutzgaseinrichtung", sku: "MULTIVAC-C370-STD", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Ohne Schutzgaseinrichtung" } },
      { title: "C 370 – Mit Schutzgaseinrichtung", sku: "MULTIVAC-C370-MAP", manage_inventory: false, allow_backorder: true, options: { "Schutzgaseinrichtung": "Mit Schutzgaseinrichtung" } },
    ],
  })

  await upsertTranslation(c370.id, "de-DE", {
    title: "MULTIVAC C 370",
    subtitle: "Besonders großer Siegelschienenabstand für lange Produkte – ganze Fische, Salamistangen und mehr",
    description:
      "Die MULTIVAC C 370 ist eine kompakte Standkammermaschine mit besonders großem " +
      "Siegelschienenabstand für lange Produkte, z. B. ganze Fische oder Salamistangen. Sie ist " +
      "ausstattbar mit Vakuumpumpen bis zu 150 m³/h, einem Anschluss für eine externe Vakuumpumpe " +
      "und einer Schutzgaseinrichtung für MAP-Packungen.\n\n" +
      "Zwei nutzbare Siegelschienen mit 440 mm (links und rechts), Kammertiefe/-breite 900 mm, " +
      "Kammerhöhe 160 mm. Doppelnaht-Trennsiegelung als Standardausstattung, Kammerdeckel aus " +
      "Edelstahl mit Sichtfenster aus Sicherheitsglas und die digitale Steuerung MC 06 mit Auto-Stopp, " +
      "18 Bediensprachen und 29 Produktspeicherplätzen. GS-geprüft (DGUV), MULTIVAC Hygienic Design " +
      "und komplett washdownfähig.\n\n" +
      "Technische Daten: Nutzbare Siegellänge 2 × 440 mm | Kammertiefe/-breite 900 mm | Kammerhöhe " +
      "160 mm | Maschinenmaße (geschlossen) 1100 × 585 × 900 mm | (geöffnet) 1100 × 585 × 1340 mm | " +
      "Gewicht 200 kg | Vakuumpumpe 63 / 100 / 150 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  await upsertTranslation(c370.id, "en-US", c370En)

  await upsertTranslation(c370.id, "it-IT", {
    title: "MULTIVAC C 370",
    subtitle: "Distanza particolarmente ampia tra le barre saldanti per prodotti lunghi – pesci interi, salami e altro",
    description:
      "La MULTIVAC C 370 è una macchina sottovuoto a campana da pavimento compatta con una distanza " +
      "particolarmente ampia tra le due barre saldanti – ideale per prodotti lunghi come pesci interi " +
      "o salami. Può essere equipaggiata con pompe per vuoto fino a 150 m³/h, un attacco per una pompa " +
      "per vuoto esterna e un dispositivo per gas protettivo per confezioni MAP.\n\n" +
      "Due barre saldanti utili da 440 mm (sinistra e destra), profondità/larghezza camera 900 mm, " +
      "altezza camera 160 mm. Saldatura di separazione a doppia cucitura di serie, coperchio della " +
      "camera in acciaio inox con finestra in vetro di sicurezza e controllo digitale MC 06 con " +
      "auto-stop, 18 lingue e 29 programmi memorizzabili. Certificata GS (DGUV), MULTIVAC Hygienic " +
      "Design e completamente lavabile (washdown).\n\n" +
      "Dati tecnici: Lunghezza utile di saldatura 2 × 440 mm | Profondità/larghezza camera 900 mm | " +
      "Altezza camera 160 mm | Dimensioni macchina (chiusa) 1100 × 585 × 900 mm | (aperta) " +
      "1100 × 585 × 1340 mm | Peso 200 kg | Pompa per vuoto 63 / 100 / 150 m³/h | 3×400V 50Hz / 3×220V 60Hz",
  })

  // ── Sales channel links + placeholder prices ────────────────────────────────
  for (const { product, price } of [
    { product: c300, price: 8000 },
    { product: c350, price: 9500 },
    { product: c370, price: 12000 },
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

  logger.info("✅ C 300 / C 350 / C 370 seed complete!")
  logger.info(`   Sales Channel: ${salesChannel.name} (${salesChannel.id})`)
  logger.info(`   Category:      Chamber Machines > Floor Chamber Machines`)
  logger.info("⚠️  Prices are placeholders (C 300 €8.000, C 350 €9.500, C 370 €12.000) — update before going live!")
}
