import type { ImproveProductPayload } from "./improve-product.data"

/**
 * Data for the `/improve-product` command — category: **Vakuumiermaschinen**
 * (Planeta vacuum sealers). German base + English (en-US) + Italian (it-IT).
 * Specs taken from the structured `technische_daten__*` metadata; SKUs verbatim.
 *
 * Merged into the main PAYLOADS in `improve-product.ts`.
 */

// ─── DATA: one entry per product (the command appends here) ─────────────────
export const VAKUUMIERMASCHINEN_PAYLOADS: ImproveProductPayload[] = [
{
  productId: "prod_01KSMD62DS10VXJFJ8QD4V8X22",
  handle: "vakuumierer-pv-4000",
  base: {
    title: "Planeta Vakuumierer PV 4000 – Doppelpumpe, 22 l/min, 800 mbar",
    subtitle:
      "Leistungsstarker Folien-Vakuumierer mit Doppelpumpe und integriertem Flüssigkeitsauffang – halb- und vollautomatisch",
    description:
      '<p class="mb-3 leading-relaxed">Mehr Frische, weniger Abfall: Der Planeta PV 4000 versiegelt Ihre Lebensmittel luftdicht in Vakuumfolie und hält sie ein Vielfaches länger frisch. Die kräftige Doppelpumpe mit 22 l/min und 800 mbar arbeitet schnell und zuverlässig – zu Hause wie im täglichen Einsatz.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Kräftige Doppelpumpe:</strong> 22 l/min und 800 mbar für schnelles, gleichmäßiges Vakuumieren.</li><li class="ml-1"><strong class="font-semibold">Halb- und vollautomatisch:</strong> vakuumieren und verschweißen auf Knopfdruck.</li><li class="ml-1"><strong class="font-semibold">Folienfach mit Messer:</strong> Folie direkt zuschneiden, verschweißen und vakuumieren.</li><li class="ml-1"><strong class="font-semibold">Flüssigkeitsauffang:</strong> integrierter Behälter schützt das Gerät bei feuchten Produkten.</li><li class="ml-1"><strong class="font-semibold">Auch für Vakuumbehälter:</strong> passender Vakuumierschlauch zum Anstecken.</li><li class="ml-1"><strong class="font-semibold">Sicher:</strong> automatische Abschaltung bei Überhitzung.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Lieferumfang</strong></p>' +
      '<p class="mb-3 leading-relaxed">PV 4000, Vakuumierschlauch für die Behälter, 1 Packung Vakuumfolien/-rollen, 1 Packung Vakuumbeutel, Bedienungsanleitung, Ersatzklinge.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pumpe: Doppel-Kolben-Pumpe (selbstölend, wartungsfrei)</li><li class="ml-1">Pumpvolumen: 22 l/min</li><li class="ml-1">Vakuumierleistung: −800 mbar</li><li class="ml-1">Beutelbreite: 28 cm</li><li class="ml-1">Umdrehungen: 2900 U/min</li><li class="ml-1">Steuerung: elektronisch</li><li class="ml-1">Maße: 385 × 235 × 95 mm</li><li class="ml-1">Gewicht: ca. 3,7 kg</li><li class="ml-1">Gehäuse: Kunststoff (ABS)</li><li class="ml-1">Artikelnummer: 570300</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Planeta Vakuumierer PV 4000 – Doppelpumpe 22 l/min | Planeta",
      meta_description:
        "Planeta PV 4000 Folien-Vakuumierer mit Doppelpumpe, 22 l/min und 800 mbar. Mit Folienfach, Cutter & Flüssigkeitsauffang – hält Lebensmittel länger frisch.",
      meta_title_en: "Planeta Vacuum Sealer PV 4000 – Twin Pump 22 l/min | Planeta",
      meta_description_en:
        "Planeta PV 4000 film vacuum sealer with twin pump, 22 l/min and 800 mbar. With film compartment, cutter & liquid trap – keeps food fresher for longer.",
      meta_title_it: "Macchina sottovuoto Planeta PV 4000 – doppia pompa | Planeta",
      meta_description_it:
        "Macchina sottovuoto Planeta PV 4000 con doppia pompa, 22 l/min e 800 mbar. Con vano pellicola, lama e vaschetta raccogli-liquidi – conserva gli alimenti più a lungo.",
    },
  },
  translations: {
    "en-US": {
      title: "Planeta Vacuum Sealer PV 4000 – Twin Pump, 22 l/min, 800 mbar",
      subtitle:
        "Powerful film vacuum sealer with twin pump and built-in liquid trap – semi- and fully automatic",
      description:
        '<p class="mb-3 leading-relaxed">More freshness, less waste: the Planeta PV 4000 seals your food airtight in vacuum film and keeps it fresh many times longer. The strong twin pump with 22 l/min and 800 mbar works fast and reliably – at home and in everyday use.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Strong twin pump:</strong> 22 l/min and 800 mbar for fast, even sealing.</li><li class="ml-1"><strong class="font-semibold">Semi- and fully automatic:</strong> vacuum and seal at the push of a button.</li><li class="ml-1"><strong class="font-semibold">Film compartment with cutter:</strong> cut, seal and vacuum the film directly.</li><li class="ml-1"><strong class="font-semibold">Liquid trap:</strong> built-in container protects the device with moist products.</li><li class="ml-1"><strong class="font-semibold">Also for vacuum containers:</strong> matching vacuum hose to attach.</li><li class="ml-1"><strong class="font-semibold">Safe:</strong> automatic shut-off on overheating.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In the box</strong></p>' +
        '<p class="mb-3 leading-relaxed">PV 4000, vacuum hose for containers, 1 pack of vacuum film/rolls, 1 pack of vacuum bags, manual, spare blade.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pump: twin piston pump (self-oiling, maintenance-free)</li><li class="ml-1">Pump volume: 22 l/min</li><li class="ml-1">Vacuum: −800 mbar</li><li class="ml-1">Bag width: 28 cm</li><li class="ml-1">Rotation: 2900 rpm</li><li class="ml-1">Control: electronic</li><li class="ml-1">Dimensions: 385 × 235 × 95 mm</li><li class="ml-1">Weight: approx. 3.7 kg</li><li class="ml-1">Housing: ABS plastic</li><li class="ml-1">Article number: 570300</li></ul>',
    },
    "it-IT": {
      title: "Macchina sottovuoto Planeta PV 4000 – doppia pompa, 22 l/min, 800 mbar",
      subtitle:
        "Potente macchina per sottovuoto a film con doppia pompa e vaschetta raccogli-liquidi integrata – semi e completamente automatica",
      description:
        '<p class="mb-3 leading-relaxed">Più freschezza, meno sprechi: la Planeta PV 4000 sigilla gli alimenti ermeticamente nella pellicola sottovuoto e li mantiene freschi molto più a lungo. La potente doppia pompa da 22 l/min e 800 mbar lavora in modo rapido e affidabile – a casa e nell\'uso quotidiano.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Doppia pompa potente:</strong> 22 l/min e 800 mbar per un sottovuoto rapido e uniforme.</li><li class="ml-1"><strong class="font-semibold">Semi e completamente automatica:</strong> sottovuoto e saldatura con un pulsante.</li><li class="ml-1"><strong class="font-semibold">Vano pellicola con lama:</strong> taglia, salda e mette sottovuoto la pellicola direttamente.</li><li class="ml-1"><strong class="font-semibold">Raccogli-liquidi:</strong> vaschetta integrata che protegge l\'apparecchio con i prodotti umidi.</li><li class="ml-1"><strong class="font-semibold">Anche per contenitori sottovuoto:</strong> tubo sottovuoto da collegare incluso.</li><li class="ml-1"><strong class="font-semibold">Sicura:</strong> spegnimento automatico in caso di surriscaldamento.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In dotazione</strong></p>' +
        '<p class="mb-3 leading-relaxed">PV 4000, tubo sottovuoto per i contenitori, 1 confezione di pellicola/rotoli, 1 confezione di buste sottovuoto, manuale, lama di ricambio.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pompa: doppia pompa a pistoni (autolubrificante, senza manutenzione)</li><li class="ml-1">Portata: 22 l/min</li><li class="ml-1">Vuoto: −800 mbar</li><li class="ml-1">Larghezza busta: 28 cm</li><li class="ml-1">Giri: 2900 g/min</li><li class="ml-1">Controllo: elettronico</li><li class="ml-1">Dimensioni: 385 × 235 × 95 mm</li><li class="ml-1">Peso: ca. 3,7 kg</li><li class="ml-1">Scocca: plastica (ABS)</li><li class="ml-1">Codice articolo: 570300</li></ul>',
    },
  },
  tags: ["Vakuumierer", "Folienschweißgerät", "Lebensmittel vakuumieren", "Profi-Vakuumierer", "Planeta"],
},
{
  productId: "prod_01KSMD62QJ9AZZVJKCDCZ8K7ZV",
  handle: "vakuumierer-pv-600",
  base: {
    title: "Planeta Vakuumierer PV 600 – kompakt, 14 l/min, 750 mbar",
    subtitle:
      "Einfacher Folien-Vakuumierer für den Privathaushalt – schweißt Vakuumfolien und vakuumiert Behälter per Schlauch",
    description:
      '<p class="mb-3 leading-relaxed">Einfach frisch halten: Der kompakte Planeta PV 600 vakuumiert und verschweißt Ihre Lebensmittel in Vakuumfolie – ideal für den Privathaushalt. So bleiben Aroma und Frische deutlich länger erhalten und Sie werfen weniger weg.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Einfache Bedienung:</strong> halb- und vollautomatisches Vakuumieren und Verschweißen.</li><li class="ml-1"><strong class="font-semibold">Kompakt & leicht:</strong> passt mit ca. 2,8 kg in jede Küche.</li><li class="ml-1"><strong class="font-semibold">Auch für Vakuumbehälter:</strong> passender Vakuumierschlauch zum Anstecken.</li><li class="ml-1"><strong class="font-semibold">Sicher:</strong> automatische Abschaltung bei Überhitzung.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Lieferumfang</strong></p>' +
      '<p class="mb-3 leading-relaxed">PV 600, Vakuumierschlauch für die Behälter, 1 Packung Vakuumfolien/-rollen, 1 Packung Vakuumbeutel, Bedienungsanleitung.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pumpe: Doppel-Kolben-Pumpe (selbstölend, wartungsfrei)</li><li class="ml-1">Pumpvolumen: 14 l/min</li><li class="ml-1">Vakuumierleistung: −750 mbar</li><li class="ml-1">Beutelbreite: 28 cm</li><li class="ml-1">Umdrehungen: 2900 U/min</li><li class="ml-1">Steuerung: elektronisch</li><li class="ml-1">Maße: 340 × 170 × 90 mm</li><li class="ml-1">Gewicht: ca. 2,8 kg</li><li class="ml-1">Gehäuse: Kunststoff (ABS)</li><li class="ml-1">Artikelnummer: 575105</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Planeta Vakuumierer PV 600 – kompakt für zu Hause | Planeta",
      meta_description:
        "Planeta PV 600 Folien-Vakuumierer für den Haushalt: 14 l/min, 750 mbar, 28 cm Beutelbreite, halb- & vollautomatisch. Hält Lebensmittel länger frisch.",
      meta_title_en: "Planeta Vacuum Sealer PV 600 – Compact for Home | Planeta",
      meta_description_en:
        "Planeta PV 600 film vacuum sealer for the home: 14 l/min, 750 mbar, 28 cm bag width, semi- & fully automatic. Keeps food fresher for longer.",
      meta_title_it: "Macchina sottovuoto Planeta PV 600 – compatta | Planeta",
      meta_description_it:
        "Macchina sottovuoto Planeta PV 600 per la casa: 14 l/min, 750 mbar, busta da 28 cm, semi e completamente automatica. Conserva gli alimenti più a lungo.",
    },
  },
  translations: {
    "en-US": {
      title: "Planeta Vacuum Sealer PV 600 – Compact, 14 l/min, 750 mbar",
      subtitle:
        "Simple film vacuum sealer for the home – seals vacuum film and vacuums containers via hose",
      description:
        '<p class="mb-3 leading-relaxed">Easy freshness: the compact Planeta PV 600 vacuums and seals your food in vacuum film – ideal for the home. Flavour and freshness last much longer and you waste less.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Easy to use:</strong> semi- and fully automatic vacuuming and sealing.</li><li class="ml-1"><strong class="font-semibold">Compact & light:</strong> fits any kitchen at approx. 2.8 kg.</li><li class="ml-1"><strong class="font-semibold">Also for vacuum containers:</strong> matching vacuum hose to attach.</li><li class="ml-1"><strong class="font-semibold">Safe:</strong> automatic shut-off on overheating.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In the box</strong></p>' +
        '<p class="mb-3 leading-relaxed">PV 600, vacuum hose for containers, 1 pack of vacuum film/rolls, 1 pack of vacuum bags, manual.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pump: twin piston pump (self-oiling, maintenance-free)</li><li class="ml-1">Pump volume: 14 l/min</li><li class="ml-1">Vacuum: −750 mbar</li><li class="ml-1">Bag width: 28 cm</li><li class="ml-1">Rotation: 2900 rpm</li><li class="ml-1">Control: electronic</li><li class="ml-1">Dimensions: 340 × 170 × 90 mm</li><li class="ml-1">Weight: approx. 2.8 kg</li><li class="ml-1">Housing: ABS plastic</li><li class="ml-1">Article number: 575105</li></ul>',
    },
    "it-IT": {
      title: "Macchina sottovuoto Planeta PV 600 – compatta, 14 l/min, 750 mbar",
      subtitle:
        "Semplice macchina per sottovuoto a film per la casa – salda la pellicola sottovuoto e mette sottovuoto i contenitori tramite tubo",
      description:
        '<p class="mb-3 leading-relaxed">Freschezza semplice: la compatta Planeta PV 600 mette sottovuoto e salda gli alimenti nella pellicola – ideale per la casa. Aroma e freschezza durano molto più a lungo e si spreca meno.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Facile da usare:</strong> sottovuoto e saldatura semi e completamente automatici.</li><li class="ml-1"><strong class="font-semibold">Compatta e leggera:</strong> con ca. 2,8 kg trova posto in ogni cucina.</li><li class="ml-1"><strong class="font-semibold">Anche per contenitori sottovuoto:</strong> tubo sottovuoto da collegare incluso.</li><li class="ml-1"><strong class="font-semibold">Sicura:</strong> spegnimento automatico in caso di surriscaldamento.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In dotazione</strong></p>' +
        '<p class="mb-3 leading-relaxed">PV 600, tubo sottovuoto per i contenitori, 1 confezione di pellicola/rotoli, 1 confezione di buste sottovuoto, manuale.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pompa: doppia pompa a pistoni (autolubrificante, senza manutenzione)</li><li class="ml-1">Portata: 14 l/min</li><li class="ml-1">Vuoto: −750 mbar</li><li class="ml-1">Larghezza busta: 28 cm</li><li class="ml-1">Giri: 2900 g/min</li><li class="ml-1">Controllo: elettronico</li><li class="ml-1">Dimensioni: 340 × 170 × 90 mm</li><li class="ml-1">Peso: ca. 2,8 kg</li><li class="ml-1">Scocca: plastica (ABS)</li><li class="ml-1">Codice articolo: 575105</li></ul>',
    },
  },
  tags: ["Vakuumierer", "Folienschweißgerät", "Lebensmittel vakuumieren", "Haushalt", "Planeta"],
},
{
  productId: "prod_01KSMD62T4WRCTPQ9T2FY9EP6T",
  handle: "vakuumierer-pv-9000",
  base: {
    title: "Planeta Vakuumierer PV 9000 – Profi, Doppelpumpe 30 l/min, Marinierfunktion",
    subtitle:
      "Leistungsstarker Profi-Vakuumierer mit Doppelpumpe, Flüssigkeitssensor und Marinierfunktion – für Metzger, Jäger, Fischer und Gastronomie",
    description:
      '<p class="mb-3 leading-relaxed">Für große Mengen gemacht: Der Planeta PV 9000 ist ein leistungsstarker Profi-Vakuumierer mit Doppelpumpe (30 l/min, 900 mbar). Er versiegelt Fleisch, Fisch und Gemüse schnell und zuverlässig und verlängert die Haltbarkeit deutlich – besonders beliebt bei Metzgern, Jägern, Fischern und in der Gastronomie.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Kräftige Doppelpumpe:</strong> 30 l/min und −900 mbar für schnelles Vakuumieren großer Mengen.</li><li class="ml-1"><strong class="font-semibold">Flüssigkeitssensor:</strong> herausnehmbarer Auffangbehälter mit Sensoren schützt das Gerät bei feuchten Produkten.</li><li class="ml-1"><strong class="font-semibold">Marinierfunktion:</strong> Fleisch, Gemüse und Obst in kurzer Zeit intensiv durchziehen – mit passenden Boxen und Marinierschlauch.</li><li class="ml-1"><strong class="font-semibold">Rollenfach mit Messer:</strong> Folie direkt zuschneiden.</li><li class="ml-1"><strong class="font-semibold">Sicher:</strong> automatische Abschaltung bei Überhitzung.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Lieferumfang</strong></p>' +
      '<p class="mb-3 leading-relaxed">PV 9000, Vakuumierschlauch für die Behälter, 1 Packung Vakuumierfolien/-rollen, 1 Packung Vakuumbeutel, Bedienungsanleitung.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pumpe: Doppelpumpen</li><li class="ml-1">Pumpvolumen: 30 l/min</li><li class="ml-1">Vakuumierleistung: −900 mbar</li><li class="ml-1">Umdrehungen: 2900 U/min</li><li class="ml-1">Steuerung: elektronisch</li><li class="ml-1">Maße: 510 × 288 × 137 mm</li><li class="ml-1">Gewicht: ca. 8,9 kg</li><li class="ml-1">Artikelnummer: 573305</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Planeta Vakuumierer PV 9000 – Profi 30 l/min | Planeta",
      meta_description:
        "Planeta PV 9000 Profi-Vakuumierer mit Doppelpumpe (30 l/min, 900 mbar), Flüssigkeitssensor & Marinierfunktion. Für Metzger, Jäger, Fischer & Gastronomie.",
      meta_title_en: "Planeta Vacuum Sealer PV 9000 – Pro 30 l/min | Planeta",
      meta_description_en:
        "Planeta PV 9000 pro vacuum sealer with twin pump (30 l/min, 900 mbar), liquid sensor & marinating function. For butchers, hunters, anglers & catering.",
      meta_title_it: "Macchina sottovuoto Planeta PV 9000 – pro 30 l/min | Planeta",
      meta_description_it:
        "Macchina sottovuoto Planeta PV 9000 con doppia pompa (30 l/min, 900 mbar), sensore liquidi e funzione marinatura. Per macellai, cacciatori, pescatori e ristorazione.",
    },
  },
  translations: {
    "en-US": {
      title: "Planeta Vacuum Sealer PV 9000 – Pro, Twin Pump 30 l/min, Marinating Function",
      subtitle:
        "Powerful professional vacuum sealer with twin pump, liquid sensor and marinating function – for butchers, hunters, anglers and catering",
      description:
        '<p class="mb-3 leading-relaxed">Built for big batches: the Planeta PV 9000 is a powerful professional vacuum sealer with a twin pump (30 l/min, 900 mbar). It seals meat, fish and vegetables quickly and reliably and extends shelf life considerably – a favourite with butchers, hunters, anglers and catering.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Strong twin pump:</strong> 30 l/min and −900 mbar for fast sealing of large quantities.</li><li class="ml-1"><strong class="font-semibold">Liquid sensor:</strong> removable collection container with sensors protects the device with moist products.</li><li class="ml-1"><strong class="font-semibold">Marinating function:</strong> infuse meat, vegetables and fruit quickly – with matching boxes and marinating hose.</li><li class="ml-1"><strong class="font-semibold">Roll compartment with cutter:</strong> cut the film directly.</li><li class="ml-1"><strong class="font-semibold">Safe:</strong> automatic shut-off on overheating.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In the box</strong></p>' +
        '<p class="mb-3 leading-relaxed">PV 9000, vacuum hose for containers, 1 pack of vacuum film/rolls, 1 pack of vacuum bags, manual.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pump: twin pumps</li><li class="ml-1">Pump volume: 30 l/min</li><li class="ml-1">Vacuum: −900 mbar</li><li class="ml-1">Rotation: 2900 rpm</li><li class="ml-1">Control: electronic</li><li class="ml-1">Dimensions: 510 × 288 × 137 mm</li><li class="ml-1">Weight: approx. 8.9 kg</li><li class="ml-1">Article number: 573305</li></ul>',
    },
    "it-IT": {
      title: "Macchina sottovuoto Planeta PV 9000 – pro, doppia pompa 30 l/min, marinatura",
      subtitle:
        "Potente macchina per sottovuoto professionale con doppia pompa, sensore liquidi e funzione marinatura – per macellai, cacciatori, pescatori e ristorazione",
      description:
        '<p class="mb-3 leading-relaxed">Pensata per le grandi quantità: la Planeta PV 9000 è una potente macchina per sottovuoto professionale con doppia pompa (30 l/min, 900 mbar). Sigilla carne, pesce e verdura in modo rapido e affidabile e prolunga notevolmente la conservazione – molto apprezzata da macellai, cacciatori, pescatori e ristorazione.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Doppia pompa potente:</strong> 30 l/min e −900 mbar per mettere sottovuoto grandi quantità in fretta.</li><li class="ml-1"><strong class="font-semibold">Sensore liquidi:</strong> vaschetta di raccolta estraibile con sensori che protegge l\'apparecchio con i prodotti umidi.</li><li class="ml-1"><strong class="font-semibold">Funzione marinatura:</strong> insaporisce carne, verdura e frutta in poco tempo – con apposite box e tubo per marinatura.</li><li class="ml-1"><strong class="font-semibold">Vano rotoli con lama:</strong> taglia la pellicola direttamente.</li><li class="ml-1"><strong class="font-semibold">Sicura:</strong> spegnimento automatico in caso di surriscaldamento.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In dotazione</strong></p>' +
        '<p class="mb-3 leading-relaxed">PV 9000, tubo sottovuoto per i contenitori, 1 confezione di pellicola/rotoli, 1 confezione di buste sottovuoto, manuale.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pompa: doppie pompe</li><li class="ml-1">Portata: 30 l/min</li><li class="ml-1">Vuoto: −900 mbar</li><li class="ml-1">Giri: 2900 g/min</li><li class="ml-1">Controllo: elettronico</li><li class="ml-1">Dimensioni: 510 × 288 × 137 mm</li><li class="ml-1">Peso: ca. 8,9 kg</li><li class="ml-1">Codice articolo: 573305</li></ul>',
    },
  },
  tags: ["Vakuumierer", "Profi-Vakuumierer", "Lebensmittel vakuumieren", "Gastronomie", "Planeta"],
},
{
  productId: "prod_01KSMD69E8K7VR5WQDF2JJ7NBW",
  handle: "vakuumierer-multivac-home",
  base: {
    title: "Multivac Home – Kammer-Vakuumierer für zu Hause",
    subtitle:
      "Kammer-Vakuumierer für die Küche – vakuumiert auch Flüssigkeiten (Suppen, Saucen, Marinaden) und mariniert in unter 30 Minuten",
    description:
      '<p class="mb-3 leading-relaxed">Profi-Vakuumieren für zu Hause: Mit dem Multivac Home holen Sie sich einen Kammer-Vakuumierer in die Küche – das einzige Prinzip, mit dem sich auch Flüssigkeiten wie Suppen, Saucen und Marinaden sicher vakuumieren lassen, im Beutel wie im Schraubglas. Einfach, sicher und vielseitig.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Vakuumiert auch Flüssigkeiten:</strong> im Beutel, in Gläsern und in externen Behältern oder Flaschen.</li><li class="ml-1"><strong class="font-semibold">Extra starkes Vakuum:</strong> bis unter 15 mbar.</li><li class="ml-1"><strong class="font-semibold">Marinierfunktion:</strong> mariniert Fleisch, Fisch und Gemüse in maximal 30 Minuten durch pulsierendes Vakuum.</li><li class="ml-1"><strong class="font-semibold">Einfache Bedienung:</strong> Drehknopf, praktische Voreinstellungen, individuell regelbares Vakuum (in %) und speicherbare Favoriten – optimal für Sous-vide.</li><li class="ml-1"><strong class="font-semibold">Doppelnaht-Trennsiegelung:</strong> Beutelüberstand ohne Schere abtrennen – hygienisch.</li><li class="ml-1"><strong class="font-semibold">Wartungsfreie Vakuumpumpe – Made in Germany.</strong></li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Lieferumfang</strong></p>' +
      '<p class="mb-3 leading-relaxed">1× Beutelauflage mit Positionierwinkel, 1× Vakuumschlauch für externe Behälter, 2× Flaschenvakuumverschlüsse, 1× Beutel-Starterset (15× Vakuumbeutel 150 × 200 mm, 15× Vakuumbeutel 200 × 300 mm, 15× Kochbeutel 150 × 200 mm, 15× Kochbeutel 200 × 300 mm).</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pumpe: Doppelpumpen, 2,5 m³/h</li><li class="ml-1">Vakuumierleistung: bis unter 15 mbar</li><li class="ml-1">Steuerung: elektronisch</li><li class="ml-1">Maße: 480 × 310 × 225 mm</li><li class="ml-1">Gewicht: 12,2 kg</li><li class="ml-1">Herstellung: Made in Germany</li><li class="ml-1">Artikelnummer: 573301</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Multivac Home – Kammer-Vakuumierer fürs Zuhause | Planeta",
      meta_description:
        "Multivac Home Kammer-Vakuumierer: vakuumiert auch Flüssigkeiten, Vakuum bis unter 15 mbar, Marinierfunktion < 30 Min., Made in Germany. Sous-vide-ready.",
      meta_title_en: "Multivac Home – Chamber Vacuum Sealer for Home | Planeta",
      meta_description_en:
        "Multivac Home chamber vacuum sealer: vacuums liquids too, vacuum down to under 15 mbar, marinating function < 30 min, Made in Germany. Sous-vide ready.",
      meta_title_it: "Multivac Home – macchina sottovuoto a campana per casa | Planeta",
      meta_description_it:
        "Multivac Home macchina sottovuoto a campana: mette sottovuoto anche i liquidi, vuoto fino a meno di 15 mbar, marinatura < 30 min, Made in Germany. Pronta sous-vide.",
    },
  },
  translations: {
    "en-US": {
      title: "Multivac Home – Chamber Vacuum Sealer for Home",
      subtitle:
        "Chamber vacuum sealer for the kitchen – vacuums liquids too (soups, sauces, marinades) and marinates in under 30 minutes",
      description:
        '<p class="mb-3 leading-relaxed">Professional vacuum sealing at home: the Multivac Home brings a chamber vacuum sealer into your kitchen – the only method that can safely vacuum liquids such as soups, sauces and marinades, in bags as well as screw-top jars. Simple, safe and versatile.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Vacuums liquids too:</strong> in bags, jars and external containers or bottles.</li><li class="ml-1"><strong class="font-semibold">Extra-strong vacuum:</strong> down to under 15 mbar.</li><li class="ml-1"><strong class="font-semibold">Marinating function:</strong> marinates meat, fish and vegetables in a maximum of 30 minutes via pulsing vacuum.</li><li class="ml-1"><strong class="font-semibold">Easy to use:</strong> rotary knob, handy presets, individually adjustable vacuum (in %) and saved favourites – ideal for sous-vide.</li><li class="ml-1"><strong class="font-semibold">Double-seam cut sealing:</strong> remove the bag overhang without scissors – hygienic.</li><li class="ml-1"><strong class="font-semibold">Maintenance-free vacuum pump – Made in Germany.</strong></li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In the box</strong></p>' +
        '<p class="mb-3 leading-relaxed">1× bag support with positioning angle, 1× vacuum hose for external containers, 2× bottle vacuum stoppers, 1× bag starter set (15× vacuum bags 150 × 200 mm, 15× vacuum bags 200 × 300 mm, 15× cooking bags 150 × 200 mm, 15× cooking bags 200 × 300 mm).</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pump: twin pumps, 2.5 m³/h</li><li class="ml-1">Vacuum: down to under 15 mbar</li><li class="ml-1">Control: electronic</li><li class="ml-1">Dimensions: 480 × 310 × 225 mm</li><li class="ml-1">Weight: 12.2 kg</li><li class="ml-1">Manufacture: Made in Germany</li><li class="ml-1">Article number: 573301</li></ul>',
    },
    "it-IT": {
      title: "Multivac Home – macchina sottovuoto a campana per la casa",
      subtitle:
        "Macchina sottovuoto a campana per la cucina – mette sottovuoto anche i liquidi (zuppe, salse, marinate) e marina in meno di 30 minuti",
      description:
        '<p class="mb-3 leading-relaxed">Sottovuoto professionale a casa: con la Multivac Home porti in cucina una macchina sottovuoto a campana – l\'unico principio che permette di mettere sottovuoto in sicurezza anche i liquidi come zuppe, salse e marinate, sia in busta sia in vasetti a vite. Semplice, sicura e versatile.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mette sottovuoto anche i liquidi:</strong> in busta, in vasetti e in contenitori o bottiglie esterni.</li><li class="ml-1"><strong class="font-semibold">Vuoto extra potente:</strong> fino a meno di 15 mbar.</li><li class="ml-1"><strong class="font-semibold">Funzione marinatura:</strong> marina carne, pesce e verdura in massimo 30 minuti grazie al vuoto pulsante.</li><li class="ml-1"><strong class="font-semibold">Facile da usare:</strong> manopola, comode preimpostazioni, vuoto regolabile individualmente (in %) e preferiti memorizzabili – ideale per il sous-vide.</li><li class="ml-1"><strong class="font-semibold">Saldatura a doppia cucitura con taglio:</strong> rimuovi l\'eccesso di busta senza forbici – igienico.</li><li class="ml-1"><strong class="font-semibold">Pompa sottovuoto senza manutenzione – Made in Germany.</strong></li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">In dotazione</strong></p>' +
        '<p class="mb-3 leading-relaxed">1× supporto busta con squadra di posizionamento, 1× tubo sottovuoto per contenitori esterni, 2× tappi sottovuoto per bottiglie, 1× set starter di buste (15× buste sottovuoto 150 × 200 mm, 15× buste sottovuoto 200 × 300 mm, 15× buste da cottura 150 × 200 mm, 15× buste da cottura 200 × 300 mm).</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pompa: doppie pompe, 2,5 m³/h</li><li class="ml-1">Vuoto: fino a meno di 15 mbar</li><li class="ml-1">Controllo: elettronico</li><li class="ml-1">Dimensioni: 480 × 310 × 225 mm</li><li class="ml-1">Peso: 12,2 kg</li><li class="ml-1">Produzione: Made in Germany</li><li class="ml-1">Codice articolo: 573301</li></ul>',
    },
  },
  tags: ["Kammer-Vakuumierer", "Vakuumierer", "Lebensmittel vakuumieren", "Sous-vide", "Planeta"],
},
]
