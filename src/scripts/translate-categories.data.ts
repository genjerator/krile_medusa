/**
 * Data for the category-translation script (`translate-categories.ts`).
 *
 * One entry per product category. `translations` maps a `locale_code` to the
 * translated `name` (and `description`, where the category has one). Only the
 * **non-source** locales are listed: German-source categories carry `en-US` +
 * `it-IT`; the English-source MULTIVAC categories carry `de-DE` + `it-IT` (their
 * English base row stays as the source). The trailing comment shows the source
 * name for readability.
 *
 * `baseDescription` (optional) is the description in the category's source
 * language; the script writes it onto the `product_category` row. Categories
 * with products carry one (human-friendly + SEO copy based on title + contents);
 * the matching translated `description` lives under each locale in `translations`.
 *
 * Copy is baked in here (like improve-product) so nothing is corrupted via
 * copy-paste through the terminal. Applied via the Product + Translation modules
 * so domain events fire (search reindex, cache/ISR invalidation). Idempotent.
 */

export type CategoryTranslationFields = { name?: string; description?: string }

export type CategoryTranslationPayload = {
  categoryId: string
  /** Description in the category's source language, written to the product_category row. */
  baseDescription?: string
  /** locale_code -> translated fields (only the non-source locales) */
  translations: Record<string, CategoryTranslationFields>
}

// ─── DATA: one entry per category ───────────────────────────────────────────
export const CATEGORY_TRANSLATIONS: CategoryTranslationPayload[] = [
  // Behälter
  {
    categoryId: "pcat_01KSMC26RF0D7884AVNJHKC2JR",
    baseDescription:
      "Vakuumbehälter und Frischhaltedosen für jede Küche: von der kleinen 0,5-l-Dose bis zum 4,5-l-Behälter, dazu Glasbehälter, Marinaden- und Baby-Food-Sets. BPA-frei, stapelbar und mit Handpumpe – hält Lebensmittel deutlich länger frisch.",
    translations: {
      "en-US": {
        name: "Containers",
        description:
          "Vacuum containers and food storage boxes for every kitchen: from the small 0.5 l box to the 4.5 l container, plus glass containers, marinade and baby-food sets. BPA-free, stackable and with a hand pump – keeps food fresh for much longer.",
      },
      "it-IT": {
        name: "Contenitori",
        description:
          "Contenitori sottovuoto e box salvafreschezza per ogni cucina: dal piccolo da 0,5 l al contenitore da 4,5 l, più contenitori in vetro, set per marinatura e per pappe. Senza BPA, impilabili e con pompa manuale – mantengono gli alimenti freschi molto più a lungo.",
      },
    },
  },
  // Bügelbrettbezüge
  {
    categoryId: "pcat_01KSMC26JNN23X3HP12ZYG51D9",
    baseDescription:
      "Bügelbrettbezüge für Planeta Bügelsysteme – passgenau für Modelle wie Rapid Z, Rapid Premium und Saphir 2. Viele Farben und Muster, von schlicht uni bis floral, sowie hitzereflektierende Alubezüge für ein besseres Bügelergebnis.",
    translations: {
      "en-US": {
        name: "Ironing Board Covers",
        description:
          "Ironing board covers for Planeta ironing systems – a precise fit for models such as Rapid Z, Rapid Premium and Saphir 2. Many colours and patterns, from plain to floral, plus heat-reflecting aluminium covers for better ironing results.",
      },
      "it-IT": {
        name: "Teli per asse da stiro",
        description:
          "Teli per asse da stiro per i sistemi di stiratura Planeta – su misura per modelli come Rapid Z, Rapid Premium e Saphir 2. Tanti colori e fantasie, dalle tinte unite ai motivi floreali, oltre ai teli alluminati riflettenti per risultati di stiratura migliori.",
      },
    },
  },
  // Bugelsysteme (source name misspelled; translations use correct terms)
  {
    categoryId: "pcat_01KSMC26ND38BVSJK7YZST3GWQ",
    baseDescription:
      "Professionelle Bügelsysteme von Planeta: Dampfstationen mit beheiztem Aktiv-Bügeltisch, Dampferzeuger, Bügelpressen und Dampfbügeltische. Für müheloses, schnelles Bügeln zu Hause und im professionellen Einsatz.",
    translations: {
      "en-US": {
        name: "Ironing Systems",
        description:
          "Professional ironing systems from Planeta: steam stations with a heated active ironing table, steam generators, ironing presses and steam ironing tables. For effortless, fast ironing at home and in professional use.",
      },
      "it-IT": {
        name: "Sistemi di stiratura",
        description:
          "Sistemi di stiratura professionali Planeta: caldaie con tavolo da stiro attivo riscaldato, generatori di vapore, presse stiranti e tavoli da stiro a vapore. Per stirare senza fatica e in fretta, a casa e nell'uso professionale.",
      },
    },
  },
  // Bügelsysteme (description: "Bügelsysteme")
  {
    categoryId: "pcat_01KSMC26KERR9JQSJ2YXRNJ8ZR",
    baseDescription:
      "Professionelle Bügelsysteme von Planeta: Dampfstationen mit beheiztem Aktiv-Bügeltisch, Dampferzeuger, Bügelpressen und Dampfbügeltische. Für müheloses, schnelles Bügeln zu Hause und im professionellen Einsatz.",
    translations: {
      "en-US": {
        name: "Ironing Systems",
        description:
          "Professional ironing systems from Planeta: steam stations with a heated active ironing table, steam generators, ironing presses and steam ironing tables. For effortless, fast ironing at home and in professional use.",
      },
      "it-IT": {
        name: "Sistemi di stiratura",
        description:
          "Sistemi di stiratura professionali Planeta: caldaie con tavolo da stiro attivo riscaldato, generatori di vapore, presse stiranti e tavoli da stiro a vapore. Per stirare senza fatica e in fretta, a casa e nell'uso professionale.",
      },
    },
  },
  // Bügel Zubehörteile
  {
    categoryId: "pcat_01KSMC26MWAD1HZ81X9A1JQYJB",
    baseDescription:
      "Zubehör rund ums Bügeln: Ärmelbretter, Bügelhandschuhe, Teflonsohlen, Silikonmatten, Dampfbürsten, Befüllflaschen und mehr. Praktische Helfer, die das Bügeln mit Ihrem Planeta System leichter und sicherer machen.",
    translations: {
      "en-US": {
        name: "Ironing Accessories",
        description:
          "Accessories for ironing: sleeve boards, ironing gloves, Teflon soleplates, silicone mats, steam brushes, filling bottles and more. Practical helpers that make ironing with your Planeta system easier and safer.",
      },
      "it-IT": {
        name: "Accessori per la stiratura",
        description:
          "Accessori per la stiratura: assi stiramaniche, guanti da stiro, suole in teflon, tappetini in silicone, spazzole a vapore, bottiglie di riempimento e altro. Aiuti pratici che rendono la stiratura con il tuo sistema Planeta più facile e sicura.",
      },
    },
  },
  // Chamber Machines (English source → DE + IT). No products: name only.
  {
    categoryId: "pcat_01KTBYD6TWBKQYMT3M0YM6X4MW",
    translations: {
      "de-DE": {
        name: "Kammermaschinen",
        description:
          "MULTIVAC Vakuum-Kammermaschinen für die Verpackung von Lebensmitteln und Non-Food-Produkten",
      },
      "it-IT": {
        name: "Macchine a campana",
        description:
          "Macchine sottovuoto a campana MULTIVAC per il confezionamento di prodotti alimentari e non alimentari",
      },
    },
  },
  // Double Chamber Machines (English source → DE + IT)
  {
    categoryId: "pcat_01KSPS9A727QM57MHH9JJQ906V",
    baseDescription:
      "MULTIVAC double chamber machines — high-throughput vacuum packaging with two alternating chambers for continuous production in butcheries, food processing and industrial use. Includes models such as the C 300 Twin, C 450, C 500 and C 550.",
    translations: {
      "de-DE": {
        name: "Doppelkammermaschinen",
        description:
          "MULTIVAC Doppelkammermaschinen – Hochleistungs-Vakuumverpackung mit zwei abwechselnd arbeitenden Kammern für die kontinuierliche Produktion in Metzgereien, Lebensmittelverarbeitung und Industrie. Mit Modellen wie C 300 Twin, C 450, C 500 und C 550.",
      },
      "it-IT": {
        name: "Macchine a doppia campana",
        description:
          "Macchine a doppia campana MULTIVAC – confezionamento sottovuoto ad alta produttività con due campane alternate per la produzione continua in macellerie, trasformazione alimentare e industria. Con modelli come C 300 Twin, C 450, C 500 e C 550.",
      },
    },
  },
  // Edelstahl Vakuumbehälter
  {
    categoryId: "pcat_01KRZKRWCAQCV5C0ASSH7H7RV8",
    translations: {
      "en-US": { name: "Stainless Steel Vacuum Containers" },
      "it-IT": { name: "Contenitori sottovuoto in acciaio inox" },
    },
  },
  // Ersatzteile
  {
    categoryId: "pcat_01KSMC26NW09D4BBGZTQE7VD5X",
    baseDescription:
      "Original-Ersatzteile für Planeta Bügelsysteme und Dampfstationen: Dampfschläuche, Thermostate, Magnetventile, Druckschalter, Dichtungen, Filter und mehr. Für Reparaturen und Wartung, damit Ihr Gerät zuverlässig weiterläuft.",
    translations: {
      "en-US": {
        name: "Spare Parts",
        description:
          "Genuine spare parts for Planeta ironing systems and steam stations: steam hoses, thermostats, solenoid valves, pressure switches, seals, filters and more. For repairs and maintenance to keep your appliance running reliably.",
      },
      "it-IT": {
        name: "Ricambi",
        description:
          "Ricambi originali per i sistemi di stiratura e le caldaie Planeta: tubi vapore, termostati, elettrovalvole, pressostati, guarnizioni, filtri e altro. Per riparazioni e manutenzione, così il tuo apparecchio continua a funzionare in modo affidabile.",
      },
    },
  },
  // Floor Chamber Machines (English source → DE + IT)
  {
    categoryId: "pcat_01KRQSGQQRMBD3S5EEZHHST5VD",
    baseDescription:
      "MULTIVAC floor chamber machines — easy to operate, clean and maintain. Ideal for butchers, dairies and producers packaging larger batches, with models such as the BASELINE P 400.",
    translations: {
      "de-DE": {
        name: "Bodenkammermaschinen",
        description:
          "MULTIVAC Bodenkammermaschinen – einfach zu bedienen, zu reinigen und zu warten. Ideal für Metzgereien, Molkereien und Produzenten, die größere Chargen verpacken, mit Modellen wie der BASELINE P 400.",
      },
      "it-IT": {
        name: "Macchine a campana da pavimento",
        description:
          "Macchine a campana da pavimento MULTIVAC – facili da usare, pulire e mantenere. Ideali per macellerie, caseifici e produttori che confezionano lotti più grandi, con modelli come la BASELINE P 400.",
      },
    },
  },
  // Folien (description: "Folien")
  {
    categoryId: "pcat_01KTNTW5JHWMVQN2A6RMP40SNJ",
    translations: {
      "en-US": { name: "Films", description: "Films" },
      "it-IT": { name: "Pellicole", description: "Pellicole" },
    },
  },
  // Frischhaltebehälter mit Vakuumfunktion (description present)
  {
    categoryId: "pcat_01KTNW9B91YG9M4G1QZYMV2985",
    translations: {
      "en-US": {
        name: "Food Storage Containers with Vacuum Function",
        description: "Food storage containers with vacuum function",
      },
      "it-IT": {
        name: "Contenitori salvafreschezza con funzione sottovuoto",
        description: "Contenitori salvafreschezza con funzione sottovuoto",
      },
    },
  },
  // Gastro Vakuumbehälter
  {
    categoryId: "pcat_01KSMC26RZJBKKFN86BSSJHKD8",
    baseDescription:
      "Vakuumbehälter für die Gastronomie in großen Formaten von 4,0 bis 10,0 Litern – transparent und eckig für effiziente Lagerung. Halten große Mengen Lebensmittel länger frisch und sparen Platz in Küche und Kühlhaus.",
    translations: {
      "en-US": {
        name: "Catering Vacuum Containers",
        description:
          "Vacuum containers for catering in large 4.0 to 10.0 litre formats – transparent and rectangular for efficient storage. Keep large quantities of food fresh for longer and save space in the kitchen and cold store.",
      },
      "it-IT": {
        name: "Contenitori sottovuoto per ristorazione",
        description:
          "Contenitori sottovuoto per la ristorazione nei grandi formati da 4,0 a 10,0 litri – trasparenti e rettangolari per uno stoccaggio efficiente. Mantengono grandi quantità di alimenti freschi più a lungo e fanno risparmiare spazio in cucina e in cella.",
      },
    },
  },
  // Gebrauchtmaschienen (description: "Gebrauchtmaschinen")
  {
    categoryId: "pcat_01KTNV6SCXTP8QH9Y0EVVFS7K3",
    translations: {
      "en-US": { name: "Used Machines", description: "Used machines" },
      "it-IT": { name: "Macchine usate", description: "Macchine usate" },
    },
  },
  // Gebraucht Maschienen (description: "Gebrauchte Vakuum Maschinen")
  {
    categoryId: "pcat_01KS4V50KZJCJAH82RS0AC8KWN",
    baseDescription:
      "Geprüfte gebrauchte Vakuummaschinen zum günstigen Preis: professionelle Kammermaschinen wie C100 und C-200, aufgearbeitet und einsatzbereit. Eine wirtschaftliche Wahl für Metzgereien, Gastronomie und Lebensmittelbetriebe.",
    translations: {
      "en-US": {
        name: "Used Vacuum Machines",
        description:
          "Inspected used vacuum machines at an attractive price: professional chamber machines such as the C100 and C-200, refurbished and ready to use. An economical choice for butcheries, catering and food businesses.",
      },
      "it-IT": {
        name: "Macchine sottovuoto usate",
        description:
          "Macchine sottovuoto usate e controllate a un prezzo conveniente: macchine a campana professionali come C100 e C-200, ricondizionate e pronte all'uso. Una scelta economica per macellerie, ristorazione e aziende alimentari.",
      },
    },
  },
  // Geflügel
  {
    categoryId: "pcat_01KRZKRWGQASGYRDTBAVRJ4HGM",
    translations: {
      "en-US": { name: "Poultry" },
      "it-IT": { name: "Pollame" },
    },
  },
  // Gewürze
  {
    categoryId: "pcat_01KRZKRW4E1CJSPSC0PAMTDN1N",
    translations: {
      "en-US": { name: "Spices" },
      "it-IT": { name: "Spezie" },
    },
  },
  // Glas Vakuumbehälter Set
  {
    categoryId: "pcat_01KRZKRWAVRP5SBNJ4S14P84WX",
    translations: {
      "en-US": { name: "Glass Vacuum Container Set" },
      "it-IT": { name: "Set di contenitori sottovuoto in vetro" },
    },
  },
  // Haushalts Vakuumier Maschienen (description present)
  {
    categoryId: "pcat_01KTNV7FX5ZDC3A1TP7KCT4Q4D",
    translations: {
      "en-US": { name: "Household Vacuum Sealers", description: "Household vacuum sealers" },
      "it-IT": {
        name: "Macchine per sottovuoto domestiche",
        description: "Macchine per sottovuoto domestiche",
      },
    },
  },
  // Packaging Machines (English source → DE + IT)
  {
    categoryId: "pcat_01KRQSGQQ1W0MNPY8HYDWVVTTF",
    translations: {
      "de-DE": {
        name: "Verpackungsmaschinen",
        description: "Industrielle und gewerbliche Vakuumverpackungsmaschinen",
      },
      "it-IT": {
        name: "Macchine confezionatrici",
        description: "Macchine per il confezionamento sottovuoto industriali e commerciali",
      },
    },
  },
  // Planeta Stationen (contents are ironing board covers, not stations)
  {
    categoryId: "pcat_01KSMC26PCB0B5CVF61MCW9A4B",
    baseDescription:
      "Passende Bügelbrettbezüge für Planeta Bügelstationen – in vielen Farben und Mustern. Sorgen für eine glatte Bügelfläche und optimale Dampfdurchlässigkeit auf Ihrem Planeta System.",
    translations: {
      "en-US": {
        name: "Planeta Stations",
        description:
          "Matching ironing board covers for Planeta ironing stations – in many colours and patterns. They provide a smooth ironing surface and optimal steam permeability on your Planeta system.",
      },
      "it-IT": {
        name: "Stazioni Planeta",
        description:
          "Teli per asse da stiro adatti alle stazioni di stiratura Planeta – in tanti colori e fantasie. Garantiscono una superficie di stiratura liscia e un'ottima permeabilità al vapore sul tuo sistema Planeta.",
      },
    },
  },
  // Rapid Premium (brand name — identical across locales)
  {
    categoryId: "pcat_01KSMC26PVDGW9506RFEW3EJ9V",
    baseDescription:
      "Bügelbrettbezüge für das Planeta Modell Rapid Premium – passgenau zugeschnitten. Erhältlich in verschiedenen Farben und Mustern sowie als hitzereflektierender Alubezug für ein besseres Bügelergebnis.",
    translations: {
      "en-US": {
        name: "Rapid Premium",
        description:
          "Ironing board covers for the Planeta Rapid Premium model – cut to a precise fit. Available in various colours and patterns, as well as a heat-reflecting aluminium cover for better ironing results.",
      },
      "it-IT": {
        name: "Rapid Premium",
        description:
          "Teli per asse da stiro per il modello Planeta Rapid Premium – tagliati su misura. Disponibili in vari colori e fantasie e nella versione alluminata riflettente per un risultato di stiratura migliore.",
      },
    },
  },
  // Rapid Z (brand name — identical across locales)
  {
    categoryId: "pcat_01KSMC26QDY23A39C4XRPET169",
    baseDescription:
      "Bügelbrettbezüge für das Planeta Modell Rapid Z – passgenau und in vielen Farben und Mustern, von dezent bis verspielt. Für eine glatte Bügelfläche und gute Dampfdurchlässigkeit.",
    translations: {
      "en-US": {
        name: "Rapid Z",
        description:
          "Ironing board covers for the Planeta Rapid Z model – a precise fit in many colours and patterns, from understated to playful. For a smooth ironing surface and good steam permeability.",
      },
      "it-IT": {
        name: "Rapid Z",
        description:
          "Teli per asse da stiro per il modello Planeta Rapid Z – su misura e in tanti colori e fantasie, dai più sobri ai più vivaci. Per una superficie di stiratura liscia e una buona permeabilità al vapore.",
      },
    },
  },
  // Reinigungs Maschienen
  {
    categoryId: "pcat_01KSMC26KVAE8CDJACNSDSYN6Q",
    baseDescription:
      "Reinigungsmaschinen von Planeta wie der Dampfsauger Silverline: reinigen mit der Kraft von heißem Dampf – hygienisch, gründlich und ohne Chemie. Ideal für Böden, Fugen, Polster und schwer erreichbare Stellen.",
    translations: {
      "en-US": {
        name: "Cleaning Machines",
        description:
          "Cleaning machines from Planeta such as the Silverline steam vacuum: clean with the power of hot steam – hygienic, thorough and chemical-free. Ideal for floors, joints, upholstery and hard-to-reach spots.",
      },
      "it-IT": {
        name: "Macchine per la pulizia",
        description:
          "Macchine per la pulizia Planeta come l'aspiratore a vapore Silverline: puliscono con la forza del vapore caldo – in modo igienico, accurato e senza prodotti chimici. Ideali per pavimenti, fughe, imbottiti e punti difficili da raggiungere.",
      },
    },
  },
  // Rind
  {
    categoryId: "pcat_01KRZKRWDVX9FPG03ZSCXFFH1A",
    translations: {
      "en-US": { name: "Beef" },
      "it-IT": { name: "Manzo" },
    },
  },
  // Sapphir 2 (model name — identical across locales)
  {
    categoryId: "pcat_01KSMC26QYWM5HGQMZW675JXSF",
    baseDescription:
      "Bügelbrettbezüge für das Planeta Modell Saphir 2 – passgenau zugeschnitten und in verschiedenen Farben und Mustern erhältlich. Für eine glatte Bügelfläche und optimale Dampfdurchlässigkeit.",
    translations: {
      "en-US": {
        name: "Sapphir 2",
        description:
          "Ironing board covers for the Planeta Saphir 2 model – cut to a precise fit and available in various colours and patterns. For a smooth ironing surface and optimal steam permeability.",
      },
      "it-IT": {
        name: "Sapphir 2",
        description:
          "Teli per asse da stiro per il modello Planeta Saphir 2 – tagliati su misura e disponibili in vari colori e fantasie. Per una superficie di stiratura liscia e un'ottima permeabilità al vapore.",
      },
    },
  },
  // Schutzfolien (description: "Schutzfolien")
  {
    categoryId: "pcat_01KTNV07EBQ7WGNDGG8XXKPCP2",
    translations: {
      "en-US": { name: "Protective Films", description: "Protective films" },
      "it-IT": { name: "Pellicole protettive", description: "Pellicole protettive" },
    },
  },
  // Schwein
  {
    categoryId: "pcat_01KRZKRWFBW8F5GHJPBZAF05D7",
    translations: {
      "en-US": { name: "Pork" },
      "it-IT": { name: "Maiale" },
    },
  },
  // Siegelfolien (description: "Siegelfolien")
  {
    categoryId: "pcat_01KTNTZ8QSX35MRNE5BKJ2JEV9",
    translations: {
      "en-US": { name: "Sealing Films", description: "Sealing films" },
      "it-IT": { name: "Pellicole termosaldabili", description: "Pellicole termosaldabili" },
    },
  },
  // Siegelrandbeutel
  {
    categoryId: "pcat_01KRZKRW6AA77YKP0KKZ5RRDPD",
    translations: {
      "en-US": { name: "Sealed-Edge Bags" },
      "it-IT": { name: "Buste a bordo saldato" },
    },
  },
  // Strukturierte Beutel
  {
    categoryId: "pcat_01KRZKRW7VKCT9ZGFT63GMSGRH",
    translations: {
      "en-US": { name: "Structured Bags" },
      "it-IT": { name: "Buste goffrate" },
    },
  },
  // Strukturierte Rollen
  {
    categoryId: "pcat_01KRZKRVY1QSRA51JTDPJWBM8F",
    translations: {
      "en-US": { name: "Structured Rolls" },
      "it-IT": { name: "Rotoli goffrati" },
    },
  },
  // Table-Top Chamber Machines (English source → DE + IT)
  {
    categoryId: "pcat_01KS0DKKK4WH718R03F403SGB9",
    baseDescription:
      "MULTIVAC table-top chamber machines — compact, high-quality vacuum packaging for small-scale production. Ideal for butchers, delis, catering and light industrial use, with models such as the C 70, C 100, C 200 and C 250.",
    translations: {
      "de-DE": {
        name: "Tisch-Kammermaschinen",
        description:
          "MULTIVAC Tisch-Kammermaschinen – kompakte, hochwertige Vakuumverpackung für die Produktion in kleinem Maßstab. Ideal für Metzgereien, Feinkost, Catering und den leichten industriellen Einsatz, mit Modellen wie C 70, C 100, C 200 und C 250.",
      },
      "it-IT": {
        name: "Macchine a campana da banco",
        description:
          "Macchine a campana da banco MULTIVAC – confezionamento sottovuoto compatto e di alta qualità per produzioni su piccola scala. Ideali per macellerie, gastronomie, catering e uso industriale leggero, con modelli come C 70, C 100, C 200 e C 250.",
      },
    },
  },
  // Tabletop Machines (English source → DE + IT)
  {
    categoryId: "pcat_01KTBYD6VVN27M13FQ31P97B1Q",
    baseDescription:
      "MULTIVAC BASELINE tabletop chamber machines — compact, easy to use and built for reliable everyday vacuum packaging. Includes the BASELINE P 100, P 200, P 300 and P 360.",
    translations: {
      "de-DE": {
        name: "Tischmaschinen",
        description:
          "MULTIVAC BASELINE Tisch-Kammermaschinen – kompakt, einfach zu bedienen und für die zuverlässige tägliche Vakuumverpackung gebaut. Mit den Modellen BASELINE P 100, P 200, P 300 und P 360.",
      },
      "it-IT": {
        name: "Macchine da banco",
        description:
          "Macchine a campana da banco MULTIVAC BASELINE – compatte, facili da usare e pensate per il confezionamento sottovuoto quotidiano e affidabile. Comprendono i modelli BASELINE P 100, P 200, P 300 e P 360.",
      },
    },
  },
  // Tritan (BPA FREI) Vakuum Behälter
  {
    categoryId: "pcat_01KRZKRW9AS99QBAF63CEZ38V2",
    translations: {
      "en-US": { name: "Tritan (BPA-Free) Vacuum Containers" },
      "it-IT": { name: "Contenitori sottovuoto in Tritan (senza BPA)" },
    },
  },
  // Vakuumbehälter (description: "Vakuumbehälter")
  {
    categoryId: "pcat_01KTNW3VFBDXWZ4AXA6ZBSBJV2",
    translations: {
      "en-US": { name: "Vacuum Containers", description: "Vacuum containers" },
      "it-IT": { name: "Contenitori sottovuoto", description: "Contenitori sottovuoto" },
    },
  },
  // Vakuum Behälter
  {
    categoryId: "pcat_01KRZKRVZJXNHBB8D923Q1Y3Z9",
    translations: {
      "en-US": { name: "Vacuum Containers" },
      "it-IT": { name: "Contenitori sottovuoto" },
    },
  },
  // Vakuumbehälter aus Glas (description present)
  {
    categoryId: "pcat_01KTNW70XAA1G1BGEHVFB8TVC1",
    translations: {
      "en-US": { name: "Glass Vacuum Containers", description: "Glass vacuum containers" },
      "it-IT": {
        name: "Contenitori sottovuoto in vetro",
        description: "Contenitori sottovuoto in vetro",
      },
    },
  },
  // Vakuumbehälter aus Kunststoff (description present)
  {
    categoryId: "pcat_01KTNW5SJYYPXXBJYKNETZAAKE",
    translations: {
      "en-US": { name: "Plastic Vacuum Containers", description: "Plastic vacuum containers" },
      "it-IT": {
        name: "Contenitori sottovuoto in plastica",
        description: "Contenitori sottovuoto in plastica",
      },
    },
  },
  // Vakuumbeutel (description: "Vakuumbeutel")
  {
    categoryId: "pcat_01KTNTXEAY52X2MEG7FDK23XTT",
    translations: {
      "en-US": { name: "Vacuum Bags", description: "Vacuum bags" },
      "it-IT": { name: "Buste sottovuoto", description: "Buste sottovuoto" },
    },
  },
  // Vakuum Beutel
  {
    categoryId: "pcat_01KRZKRVWCRG1YNBTXQN6H6000",
    translations: {
      "en-US": { name: "Vacuum Bags" },
      "it-IT": { name: "Buste sottovuoto" },
    },
  },
  // Vakuumboxen (description: "Vakuumboxen")
  {
    categoryId: "pcat_01KTNW4PTMN5Z2H96YEBSDYR3G",
    translations: {
      "en-US": { name: "Vacuum Boxes", description: "Vacuum boxes" },
      "it-IT": { name: "Box sottovuoto", description: "Box sottovuoto" },
    },
  },
  // Vakuumdeckel (description: "Vakuumdeckel")
  {
    categoryId: "pcat_01KTNW7H50CT73XGBSPSNWANZP",
    translations: {
      "en-US": { name: "Vacuum Lids", description: "Vacuum lids" },
      "it-IT": { name: "Coperchi sottovuoto", description: "Coperchi sottovuoto" },
    },
  },
  // Vakuumfolienrollen (description: "Vakuumfolienrollen")
  {
    categoryId: "pcat_01KTNTYA9PQNA6XGX7DKJTFMWY",
    translations: {
      "en-US": { name: "Vacuum Film Rolls", description: "Vacuum film rolls" },
      "it-IT": {
        name: "Rotoli di pellicola sottovuoto",
        description: "Rotoli di pellicola sottovuoto",
      },
    },
  },
  // Vakuumiermaschienen
  {
    categoryId: "pcat_01KSMC26SG0JEWKZ2ESZ7MQSB5",
    baseDescription:
      "Vakuumiermaschinen von Planeta für Haushalt und Profi: vom kompakten PM Home bis zu den leistungsstarken Modellen PV 600, PV 4000 und PV 9000. Schweißen Lebensmittel luftdicht ein und halten sie um ein Vielfaches länger frisch.",
    translations: {
      "en-US": {
        name: "Vacuum Sealers",
        description:
          "Vacuum sealers from Planeta for home and professional use: from the compact PM Home to the powerful PV 600, PV 4000 and PV 9000 models. Seal food airtight and keep it fresh many times longer.",
      },
      "it-IT": {
        name: "Macchine per sottovuoto",
        description:
          "Macchine per sottovuoto Planeta per uso domestico e professionale: dal compatto PM Home ai potenti modelli PV 600, PV 4000 e PV 9000. Sigillano gli alimenti ermeticamente e li mantengono freschi molto più a lungo.",
      },
    },
  },
  // Vakuumiertüten & Rollen
  {
    categoryId: "pcat_01KSMC26SZH59Y6RD5PEEV1596",
    baseDescription:
      "Vakuumiertüten und -rollen in verschiedenen Größen – auch speziell für Wurstwaren. Strukturiert für sicheres Verschweißen mit Ihrem Vakuumierer; halten Lebensmittel luftdicht und länger frisch.",
    translations: {
      "en-US": {
        name: "Vacuum Bags & Rolls",
        description:
          "Vacuum bags and rolls in various sizes – including special ones for sausages and cold cuts. Embossed for reliable sealing with your vacuum sealer; keep food airtight and fresh for longer.",
      },
      "it-IT": {
        name: "Buste e rotoli per sottovuoto",
        description:
          "Buste e rotoli per sottovuoto in varie misure – anche specifici per salumi. Goffrati per una saldatura sicura con la tua macchina per sottovuoto; mantengono gli alimenti ermetici e freschi più a lungo.",
      },
    },
  },
  // Vakuum Maschienen
  {
    categoryId: "pcat_01KRZKRVSYQ5GN0V0E7Q103D86",
    translations: {
      "en-US": { name: "Vacuum Machines" },
      "it-IT": { name: "Macchine sottovuoto" },
    },
  },
  // Vakuumspeicherung
  {
    categoryId: "pcat_01KSMC26M8KBRD5Q3Z11GS4MN6",
    translations: {
      "en-US": { name: "Vacuum Storage" },
      "it-IT": { name: "Conservazione sottovuoto" },
    },
  },
  // Vakuum Topf Deckel
  {
    categoryId: "pcat_01KRZKRW2WYWVKGN5SVMQVV04J",
    translations: {
      "en-US": { name: "Vacuum Pot Lids" },
      "it-IT": { name: "Coperchi sottovuoto per pentole" },
    },
  },
  // Vakuum Zubehör (description: "Vakuum Zubehör")
  {
    categoryId: "pcat_01KRZKRW18798A9ZYM4CYNSZQY",
    baseDescription:
      "Zubehör für die Vakuumaufbewahrung: Hand-Vakuumpumpen, universelle Vakuumdeckel in verschiedenen Größen, Flaschenventile und Frischhaltebox-Sets. Ergänzen Ihr Vakuumsystem und halten Lebensmittel und Getränke länger frisch.",
    translations: {
      "en-US": {
        name: "Vacuum Accessories",
        description:
          "Accessories for vacuum storage: hand vacuum pumps, universal vacuum lids in various sizes, bottle valves and food-storage box sets. They complement your vacuum system and keep food and drinks fresh for longer.",
      },
      "it-IT": {
        name: "Accessori per sottovuoto",
        description:
          "Accessori per la conservazione sottovuoto: pompe manuali, coperchi sottovuoto universali in varie misure, valvole per bottiglie e set di box salvafreschezza. Completano il tuo sistema sottovuoto e mantengono cibi e bevande freschi più a lungo.",
      },
    },
  },
  // Vegan
  {
    categoryId: "pcat_01KRZKRWJ5MPD3GK33SAHM0M2W",
    translations: {
      "en-US": { name: "Vegan" },
      "it-IT": { name: "Vegano" },
    },
  },
]
