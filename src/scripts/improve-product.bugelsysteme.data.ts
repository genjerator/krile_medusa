import type { ImproveProductPayload } from "./improve-product.data"

/**
 * Data for the `/improve-product` command — category: **Bügelsysteme**
 * (ironing systems, presses, active tables and steam generators).
 *
 * Kept in its own file per category; merged into the main PAYLOADS in
 * `improve-product.ts`. Copy is German (base) + English (en-US) + Italian
 * (it-IT). Specs/SKUs are preserved verbatim from the source data.
 */

// ─── DATA: one entry per product (the command appends here) ─────────────────
export const BUGELSYSTEME_PAYLOADS: ImproveProductPayload[] = [
{
  productId: "prod_01KSMD68NDP8N2F05MNDSW62J0",
  handle: "buegelpresse-pp8000",
  base: {
    title: "Bügelpresse PP8000 – Profi-Dampfpresse mit 45 kg Anpressdruck",
    subtitle:
      "Dampfbügelpresse mit 2.200 W, dampfbereit in 3 Minuten – glättet Hemden & Wäsche in Sekunden",
    description:
      '<p class="mb-3 leading-relaxed">Bügeln in Sekunden statt Minuten: Die Planeta Bügelpresse PP8000 presst Ihre Wäsche mit bis zu 45 kg Anpressdruck und kräftigem Dampf glatt – Hemden, Tisch- und Bettwäsche gelingen schneller und gleichmäßiger als mit dem Bügeleisen.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Schnell einsatzbereit:</strong> dampfbereit in nur 3 Minuten, 200 g/min Dampfleistung.</li><li class="ml-1"><strong class="font-semibold">Nie ohne Dampf:</strong> 2-Kessel-System – der abnehmbare 0,75-l-Tank lässt sich jederzeit nachfüllen, auch während des Bügelns.</li><li class="ml-1"><strong class="font-semibold">Sicher:</strong> automatische Abschaltung der Heizung, wenn die geschlossene Presse eingesteckt bleibt, plus Transport-Verriegelung.</li><li class="ml-1"><strong class="font-semibold">Schonend & sauber:</strong> Antihaft-Heizplatte und Anti-Kalk-Kartusche.</li><li class="ml-1"><strong class="font-semibold">Gute Sicht:</strong> gekippte Alu-Fläche und Weitwinkel-Öffnung für leichtes Auflegen auch sperriger Wäsche.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Anpressdruck: 45 kg (33 g/cm²)</li><li class="ml-1">Leistung: 2.200 W (220–240 V)</li><li class="ml-1">Dampfleistung: 200 g/min, dampfbereit in 3 Min.</li><li class="ml-1">Wassertank: 0,75 l, abnehmbar mit Füllstandsanzeige</li><li class="ml-1">Bügelfläche: 68 × 25 cm (gekippt, Aluminium)</li><li class="ml-1">Maße: 68 × 58 × 27 cm</li><li class="ml-1">Gewicht: 11,6 kg</li><li class="ml-1">Artikelnummer: 9998</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Bügelpresse PP8000 – Profi-Dampfpresse 45 kg | Planeta",
      meta_description:
        "Planeta Bügelpresse PP8000 mit 45 kg Anpressdruck und 2.200 W. Dampfbereit in 3 Min., 200 g/min Dampf, nachfüllbarer 0,75-l-Tank. Glättet Hemden & Wäsche im Nu.",
      meta_title_en: "Ironing Press PP8000 – Pro Steam Press 45 kg | Planeta",
      meta_description_en:
        "Planeta PP8000 ironing press with 45 kg pressure and 2,200 W. Steam-ready in 3 min, 200 g/min steam, refillable 0.75 l tank. Presses shirts & linen in seconds.",
      meta_title_it: "Pressa stirante PP8000 – pressa a vapore 45 kg | Planeta",
      meta_description_it:
        "Pressa stirante Planeta PP8000 con 45 kg di pressione e 2.200 W. Pronta in 3 min, 200 g/min di vapore, serbatoio 0,75 l ricaricabile. Stira camicie e biancheria in pochi secondi.",
    },
  },
  translations: {
    "en-US": {
      title: "Ironing Press PP8000 – Pro Steam Press with 45 kg Pressure",
      subtitle:
        "Steam ironing press with 2,200 W, steam-ready in 3 minutes – flattens shirts & linen in seconds",
      description:
        '<p class="mb-3 leading-relaxed">Ironing in seconds, not minutes: the Planeta PP8000 ironing press flattens your laundry with up to 45 kg of pressure and powerful steam – shirts, table and bed linen come out faster and more evenly than with an iron.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Ready fast:</strong> steam-ready in just 3 minutes, 200 g/min steam output.</li><li class="ml-1"><strong class="font-semibold">Never out of steam:</strong> twin-boiler system – the removable 0.75 l tank can be refilled at any time, even while ironing.</li><li class="ml-1"><strong class="font-semibold">Safe:</strong> the heater switches off automatically if the closed press stays plugged in, plus a transport lock.</li><li class="ml-1"><strong class="font-semibold">Gentle & clean:</strong> non-stick heating plate and anti-scale cartridge.</li><li class="ml-1"><strong class="font-semibold">Clear view:</strong> tilted aluminium plate and wide-angle opening make it easy to lay out even bulky items.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pressure: 45 kg (33 g/cm²)</li><li class="ml-1">Power: 2,200 W (220–240 V)</li><li class="ml-1">Steam output: 200 g/min, steam-ready in 3 min</li><li class="ml-1">Water tank: 0.75 l, removable with level indicator</li><li class="ml-1">Pressing surface: 68 × 25 cm (tilted, aluminium)</li><li class="ml-1">Dimensions: 68 × 58 × 27 cm</li><li class="ml-1">Weight: 11.6 kg</li><li class="ml-1">Article number: 9998</li></ul>',
    },
    "it-IT": {
      title: "Pressa stirante PP8000 – pressa a vapore con 45 kg di pressione",
      subtitle:
        "Pressa stirante a vapore da 2.200 W, pronta in 3 minuti – stira camicie e biancheria in pochi secondi",
      description:
        '<p class="mb-3 leading-relaxed">Stirare in secondi, non in minuti: la pressa stirante Planeta PP8000 stira la biancheria con una pressione fino a 45 kg e un vapore potente – camicie, tovaglie e lenzuola vengono perfette più in fretta e in modo più uniforme che con il ferro.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Pronta in fretta:</strong> vapore pronto in soli 3 minuti, erogazione di 200 g/min.</li><li class="ml-1"><strong class="font-semibold">Mai senza vapore:</strong> sistema a doppia caldaia – il serbatoio rimovibile da 0,75 l si ricarica in qualsiasi momento, anche durante la stiratura.</li><li class="ml-1"><strong class="font-semibold">Sicura:</strong> la resistenza si spegne automaticamente se la pressa chiusa resta collegata, con blocco per il trasporto.</li><li class="ml-1"><strong class="font-semibold">Delicata e pulita:</strong> piastra antiaderente e cartuccia anticalcare.</li><li class="ml-1"><strong class="font-semibold">Buona visibilità:</strong> piano inclinato in alluminio e apertura grandangolare per disporre con facilità anche i capi ingombranti.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pressione: 45 kg (33 g/cm²)</li><li class="ml-1">Potenza: 2.200 W (220–240 V)</li><li class="ml-1">Erogazione vapore: 200 g/min, pronta in 3 min</li><li class="ml-1">Serbatoio acqua: 0,75 l, rimovibile con indicatore di livello</li><li class="ml-1">Superficie di stiratura: 68 × 25 cm (inclinata, alluminio)</li><li class="ml-1">Dimensioni: 68 × 58 × 27 cm</li><li class="ml-1">Peso: 11,6 kg</li><li class="ml-1">Codice articolo: 9998</li></ul>',
    },
  },
  tags: ["Bügelpresse", "Dampfpresse", "Hemdenpresse", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD63M8X9RHN26GFC0TVAGF",
  handle: "buegelsystem-harmonie",
  base: {
    title: "Bügelsystem HARMONIE – Dampfstation mit beheiztem Aktiv-Bügeltisch",
    subtitle:
      "Komplettes Dampfbügelsystem mit beheiztem Aktivtisch (Absaugung & Gebläse) und Profi-Bügeleisen – für müheloses Bügeln zu Hause und im Kleinbetrieb",
    description:
      '<p class="mb-3 leading-relaxed">Profi-Ergebnisse mit halber Mühe: Das Planeta HARMONIE vereint einen leistungsstarken Dampferzeuger mit einem beheizten Aktiv-Bügeltisch. Die Absaugung fixiert den Stoff, das Gebläse erzeugt ein Luftpolster – so glätten Sie selbst hartnäckige Falten schnell und gleichmäßig.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Komplett & einsatzbereit:</strong> Dampferzeuger, beheizter Tisch und Profi-Bügeleisen mit Aluguss-Sohle und Korkgriff in einem System.</li><li class="ml-1"><strong class="font-semibold">Saubere Ergebnisse:</strong> beheizte Bügelfläche mit Absaugung und Gebläse fixiert den Stoff und beugt Restfeuchte vor.</li><li class="ml-1"><strong class="font-semibold">Ergonomisch:</strong> 9-fach höhenverstellbar mit doppelter Feststellsicherung, auch zum Bügeln im Sitzen.</li><li class="ml-1"><strong class="font-semibold">Komfortabel:</strong> Luft-Druckfeder zum einfachen Öffnen des Klappgestells, abnehmbare Bügelstation und seitliche Rollen zum Bewegen.</li><li class="ml-1"><strong class="font-semibold">Langlebig:</strong> Edelstahl-Heizkessel mit 3,2 bar Dampfdruck.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Dampfdruck: 3,2 bar</li><li class="ml-1">Kesselkapazität: 1,5 l (Edelstahl)</li><li class="ml-1">Leistung Dampferzeuger: 1.150 W</li><li class="ml-1">Leistung Bügeleisen: 800 W</li><li class="ml-1">Leistung Bügeltisch: 200 W</li><li class="ml-1">Motor (Doppelschaltung): 40–60 W</li><li class="ml-1">Bügeltischfläche: 120 × 37 cm</li><li class="ml-1">Gewicht: 22 kg</li><li class="ml-1">Zubehör: Kabelhalter, Einfüllflasche, Silikonmatte</li><li class="ml-1">Artikelnummer: 9200</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Bügelsystem HARMONIE – Dampfstation & Aktivtisch | Planeta",
      meta_description:
        "Planeta HARMONIE: Dampfbügelstation mit beheiztem Aktivtisch (Absaugung & Gebläse), 3,2 bar, 1,5-l-Edelstahlkessel. 9-fach höhenverstellbar, Bügeln im Sitzen.",
      meta_title_en: "HARMONIE Ironing System – Steam Station & Active Table | Planeta",
      meta_description_en:
        "Planeta HARMONIE: steam ironing station with heated active table (suction & blower), 3.2 bar, 1.5 l stainless boiler. 9-step height adjustment, sit-down ironing.",
      meta_title_it: "Sistema stirante HARMONIE – caldaia e tavolo attivo | Planeta",
      meta_description_it:
        "Planeta HARMONIE: sistema stirante con tavolo attivo riscaldato (aspirazione e soffio), 3,2 bar, caldaia inox da 1,5 l. Altezza regolabile a 9 posizioni, stiro da seduti.",
    },
  },
  translations: {
    "en-US": {
      title: "HARMONIE Ironing System – Steam Station with Heated Active Table",
      subtitle:
        "Complete steam ironing system with heated active table (suction & blower) and a professional iron – effortless ironing at home and in small businesses",
      description:
        '<p class="mb-3 leading-relaxed">Professional results with half the effort: the Planeta HARMONIE combines a powerful steam generator with a heated active ironing table. The suction holds the fabric in place while the blower creates an air cushion – so even stubborn creases are smoothed quickly and evenly.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Complete & ready to use:</strong> steam generator, heated table and a professional iron with cast-aluminium soleplate and cork handle in one system.</li><li class="ml-1"><strong class="font-semibold">Clean results:</strong> the heated surface with suction and blower fixes the fabric and prevents residual moisture.</li><li class="ml-1"><strong class="font-semibold">Ergonomic:</strong> 9-step height adjustment with double safety lock, also for sit-down ironing.</li><li class="ml-1"><strong class="font-semibold">Convenient:</strong> air spring for easy opening of the folding frame, removable ironing station and side rollers for moving it.</li><li class="ml-1"><strong class="font-semibold">Durable:</strong> stainless-steel boiler with 3.2 bar steam pressure.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Steam pressure: 3.2 bar</li><li class="ml-1">Boiler capacity: 1.5 l (stainless steel)</li><li class="ml-1">Steam generator power: 1,150 W</li><li class="ml-1">Iron power: 800 W</li><li class="ml-1">Table power: 200 W</li><li class="ml-1">Motor (dual switching): 40–60 W</li><li class="ml-1">Table surface: 120 × 37 cm</li><li class="ml-1">Weight: 22 kg</li><li class="ml-1">Accessories: cable holder, filling bottle, silicone mat</li><li class="ml-1">Article number: 9200</li></ul>',
    },
    "it-IT": {
      title: "Sistema stirante HARMONIE – caldaia con tavolo attivo riscaldato",
      subtitle:
        "Sistema stirante a vapore completo con tavolo attivo riscaldato (aspirazione e soffio) e ferro professionale – stiratura senza fatica a casa e nelle piccole attività",
      description:
        '<p class="mb-3 leading-relaxed">Risultati professionali con metà della fatica: il Planeta HARMONIE unisce un potente generatore di vapore a un tavolo da stiro attivo riscaldato. L\'aspirazione fissa il tessuto mentre il soffio crea un cuscino d\'aria – così anche le pieghe più ostinate si eliminano in fretta e in modo uniforme.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Completo e pronto all\'uso:</strong> generatore di vapore, tavolo riscaldato e ferro professionale con piastra in alluminio pressofuso e impugnatura in sughero in un unico sistema.</li><li class="ml-1"><strong class="font-semibold">Risultati impeccabili:</strong> la superficie riscaldata con aspirazione e soffio fissa il tessuto e previene l\'umidità residua.</li><li class="ml-1"><strong class="font-semibold">Ergonomico:</strong> altezza regolabile a 9 posizioni con doppio blocco di sicurezza, anche per stirare da seduti.</li><li class="ml-1"><strong class="font-semibold">Comodo:</strong> molla a gas per l\'apertura facile del telaio pieghevole, stazione di stiro rimovibile e ruote laterali per spostarlo.</li><li class="ml-1"><strong class="font-semibold">Durevole:</strong> caldaia in acciaio inox con 3,2 bar di pressione del vapore.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pressione vapore: 3,2 bar</li><li class="ml-1">Capacità caldaia: 1,5 l (acciaio inox)</li><li class="ml-1">Potenza generatore di vapore: 1.150 W</li><li class="ml-1">Potenza ferro: 800 W</li><li class="ml-1">Potenza tavolo: 200 W</li><li class="ml-1">Motore (doppio comando): 40–60 W</li><li class="ml-1">Superficie del tavolo: 120 × 37 cm</li><li class="ml-1">Peso: 22 kg</li><li class="ml-1">Accessori: reggicavo, bottiglia di riempimento, tappetino in silicone</li><li class="ml-1">Codice articolo: 9200</li></ul>',
    },
  },
  tags: ["Bügelsystem", "Dampfbügelstation", "Aktiv-Bügeltisch", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD63K8T517ETEXPVDF3HGB",
  handle: "buegelsystem-harmonie-refill",
  base: {
    title: "Bügelsystem HARMONIE REFILL – Dampfstation mit nachfüllbarem Kessel",
    subtitle:
      "Dampfbügelsystem mit beheiztem Aktivtisch und nachfüllbarem Edelstahlkessel – unbegrenzte Bügelautonomie ohne Pausen",
    description:
      '<p class="mb-3 leading-relaxed">Bügeln ohne Unterbrechung: Das Planeta HARMONIE REFILL verbindet einen leistungsstarken Dampferzeuger mit einem beheizten Aktiv-Bügeltisch. Dank nachfüllbarem Edelstahlkessel müssen Sie nie auf Druckabbau warten – ideal für große Wäschemengen.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Unbegrenzte Autonomie:</strong> wiederbefüllbarer Edelstahlkessel – Wasser jederzeit nachfüllen, ohne Pause.</li><li class="ml-1"><strong class="font-semibold">Saubere Ergebnisse:</strong> beheizter Bügeltisch mit Gebläse und Absaugung fixiert den Stoff.</li><li class="ml-1"><strong class="font-semibold">Komplett:</strong> Profi-Bügeleisen mit Aluguss-Sohle und Korkgriff (nach Wahl).</li><li class="ml-1"><strong class="font-semibold">Ergonomisch:</strong> 9-fach höhenverstellbar mit doppelter Feststellsicherung; Luft-Druckfeder zum einfachen Öffnen.</li><li class="ml-1"><strong class="font-semibold">Sicher:</strong> elektromechanischer Druckwächter und Sicherheits-Thermostat.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Dampfdruck: 3,2 bar</li><li class="ml-1">Kessel: nachfüllbar (Edelstahl), unbegrenzte Autonomie</li><li class="ml-1">Leistung Dampferzeuger: 1.150 W</li><li class="ml-1">Leistung Bügeleisen: 800 W</li><li class="ml-1">Leistung Bügeltisch: 200 W</li><li class="ml-1">Motor (Doppelschaltung): 40–60 W</li><li class="ml-1">Bügeltischfläche: 120 × 37 cm</li><li class="ml-1">Gewicht: 22 kg</li><li class="ml-1">Zubehör: Kabelhalter, Einfüllflasche, Silikonmatte</li><li class="ml-1">Artikelnummer: 9300</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "HARMONIE REFILL – nachfüllbare Dampfstation | Planeta",
      meta_description:
        "Planeta HARMONIE REFILL: Dampfstation mit beheiztem Aktivtisch und nachfüllbarem Edelstahlkessel für unbegrenztes Bügeln. 3,2 bar, 9-fach höhenverstellbar.",
      meta_title_en: "HARMONIE REFILL – Refillable Steam Station | Planeta",
      meta_description_en:
        "Planeta HARMONIE REFILL: steam station with heated active table and refillable stainless boiler for non-stop ironing. 3.2 bar, 9-step height adjustment.",
      meta_title_it: "HARMONIE REFILL – caldaia ricaricabile | Planeta",
      meta_description_it:
        "Planeta HARMONIE REFILL: sistema stirante con tavolo attivo riscaldato e caldaia inox ricaricabile per stirare senza sosta. 3,2 bar, 9 posizioni di altezza.",
    },
  },
  translations: {
    "en-US": {
      title: "HARMONIE REFILL Ironing System – Steam Station with Refillable Boiler",
      subtitle:
        "Steam ironing system with heated active table and refillable stainless boiler – unlimited ironing autonomy with no breaks",
      description:
        '<p class="mb-3 leading-relaxed">Ironing without interruption: the Planeta HARMONIE REFILL combines a powerful steam generator with a heated active ironing table. Thanks to the refillable stainless boiler you never have to wait for the pressure to drop – ideal for large amounts of laundry.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Unlimited autonomy:</strong> refillable stainless-steel boiler – top up water at any time, without a break.</li><li class="ml-1"><strong class="font-semibold">Clean results:</strong> heated table with blower and suction holds the fabric in place.</li><li class="ml-1"><strong class="font-semibold">Complete:</strong> professional iron with cast-aluminium soleplate and cork handle (your choice).</li><li class="ml-1"><strong class="font-semibold">Ergonomic:</strong> 9-step height adjustment with double safety lock; air spring for easy opening.</li><li class="ml-1"><strong class="font-semibold">Safe:</strong> electromechanical pressure switch and safety thermostat.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Steam pressure: 3.2 bar</li><li class="ml-1">Boiler: refillable (stainless steel), unlimited autonomy</li><li class="ml-1">Steam generator power: 1,150 W</li><li class="ml-1">Iron power: 800 W</li><li class="ml-1">Table power: 200 W</li><li class="ml-1">Motor (dual switching): 40–60 W</li><li class="ml-1">Table surface: 120 × 37 cm</li><li class="ml-1">Weight: 22 kg</li><li class="ml-1">Accessories: cable holder, filling bottle, silicone mat</li><li class="ml-1">Article number: 9300</li></ul>',
    },
    "it-IT": {
      title: "Sistema stirante HARMONIE REFILL – caldaia ricaricabile",
      subtitle:
        "Sistema stirante a vapore con tavolo attivo riscaldato e caldaia inox ricaricabile – autonomia di stiratura illimitata senza pause",
      description:
        '<p class="mb-3 leading-relaxed">Stirare senza interruzioni: il Planeta HARMONIE REFILL unisce un potente generatore di vapore a un tavolo da stiro attivo riscaldato. Grazie alla caldaia inox ricaricabile non devi mai attendere il calo di pressione – ideale per grandi quantità di biancheria.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Autonomia illimitata:</strong> caldaia in acciaio inox ricaricabile – rabbocco dell\'acqua in qualsiasi momento, senza pause.</li><li class="ml-1"><strong class="font-semibold">Risultati impeccabili:</strong> tavolo riscaldato con soffio e aspirazione che fissa il tessuto.</li><li class="ml-1"><strong class="font-semibold">Completo:</strong> ferro professionale con piastra in alluminio pressofuso e impugnatura in sughero (a scelta).</li><li class="ml-1"><strong class="font-semibold">Ergonomico:</strong> altezza regolabile a 9 posizioni con doppio blocco di sicurezza; molla a gas per l\'apertura facile.</li><li class="ml-1"><strong class="font-semibold">Sicuro:</strong> pressostato elettromeccanico e termostato di sicurezza.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pressione vapore: 3,2 bar</li><li class="ml-1">Caldaia: ricaricabile (acciaio inox), autonomia illimitata</li><li class="ml-1">Potenza generatore di vapore: 1.150 W</li><li class="ml-1">Potenza ferro: 800 W</li><li class="ml-1">Potenza tavolo: 200 W</li><li class="ml-1">Motore (doppio comando): 40–60 W</li><li class="ml-1">Superficie del tavolo: 120 × 37 cm</li><li class="ml-1">Peso: 22 kg</li><li class="ml-1">Accessori: reggicavo, bottiglia di riempimento, tappetino in silicone</li><li class="ml-1">Codice articolo: 9300</li></ul>',
    },
  },
  tags: ["Bügelsystem", "Dampfbügelstation", "Aktiv-Bügeltisch", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD63P82P6AYYM4EY6E6NJ3",
  handle: "buegelsystem-refill-g3",
  base: {
    title: "Bügelsystem Refill G3 – Dampfstation mit 10 Jahren Kesselgarantie",
    subtitle:
      "Dampfbügelsystem mit beheiztem Aktivtisch und nachfüllbarem Kessel (4,5 bar) – unbegrenztes Bügeln, 10 Jahre Kesselgarantie",
    description:
      '<p class="mb-3 leading-relaxed">Schneller, einfacher, komfortabler bügeln – zu Hause wie im Profi-Einsatz: Der Planeta Refill G3 verbindet einen kräftigen Dampfgenerator mit 4,5 bar und einem beheizten Aktiv-Bügeltisch mit Absaugung. Hartnäckige Falten verschwinden mühelos, der Stoff wird perfekt fixiert.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">10 Jahre Kesselgarantie:</strong> neues Kesselsystem für lange Lebensdauer.</li><li class="ml-1"><strong class="font-semibold">Unbegrenzte Autonomie:</strong> nachfüllbarer Edelstahlkessel mit 4,5 bar – Dampf, so lange Sie ihn brauchen.</li><li class="ml-1"><strong class="font-semibold">Vielseitig:</strong> Anschlussmöglichkeit für alle Planeta Dampfzubehör-Werkzeuge, mit Manometer und verstärkter Lüftung.</li><li class="ml-1"><strong class="font-semibold">Ergonomisch:</strong> 9-fach höhenverstellbar mit doppelter Feststellsicherung, auch zum Bügeln im Sitzen.</li><li class="ml-1"><strong class="font-semibold">Sicher:</strong> elektromechanischer Druckschalter und Sicherheitsthermostat; Profi-Bügeleisen mit Aluguss-Sohle und Korkgriff.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Dampfdruck: 4,5 bar</li><li class="ml-1">Kessel: nachfüllbar (Edelstahl), unbegrenzte Autonomie, 10 Jahre Garantie</li><li class="ml-1">Leistung Dampferzeuger: 1.150 W</li><li class="ml-1">Leistung Bügeleisen: 800 W</li><li class="ml-1">Leistung Bügeltisch: 200 W</li><li class="ml-1">Motor (Doppelschaltung): 40–60 W</li><li class="ml-1">Bügeltischfläche: 120 × 37 cm</li><li class="ml-1">Gewicht: 22 kg</li><li class="ml-1">Zubehör: Kabelhalter, Einfüllflasche, Silikonmatte</li><li class="ml-1">Artikelnummer: 9300</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Refill G3 – Dampfstation, 10 J. Kesselgarantie | Planeta",
      meta_description:
        "Planeta Refill G3: Dampfsystem mit beheiztem Aktivtisch, nachfüllbarem Kessel (4,5 bar) und 10 Jahren Kesselgarantie. 9-fach höhenverstellbar, Bügeln im Sitzen.",
      meta_title_en: "Refill G3 – Steam Station, 10-Year Boiler Warranty | Planeta",
      meta_description_en:
        "Planeta Refill G3: steam system with heated active table, refillable boiler (4.5 bar) and a 10-year boiler warranty. 9-step height adjustment, sit-down ironing.",
      meta_title_it: "Refill G3 – caldaia, garanzia caldaia 10 anni | Planeta",
      meta_description_it:
        "Planeta Refill G3: sistema stirante con tavolo attivo riscaldato, caldaia ricaricabile (4,5 bar) e garanzia caldaia di 10 anni. 9 posizioni di altezza, stiro da seduti.",
    },
  },
  translations: {
    "en-US": {
      title: "Refill G3 Ironing System – Steam Station with 10-Year Boiler Warranty",
      subtitle:
        "Steam ironing system with heated active table and refillable boiler (4.5 bar) – unlimited ironing and a 10-year boiler warranty",
      description:
        '<p class="mb-3 leading-relaxed">Iron faster, easier and more comfortably – at home and in professional use: the Planeta Refill G3 combines a powerful 4.5 bar steam generator with a heated active ironing table with suction. Stubborn creases disappear effortlessly and the fabric is held perfectly in place.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">10-year boiler warranty:</strong> new boiler system built to last.</li><li class="ml-1"><strong class="font-semibold">Unlimited autonomy:</strong> refillable stainless boiler at 4.5 bar – steam for as long as you need it.</li><li class="ml-1"><strong class="font-semibold">Versatile:</strong> connects to all Planeta steam accessory tools, with pressure gauge and reinforced ventilation.</li><li class="ml-1"><strong class="font-semibold">Ergonomic:</strong> 9-step height adjustment with double safety lock, also for sit-down ironing.</li><li class="ml-1"><strong class="font-semibold">Safe:</strong> electromechanical pressure switch and safety thermostat; professional iron with cast-aluminium soleplate and cork handle.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Steam pressure: 4.5 bar</li><li class="ml-1">Boiler: refillable (stainless steel), unlimited autonomy, 10-year warranty</li><li class="ml-1">Steam generator power: 1,150 W</li><li class="ml-1">Iron power: 800 W</li><li class="ml-1">Table power: 200 W</li><li class="ml-1">Motor (dual switching): 40–60 W</li><li class="ml-1">Table surface: 120 × 37 cm</li><li class="ml-1">Weight: 22 kg</li><li class="ml-1">Accessories: cable holder, filling bottle, silicone mat</li><li class="ml-1">Article number: 9300</li></ul>',
    },
    "it-IT": {
      title: "Sistema stirante Refill G3 – caldaia con garanzia di 10 anni",
      subtitle:
        "Sistema stirante a vapore con tavolo attivo riscaldato e caldaia ricaricabile (4,5 bar) – stiratura illimitata e garanzia caldaia di 10 anni",
      description:
        '<p class="mb-3 leading-relaxed">Stirare più in fretta, più facilmente e con più comfort – a casa e nell\'uso professionale: il Planeta Refill G3 unisce un potente generatore di vapore a 4,5 bar a un tavolo da stiro attivo riscaldato con aspirazione. Le pieghe più ostinate spariscono senza fatica e il tessuto resta perfettamente fermo.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Garanzia caldaia 10 anni:</strong> nuovo sistema di caldaia costruito per durare.</li><li class="ml-1"><strong class="font-semibold">Autonomia illimitata:</strong> caldaia inox ricaricabile a 4,5 bar – vapore per tutto il tempo che ti serve.</li><li class="ml-1"><strong class="font-semibold">Versatile:</strong> compatibile con tutti gli accessori a vapore Planeta, con manometro e ventilazione potenziata.</li><li class="ml-1"><strong class="font-semibold">Ergonomico:</strong> altezza regolabile a 9 posizioni con doppio blocco di sicurezza, anche per stirare da seduti.</li><li class="ml-1"><strong class="font-semibold">Sicuro:</strong> pressostato elettromeccanico e termostato di sicurezza; ferro professionale con piastra in alluminio pressofuso e impugnatura in sughero.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pressione vapore: 4,5 bar</li><li class="ml-1">Caldaia: ricaricabile (acciaio inox), autonomia illimitata, garanzia 10 anni</li><li class="ml-1">Potenza generatore di vapore: 1.150 W</li><li class="ml-1">Potenza ferro: 800 W</li><li class="ml-1">Potenza tavolo: 200 W</li><li class="ml-1">Motore (doppio comando): 40–60 W</li><li class="ml-1">Superficie del tavolo: 120 × 37 cm</li><li class="ml-1">Peso: 22 kg</li><li class="ml-1">Accessori: reggicavo, bottiglia di riempimento, tappetino in silicone</li><li class="ml-1">Codice articolo: 9300</li></ul>',
    },
  },
  tags: ["Bügelsystem", "Dampfbügelstation", "Aktiv-Bügeltisch", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD63RDJEHQ19GN2RSF0WNN",
  handle: "buegelsystem-rapid-z-macro",
  base: {
    title: "Bügelsystem Rapid Z Macro – kompakte Profi-Dampfstation, 4,5 bar",
    subtitle:
      "Kompaktes, leistungsstarkes Dampfbügelsystem mit 4,5 bar – schnelle, gleichmäßige Dampfleistung für anspruchsvolle Stoffe",
    description:
      '<p class="mb-3 leading-relaxed">Profi-Ergebnisse auf kleinem Raum: Die Planeta Rapid Z Macro ist ein kompaktes und dennoch leistungsstarkes Bügelsystem. Der Dampfgenerator mit 4,5 bar liefert schnell und gleichmäßig Dampf, der selbst dicke oder widerspenstige Stoffe mühelos glättet.</p>' +
      '<p class="mb-3 leading-relaxed">Eine zuverlässige, langlebige Wahl für Schneidereien, kleine Wäschereien und alle, die häufig bügeln.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Kraftvoller Dampf:</strong> 4,5 bar und 1.300-W-Dampferzeuger für schnelle, gleichmäßige Ergebnisse.</li><li class="ml-1"><strong class="font-semibold">Platzsparend:</strong> kompakte Bauform mit beheiztem Aktivtisch (120 × 40 cm).</li><li class="ml-1"><strong class="font-semibold">Unbegrenzte Autonomie:</strong> nachfüllbarer Kessel – Dampf ohne Pause.</li><li class="ml-1"><strong class="font-semibold">Robust & langlebig:</strong> für den häufigen, professionellen Einsatz ausgelegt.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Dampfdruck: 4,5 bar</li><li class="ml-1">Kessel: nachfüllbar, unbegrenzte Autonomie</li><li class="ml-1">Leistung Dampferzeuger: 1.300 W</li><li class="ml-1">Leistung Bügeleisen: 1.050 W</li><li class="ml-1">Leistung Bügeltisch: 200 W</li><li class="ml-1">Motor (Doppelschaltung): 40 W</li><li class="ml-1">Bügeltischfläche: 120 × 40 cm</li><li class="ml-1">Gewicht: 18 kg</li><li class="ml-1">Zubehör: Kabelhalter, Einfüllflasche, Silikonmatte, Ablagegitter</li><li class="ml-1">Artikelnummer: 9100</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Rapid Z Macro – kompakte Dampfstation 4,5 bar | Planeta",
      meta_description:
        "Planeta Rapid Z Macro: kompaktes Profi-Dampfsystem mit 4,5 bar und 1.300-W-Dampferzeuger. Beheizter Aktivtisch 120 × 40 cm – ideal für Schneidereien & Wäschereien.",
      meta_title_en: "Rapid Z Macro – Compact Steam Station 4.5 bar | Planeta",
      meta_description_en:
        "Planeta Rapid Z Macro: compact pro steam system with 4.5 bar and 1,300 W steam generator. Heated active table 120 × 40 cm – ideal for tailors & small laundries.",
      meta_title_it: "Rapid Z Macro – caldaia compatta 4,5 bar | Planeta",
      meta_description_it:
        "Planeta Rapid Z Macro: sistema stirante compatto a 4,5 bar con generatore da 1.300 W. Tavolo attivo riscaldato 120 × 40 cm – ideale per sartorie e piccole lavanderie.",
    },
  },
  translations: {
    "en-US": {
      title: "Rapid Z Macro Ironing System – Compact Pro Steam Station, 4.5 bar",
      subtitle:
        "Compact yet powerful steam ironing system with 4.5 bar – fast, even steam output for demanding fabrics",
      description:
        '<p class="mb-3 leading-relaxed">Professional results in a small footprint: the Planeta Rapid Z Macro is a compact yet powerful ironing system. The 4.5 bar steam generator delivers fast, even steam that smooths even thick or stubborn fabrics with ease.</p>' +
        '<p class="mb-3 leading-relaxed">A reliable, durable choice for tailors, small laundries and anyone who irons frequently.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Powerful steam:</strong> 4.5 bar and a 1,300 W steam generator for fast, even results.</li><li class="ml-1"><strong class="font-semibold">Space-saving:</strong> compact design with a heated active table (120 × 40 cm).</li><li class="ml-1"><strong class="font-semibold">Unlimited autonomy:</strong> refillable boiler – steam without breaks.</li><li class="ml-1"><strong class="font-semibold">Robust & durable:</strong> built for frequent, professional use.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Steam pressure: 4.5 bar</li><li class="ml-1">Boiler: refillable, unlimited autonomy</li><li class="ml-1">Steam generator power: 1,300 W</li><li class="ml-1">Iron power: 1,050 W</li><li class="ml-1">Table power: 200 W</li><li class="ml-1">Motor (dual switching): 40 W</li><li class="ml-1">Table surface: 120 × 40 cm</li><li class="ml-1">Weight: 18 kg</li><li class="ml-1">Accessories: cable holder, filling bottle, silicone mat, rest grid</li><li class="ml-1">Article number: 9100</li></ul>',
    },
    "it-IT": {
      title: "Sistema stirante Rapid Z Macro – caldaia compatta, 4,5 bar",
      subtitle:
        "Sistema stirante a vapore compatto ma potente con 4,5 bar – erogazione di vapore rapida e uniforme per i tessuti più impegnativi",
      description:
        '<p class="mb-3 leading-relaxed">Risultati professionali in poco spazio: il Planeta Rapid Z Macro è un sistema stirante compatto ma potente. Il generatore di vapore a 4,5 bar eroga vapore rapido e uniforme che stira senza fatica anche i tessuti spessi o difficili.</p>' +
        '<p class="mb-3 leading-relaxed">Una scelta affidabile e duratura per sartorie, piccole lavanderie e chiunque stiri spesso.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Vapore potente:</strong> 4,5 bar e generatore da 1.300 W per risultati rapidi e uniformi.</li><li class="ml-1"><strong class="font-semibold">Salvaspazio:</strong> design compatto con tavolo attivo riscaldato (120 × 40 cm).</li><li class="ml-1"><strong class="font-semibold">Autonomia illimitata:</strong> caldaia ricaricabile – vapore senza pause.</li><li class="ml-1"><strong class="font-semibold">Robusto e duraturo:</strong> progettato per un uso frequente e professionale.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pressione vapore: 4,5 bar</li><li class="ml-1">Caldaia: ricaricabile, autonomia illimitata</li><li class="ml-1">Potenza generatore di vapore: 1.300 W</li><li class="ml-1">Potenza ferro: 1.050 W</li><li class="ml-1">Potenza tavolo: 200 W</li><li class="ml-1">Motore (doppio comando): 40 W</li><li class="ml-1">Superficie del tavolo: 120 × 40 cm</li><li class="ml-1">Peso: 18 kg</li><li class="ml-1">Accessori: reggicavo, bottiglia di riempimento, tappetino in silicone, griglia poggiaferro</li><li class="ml-1">Codice articolo: 9100</li></ul>',
    },
  },
  tags: ["Bügelsystem", "Dampfbügelstation", "Aktiv-Bügeltisch", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD63TRJFC5G15JXCJ3PWDA",
  handle: "buegelsystem-rapid-z-sprint",
  base: {
    title: "Bügelsystem Rapid Z Sprint – Profi-Dampfstation, 4,5 bar",
    subtitle:
      "Leistungsstarkes Dampfbügelsystem mit 4,5 bar und kompaktem Aktivtisch (100 × 40 cm) – schnelles, gleichmäßiges Bügeln",
    description:
      '<p class="mb-3 leading-relaxed">Kraftvoll und kompakt: Das Planeta Rapid Z Sprint vereint einen leistungsstarken Dampfgenerator mit 4,5 bar und einen beheizten Aktiv-Bügeltisch. Der Dampf wird schnell und gleichmäßig abgegeben und glättet selbst widerspenstige Stoffe mühelos – ideal fürs Vielbügeln auf kleinem Raum.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Kraftvoller Dampf:</strong> 4,5 bar und 1.300-W-Dampferzeuger für schnelle, gleichmäßige Ergebnisse.</li><li class="ml-1"><strong class="font-semibold">Kompakt:</strong> beheizter Aktivtisch mit 100 × 40 cm – platzsparend aufgestellt.</li><li class="ml-1"><strong class="font-semibold">Unbegrenzte Autonomie:</strong> nachfüllbarer Kessel – Dampf ohne Pause.</li><li class="ml-1"><strong class="font-semibold">Robust & langlebig:</strong> für den häufigen, professionellen Einsatz ausgelegt.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Dampfdruck: 4,5 bar</li><li class="ml-1">Kessel: nachfüllbar, unbegrenzte Autonomie</li><li class="ml-1">Leistung Dampferzeuger: 1.300 W</li><li class="ml-1">Leistung Bügeleisen: 1.050 W</li><li class="ml-1">Leistung Bügeltisch: 200 W</li><li class="ml-1">Motor (Doppelschaltung): 40 W</li><li class="ml-1">Bügeltischfläche: 100 × 40 cm</li><li class="ml-1">Gewicht: 18 kg</li><li class="ml-1">Zubehör: Kabelhalter, Einfüllflasche, Silikonmatte, Ablagegitter</li><li class="ml-1">Artikelnummer: 9600</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Rapid Z Sprint – Profi-Dampfstation 4,5 bar | Planeta",
      meta_description:
        "Planeta Rapid Z Sprint: Profi-Dampfsystem mit 4,5 bar und 1.300-W-Dampferzeuger. Beheizter Aktivtisch 100 × 40 cm, nachfüllbarer Kessel – ideal fürs Vielbügeln.",
      meta_title_en: "Rapid Z Sprint – Pro Steam Station 4.5 bar | Planeta",
      meta_description_en:
        "Planeta Rapid Z Sprint: pro steam system with 4.5 bar and 1,300 W steam generator. Heated active table 100 × 40 cm, refillable boiler – ideal for frequent ironing.",
      meta_title_it: "Rapid Z Sprint – caldaia professionale 4,5 bar | Planeta",
      meta_description_it:
        "Planeta Rapid Z Sprint: sistema stirante professionale a 4,5 bar con generatore da 1.300 W. Tavolo attivo riscaldato 100 × 40 cm, caldaia ricaricabile – ideale per chi stira spesso.",
    },
  },
  translations: {
    "en-US": {
      title: "Rapid Z Sprint Ironing System – Pro Steam Station, 4.5 bar",
      subtitle:
        "Powerful steam ironing system with 4.5 bar and a compact active table (100 × 40 cm) – fast, even ironing",
      description:
        '<p class="mb-3 leading-relaxed">Powerful and compact: the Planeta Rapid Z Sprint combines a powerful 4.5 bar steam generator with a heated active ironing table. Steam is released quickly and evenly and smooths even stubborn fabrics with ease – ideal for frequent ironing in a small space.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Powerful steam:</strong> 4.5 bar and a 1,300 W steam generator for fast, even results.</li><li class="ml-1"><strong class="font-semibold">Compact:</strong> heated active table at 100 × 40 cm – space-saving setup.</li><li class="ml-1"><strong class="font-semibold">Unlimited autonomy:</strong> refillable boiler – steam without breaks.</li><li class="ml-1"><strong class="font-semibold">Robust & durable:</strong> built for frequent, professional use.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Steam pressure: 4.5 bar</li><li class="ml-1">Boiler: refillable, unlimited autonomy</li><li class="ml-1">Steam generator power: 1,300 W</li><li class="ml-1">Iron power: 1,050 W</li><li class="ml-1">Table power: 200 W</li><li class="ml-1">Motor (dual switching): 40 W</li><li class="ml-1">Table surface: 100 × 40 cm</li><li class="ml-1">Weight: 18 kg</li><li class="ml-1">Accessories: cable holder, filling bottle, silicone mat, rest grid</li><li class="ml-1">Article number: 9600</li></ul>',
    },
    "it-IT": {
      title: "Sistema stirante Rapid Z Sprint – caldaia professionale, 4,5 bar",
      subtitle:
        "Sistema stirante a vapore potente con 4,5 bar e tavolo attivo compatto (100 × 40 cm) – stiratura rapida e uniforme",
      description:
        '<p class="mb-3 leading-relaxed">Potente e compatto: il Planeta Rapid Z Sprint unisce un potente generatore di vapore a 4,5 bar a un tavolo da stiro attivo riscaldato. Il vapore viene erogato in modo rapido e uniforme e stira senza fatica anche i tessuti difficili – ideale per chi stira spesso in poco spazio.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Vapore potente:</strong> 4,5 bar e generatore da 1.300 W per risultati rapidi e uniformi.</li><li class="ml-1"><strong class="font-semibold">Compatto:</strong> tavolo attivo riscaldato da 100 × 40 cm – ingombro ridotto.</li><li class="ml-1"><strong class="font-semibold">Autonomia illimitata:</strong> caldaia ricaricabile – vapore senza pause.</li><li class="ml-1"><strong class="font-semibold">Robusto e duraturo:</strong> progettato per un uso frequente e professionale.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Pressione vapore: 4,5 bar</li><li class="ml-1">Caldaia: ricaricabile, autonomia illimitata</li><li class="ml-1">Potenza generatore di vapore: 1.300 W</li><li class="ml-1">Potenza ferro: 1.050 W</li><li class="ml-1">Potenza tavolo: 200 W</li><li class="ml-1">Motore (doppio comando): 40 W</li><li class="ml-1">Superficie del tavolo: 100 × 40 cm</li><li class="ml-1">Peso: 18 kg</li><li class="ml-1">Accessori: reggicavo, bottiglia di riempimento, tappetino in silicone, griglia poggiaferro</li><li class="ml-1">Codice articolo: 9600</li></ul>',
    },
  },
  tags: ["Bügelsystem", "Dampfbügelstation", "Aktiv-Bügeltisch", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD68KF0XJNZ4YDSXQPT4H4",
  handle: "dampfbuegeltisch-harmonie-ii",
  base: {
    title: "Harmonie II – Dampfbügeltisch mit Edelstahlkessel & Profi-Bügeleisen",
    subtitle:
      "Aktiv-Dampfbügeltisch mit regelbarem Dampfdruck, Edelstahlkessel und Profi-Bügeleisen mit Dauerdampf – 8-fach höhenverstellbar",
    description:
      '<p class="mb-3 leading-relaxed">Bügeln auf Profi-Niveau: Der Planeta Harmonie II ist ein aktiver Dampfbügeltisch mit eigenem Edelstahlkessel und Profi-Bügeleisen. Der regelbare Dampfdruck und die Dauerdampfschaltung glätten Falten schnell – die robuste, langlebige Konstruktion ist auf intensiven Einsatz ausgelegt.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Kräftiger, regelbarer Dampf:</strong> Edelstahlkessel (1,5 mm) mit externem Heizelement und regulierbarem Dampfdruck.</li><li class="ml-1"><strong class="font-semibold">Profi-Bügeleisen:</strong> mit Dauerdampfschaltung für längeres Bügeln ohne Unterbrechung.</li><li class="ml-1"><strong class="font-semibold">Ergonomisch:</strong> 8-fach höhenverstellbar von 75–98 cm.</li><li class="ml-1"><strong class="font-semibold">Robust:</strong> industrielle Textilbespannung mit 400-g-Füllung, kratz- und stoßfest lackierte Beine.</li><li class="ml-1"><strong class="font-semibold">Praktisch:</strong> Kabelablagefach und 2,4 m nutzbare Kabellänge.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Kessel: Edelstahl, 1,5 mm, externes Heizelement</li><li class="ml-1">Dampfdruck: regulierbar</li><li class="ml-1">Bügelfläche (T × B): 110 × 45 cm</li><li class="ml-1">Maße geöffnet: 136 × 45 × 98 cm</li><li class="ml-1">Maße geschlossen: 143 × 53 × 23 cm</li><li class="ml-1">Höhe einstellbar: 75–98 cm (8 Positionen)</li><li class="ml-1">Nutzbare Kabellänge: 2,4 m</li><li class="ml-1">Gewicht: 16 kg</li><li class="ml-1">Artikelnummer: 9202</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Harmonie II – Dampfbügeltisch mit Edelstahlkessel | Planeta",
      meta_description:
        "Planeta Harmonie II: Aktiv-Dampfbügeltisch mit Edelstahlkessel (1,5 mm), regelbarem Dampfdruck und Profi-Bügeleisen mit Dauerdampf. 8 Höhen, 75–98 cm, 16 kg.",
      meta_title_en: "Harmonie II – Steam Ironing Table with Stainless Boiler | Planeta",
      meta_description_en:
        "Planeta Harmonie II: active steam ironing table with stainless boiler (1.5 mm), adjustable steam pressure and a pro iron with continuous steam. 8 heights, 75–98 cm.",
      meta_title_it: "Harmonie II – tavolo da stiro a vapore con caldaia inox | Planeta",
      meta_description_it:
        "Planeta Harmonie II: tavolo da stiro attivo a vapore con caldaia inox (1,5 mm), pressione regolabile e ferro professionale con vapore continuo. 8 altezze, 75–98 cm.",
    },
  },
  translations: {
    "en-US": {
      title: "Harmonie II – Steam Ironing Table with Stainless Boiler & Pro Iron",
      subtitle:
        "Active steam ironing table with adjustable steam pressure, stainless boiler and a pro iron with continuous steam – 8-step height adjustment",
      description:
        '<p class="mb-3 leading-relaxed">Ironing at a professional level: the Planeta Harmonie II is an active steam ironing table with its own stainless boiler and a professional iron. The adjustable steam pressure and continuous-steam setting smooth creases quickly – and the robust, durable build is made for intensive use.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Strong, adjustable steam:</strong> stainless boiler (1.5 mm) with external heating element and adjustable steam pressure.</li><li class="ml-1"><strong class="font-semibold">Professional iron:</strong> with continuous-steam setting for longer, uninterrupted ironing.</li><li class="ml-1"><strong class="font-semibold">Ergonomic:</strong> 8-step height adjustment from 75–98 cm.</li><li class="ml-1"><strong class="font-semibold">Robust:</strong> industrial cover with 400 g padding, scratch- and impact-resistant painted legs.</li><li class="ml-1"><strong class="font-semibold">Practical:</strong> cable storage compartment and 2.4 m usable cable length.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Boiler: stainless steel, 1.5 mm, external heating element</li><li class="ml-1">Steam pressure: adjustable</li><li class="ml-1">Ironing surface (D × W): 110 × 45 cm</li><li class="ml-1">Dimensions open: 136 × 45 × 98 cm</li><li class="ml-1">Dimensions folded: 143 × 53 × 23 cm</li><li class="ml-1">Height adjustable: 75–98 cm (8 positions)</li><li class="ml-1">Usable cable length: 2.4 m</li><li class="ml-1">Weight: 16 kg</li><li class="ml-1">Article number: 9202</li></ul>',
    },
    "it-IT": {
      title: "Harmonie II – tavolo da stiro a vapore con caldaia inox e ferro pro",
      subtitle:
        "Tavolo da stiro attivo a vapore con pressione regolabile, caldaia inox e ferro professionale con vapore continuo – altezza regolabile a 8 posizioni",
      description:
        '<p class="mb-3 leading-relaxed">Stirare a livello professionale: il Planeta Harmonie II è un tavolo da stiro attivo a vapore con caldaia inox propria e ferro professionale. La pressione del vapore regolabile e la funzione vapore continuo eliminano le pieghe in fretta – e la struttura robusta e duratura è pensata per un uso intensivo.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Vapore potente e regolabile:</strong> caldaia inox (1,5 mm) con resistenza esterna e pressione del vapore regolabile.</li><li class="ml-1"><strong class="font-semibold">Ferro professionale:</strong> con funzione vapore continuo per stirare più a lungo senza interruzioni.</li><li class="ml-1"><strong class="font-semibold">Ergonomico:</strong> altezza regolabile a 8 posizioni da 75 a 98 cm.</li><li class="ml-1"><strong class="font-semibold">Robusto:</strong> rivestimento industriale con imbottitura da 400 g, gambe verniciate resistenti a graffi e urti.</li><li class="ml-1"><strong class="font-semibold">Pratico:</strong> vano portacavo e 2,4 m di cavo utile.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Caldaia: acciaio inox, 1,5 mm, resistenza esterna</li><li class="ml-1">Pressione vapore: regolabile</li><li class="ml-1">Superficie di stiratura (P × L): 110 × 45 cm</li><li class="ml-1">Dimensioni aperto: 136 × 45 × 98 cm</li><li class="ml-1">Dimensioni chiuso: 143 × 53 × 23 cm</li><li class="ml-1">Altezza regolabile: 75–98 cm (8 posizioni)</li><li class="ml-1">Lunghezza utile del cavo: 2,4 m</li><li class="ml-1">Peso: 16 kg</li><li class="ml-1">Codice articolo: 9202</li></ul>',
    },
  },
  tags: ["Dampfbügeltisch", "Bügeltisch", "Dampfbügeln", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD68HMZS31TQX6FQ34Y9D4",
  handle: "opal-aktiver-buegeltisch",
  base: {
    title: "Opal Aktiver Bügeltisch – beheizt, mit Absaugung & Aufblasfunktion",
    subtitle:
      "Aktiv-Bügeltisch mit beheizter Aluminiumfläche, Absaug- und Aufblasfunktion sowie kraftunterstützter Höhenverstellung",
    description:
      '<p class="mb-3 leading-relaxed">Der Aktiv-Bügeltisch mit umfangreicher Ausstattung: Die beheizte Aluminium-Lochblechfläche des Planeta Opal lässt der Restfeuchtigkeit keine Chance, während Absaugung und Aufblasfunktion die Wäsche fixieren oder auf einem Luftpolster schweben lassen. Die kraftunterstützte Höhenverstellung macht das Einstellen mühelos.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Beheizte Bügelfläche:</strong> Aluminium-Lochblech (ca. 110 × 43 cm) gegen Restfeuchtigkeit.</li><li class="ml-1"><strong class="font-semibold">Absaugen & Aufblasen:</strong> leistungsstarker Ventilator fixiert die Wäsche oder erzeugt ein Luftpolster.</li><li class="ml-1"><strong class="font-semibold">Kraftunterstützte Höhenverstellung:</strong> 6-fach von ca. 72–95 cm.</li><li class="ml-1"><strong class="font-semibold">Praktische Ablage:</strong> große Kunststoff-Ablage (ca. 40 × 32 cm) mit umlaufender Reling und Kabelhalter für alle gängigen Dampfbügelstationen.</li><li class="ml-1"><strong class="font-semibold">Flexibel:</strong> integrierte Steckdose für externe Geräte bis 2.300 W, 2 Rollen und 2 Füße für Niveauausgleich, Staufach für die Anschlussleitung.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Nennspannung: 230 V / 50 Hz</li><li class="ml-1">Leistungsaufnahme (Ventilator + Heizung): ca. 350 W</li><li class="ml-1">Max. Steckdosenleistung: 2.300 W</li><li class="ml-1">Bügelfläche: ca. 110 × 43 cm (Aluminium-Lochblech)</li><li class="ml-1">Höhenverstellung: 6-fach, ca. 72–95 cm</li><li class="ml-1">Maße zusammengeklappt: 130 × 50 × 24 cm</li><li class="ml-1">Bügeltischbezug: molton­gepolstert, mit Abdeckhaube</li><li class="ml-1">Gewicht: 16 kg</li><li class="ml-1">Garantie: 2 Jahre</li><li class="ml-1">Artikelnummer: 9999</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Opal Aktiver Bügeltisch – beheizt mit Absaugung | Planeta",
      meta_description:
        "Planeta Opal Aktiv-Bügeltisch: beheizte Alufläche (110 × 43 cm), Absaug- & Aufblasfunktion, 6-fach kraftunterstützte Höhe 72–95 cm, Steckdose bis 2.300 W.",
      meta_title_en: "Opal Active Ironing Table – Heated, with Suction | Planeta",
      meta_description_en:
        "Planeta Opal active ironing table: heated aluminium surface (110 × 43 cm), suction & blowing, 6-step power-assisted height 72–95 cm, socket up to 2,300 W.",
      meta_title_it: "Opal tavolo da stiro attivo – riscaldato, con aspirazione | Planeta",
      meta_description_it:
        "Planeta Opal tavolo da stiro attivo: superficie in alluminio riscaldata (110 × 43 cm), aspirazione e soffio, altezza assistita a 6 posizioni 72–95 cm, presa fino a 2.300 W.",
    },
  },
  translations: {
    "en-US": {
      title: "Opal Active Ironing Table – Heated, with Suction & Blowing",
      subtitle:
        "Active ironing table with heated aluminium surface, suction and blowing functions and power-assisted height adjustment",
      description:
        '<p class="mb-3 leading-relaxed">The active ironing table with comprehensive features: the heated perforated aluminium surface of the Planeta Opal leaves residual moisture no chance, while the suction and blowing functions hold the laundry in place or let it float on an air cushion. The power-assisted height adjustment makes setup effortless.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Heated surface:</strong> perforated aluminium (approx. 110 × 43 cm) against residual moisture.</li><li class="ml-1"><strong class="font-semibold">Suction & blowing:</strong> powerful fan holds the laundry in place or creates an air cushion.</li><li class="ml-1"><strong class="font-semibold">Power-assisted height adjustment:</strong> 6 steps from approx. 72–95 cm.</li><li class="ml-1"><strong class="font-semibold">Handy shelf:</strong> large plastic shelf (approx. 40 × 32 cm) with surrounding rail and cable holder for all common steam stations.</li><li class="ml-1"><strong class="font-semibold">Flexible:</strong> built-in socket for external devices up to 2,300 W, 2 rollers and 2 feet for levelling, storage compartment for the power cord.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Rated voltage: 230 V / 50 Hz</li><li class="ml-1">Power consumption (fan + heating): approx. 350 W</li><li class="ml-1">Max. socket power: 2,300 W</li><li class="ml-1">Ironing surface: approx. 110 × 43 cm (perforated aluminium)</li><li class="ml-1">Height adjustment: 6 steps, approx. 72–95 cm</li><li class="ml-1">Dimensions folded: 130 × 50 × 24 cm</li><li class="ml-1">Cover: molleton-padded, with protective hood</li><li class="ml-1">Weight: 16 kg</li><li class="ml-1">Warranty: 2 years</li><li class="ml-1">Article number: 9999</li></ul>',
    },
    "it-IT": {
      title: "Opal tavolo da stiro attivo – riscaldato, con aspirazione e soffio",
      subtitle:
        "Tavolo da stiro attivo con superficie in alluminio riscaldata, funzioni di aspirazione e soffio e regolazione dell\'altezza assistita",
      description:
        '<p class="mb-3 leading-relaxed">Il tavolo da stiro attivo con dotazione completa: la superficie in lamiera forata di alluminio riscaldata del Planeta Opal non lascia scampo all\'umidità residua, mentre le funzioni di aspirazione e soffio fissano la biancheria o la fanno galleggiare su un cuscino d\'aria. La regolazione dell\'altezza assistita rende la messa a punto senza sforzo.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Superficie riscaldata:</strong> alluminio forato (ca. 110 × 43 cm) contro l\'umidità residua.</li><li class="ml-1"><strong class="font-semibold">Aspirazione e soffio:</strong> ventilatore potente che fissa la biancheria o crea un cuscino d\'aria.</li><li class="ml-1"><strong class="font-semibold">Altezza assistita:</strong> 6 posizioni da ca. 72 a 95 cm.</li><li class="ml-1"><strong class="font-semibold">Ripiano pratico:</strong> ampio ripiano in plastica (ca. 40 × 32 cm) con ringhiera perimetrale e reggicavo per tutte le caldaie più diffuse.</li><li class="ml-1"><strong class="font-semibold">Flessibile:</strong> presa integrata per dispositivi esterni fino a 2.300 W, 2 ruote e 2 piedini per il livellamento, vano per il cavo di alimentazione.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Tensione nominale: 230 V / 50 Hz</li><li class="ml-1">Assorbimento (ventilatore + riscaldamento): ca. 350 W</li><li class="ml-1">Potenza massima presa: 2.300 W</li><li class="ml-1">Superficie di stiratura: ca. 110 × 43 cm (alluminio forato)</li><li class="ml-1">Regolazione altezza: 6 posizioni, ca. 72–95 cm</li><li class="ml-1">Dimensioni da chiuso: 130 × 50 × 24 cm</li><li class="ml-1">Rivestimento: imbottito in mollettone, con telo di copertura</li><li class="ml-1">Peso: 16 kg</li><li class="ml-1">Garanzia: 2 anni</li><li class="ml-1">Codice articolo: 9999</li></ul>',
    },
  },
  tags: ["Aktiv-Bügeltisch", "Bügeltisch", "Bügeltisch beheizt", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD69V09KQSHPVMJP6NH1DQ",
  handle: "dampfstation-px4500",
  base: {
    title: "Planeta PX4500 – Profi-Dampferzeuger mit 4,5-l-Kessel, bis 8 h Dampf",
    subtitle:
      "Professionelle Dampfstation mit 4,5-l-Edelstahlkessel und Profi-Bügeleisen – bis zu 8 Stunden Dampf, auch für Linkshänder",
    description:
      '<p class="mb-3 leading-relaxed">Dauerdampf für den Profi-Einsatz: Der Planeta PX4500 ist ein professioneller Dampferzeuger mit großem 4,5-l-Edelstahlkessel. Die hohe Kapazität sorgt für bis zu 8 Stunden Bügelautonomie – ideal für anspruchsvolles und häufiges Bügeln.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Lange Autonomie:</strong> 4,5-l-Edelstahlkessel (AISI 304, 1,5 mm) für bis zu 8 Stunden Dampf.</li><li class="ml-1"><strong class="font-semibold">Kräftiger Dampf:</strong> 1.450-W-Kesselheizung und bis zu 120 g/min Dampfleistung, manuell regelbar.</li><li class="ml-1"><strong class="font-semibold">Profi-Bügeleisen:</strong> mit Metallhaltestruktur und seitlichem Mikroschalter, leicht auf die andere Seite umsteckbar (auch für Linkshänder).</li><li class="ml-1"><strong class="font-semibold">Zuverlässig:</strong> professionelles Magnetventil mit integrierter Dampfversorgung, robuster Edelstahlkörper.</li><li class="ml-1"><strong class="font-semibold">Komfortabel:</strong> 3,4 m nutzbare Kabellänge und abnehmbare Silikonmatte.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Leistung: 2.300 W (220–240 V)</li><li class="ml-1">Kesselvolumen: 4,5 l</li><li class="ml-1">Kessel: AISI 304, 1,5 mm</li><li class="ml-1">Kesselheizleistung: 1.450 W</li><li class="ml-1">Bügeleisenleistung: 800 W</li><li class="ml-1">Dampfleistung: bis 120 g/min, manuell</li><li class="ml-1">Autonomie: bis zu 8 Stunden</li><li class="ml-1">Nutzbare Kabellänge: 3,4 m</li><li class="ml-1">Zubehör: abnehmbare Silikonmatte</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Planeta PX4500 – Profi-Dampferzeuger 4,5 l | Planeta",
      meta_description:
        "Planeta PX4500: Profi-Dampfstation mit 4,5-l-Edelstahlkessel (AISI 304), 2.300 W, bis 120 g/min Dampf und bis zu 8 h Autonomie. Profi-Bügeleisen, auch für Linkshänder.",
      meta_title_en: "Planeta PX4500 – Pro Steam Generator 4.5 l | Planeta",
      meta_description_en:
        "Planeta PX4500: pro steam station with 4.5 l stainless boiler (AISI 304), 2,300 W, up to 120 g/min steam and up to 8 h autonomy. Pro iron, also for left-handers.",
      meta_title_it: "Planeta PX4500 – generatore di vapore pro 4,5 l | Planeta",
      meta_description_it:
        "Planeta PX4500: caldaia professionale con serbatoio inox da 4,5 l (AISI 304), 2.300 W, fino a 120 g/min di vapore e fino a 8 h di autonomia. Ferro pro, anche per mancini.",
    },
  },
  translations: {
    "en-US": {
      title: "Planeta PX4500 – Pro Steam Generator with 4.5 l Boiler, up to 8 h Steam",
      subtitle:
        "Professional steam station with 4.5 l stainless boiler and a pro iron – up to 8 hours of steam, also for left-handers",
      description:
        '<p class="mb-3 leading-relaxed">Continuous steam for professional use: the Planeta PX4500 is a professional steam generator with a large 4.5 l stainless boiler. The high capacity delivers up to 8 hours of ironing autonomy – ideal for demanding and frequent ironing.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Long autonomy:</strong> 4.5 l stainless boiler (AISI 304, 1.5 mm) for up to 8 hours of steam.</li><li class="ml-1"><strong class="font-semibold">Powerful steam:</strong> 1,450 W boiler heating and up to 120 g/min steam output, manually adjustable.</li><li class="ml-1"><strong class="font-semibold">Pro iron:</strong> with metal support structure and side microswitch, easily moved to the other side (also for left-handers).</li><li class="ml-1"><strong class="font-semibold">Reliable:</strong> professional solenoid valve with integrated steam supply, robust stainless-steel body.</li><li class="ml-1"><strong class="font-semibold">Convenient:</strong> 3.4 m usable cable length and removable silicone mat.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Power: 2,300 W (220–240 V)</li><li class="ml-1">Boiler capacity: 4.5 l</li><li class="ml-1">Boiler: AISI 304, 1.5 mm</li><li class="ml-1">Boiler heating power: 1,450 W</li><li class="ml-1">Iron power: 800 W</li><li class="ml-1">Steam output: up to 120 g/min, manual</li><li class="ml-1">Autonomy: up to 8 hours</li><li class="ml-1">Usable cable length: 3.4 m</li><li class="ml-1">Accessories: removable silicone mat</li></ul>',
    },
    "it-IT": {
      title: "Planeta PX4500 – generatore di vapore pro con caldaia 4,5 l, fino a 8 h",
      subtitle:
        "Caldaia professionale con serbatoio inox da 4,5 l e ferro professionale – fino a 8 ore di vapore, anche per mancini",
      description:
        '<p class="mb-3 leading-relaxed">Vapore continuo per l\'uso professionale: il Planeta PX4500 è un generatore di vapore professionale con un\'ampia caldaia inox da 4,5 l. L\'elevata capacità garantisce fino a 8 ore di autonomia di stiratura – ideale per stirare spesso e con esigenze elevate.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Lunga autonomia:</strong> caldaia inox da 4,5 l (AISI 304, 1,5 mm) per fino a 8 ore di vapore.</li><li class="ml-1"><strong class="font-semibold">Vapore potente:</strong> riscaldamento caldaia da 1.450 W e fino a 120 g/min di vapore, regolabile manualmente.</li><li class="ml-1"><strong class="font-semibold">Ferro professionale:</strong> con struttura di supporto in metallo e microinterruttore laterale, spostabile facilmente sull\'altro lato (anche per mancini).</li><li class="ml-1"><strong class="font-semibold">Affidabile:</strong> elettrovalvola professionale con erogazione del vapore integrata, corpo robusto in acciaio inox.</li><li class="ml-1"><strong class="font-semibold">Comodo:</strong> 3,4 m di cavo utile e tappetino in silicone rimovibile.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Potenza: 2.300 W (220–240 V)</li><li class="ml-1">Volume caldaia: 4,5 l</li><li class="ml-1">Caldaia: AISI 304, 1,5 mm</li><li class="ml-1">Potenza riscaldamento caldaia: 1.450 W</li><li class="ml-1">Potenza ferro: 800 W</li><li class="ml-1">Erogazione vapore: fino a 120 g/min, manuale</li><li class="ml-1">Autonomia: fino a 8 ore</li><li class="ml-1">Lunghezza utile del cavo: 3,4 m</li><li class="ml-1">Accessori: tappetino in silicone rimovibile</li></ul>',
    },
  },
  tags: ["Dampferzeuger", "Dampfstation", "Dampfbügeleisen", "Profi-Bügeln", "Planeta"],
},
{
  productId: "prod_01KSMD66SPS2VQD8SXZNQXNZCF",
  handle: "dampfstation-px3000",
  base: {
    title: "Planeta PX3000 – Profi-Dampferzeuger mit 2,3-l-Kessel, bis 8 h Dampf",
    subtitle:
      "Professionelle Dampfstation mit 2,3-l-Edelstahlkessel und Profi-Bügeleisen – bis zu 8 Stunden Dampf, auch für Linkshänder",
    description:
      '<p class="mb-3 leading-relaxed">Dauerdampf für den Profi-Einsatz: Der Planeta PX3000 ist ein professioneller Dampferzeuger mit 2,3-l-Edelstahlkessel. Er liefert kräftigen, gleichmäßigen Dampf für bis zu 8 Stunden Bügelautonomie – ideal für häufiges Bügeln.</p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Lange Autonomie:</strong> 2,3-l-Edelstahlkessel (AISI 304, 1,5 mm) für bis zu 8 Stunden Dampf.</li><li class="ml-1"><strong class="font-semibold">Kräftiger Dampf:</strong> 1.450-W-Kesselheizung und bis zu 120 g/min Dampfleistung, manuell regelbar.</li><li class="ml-1"><strong class="font-semibold">Profi-Bügeleisen:</strong> mit Metallhaltestruktur und seitlichem Mikroschalter, leicht auf die andere Seite umsteckbar (auch für Linkshänder).</li><li class="ml-1"><strong class="font-semibold">Zuverlässig:</strong> professionelles Magnetventil mit integrierter Dampfversorgung, robuster Edelstahlkörper.</li><li class="ml-1"><strong class="font-semibold">Komfortabel:</strong> 3,4 m nutzbare Kabellänge und abnehmbare Silikonmatte.</li></ul>' +
      '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Technische Daten</strong></p>' +
      '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Leistung: 2.300 W (220–240 V)</li><li class="ml-1">Kesselvolumen: 2,3 l</li><li class="ml-1">Kessel: AISI 304, 1,5 mm</li><li class="ml-1">Kesselheizleistung: 1.450 W</li><li class="ml-1">Bügeleisenleistung: 800 W</li><li class="ml-1">Dampfleistung: bis 120 g/min, manuell</li><li class="ml-1">Autonomie: bis zu 8 Stunden</li><li class="ml-1">Nutzbare Kabellänge: 3,4 m</li><li class="ml-1">Zubehör: abnehmbare Silikonmatte</li><li class="ml-1">Artikelnummer: 1203</li></ul>',
  },
  metadata: {
    stripPrefixes: ["woo_"],
    set: {
      meta_title: "Planeta PX3000 – Profi-Dampferzeuger 2,3 l | Planeta",
      meta_description:
        "Planeta PX3000: Profi-Dampfstation mit 2,3-l-Edelstahlkessel (AISI 304), 2.300 W, bis 120 g/min Dampf und bis zu 8 h Autonomie. Profi-Bügeleisen, auch für Linkshänder.",
      meta_title_en: "Planeta PX3000 – Pro Steam Generator 2.3 l | Planeta",
      meta_description_en:
        "Planeta PX3000: pro steam station with 2.3 l stainless boiler (AISI 304), 2,300 W, up to 120 g/min steam and up to 8 h autonomy. Pro iron, also for left-handers.",
      meta_title_it: "Planeta PX3000 – generatore di vapore pro 2,3 l | Planeta",
      meta_description_it:
        "Planeta PX3000: caldaia professionale con serbatoio inox da 2,3 l (AISI 304), 2.300 W, fino a 120 g/min di vapore e fino a 8 h di autonomia. Ferro pro, anche per mancini.",
    },
  },
  translations: {
    "en-US": {
      title: "Planeta PX3000 – Pro Steam Generator with 2.3 l Boiler, up to 8 h Steam",
      subtitle:
        "Professional steam station with 2.3 l stainless boiler and a pro iron – up to 8 hours of steam, also for left-handers",
      description:
        '<p class="mb-3 leading-relaxed">Continuous steam for professional use: the Planeta PX3000 is a professional steam generator with a 2.3 l stainless boiler. It delivers strong, even steam for up to 8 hours of ironing autonomy – ideal for frequent ironing.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Long autonomy:</strong> 2.3 l stainless boiler (AISI 304, 1.5 mm) for up to 8 hours of steam.</li><li class="ml-1"><strong class="font-semibold">Powerful steam:</strong> 1,450 W boiler heating and up to 120 g/min steam output, manually adjustable.</li><li class="ml-1"><strong class="font-semibold">Pro iron:</strong> with metal support structure and side microswitch, easily moved to the other side (also for left-handers).</li><li class="ml-1"><strong class="font-semibold">Reliable:</strong> professional solenoid valve with integrated steam supply, robust stainless-steel body.</li><li class="ml-1"><strong class="font-semibold">Convenient:</strong> 3.4 m usable cable length and removable silicone mat.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Specifications</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Power: 2,300 W (220–240 V)</li><li class="ml-1">Boiler capacity: 2.3 l</li><li class="ml-1">Boiler: AISI 304, 1.5 mm</li><li class="ml-1">Boiler heating power: 1,450 W</li><li class="ml-1">Iron power: 800 W</li><li class="ml-1">Steam output: up to 120 g/min, manual</li><li class="ml-1">Autonomy: up to 8 hours</li><li class="ml-1">Usable cable length: 3.4 m</li><li class="ml-1">Accessories: removable silicone mat</li><li class="ml-1">Article number: 1203</li></ul>',
    },
    "it-IT": {
      title: "Planeta PX3000 – generatore di vapore pro con caldaia 2,3 l, fino a 8 h",
      subtitle:
        "Caldaia professionale con serbatoio inox da 2,3 l e ferro professionale – fino a 8 ore di vapore, anche per mancini",
      description:
        '<p class="mb-3 leading-relaxed">Vapore continuo per l\'uso professionale: il Planeta PX3000 è un generatore di vapore professionale con caldaia inox da 2,3 l. Eroga vapore potente e uniforme per fino a 8 ore di autonomia di stiratura – ideale per chi stira spesso.</p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1"><strong class="font-semibold">Lunga autonomia:</strong> caldaia inox da 2,3 l (AISI 304, 1,5 mm) per fino a 8 ore di vapore.</li><li class="ml-1"><strong class="font-semibold">Vapore potente:</strong> riscaldamento caldaia da 1.450 W e fino a 120 g/min di vapore, regolabile manualmente.</li><li class="ml-1"><strong class="font-semibold">Ferro professionale:</strong> con struttura di supporto in metallo e microinterruttore laterale, spostabile facilmente sull\'altro lato (anche per mancini).</li><li class="ml-1"><strong class="font-semibold">Affidabile:</strong> elettrovalvola professionale con erogazione del vapore integrata, corpo robusto in acciaio inox.</li><li class="ml-1"><strong class="font-semibold">Comodo:</strong> 3,4 m di cavo utile e tappetino in silicone rimovibile.</li></ul>' +
        '<p class="mb-3 leading-relaxed"><strong class="font-semibold">Dati tecnici</strong></p>' +
        '<ul class="list-disc pl-5 mb-3 space-y-1"><li class="ml-1">Potenza: 2.300 W (220–240 V)</li><li class="ml-1">Volume caldaia: 2,3 l</li><li class="ml-1">Caldaia: AISI 304, 1,5 mm</li><li class="ml-1">Potenza riscaldamento caldaia: 1.450 W</li><li class="ml-1">Potenza ferro: 800 W</li><li class="ml-1">Erogazione vapore: fino a 120 g/min, manuale</li><li class="ml-1">Autonomia: fino a 8 ore</li><li class="ml-1">Lunghezza utile del cavo: 3,4 m</li><li class="ml-1">Accessori: tappetino in silicone rimovibile</li><li class="ml-1">Codice articolo: 1203</li></ul>',
    },
  },
  tags: ["Dampferzeuger", "Dampfstation", "Dampfbügeleisen", "Profi-Bügeln", "Planeta"],
},
]
