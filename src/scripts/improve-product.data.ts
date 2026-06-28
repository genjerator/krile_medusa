/**
 * Data for the `/improve-product` command: one entry per product.
 *
 * The copy is baked in here (not in external JSON) so nothing is corrupted via
 * copy-paste through the terminal. The apply logic lives in
 * `improve-product.ts`, which imports PAYLOADS from this file.
 */

export type ImproveProductPayload = {
  productId: string
  /** New URL slug. Changing it 404s the old URL unless a redirect is added. */
  handle?: string
  /** Default-locale (German) fields written to the product row. */
  base?: { title?: string; subtitle?: string; description?: string }
  metadata?: {
    /** Metadata keys with any of these prefixes are removed (e.g. "woo_"). */
    stripPrefixes?: string[]
    /** Keys merged into metadata after stripping (e.g. SEO meta). */
    set?: Record<string, unknown>
  }
  /** Per-locale translations, e.g. { "en-US": { title, subtitle, description } }. */
  translations?: Record<string, Record<string, string>>
  /** Tag values to ensure exist and link (added to any existing tags). */
  tags?: string[]
}

// ─── DATA: one entry per product (the command appends here) ─────────────────
export const PAYLOADS: ImproveProductPayload[] = [
{
  productId: "prod_01KSMD62WY5ABZP0TTZWFN2XDN",
  handle: "vakuumbehaelter-3l-rechteckig",
  base: {
    title: "Vakuumbehälter 3,0 l – rechteckig, BPA-frei & stapelbar",
    subtitle:
      "Rechteckige Frischhaltedose mit Handpumpe – hält Lebensmittel länger frisch und spart Platz im Kühlschrank",
    description:
      '<p class="mb-3 leading-relaxed">Länger frisch, weniger Abfall: Mit dem rechteckigen Planeta Vakuumbehälter (ca. 3,0 l) entziehen Sie Ihren Lebensmitteln per Handpumpe die Luft – so bleiben Aroma, Frische und Nährstoffe spürbar länger erhalten. Kaufen Sie größere Mengen günstiger ein und portionieren Sie sie luftdicht.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für die tägliche Aufbewahrung von Obst, Gemüse, Brot, Wurst und Käse, Resten sowie Saucen und Suppen.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar und transparent für Ordnung in Kühlschrank und Regal.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rechteckig, grün</li><li class="ml-1">Volumen: ca. 3,0 l</li><li class="ml-1">Maße (L × B × H): 310 × 190 × 120 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 578618</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 3,0 l rechteckig, BPA-frei | Planeta",
      meta_description:
        "Rechteckiger Vakuumbehälter mit 3,0 l Volumen und Handpumpe. BPA-frei, stapelbar, spülmaschinenfest – hält Obst, Gemüse, Brot & Reste länger frisch.",
      meta_title_en: "Vacuum Container 3.0 l Rectangular, BPA-Free | Planeta",
      meta_description_en:
        "Rectangular 3.0 l vacuum container with hand pump. BPA-free, stackable, dishwasher-safe – keeps fruit, vegetables, bread & leftovers fresher for longer.",
      meta_title_it: "Contenitore sottovuoto 3,0 l, senza BPA | Planeta",
      meta_description_it:
        "Contenitore sottovuoto rettangolare da 3,0 l con pompa manuale. Senza BPA, impilabile, lavabile in lavastoviglie – mantiene freschi frutta, verdura e pane.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 3.0 l – Rectangular, BPA-Free & Stackable",
      subtitle:
        "Rectangular vacuum food container with hand pump – keeps food fresher for longer and saves fridge space",
      description:
        '<p class="mb-3 leading-relaxed">Fresher for longer, less waste: the rectangular Planeta vacuum container (approx. 3.0 l) lets you remove the air with a hand pump, so flavour, freshness and nutrients last noticeably longer. Buy in bulk to save money and store food airtight in handy portions.</p>' +
        '<p class="mb-3 leading-relaxed">Perfect for everyday storage of fruit and vegetables, bread, salami and cheese, leftovers, sauces and soups.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable and transparent for a tidy fridge and pantry.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: rectangular, green</li><li class="ml-1">Volume: approx. 3.0 l</li><li class="ml-1">Dimensions (L × W × H): 310 × 190 × 120 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 578618</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 3,0 l rettangolare, senza BPA",
      subtitle:
        "Contenitore alimentare rettangolare sottovuoto con pompa manuale – mantiene gli alimenti freschi più a lungo e fa risparmiare spazio in frigo",
      description:
        '<p class="mb-3 leading-relaxed">Più freschezza, meno sprechi: con il contenitore sottovuoto rettangolare Planeta (ca. 3,0 l) togli l\'aria con la pompa manuale, così aroma, freschezza e sostanze nutritive durano molto più a lungo. Acquista in quantità maggiori per risparmiare e conserva gli alimenti sottovuoto in porzioni pratiche.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per la conservazione quotidiana di frutta e verdura, pane, salame e formaggio, avanzi, salse e zuppe.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile e trasparente per un frigo e una dispensa ordinati.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rettangolare, verde</li><li class="ml-1">Volume: ca. 3,0 l</li><li class="ml-1">Dimensioni (L × P × A): 310 × 190 × 120 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 578618</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Frischhaltedose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD62JMSHDGXRQHK302G850",
  handle: "vakuumbehaelter-4-5l-rechteckig",
  base: {
    title: "Vakuumbehälter 4,5 l – rechteckig, BPA-frei & stapelbar",
    subtitle:
      "Rechteckige Frischhaltedose mit Handpumpe – hält Lebensmittel bis zu 4× länger frisch und mariniert in Minuten",
    description:
      '<p class="mb-3 leading-relaxed">Bis zu 4× länger frisch: Im Vakuum bleiben Lebensmittel nährstoffreich und deutlich länger genießbar. Mit dem rechteckigen Planeta Vakuumbehälter (ca. 4,5 l) entziehen Sie per Handpumpe die Luft – für mehr Aroma, Frische und weniger Abfall.</p>' +
      '<p class="mb-3 leading-relaxed">Praktischer Nebeneffekt: Fleisch, Geflügel und Fisch marinieren im Vakuum in wenigen Minuten, weil die Marinade schneller einzieht.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für die tägliche Aufbewahrung von Obst, Gemüse, Brot, Wurst und Käse, süßen Leckereien, Resten sowie Saucen und Suppen.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält bis zu 4× länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Mariniert in Minuten:</strong> Marinade zieht im Vakuum deutlich schneller ein.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar – auch auf Behältern mit 3,0 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> hermetisch versiegelt, keine unangenehmen Gerüche in der Küche.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rechteckig, grün</li><li class="ml-1">Volumen: ca. 4,5 l</li><li class="ml-1">Maße (L × B × H): 310 × 190 × 160 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 578713</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 4,5 l rechteckig, BPA-frei | Planeta",
      meta_description:
        "Rechteckiger Vakuumbehälter mit 4,5 l Volumen und Handpumpe. Hält Lebensmittel bis zu 4× länger frisch, mariniert in Minuten, BPA-frei & stapelbar.",
      meta_title_en: "Vacuum Container 4.5 l Rectangular, BPA-Free | Planeta",
      meta_description_en:
        "Rectangular 4.5 l vacuum container with hand pump. Keeps food up to 4× fresher, marinates in minutes, BPA-free & stackable.",
      meta_title_it: "Contenitore sottovuoto 4,5 l, senza BPA | Planeta",
      meta_description_it:
        "Contenitore sottovuoto rettangolare da 4,5 l con pompa manuale. Mantiene gli alimenti fino a 4 volte più freschi, marina in minuti, senza BPA.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 4.5 l – Rectangular, BPA-Free & Stackable",
      subtitle:
        "Rectangular vacuum food container with hand pump – keeps food up to 4× fresher and marinates in minutes",
      description:
        '<p class="mb-3 leading-relaxed">Up to 4× fresher: vacuum keeps food nutritious and good to eat for much longer. With the rectangular Planeta vacuum container (approx. 4.5 l) you remove the air with a hand pump – for more flavour, more freshness and less waste.</p>' +
        '<p class="mb-3 leading-relaxed">Handy bonus: meat, poultry and fish marinate in just minutes under vacuum, because the marinade soaks in faster.</p>' +
        '<p class="mb-3 leading-relaxed">Perfect for everyday storage of fruit and vegetables, bread, salami and cheese, sweet treats, leftovers, sauces and soups.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food up to 4× fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Marinates in minutes:</strong> the marinade soaks in much faster under vacuum.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable – even on top of the 3.0 l containers.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> airtight seal, no odours in the kitchen.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: rectangular, green</li><li class="ml-1">Volume: approx. 4.5 l</li><li class="ml-1">Dimensions (L × W × H): 310 × 190 × 160 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 578713</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 4,5 l rettangolare, senza BPA",
      subtitle:
        "Contenitore alimentare rettangolare sottovuoto con pompa manuale – mantiene gli alimenti fino a 4 volte più freschi e marina in pochi minuti",
      description:
        '<p class="mb-3 leading-relaxed">Fino a 4 volte più freschi: sottovuoto gli alimenti restano nutrienti e buoni molto più a lungo. Con il contenitore sottovuoto rettangolare Planeta (ca. 4,5 l) togli l\'aria con la pompa manuale – per più aroma, più freschezza e meno sprechi.</p>' +
        '<p class="mb-3 leading-relaxed">Vantaggio pratico: carne, pollame e pesce si marinano in pochi minuti sottovuoto, perché la marinata penetra più in fretta.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per la conservazione quotidiana di frutta e verdura, pane, salame e formaggio, dolcetti, avanzi, salse e zuppe.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene fino a 4 volte più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Marina in pochi minuti:</strong> la marinata penetra molto più in fretta sottovuoto.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile – anche sopra i contenitori da 3,0 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> chiusura ermetica, niente odori in cucina.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rettangolare, verde</li><li class="ml-1">Volume: ca. 4,5 l</li><li class="ml-1">Dimensioni (L × P × A): 310 × 190 × 160 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 578713</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Frischhaltedose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD6367T8V469PKFW9A23AJ",
  handle: "vakuumbehaelter-0-5l-rechteckig",
  base: {
    title: "Vakuumbehälter 0,5 l – rechteckig, BPA-frei & stapelbar",
    subtitle:
      "Kleine rechteckige Frischhaltedose mit Handpumpe – ideal für Kaffee, Gewürze & Co., hält bis zu 4× länger frisch",
    description:
      '<p class="mb-3 leading-relaxed">Bis zu 4× länger frisch: Der kleinste Planeta Vakuumbehälter (ca. 0,5 l) schützt Lebensmittel vor äußeren Einflüssen – Sie entziehen per Handpumpe die Luft, und Aroma wie Frische bleiben deutlich länger erhalten.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal zum Verstauen von Zucker, Kaffee und Tee, Kräutern und Gewürzen sowie süßen Leckereien – perfekt für kleine Mengen.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält bis zu 4× länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar – auch auf Behältern mit 0,8 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rechteckig, grün</li><li class="ml-1">Volumen: ca. 0,5 l</li><li class="ml-1">Maße (L × B × H): 165 × 95 × 85 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 555312</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 0,5 l rechteckig, BPA-frei | Planeta",
      meta_description:
        "Kleiner rechteckiger Vakuumbehälter mit 0,5 l Volumen und Handpumpe. Ideal für Kaffee, Tee & Gewürze – BPA-frei, stapelbar, hält bis zu 4× länger frisch.",
      meta_title_en: "Vacuum Container 0.5 l Rectangular, BPA-Free | Planeta",
      meta_description_en:
        "Small rectangular 0.5 l vacuum container with hand pump. Ideal for coffee, tea & spices – BPA-free, stackable, keeps food up to 4× fresher.",
      meta_title_it: "Contenitore sottovuoto 0,5 l, senza BPA | Planeta",
      meta_description_it:
        "Piccolo contenitore sottovuoto rettangolare da 0,5 l con pompa manuale. Ideale per caffè, tè e spezie – senza BPA, impilabile, fino a 4 volte più fresco.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 0.5 l – Rectangular, BPA-Free & Stackable",
      subtitle:
        "Small rectangular vacuum container with hand pump – ideal for coffee, herbs & spices, keeps food up to 4× fresher",
      description:
        '<p class="mb-3 leading-relaxed">Up to 4× fresher: the smallest Planeta vacuum container (approx. 0.5 l) protects food from outside influences – you remove the air with a hand pump, so flavour and freshness last much longer.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for storing sugar, coffee and tea, herbs and spices, and sweet treats – perfect for small amounts.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food up to 4× fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable – even on top of the 0.8 l containers.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: rectangular, green</li><li class="ml-1">Volume: approx. 0.5 l</li><li class="ml-1">Dimensions (L × W × H): 165 × 95 × 85 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 555312</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 0,5 l rettangolare, senza BPA",
      subtitle:
        "Piccolo contenitore sottovuoto rettangolare con pompa manuale – ideale per caffè, erbe e spezie, mantiene gli alimenti fino a 4 volte più freschi",
      description:
        '<p class="mb-3 leading-relaxed">Fino a 4 volte più freschi: il più piccolo contenitore sottovuoto Planeta (ca. 0,5 l) protegge gli alimenti dagli influssi esterni – togli l\'aria con la pompa manuale e aroma e freschezza durano molto più a lungo.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per riporre zucchero, caffè e tè, erbe aromatiche e spezie e dolci prelibatezze – perfetto per le piccole quantità.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene fino a 4 volte più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile – anche sopra i contenitori da 0,8 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rettangolare, verde</li><li class="ml-1">Volume: ca. 0,5 l</li><li class="ml-1">Dimensioni (L × P × A): 165 × 95 × 85 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 555312</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Frischhaltedose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD62ZC4KX4WG0FXG1T3187",
  handle: "vakuumbehaelter-2l-rechteckig",
  base: {
    title: "Vakuumbehälter 2,0 l – rechteckig, BPA-frei & stapelbar",
    subtitle: "Rechteckige Frischhaltedose mit Handpumpe – hält Lebensmittel bis zu 4× länger frisch und spart Platz im Kühlschrank",
    description:
      '<p class="mb-3 leading-relaxed">Bis zu 4× länger frisch: Mit dem rechteckigen Planeta Vakuumbehälter (ca. 2,0 l) entziehen Sie per Handpumpe die Luft – so bleiben Aroma und Frische deutlich länger erhalten und es entstehen keine unangenehmen Gerüche im Kühlschrank.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für die tägliche Aufbewahrung von Obst und Gemüse, Brotscheiben, Bagels und frischen Nudeln, Salami, Käse und Frischkäse.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält bis zu 4× länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar – auch auf Behältern mit 1,4 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rechteckig, grün</li><li class="ml-1">Volumen: ca. 2,0 l</li><li class="ml-1">Maße (L × B × H): 245 × 165 × 120 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 558652</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 2,0 l rechteckig, BPA-frei | Planeta",
      meta_description: "Rechteckiger Vakuumbehälter mit 2,0 l Volumen und Handpumpe. BPA-frei, stapelbar, spülmaschinenfest – hält Obst, Gemüse, Wurst & Käse bis zu 4× länger frisch.",
      meta_title_en: "Vacuum Container 2.0 l Rectangular, BPA-Free | Planeta",
      meta_description_en: "Rectangular 2.0 l vacuum container with hand pump. BPA-free, stackable, dishwasher-safe – keeps fruit, vegetables, cold cuts & cheese up to 4× fresher.",
      meta_title_it: "Contenitore sottovuoto 2,0 l, senza BPA | Planeta",
      meta_description_it: "Contenitore sottovuoto rettangolare da 2,0 l con pompa manuale. Senza BPA, impilabile, lavabile in lavastoviglie – mantiene gli alimenti fino a 4 volte più freschi.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 2.0 l – Rectangular, BPA-Free & Stackable",
      subtitle: "Rectangular vacuum food container with hand pump – keeps food up to 4× fresher and saves fridge space",
      description:
        '<p class="mb-3 leading-relaxed">Up to 4× fresher: with the rectangular Planeta vacuum container (approx. 2.0 l) you remove the air with a hand pump, so flavour and freshness last much longer and no unpleasant odours build up in the fridge.</p>' +
        '<p class="mb-3 leading-relaxed">Perfect for everyday storage of fruit and vegetables, bread slices, bagels and fresh pasta, salami, cheese and cream cheese.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food up to 4× fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable – even on top of the 1.4 l containers.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: rectangular, green</li><li class="ml-1">Volume: approx. 2.0 l</li><li class="ml-1">Dimensions (L × W × H): 245 × 165 × 120 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 558652</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 2,0 l rettangolare, senza BPA",
      subtitle: "Contenitore alimentare rettangolare sottovuoto con pompa manuale – mantiene gli alimenti fino a 4 volte più freschi e fa risparmiare spazio in frigo",
      description:
        '<p class="mb-3 leading-relaxed">Fino a 4 volte più freschi: con il contenitore sottovuoto rettangolare Planeta (ca. 2,0 l) togli l\'aria con la pompa manuale, così aroma e freschezza durano molto più a lungo e in frigo non si formano odori sgradevoli.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per la conservazione quotidiana di frutta e verdura, fette di pane, bagel e pasta fresca, salame, formaggio e formaggio fresco.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene fino a 4 volte più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile – anche sopra i contenitori da 1,4 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rettangolare, verde</li><li class="ml-1">Volume: ca. 2,0 l</li><li class="ml-1">Dimensioni (L × P × A): 245 × 165 × 120 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 558652</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Frischhaltedose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD631Q27CKP082BFTW0AQ4",
  handle: "vakuumbehaelter-1-4l-rechteckig",
  base: {
    title: "Vakuumbehälter 1,4 l – rechteckig, BPA-frei & stapelbar",
    subtitle: "Flache rechteckige Frischhaltedose mit Handpumpe – hält Aufschnitt, Käse & Fleisch bis zu 4× länger frisch",
    description:
      '<p class="mb-3 leading-relaxed">Bis zu 4× länger frisch: Pumpen Sie mit der Handpumpe die Luft aus dem rechteckigen Planeta Vakuumbehälter (ca. 1,4 l) und bewahren Sie die Qualität Ihrer Lebensmittel – ideal auch für empfindliche Produkte wie Mozzarella.</p>' +
      '<p class="mb-3 leading-relaxed">Perfekt für Aufschnitt und Käse aller Art, frisches Fleisch und Eier sowie Obst und Gemüse. Fleisch, Geflügel und Fisch lassen sich im Vakuum schneller marinieren.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält bis zu 4× länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> flache Bauform, stapelbar – auch auf Behältern mit 2,0 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rechteckig, grün</li><li class="ml-1">Volumen: ca. 1,4 l</li><li class="ml-1">Maße (L × B × H): 245 × 165 × 90 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 557631</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 1,4 l rechteckig, BPA-frei | Planeta",
      meta_description: "Flacher rechteckiger Vakuumbehälter mit 1,4 l Volumen und Handpumpe. BPA-frei, stapelbar – hält Aufschnitt, Käse & Fleisch bis zu 4× länger frisch.",
      meta_title_en: "Vacuum Container 1.4 l Rectangular, BPA-Free | Planeta",
      meta_description_en: "Flat rectangular 1.4 l vacuum container with hand pump. BPA-free, stackable – keeps cold cuts, cheese & meat up to 4× fresher.",
      meta_title_it: "Contenitore sottovuoto 1,4 l, senza BPA | Planeta",
      meta_description_it: "Contenitore sottovuoto rettangolare basso da 1,4 l con pompa manuale. Senza BPA, impilabile – mantiene affettati, formaggio e carne fino a 4 volte più freschi.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 1.4 l – Rectangular, BPA-Free & Stackable",
      subtitle: "Flat rectangular vacuum container with hand pump – keeps cold cuts, cheese & meat up to 4× fresher",
      description:
        '<p class="mb-3 leading-relaxed">Up to 4× fresher: pump the air out of the rectangular Planeta vacuum container (approx. 1.4 l) with the hand pump and preserve the quality of your food – ideal even for delicate items such as mozzarella.</p>' +
        '<p class="mb-3 leading-relaxed">Perfect for cold cuts and all kinds of cheese, fresh meat and eggs, and fruit and vegetables. Meat, poultry and fish also marinate faster under vacuum.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food up to 4× fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> low profile, stackable – even on top of the 2.0 l containers.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: rectangular, green</li><li class="ml-1">Volume: approx. 1.4 l</li><li class="ml-1">Dimensions (L × W × H): 245 × 165 × 90 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 557631</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 1,4 l rettangolare, senza BPA",
      subtitle: "Contenitore sottovuoto rettangolare basso con pompa manuale – mantiene affettati, formaggio e carne fino a 4 volte più freschi",
      description:
        '<p class="mb-3 leading-relaxed">Fino a 4 volte più freschi: togli l\'aria dal contenitore sottovuoto rettangolare Planeta (ca. 1,4 l) con la pompa manuale e conserva la qualità dei tuoi alimenti – ideale anche per prodotti delicati come la mozzarella.</p>' +
        '<p class="mb-3 leading-relaxed">Perfetto per affettati e formaggi di ogni tipo, carne fresca e uova, frutta e verdura. Carne, pollame e pesce si marinano più in fretta sottovuoto.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene fino a 4 volte più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> basso e impilabile – anche sopra i contenitori da 2,0 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rettangolare, verde</li><li class="ml-1">Volume: ca. 1,4 l</li><li class="ml-1">Dimensioni (L × P × A): 245 × 165 × 90 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 557631</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Frischhaltedose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD633ZCVH0T7P53WRZBS0J",
  handle: "vakuumbehaelter-0-8l-rechteckig",
  base: {
    title: "Vakuumbehälter 0,8 l – rechteckig, BPA-frei & stapelbar",
    subtitle: "Kompakte rechteckige Frischhaltedose mit Handpumpe – ideal für Kaffee, Gewürze & Snacks, ohne Gerüche im Kühlschrank",
    description:
      '<p class="mb-3 leading-relaxed">Länger frisch, keine Gerüche: Der luftdichte rechteckige Planeta Vakuumbehälter (ca. 0,8 l) verhindert unangenehme Gerüche im Kühlschrank. Einfach mit der Handpumpe die Luft entziehen und die Qualität roher wie gekochter Lebensmittel bewahren.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für Zucker und Kaffee, Kräuter, Kekse und Kuchen, Salami, Käse und Knoblauch, süße Leckereien, Reste und Saucen.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar – auch auf Behältern mit 0,5 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rechteckig, grün</li><li class="ml-1">Volumen: ca. 0,8 l</li><li class="ml-1">Maße (L × B × H): 165 × 95 × 115 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 556621</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 0,8 l rechteckig, BPA-frei | Planeta",
      meta_description: "Kompakter rechteckiger Vakuumbehälter mit 0,8 l Volumen und Handpumpe. BPA-frei, stapelbar – ideal für Kaffee, Gewürze & Snacks, ohne Gerüche im Kühlschrank.",
      meta_title_en: "Vacuum Container 0.8 l Rectangular, BPA-Free | Planeta",
      meta_description_en: "Compact rectangular 0.8 l vacuum container with hand pump. BPA-free, stackable – ideal for coffee, spices & snacks, with no odours in the fridge.",
      meta_title_it: "Contenitore sottovuoto 0,8 l, senza BPA | Planeta",
      meta_description_it: "Contenitore sottovuoto rettangolare compatto da 0,8 l con pompa manuale. Senza BPA, impilabile – ideale per caffè, spezie e snack, senza odori in frigo.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 0.8 l – Rectangular, BPA-Free & Stackable",
      subtitle: "Compact rectangular vacuum container with hand pump – ideal for coffee, spices & snacks, with no odours in the fridge",
      description:
        '<p class="mb-3 leading-relaxed">Fresher for longer, no odours: the airtight rectangular Planeta vacuum container (approx. 0.8 l) keeps unpleasant smells out of your fridge. Simply remove the air with the hand pump and preserve the quality of raw and cooked food alike.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for sugar and coffee, herbs, biscuits and cake, salami, cheese and garlic, sweet treats, leftovers and sauces.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable – even on top of the 0.5 l containers.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: rectangular, green</li><li class="ml-1">Volume: approx. 0.8 l</li><li class="ml-1">Dimensions (L × W × H): 165 × 95 × 115 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 556621</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 0,8 l rettangolare, senza BPA",
      subtitle: "Contenitore sottovuoto rettangolare compatto con pompa manuale – ideale per caffè, spezie e snack, senza odori in frigo",
      description:
        '<p class="mb-3 leading-relaxed">Più freschi a lungo, niente odori: il contenitore sottovuoto rettangolare ermetico Planeta (ca. 0,8 l) tiene gli odori sgradevoli fuori dal frigo. Basta togliere l\'aria con la pompa manuale e conservare la qualità di alimenti crudi e cotti.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per zucchero e caffè, erbe aromatiche, biscotti e torte, salame, formaggio e aglio, dolci, avanzi e salse.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile – anche sopra i contenitori da 0,5 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rettangolare, verde</li><li class="ml-1">Volume: ca. 0,8 l</li><li class="ml-1">Dimensioni (L × P × A): 165 × 95 × 115 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 556621</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Frischhaltedose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD638B3WS9ZR6HFD3F6929",
  handle: "vakuumbehaelter-2-5l-rund",
  base: {
    title: "Vakuumbehälter 2,5 l – rund, BPA-frei & stapelbar",
    subtitle: "Runde Vorratsdose mit Handpumpe – hält Pasta, Reis, Mehl & Kaffee länger frisch, ideal für die Arbeitsplatte",
    description:
      '<p class="mb-3 leading-relaxed">Frisch und ordentlich: Der runde Planeta Vakuumbehälter (ca. 2,5 l) ist luftdicht und platzsparend – mit eleganter Form für die Arbeitsplatte. Einfach per Handpumpe die Luft entziehen und Trockenvorräte länger frisch halten.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für Spaghetti und Teigwaren, Reis und Mehl, Kaffeebohnen und Kekse sowie Saucen und Suppen. Auch für die Verwendung im Gefrierschrank geeignet.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar – auf runden Behältern mit 1,5 l und 0,75 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & gefriergeeignet:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rund, grün</li><li class="ml-1">Volumen: ca. 2,5 l</li><li class="ml-1">Maße: Ø 130 mm, Höhe ca. 295 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 577821</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 2,5 l rund, BPA-frei | Planeta",
      meta_description: "Runder Vakuumbehälter mit 2,5 l Volumen und Handpumpe. BPA-frei, stapelbar, gefriergeeignet – hält Pasta, Reis, Mehl & Kaffee länger frisch.",
      meta_title_en: "Vacuum Container 2.5 l Round, BPA-Free | Planeta",
      meta_description_en: "Round 2.5 l vacuum container with hand pump. BPA-free, stackable, freezer-safe – keeps pasta, rice, flour & coffee fresher for longer.",
      meta_title_it: "Contenitore sottovuoto 2,5 l rotondo, senza BPA | Planeta",
      meta_description_it: "Contenitore sottovuoto rotondo da 2,5 l con pompa manuale. Senza BPA, impilabile, adatto al congelatore – mantiene pasta, riso, farina e caffè più freschi.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 2.5 l – Round, BPA-Free & Stackable",
      subtitle: "Round storage container with hand pump – keeps pasta, rice, flour & coffee fresher, ideal for the worktop",
      description:
        '<p class="mb-3 leading-relaxed">Fresh and tidy: the round Planeta vacuum container (approx. 2.5 l) is airtight and space-saving, with an elegant shape for the worktop. Simply remove the air with the hand pump and keep dry goods fresher for longer.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for spaghetti and pasta, rice and flour, coffee beans and biscuits, sauces and soups. Also suitable for use in the freezer.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable – on round containers of 1.5 l and 0.75 l.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & freezer-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: round, green</li><li class="ml-1">Volume: approx. 2.5 l</li><li class="ml-1">Dimensions: Ø 130 mm, height approx. 295 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 577821</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 2,5 l rotondo, senza BPA",
      subtitle: "Contenitore rotondo da dispensa con pompa manuale – mantiene pasta, riso, farina e caffè più freschi, ideale sul piano di lavoro",
      description:
        '<p class="mb-3 leading-relaxed">Freschezza e ordine: il contenitore sottovuoto rotondo Planeta (ca. 2,5 l) è ermetico e salvaspazio, con una forma elegante per il piano di lavoro. Basta togliere l\'aria con la pompa manuale e mantenere più freschi gli alimenti secchi.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per spaghetti e pasta, riso e farina, chicchi di caffè e biscotti, salse e zuppe. Adatto anche all\'uso nel congelatore.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile – su contenitori rotondi da 1,5 l e 0,75 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e adatto al congelatore:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rotonda, verde</li><li class="ml-1">Volume: ca. 2,5 l</li><li class="ml-1">Dimensioni: Ø 130 mm, altezza ca. 295 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 577821</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Vorratsdose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD63APPDAXEGPD024CQCKJ",
  handle: "vakuumbehaelter-1-5l-rund",
  base: {
    title: "Vakuumbehälter 1,5 l – rund, BPA-frei & stapelbar",
    subtitle: "Runde Vorratsdose mit Handpumpe – hält Pasta, Reis, Kaffee & Trockenobst länger frisch, ideal für die Arbeitsplatte",
    description:
      '<p class="mb-3 leading-relaxed">Frisch und ordentlich: Der runde Planeta Vakuumbehälter (ca. 1,5 l) ist luftdicht und platzsparend. Die hochwertigen Materialien nehmen weder Lebensmittelfarbe noch Geruch an – einfach per Handpumpe die Luft entziehen.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für Spaghetti und Teigwaren, Reis, Mehl und Flocken, Kaffeebohnen und Kekse, getrocknetes und frisches Obst sowie Saucen und Suppen. Auch für den Gefrierschrank geeignet.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar – auf runden Behältern mit 2,5 l und 0,75 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & gefriergeeignet:</strong> nimmt keine Farbe oder Gerüche an.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rund, grün</li><li class="ml-1">Volumen: ca. 1,5 l</li><li class="ml-1">Maße: Ø 130 mm, Höhe ca. 195 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 577821</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 1,5 l rund, BPA-frei | Planeta",
      meta_description: "Runder Vakuumbehälter mit 1,5 l Volumen und Handpumpe. BPA-frei, stapelbar, gefriergeeignet – hält Pasta, Reis, Kaffee & Trockenobst länger frisch.",
      meta_title_en: "Vacuum Container 1.5 l Round, BPA-Free | Planeta",
      meta_description_en: "Round 1.5 l vacuum container with hand pump. BPA-free, stackable, freezer-safe – keeps pasta, rice, coffee & dried fruit fresher for longer.",
      meta_title_it: "Contenitore sottovuoto 1,5 l rotondo, senza BPA | Planeta",
      meta_description_it: "Contenitore sottovuoto rotondo da 1,5 l con pompa manuale. Senza BPA, impilabile, adatto al congelatore – mantiene pasta, riso, caffè e frutta secca più freschi.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 1.5 l – Round, BPA-Free & Stackable",
      subtitle: "Round storage container with hand pump – keeps pasta, rice, coffee & dried fruit fresher, ideal for the worktop",
      description:
        '<p class="mb-3 leading-relaxed">Fresh and tidy: the round Planeta vacuum container (approx. 1.5 l) is airtight and space-saving. The high-quality material takes on neither food colour nor odour – simply remove the air with the hand pump.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for spaghetti and pasta, rice, flour and flakes, coffee beans and biscuits, dried and fresh fruit, sauces and soups. Also suitable for the freezer.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable – on round containers of 2.5 l and 0.75 l.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & freezer-safe:</strong> takes on no colour or odours.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: round, green</li><li class="ml-1">Volume: approx. 1.5 l</li><li class="ml-1">Dimensions: Ø 130 mm, height approx. 195 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 577821</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 1,5 l rotondo, senza BPA",
      subtitle: "Contenitore rotondo da dispensa con pompa manuale – mantiene pasta, riso, caffè e frutta secca più freschi, ideale sul piano di lavoro",
      description:
        '<p class="mb-3 leading-relaxed">Freschezza e ordine: il contenitore sottovuoto rotondo Planeta (ca. 1,5 l) è ermetico e salvaspazio. Il materiale di alta qualità non assorbe né colori né odori degli alimenti – basta togliere l\'aria con la pompa manuale.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per spaghetti e pasta, riso, farina e fiocchi, chicchi di caffè e biscotti, frutta secca e fresca, salse e zuppe. Adatto anche al congelatore.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile – su contenitori rotondi da 2,5 l e 0,75 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e adatto al congelatore:</strong> non assorbe colori né odori.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rotonda, verde</li><li class="ml-1">Volume: ca. 1,5 l</li><li class="ml-1">Dimensioni: Ø 130 mm, altezza ca. 195 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 577821</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Vorratsdose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD63CR9N6VYBYXSNNZEFD7",
  handle: "vakuumbehaelter-0-75l-rund",
  base: {
    title: "Vakuumbehälter 0,75 l – rund, BPA-frei & stapelbar",
    subtitle: "Kleine runde Vorratsdose mit Handpumpe – ideal für Kaffee, Tee, Salz & Gewürze",
    description:
      '<p class="mb-3 leading-relaxed">Frisch und ordentlich: Der kleine runde Planeta Vakuumbehälter (ca. 0,75 l) ist luftdicht und platzsparend. Mit der Handpumpe erzeugen Sie das Vakuum und halten Trockenvorräte spürbar länger frisch.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für Zucker, Kaffee und Salz, Kräuter, Kekse und Kuchen, Tee, Knoblauch und Kokosmehl sowie süße Leckereien.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar – auf runden Behältern mit 2,5 l und 1,5 l Volumen.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & gefriergeeignet:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rund, grün</li><li class="ml-1">Volumen: ca. 0,75 l</li><li class="ml-1">Maße: Ø 130 mm, Höhe ca. 100 mm</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 577821</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumbehälter 0,75 l rund, BPA-frei | Planeta",
      meta_description: "Kleiner runder Vakuumbehälter mit 0,75 l Volumen und Handpumpe. BPA-frei, stapelbar, gefriergeeignet – ideal für Kaffee, Tee, Salz & Gewürze.",
      meta_title_en: "Vacuum Container 0.75 l Round, BPA-Free | Planeta",
      meta_description_en: "Small round 0.75 l vacuum container with hand pump. BPA-free, stackable, freezer-safe – ideal for coffee, tea, salt & spices.",
      meta_title_it: "Contenitore sottovuoto 0,75 l rotondo, senza BPA | Planeta",
      meta_description_it: "Piccolo contenitore sottovuoto rotondo da 0,75 l con pompa manuale. Senza BPA, impilabile, adatto al congelatore – ideale per caffè, tè, sale e spezie.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Container 0.75 l – Round, BPA-Free & Stackable",
      subtitle: "Small round storage container with hand pump – ideal for coffee, tea, salt & spices",
      description:
        '<p class="mb-3 leading-relaxed">Fresh and tidy: the small round Planeta vacuum container (approx. 0.75 l) is airtight and space-saving. Create the vacuum with the hand pump and keep dry goods noticeably fresher.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for sugar, coffee and salt, herbs, biscuits and cake, tea, garlic and coconut flour, and sweet treats.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps food fresher:</strong> vacuum with the built-in hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable – on round containers of 2.5 l and 1.5 l.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & freezer-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: round, green</li><li class="ml-1">Volume: approx. 0.75 l</li><li class="ml-1">Dimensions: Ø 130 mm, height approx. 100 mm</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 577821</li></ul>',
    },
    "it-IT": {
      title: "Contenitore sottovuoto 0,75 l rotondo, senza BPA",
      subtitle: "Piccolo contenitore rotondo da dispensa con pompa manuale – ideale per caffè, tè, sale e spezie",
      description:
        '<p class="mb-3 leading-relaxed">Freschezza e ordine: il piccolo contenitore sottovuoto rotondo Planeta (ca. 0,75 l) è ermetico e salvaspazio. Crea il sottovuoto con la pompa manuale e mantieni gli alimenti secchi molto più freschi.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per zucchero, caffè e sale, erbe aromatiche, biscotti e torte, tè, aglio e farina di cocco, e dolci.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene più freschi:</strong> sottovuoto con la pompa manuale integrata – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabile – su contenitori rotondi da 2,5 l e 1,5 l.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e adatto al congelatore:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rotonda, verde</li><li class="ml-1">Volume: ca. 0,75 l</li><li class="ml-1">Dimensioni: Ø 130 mm, altezza ca. 100 mm</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 577821</li></ul>',
    },
  },
  tags: ["Vakuumbehälter", "Vorratsdose", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD63EXS8N1PM6YYF7HG1FA",
  handle: "vakuumboxen-set-5-teilig-rechteckig",
  base: {
    title: "Vakuumboxen-Set 5-teilig – rechteckig, 0,5–2,0 l mit Handpumpe",
    subtitle: "Starter-Set aus vier rechteckigen Vakuumboxen (0,5 / 0,8 / 1,4 / 2,0 l) und Handpumpe – ideal zum Einstieg",
    description:
      '<p class="mb-3 leading-relaxed">Der perfekte Einstieg in die Vakuumaufbewahrung: Dieses 5-teilige Set vereint die gängigsten rechteckigen Planeta Vakuumboxen (ca. 0,5 l, 0,8 l, 1,4 l und 2,0 l) mit einer Handpumpe – damit decken Sie einen Großteil Ihrer Lebensmittel ab.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für Zucker, Kaffee, Kräuter und süße Leckereien, Aufschnitt und Käse aller Art, frisches Fleisch und Eier, Obst und Gemüse, Brotscheiben, Bagels und frische Nudeln.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Komplett-Set:</strong> 4 rechteckige Boxen (0,5 / 0,8 / 1,4 / 2,0 l) + Handpumpe.</li><li class="ml-1"><strong class="font-semibold">Hält länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> ineinander stapelbar für mehr Ordnung.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rechteckig, grün</li><li class="ml-1">Set: 0,5 l + 0,8 l + 1,4 l + 2,0 l + Handpumpe</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 557531</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumboxen-Set 5-teilig rechteckig | Planeta",
      meta_description: "5-teiliges Set rechteckiger Vakuumboxen (0,5 / 0,8 / 1,4 / 2,0 l) mit Handpumpe. BPA-frei, stapelbar – der perfekte Einstieg in die Vakuumaufbewahrung.",
      meta_title_en: "5-Piece Vacuum Box Set, Rectangular | Planeta",
      meta_description_en: "5-piece set of rectangular vacuum boxes (0.5 / 0.8 / 1.4 / 2.0 l) with hand pump. BPA-free, stackable – the perfect start to vacuum storage.",
      meta_title_it: "Set 5 pezzi contenitori sottovuoto rettangolari | Planeta",
      meta_description_it: "Set di 5 pezzi di contenitori sottovuoto rettangolari (0,5 / 0,8 / 1,4 / 2,0 l) con pompa manuale. Senza BPA, impilabili – il perfetto inizio per il sottovuoto.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Box Set, 5-Piece – Rectangular, 0.5–2.0 l with Hand Pump",
      subtitle: "Starter set of four rectangular vacuum boxes (0.5 / 0.8 / 1.4 / 2.0 l) and a hand pump – ideal to get started",
      description:
        '<p class="mb-3 leading-relaxed">The perfect introduction to vacuum storage: this 5-piece set combines the most popular rectangular Planeta vacuum boxes (approx. 0.5 l, 0.8 l, 1.4 l and 2.0 l) with a hand pump – enough to cover most of your food.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for sugar, coffee, herbs and sweet treats, cold cuts and all kinds of cheese, fresh meat and eggs, fruit and vegetables, bread slices, bagels and fresh pasta.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Complete set:</strong> 4 rectangular boxes (0.5 / 0.8 / 1.4 / 2.0 l) + hand pump.</li><li class="ml-1"><strong class="font-semibold">Keeps food fresher:</strong> vacuum with the hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> nest and stack for a tidy kitchen.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: rectangular, green</li><li class="ml-1">Set: 0.5 l + 0.8 l + 1.4 l + 2.0 l + hand pump</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 557531</li></ul>',
    },
    "it-IT": {
      title: "Set sottovuoto 5 pezzi – rettangolare, 0,5–2,0 l con pompa",
      subtitle: "Set base di quattro contenitori sottovuoto rettangolari (0,5 / 0,8 / 1,4 / 2,0 l) e pompa manuale – ideale per iniziare",
      description:
        '<p class="mb-3 leading-relaxed">L\'introduzione perfetta alla conservazione sottovuoto: questo set di 5 pezzi unisce i contenitori sottovuoto rettangolari Planeta più diffusi (ca. 0,5 l, 0,8 l, 1,4 l e 2,0 l) a una pompa manuale – abbastanza per coprire gran parte dei tuoi alimenti.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per zucchero, caffè, erbe aromatiche e dolci, affettati e formaggi di ogni tipo, carne fresca e uova, frutta e verdura, fette di pane, bagel e pasta fresca.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Set completo:</strong> 4 contenitori rettangolari (0,5 / 0,8 / 1,4 / 2,0 l) + pompa manuale.</li><li class="ml-1"><strong class="font-semibold">Mantiene più freschi:</strong> sottovuoto con la pompa manuale – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabili per una cucina ordinata.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rettangolare, verde</li><li class="ml-1">Set: 0,5 l + 0,8 l + 1,4 l + 2,0 l + pompa manuale</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 557531</li></ul>',
    },
  },
  tags: ["Vakuumboxen-Set", "Vakuumbehälter", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD63H4FTHNSPGCCWPY3V1X",
  handle: "vakuumboxen-set-3-teilig-rund",
  base: {
    title: "Vakuumboxen-Set 3-teilig – rund, 0,75 + 1,5 l mit Handpumpe",
    subtitle: "Starter-Set aus zwei runden Vakuumboxen (0,75 + 1,5 l) und Handpumpe – ideal zum Einstieg",
    description:
      '<p class="mb-3 leading-relaxed">Der einfache Einstieg in die Vakuumaufbewahrung: Dieses 3-teilige Set vereint zwei runde Planeta Vakuumboxen (ca. 0,75 l und 1,5 l) mit einer Handpumpe – elegant für die Arbeitsplatte und vielseitig im Alltag.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für Zucker, Kaffee, Kräuter und süße Leckereien, Aufschnitt und Käse aller Art, frisches Fleisch und Eier, Obst und Gemüse, Brotscheiben und frische Nudeln.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Komplett-Set:</strong> 2 runde Boxen (0,75 + 1,5 l) + Handpumpe.</li><li class="ml-1"><strong class="font-semibold">Hält länger frisch:</strong> Vakuum per Handpumpe – einfach mehrmals pumpen.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> rund und stapelbar für mehr Ordnung.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> aus transparentem, lebensmittelechtem Material.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Form: rund, grün</li><li class="ml-1">Set: 0,75 l + 1,5 l + Handpumpe</li><li class="ml-1">Material: BPA-frei, transparent</li><li class="ml-1">Artikelnummer: 577633</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuumboxen-Set 3-teilig rund | Planeta",
      meta_description: "3-teiliges Set runder Vakuumboxen (0,75 + 1,5 l) mit Handpumpe. BPA-frei, stapelbar – der einfache Einstieg in die Vakuumaufbewahrung.",
      meta_title_en: "3-Piece Vacuum Box Set, Round | Planeta",
      meta_description_en: "3-piece set of round vacuum boxes (0.75 + 1.5 l) with hand pump. BPA-free, stackable – an easy start to vacuum storage.",
      meta_title_it: "Set 3 pezzi contenitori sottovuoto rotondi | Planeta",
      meta_description_it: "Set di 3 pezzi di contenitori sottovuoto rotondi (0,75 + 1,5 l) con pompa manuale. Senza BPA, impilabili – un inizio facile per il sottovuoto.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Box Set, 3-Piece – Round, 0.75 + 1.5 l with Hand Pump",
      subtitle: "Starter set of two round vacuum boxes (0.75 + 1.5 l) and a hand pump – ideal to get started",
      description:
        '<p class="mb-3 leading-relaxed">An easy introduction to vacuum storage: this 3-piece set combines two round Planeta vacuum boxes (approx. 0.75 l and 1.5 l) with a hand pump – elegant on the worktop and versatile every day.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for sugar, coffee, herbs and sweet treats, cold cuts and all kinds of cheese, fresh meat and eggs, fruit and vegetables, bread slices and fresh pasta.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Complete set:</strong> 2 round boxes (0.75 + 1.5 l) + hand pump.</li><li class="ml-1"><strong class="font-semibold">Keeps food fresher:</strong> vacuum with the hand pump – just pump a few times.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> round and stackable for a tidy kitchen.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> made from transparent, food-grade material.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Shape: round, green</li><li class="ml-1">Set: 0.75 l + 1.5 l + hand pump</li><li class="ml-1">Material: BPA-free, transparent</li><li class="ml-1">Article number: 577633</li></ul>',
    },
    "it-IT": {
      title: "Set sottovuoto 3 pezzi – rotondo, 0,75 + 1,5 l con pompa",
      subtitle: "Set base di due contenitori sottovuoto rotondi (0,75 + 1,5 l) e pompa manuale – ideale per iniziare",
      description:
        '<p class="mb-3 leading-relaxed">Un\'introduzione facile alla conservazione sottovuoto: questo set di 3 pezzi unisce due contenitori sottovuoto rotondi Planeta (ca. 0,75 l e 1,5 l) a una pompa manuale – eleganti sul piano di lavoro e versatili ogni giorno.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per zucchero, caffè, erbe aromatiche e dolci, affettati e formaggi di ogni tipo, carne fresca e uova, frutta e verdura, fette di pane e pasta fresca.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Set completo:</strong> 2 contenitori rotondi (0,75 + 1,5 l) + pompa manuale.</li><li class="ml-1"><strong class="font-semibold">Mantiene più freschi:</strong> sottovuoto con la pompa manuale – basta pompare alcune volte.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> rotondi e impilabili per una cucina ordinata.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> in materiale trasparente per alimenti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Forma: rotonda, verde</li><li class="ml-1">Set: 0,75 l + 1,5 l + pompa manuale</li><li class="ml-1">Materiale: senza BPA, trasparente</li><li class="ml-1">Codice articolo: 577633</li></ul>',
    },
  },
  tags: ["Vakuumboxen-Set", "Vakuumbehälter", "BPA-frei", "Lebensmittelaufbewahrung", "Babyfreundlich"],
},
{
  productId: "prod_01KSMD656K2AKA7M2MHND7P4NS",
  handle: "vakuum-karaffe-1l",
  base: {
    title: "Vakuum-Karaffe 1,0 l – für die Kühlschranktür, BPA-frei",
    subtitle: "Vakuum-Karaffe mit Handpumpe – hält frisch gepresste Säfte, Milch & Getränke länger frisch, passt in die Kühlschranktür",
    description:
      '<p class="mb-3 leading-relaxed">Säfte voller Vitamine, länger genießbar: Die Planeta Vakuum-Karaffe (1,0 l) ist ideal für die Aufbewahrung von frisch gepressten Säften, Milch und anderen Getränken. Im Vakuum bleiben Frische und Geschmack länger erhalten – hygienisch und ohne unangenehme Gerüche.</p>' +
      '<p class="mb-3 leading-relaxed">Die flache Form ist speziell für die Kühlschranktür konzipiert und spart so wertvollen Platz. Für das Vakuum wird eine Vakuumpumpe verwendet.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Hält Getränke länger frisch:</strong> Vakuum per Pumpe – einfach mehrmals pumpen, bis Widerstand spürbar ist.</li><li class="ml-1"><strong class="font-semibold">Passt in die Kühlschranktür:</strong> flache Form für optimale Platznutzung.</li><li class="ml-1"><strong class="font-semibold">Hygienisch:</strong> luftdicht verschlossen, keine unangenehmen Gerüche.</li><li class="ml-1"><strong class="font-semibold">BPA-frei & spülmaschinenfest:</strong> ohne Scheuermittel reinigen.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Karaffe maximal 1,5 cm unter der Kante füllen, mit dem Deckel verschließen und die Pumpe auf das Ventil in der Deckelmitte setzen. Luft entziehen, bis ein Widerstand spürbar ist. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – keine Scheuerschwämme oder scheuernden Reinigungsmittel verwenden.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Volumen: ca. 1,0 l</li><li class="ml-1">Maße: 270 × 145 × 100 mm (für die Kühlschranktür)</li><li class="ml-1">Material: BPA-frei</li><li class="ml-1">Artikelnummer: 579102</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Vakuum-Karaffe 1,0 l für die Kühlschranktür | Planeta",
      meta_description: "Vakuum-Karaffe 1,0 l mit Handpumpe für die Kühlschranktür. BPA-frei – hält frisch gepresste Säfte, Milch & Getränke länger frisch und aromatisch.",
      meta_title_en: "Vacuum Carafe 1.0 l for the Fridge Door | Planeta",
      meta_description_en: "1.0 l vacuum carafe with hand pump for the fridge door. BPA-free – keeps freshly pressed juices, milk & drinks fresher and tastier for longer.",
      meta_title_it: "Caraffa sottovuoto 1,0 l per lo sportello del frigo | Planeta",
      meta_description_it: "Caraffa sottovuoto da 1,0 l con pompa manuale per lo sportello del frigo. Senza BPA – mantiene succhi freschi, latte e bevande più freschi e gustosi.",
    },
  },
  translations: {
    "en-US": {
      title: "Vacuum Carafe 1.0 l – for the Fridge Door, BPA-Free",
      subtitle: "Vacuum carafe with hand pump – keeps freshly pressed juices, milk & drinks fresher, fits in the fridge door",
      description:
        '<p class="mb-3 leading-relaxed">Juices full of vitamins, enjoyable for longer: the Planeta vacuum carafe (1.0 l) is ideal for storing freshly pressed juices, milk and other drinks. Under vacuum, freshness and taste last longer – hygienically and without unpleasant odours.</p>' +
        '<p class="mb-3 leading-relaxed">Its flat shape is designed specifically for the fridge door, saving valuable space. A vacuum pump is used to create the vacuum.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Keeps drinks fresher for longer:</strong> vacuum with the pump – just pump until you feel resistance.</li><li class="ml-1"><strong class="font-semibold">Fits in the fridge door:</strong> flat shape for optimal use of space.</li><li class="ml-1"><strong class="font-semibold">Hygienic:</strong> airtight seal, no unpleasant odours.</li><li class="ml-1"><strong class="font-semibold">BPA-free & dishwasher-safe:</strong> clean without abrasives.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Fill the carafe to a maximum of 1.5 cm below the rim, close it with the lid and place the pump on the valve in the centre of the lid. Remove the air until you feel resistance. To open, press the valve in the centre of the lid. Clean before first use – do not use scouring pads or abrasive cleaners.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Volume: approx. 1.0 l</li><li class="ml-1">Dimensions: 270 × 145 × 100 mm (for the fridge door)</li><li class="ml-1">Material: BPA-free</li><li class="ml-1">Article number: 579102</li></ul>',
    },
    "it-IT": {
      title: "Caraffa sottovuoto 1,0 l – per lo sportello del frigo, senza BPA",
      subtitle: "Caraffa sottovuoto con pompa manuale – mantiene succhi freschi, latte e bevande più freschi, sta nello sportello del frigo",
      description:
        '<p class="mb-3 leading-relaxed">Succhi pieni di vitamine, da gustare più a lungo: la caraffa sottovuoto Planeta (1,0 l) è ideale per conservare succhi appena spremuti, latte e altre bevande. Sottovuoto, freschezza e gusto durano più a lungo – in modo igienico e senza odori sgradevoli.</p>' +
        '<p class="mb-3 leading-relaxed">La forma piatta è pensata appositamente per lo sportello del frigo e fa risparmiare spazio prezioso. Per creare il sottovuoto si utilizza una pompa.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mantiene le bevande più fresche a lungo:</strong> sottovuoto con la pompa – basta pompare finché senti resistenza.</li><li class="ml-1"><strong class="font-semibold">Sta nello sportello del frigo:</strong> forma piatta per sfruttare al meglio lo spazio.</li><li class="ml-1"><strong class="font-semibold">Igienica:</strong> chiusura ermetica, niente odori sgradevoli.</li><li class="ml-1"><strong class="font-semibold">Senza BPA e lavabile in lavastoviglie:</strong> pulisci senza prodotti abrasivi.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Riempi la caraffa fino a massimo 1,5 cm sotto il bordo, chiudila con il coperchio e posiziona la pompa sulla valvola al centro del coperchio. Togli l\'aria finché senti resistenza. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – non usare spugne o detergenti abrasivi.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Volume: ca. 1,0 l</li><li class="ml-1">Dimensioni: 270 × 145 × 100 mm (per lo sportello del frigo)</li><li class="ml-1">Materiale: senza BPA</li><li class="ml-1">Codice articolo: 579102</li></ul>',
    },
  },
  tags: ["Vakuumkaraffe", "Getränkeaufbewahrung", "BPA-frei", "Lebensmittelaufbewahrung"],
},
{
  productId: "prod_01KSMD689JRX8TKG75CV3K9SDX",
  handle: "baby-food-vakuumbehaelter-set-5-teilig",
  base: {
    title: "Baby-Food Vakuumbehälter-Set 5-teilig – BPA-frei, mikrowellen- & gefriergeeignet",
    subtitle: "4 farbige Baby-Vakuumbehälter (je 0,15 l) aus Tritan mit Handpumpe – ideal für selbst zubereitete Babymahlzeiten",
    description:
      '<p class="mb-3 leading-relaxed">Selbst zubereitete Babymahlzeiten – frisch für später: Bereiten Sie die Mahlzeiten für Ihr Kind nach Belieben zu, zuhause oder unterwegs. Im Vakuum lassen sich Portionen sogar für die kommende Woche einfrieren.</p>' +
      '<p class="mb-3 leading-relaxed">Ideal für Fertiggerichte, gewürfeltes Obst und Gemüse, Brot sowie Knabbereien und Snacks. Das Set enthält 4 Vakuumbehälter mit je 0,15 l in Pastellblau, Hellgrün, dunklerem Rosa und Orange sowie eine manuelle Vakuumpumpe.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Komplett-Set:</strong> 4 farbige Behälter (je 0,15 l) + Handpumpe.</li><li class="ml-1"><strong class="font-semibold">Mikrowellen-, gefrier- & spülmaschinenfest:</strong> aus Tritan, einem BPA-freien Material.</li><li class="ml-1"><strong class="font-semibold">Spart Platz:</strong> stapelbar für eine ordentliche Aufbewahrung.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Luft entziehen: Pumpe mehrmals betätigen. Zum Öffnen das Ventil in der Deckelmitte drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Set: 4 Behälter (je 0,15 l) + Handpumpe</li><li class="ml-1">Maße je Behälter: 80 × 80 × 35 mm</li><li class="ml-1">Material: Behälter aus Tritan (BPA-frei), Deckel ABS, Dichtungen Silikon</li><li class="ml-1">Eigenschaften: spülmaschinen-, gefrier- und mikrowellenfest</li><li class="ml-1">Artikelnummer: 558710</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Baby-Food Vakuumbehälter-Set 5-teilig, BPA-frei | Planeta",
      meta_description: "5-teiliges Baby-Food Vakuumset: 4 farbige Tritan-Behälter (je 0,15 l) + Handpumpe. BPA-frei, mikrowellen-, gefrier- & spülmaschinenfest – ideal für Babymahlzeiten.",
      meta_title_en: "Baby Food Vacuum Container Set, 5-Piece, BPA-Free | Planeta",
      meta_description_en: "5-piece baby food vacuum set: 4 colourful Tritan containers (0.15 l each) + hand pump. BPA-free, microwave-, freezer- & dishwasher-safe – ideal for baby meals.",
      meta_title_it: "Set sottovuoto baby food 5 pezzi, senza BPA | Planeta",
      meta_description_it: "Set sottovuoto baby food 5 pezzi: 4 contenitori colorati in Tritan (0,15 l ciascuno) + pompa manuale. Senza BPA, adatto a microonde, congelatore e lavastoviglie.",
    },
  },
  translations: {
    "en-US": {
      title: "Baby Food Vacuum Container Set, 5-Piece – BPA-Free, Microwave- & Freezer-Safe",
      subtitle: "4 colourful Tritan baby vacuum containers (0.15 l each) with hand pump – ideal for home-made baby meals",
      description:
        '<p class="mb-3 leading-relaxed">Home-made baby meals – fresh for later: prepare meals for your child whenever you like, at home or on the go. Under vacuum you can even freeze portions for the week ahead.</p>' +
        '<p class="mb-3 leading-relaxed">Ideal for ready meals, diced fruit and vegetables, bread, and snacks. The set contains 4 vacuum containers of 0.15 l each in pastel blue, light green, darker pink and orange, plus a manual vacuum pump.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Complete set:</strong> 4 colourful containers (0.15 l each) + hand pump.</li><li class="ml-1"><strong class="font-semibold">Microwave-, freezer- & dishwasher-safe:</strong> made from Tritan, a BPA-free material.</li><li class="ml-1"><strong class="font-semibold">Saves space:</strong> stackable for tidy storage.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Remove the air by pressing the pump several times. To open, press the valve in the centre of the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Set: 4 containers (0.15 l each) + hand pump</li><li class="ml-1">Dimensions per container: 80 × 80 × 35 mm</li><li class="ml-1">Material: containers in Tritan (BPA-free), lids ABS, seals silicone</li><li class="ml-1">Features: dishwasher-, freezer- and microwave-safe</li><li class="ml-1">Article number: 558710</li></ul>',
    },
    "it-IT": {
      title: "Set sottovuoto per pappe 5 pezzi – senza BPA, adatto a microonde e congelatore",
      subtitle: "4 contenitori sottovuoto colorati per bambini (0,15 l ciascuno) in Tritan con pompa manuale – ideali per pappe fatte in casa",
      description:
        '<p class="mb-3 leading-relaxed">Pappe fatte in casa – fresche per dopo: prepara i pasti per il tuo bambino quando vuoi, a casa o fuori. Sottovuoto puoi persino congelare le porzioni per la settimana.</p>' +
        '<p class="mb-3 leading-relaxed">Ideale per piatti pronti, frutta e verdura a cubetti, pane e snack. Il set contiene 4 contenitori sottovuoto da 0,15 l ciascuno in azzurro pastello, verde chiaro, rosa più scuro e arancione, oltre a una pompa manuale.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Set completo:</strong> 4 contenitori colorati (0,15 l ciascuno) + pompa manuale.</li><li class="ml-1"><strong class="font-semibold">Adatto a microonde, congelatore e lavastoviglie:</strong> in Tritan, un materiale senza BPA.</li><li class="ml-1"><strong class="font-semibold">Salva spazio:</strong> impilabili per una conservazione ordinata.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Togli l\'aria premendo la pompa più volte. Per aprire, premi la valvola al centro del coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Set: 4 contenitori (0,15 l ciascuno) + pompa manuale</li><li class="ml-1">Dimensioni per contenitore: 80 × 80 × 35 mm</li><li class="ml-1">Materiale: contenitori in Tritan (senza BPA), coperchi ABS, guarnizioni in silicone</li><li class="ml-1">Caratteristiche: adatto a lavastoviglie, congelatore e microonde</li><li class="ml-1">Codice articolo: 558710</li></ul>',
    },
  },
  tags: ["Babyfreundlich", "Vakuumbehälter", "BPA-frei", "Lebensmittelaufbewahrung", "Vakuumboxen-Set"],
},
{
  productId: "prod_01KSMD68BFP070FK2NC2RVCAHW",
  handle: "marinadebox-2l",
  base: {
    title: "Marinadebox 2,0 l – Vakuum-Marinierbehälter, BPA-frei",
    subtitle: "Vakuum-Marinierbox mit Handpumpe – mariniert Fleisch & Gemüse in kurzer Zeit, auch als Vorratsbehälter nutzbar",
    description:
      '<p class="mb-3 leading-relaxed">Marinieren in Minuten statt Stunden: Die Planeta Marinadebox (ca. 2,0 l) zieht mit Unterdruck die Marinade tief in die Fleischfasern – so entfalten sich die Aromen im Mariniergut vollständig und in sehr kurzer Zeit.</p>' +
      '<p class="mb-3 leading-relaxed">Legen Sie das Mariniergut in den Behälter, geben Sie die Marinade hinzu und erzeugen Sie mit einer Vakuumpumpe das Vakuum. Robust und langlebig – auch als normaler Vorratsbehälter für Lebensmittel nutzbar.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Mariniert in kurzer Zeit:</strong> Unterdruck lässt die Marinade schneller einziehen.</li><li class="ml-1"><strong class="font-semibold">Volles Aroma:</strong> die Geschmäcker entfalten sich vollständig im Mariniergut.</li><li class="ml-1"><strong class="font-semibold">Vielseitig:</strong> auch als normaler Aufbewahrungsbehälter verwendbar.</li><li class="ml-1"><strong class="font-semibold">Frischedatum im Blick:</strong> Kalender im Deckel zum Markieren von Lager- oder Haltbarkeitsdatum.</li><li class="ml-1"><strong class="font-semibold">Robust & BPA-frei:</strong> Behälter und Deckel sind stabil und langlebig.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Anwendung</strong></p>' +
      '<p class="mb-3 leading-relaxed">Mariniergut einlegen, Marinade hinzufügen und mit der Vakuumpumpe die Luft entziehen. Zum Öffnen das Ventil im Deckel drücken. Vor der ersten Verwendung reinigen – von Hand oder in der Spülmaschine.</p>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Volumen: ca. 2,0 l</li><li class="ml-1">Funktion: Vakuum-Marinieren</li><li class="ml-1">Material: BPA-frei</li><li class="ml-1">Artikelnummer: 579328</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Marinadebox 2,0 l – Vakuum-Marinierbehälter | Planeta",
      meta_description: "Vakuum-Marinadebox 2,0 l mit Handpumpe. Mariniert Fleisch & Gemüse in kurzer Zeit, volles Aroma – BPA-frei und auch als Vorratsbehälter nutzbar.",
      meta_title_en: "Marinade Box 2.0 l – Vacuum Marinating Container | Planeta",
      meta_description_en: "2.0 l vacuum marinade box with hand pump. Marinates meat & vegetables in a short time with full flavour – BPA-free and usable as a storage container too.",
      meta_title_it: "Box per marinatura 2,0 l – contenitore sottovuoto | Planeta",
      meta_description_it: "Box per marinatura sottovuoto da 2,0 l con pompa manuale. Marina carne e verdure in poco tempo con pieno aroma – senza BPA e utilizzabile anche come contenitore.",
    },
  },
  translations: {
    "en-US": {
      title: "Marinade Box 2.0 l – Vacuum Marinating Container, BPA-Free",
      subtitle: "Vacuum marinating box with hand pump – marinates meat & vegetables in a short time, also usable as a storage container",
      description:
        '<p class="mb-3 leading-relaxed">Marinate in minutes, not hours: the Planeta marinade box (approx. 2.0 l) uses vacuum pressure to draw the marinade deep into the meat fibres – so the flavours develop fully and in a very short time.</p>' +
        '<p class="mb-3 leading-relaxed">Place the food in the container, add the marinade and create the vacuum with a vacuum pump. Robust and durable – also usable as an everyday food storage container.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Marinates in a short time:</strong> vacuum pressure lets the marinade soak in faster.</li><li class="ml-1"><strong class="font-semibold">Full flavour:</strong> the tastes develop completely in the food.</li><li class="ml-1"><strong class="font-semibold">Versatile:</strong> can also be used as a normal storage container.</li><li class="ml-1"><strong class="font-semibold">Track freshness:</strong> calendar on the lid to mark the storage or best-before date.</li><li class="ml-1"><strong class="font-semibold">Robust & BPA-free:</strong> container and lid are sturdy and durable.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">How to use</strong></p>' +
        '<p class="mb-3 leading-relaxed">Add the food, pour in the marinade and remove the air with the vacuum pump. To open, press the valve in the lid. Clean before first use – by hand or in the dishwasher.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Volume: approx. 2.0 l</li><li class="ml-1">Function: vacuum marinating</li><li class="ml-1">Material: BPA-free</li><li class="ml-1">Article number: 579328</li></ul>',
    },
    "it-IT": {
      title: "Box per marinatura 2,0 l – contenitore sottovuoto, senza BPA",
      subtitle: "Box per marinatura sottovuoto con pompa manuale – marina carne e verdure in poco tempo, utilizzabile anche come contenitore",
      description:
        '<p class="mb-3 leading-relaxed">Marina in minuti, non in ore: il box per marinatura Planeta (ca. 2,0 l) usa la depressione per far penetrare la marinata in profondità nelle fibre della carne – così gli aromi si sviluppano completamente e in pochissimo tempo.</p>' +
        '<p class="mb-3 leading-relaxed">Metti l\'alimento nel contenitore, aggiungi la marinata e crea il sottovuoto con una pompa. Robusto e durevole – utilizzabile anche come normale contenitore per alimenti.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Marina in poco tempo:</strong> la depressione fa penetrare la marinata più in fretta.</li><li class="ml-1"><strong class="font-semibold">Pieno aroma:</strong> i sapori si sviluppano completamente nell\'alimento.</li><li class="ml-1"><strong class="font-semibold">Versatile:</strong> utilizzabile anche come normale contenitore.</li><li class="ml-1"><strong class="font-semibold">Tieni d\'occhio la freschezza:</strong> calendario sul coperchio per segnare la data di conservazione o di scadenza.</li><li class="ml-1"><strong class="font-semibold">Robusto e senza BPA:</strong> contenitore e coperchio sono solidi e durevoli.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Come si usa</strong></p>' +
        '<p class="mb-3 leading-relaxed">Inserisci l\'alimento, aggiungi la marinata e togli l\'aria con la pompa. Per aprire, premi la valvola nel coperchio. Pulisci prima del primo utilizzo – a mano o in lavastoviglie.</p>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Volume: ca. 2,0 l</li><li class="ml-1">Funzione: marinatura sottovuoto</li><li class="ml-1">Materiale: senza BPA</li><li class="ml-1">Codice articolo: 579328</li></ul>',
    },
  },
  tags: ["Marinierbehälter", "Vakuumbehälter", "BPA-frei", "Lebensmittelaufbewahrung"],
},
]
