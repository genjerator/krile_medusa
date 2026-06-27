import { ExecArgs, IProductModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Apply the copy improvements produced by the `/improve-product` command.
 *
 * Self-contained like the seed scripts: the copy is baked into PAYLOAD below,
 * so there are no external files and nothing to corrupt via copy-paste. Runs
 * through Medusa's module services (not raw SQL), so the change fires the normal
 * domain events — search reindex, cache/ISR invalidation. Idempotent.
 *
 * Local:
 *   medusa exec ./src/scripts/improve-product.ts
 *
 * Prod (after deploy, inside the container — same as the seeders):
 *   docker exec app-medusa-1 sh -c 'pnpm medusa exec ./src/scripts/improve-product.js'
 */

type ImproveProductPayload = {
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
const PAYLOADS: ImproveProductPayload[] = [
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
]
// ────────────────────────────────────────────────────────────────────────────

export default async function improveProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const translationModule: any = container.resolve(Modules.TRANSLATION)

  logger.info(`🛠  improve-product: ${PAYLOADS.length} product(s)`)
  for (const payload of PAYLOADS) {
    await applyOne(payload, { container, logger, query, productModule, translationModule })
  }
  logger.info(`✅ improve-product done (${PAYLOADS.length} product(s))`)
}

async function applyOne(
  payload: ImproveProductPayload,
  { container, logger, query, productModule, translationModule }: any
) {
  const productId = payload.productId
  logger.info(`— ${productId}`)

  // ─── Fetch current product (metadata + existing tags) ───────────────────
  const { data: found } = await query.graph({
    entity: "product",
    filters: { id: productId },
    fields: ["id", "metadata", "tags.id"],
  })
  const product = found[0] as any
  if (!product) {
    throw new Error(`Product ${productId} not found in this database.`)
  }

  // ─── Work out which legacy keys to strip, and the SEO keys to merge ──────
  // updateProducts MERGES metadata (it doesn't replace, and null just nulls the
  // value), so the merge adds the SEO keys; the woo_* keys are physically removed
  // afterwards with a jsonb `-` via the pg connection (see below).
  const stripPrefixes = payload.metadata?.stripPrefixes ?? []
  const currentMeta: Record<string, unknown> = product.metadata ?? {}
  const strippedKeys = Object.keys(currentMeta).filter((k) =>
    stripPrefixes.some((p) => k.startsWith(p))
  )
  const seoMeta = payload.metadata?.set ?? {}

  // ─── Ensure tags exist; union with the product's current tags ───────────
  let tagIds: { id: string }[] | undefined
  if (payload.tags?.length) {
    const existingTags = await productModule.listProductTags({ value: payload.tags })
    const existingValues = existingTags.map((t) => t.value)
    const missing = payload.tags.filter((v) => !existingValues.includes(v))
    const createdTags = missing.length
      ? await productModule.createProductTags(missing.map((value) => ({ value })))
      : []
    const desiredIds = [...existingTags, ...createdTags].map((t) => t.id)
    const currentIds: string[] = (product.tags ?? []).map((t: any) => t.id)
    tagIds = Array.from(new Set([...currentIds, ...desiredIds])).map((id) => ({ id }))
  }

  // ─── Update the product row (default locale = German) ───────────────────
  const updateData: Record<string, unknown> = { metadata: seoMeta }
  if (payload.handle !== undefined) updateData.handle = payload.handle
  if (payload.base?.title !== undefined) updateData.title = payload.base.title
  if (payload.base?.subtitle !== undefined) updateData.subtitle = payload.base.subtitle
  if (payload.base?.description !== undefined) updateData.description = payload.base.description
  if (tagIds) updateData.tags = tagIds

  await productModule.updateProducts({ id: productId }, updateData)
  logger.info(`✓ Updated product ${productId} base fields + SEO metadata`)
  if (tagIds) logger.info(`  tags now: ${tagIds.length}`)

  // Physically remove the legacy keys (the merge above can't delete them).
  if (strippedKeys.length) {
    const pg: any = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const delExpr = strippedKeys.map(() => "- ?").join(" ")
    await pg.raw(`update product set metadata = metadata ${delExpr} where id = ?`, [
      ...strippedKeys,
      productId,
    ])
    logger.info(`  stripped metadata keys: ${strippedKeys.join(", ")}`)
  }

  // ─── Upsert translations ────────────────────────────────────────────────
  for (const [locale_code, translations] of Object.entries(payload.translations ?? {})) {
    const existing = await translationModule.listTranslations({
      reference_id: productId,
      reference: "product",
      locale_code,
    })
    if (existing[0]) {
      await translationModule.updateTranslations({ id: existing[0].id, translations })
      logger.info(`  ✓ updated ${locale_code} translation`)
    } else {
      await translationModule.createTranslations({
        reference_id: productId,
        reference: "product",
        locale_code,
        translations,
      })
      logger.info(`  ✓ created ${locale_code} translation`)
    }
  }

  logger.info(`  ✓ done ${productId}`)
}
