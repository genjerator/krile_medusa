import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Vakuumbeutel-Stärke erklärt: Welche Stärke
 * brauchen Sie?" as a DRAFT (hidden on the storefront until you publish it from
 * the admin Articles page). Idempotent: if an article with this slug already
 * exists it is left untouched.
 *
 * Content lives in exported constants so the publisher
 * (publish-article-vakuumbeutel-staerke.ts) can reuse the exact copy.
 *
 * Body is rich-text HTML — the magazine renders only h2/h3/p/strong/a/ul/li/
 * ol/li/blockquote (NO table styling), so the "comparison tables" (micron/mil
 * conversion, thickness ranges, quick recommendation) are expressed as
 * structured lists, not <table>s.
 *
 * Claims are deliberately conservative: a thicker bag gives better puncture
 * resistance but NOT automatically better preservation — material, oxygen
 * barrier, seal strength, machine compatibility and temperature rating matter
 * too. Micron↔mil figures and thickness recommendations are general guidelines.
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-vakuumbeutel-staerke.ts
 */

export const SLUG = "vakuumbeutel-staerke-mikron"

export const TITLE =
  "Vakuumbeutel-Stärke erklärt: Welche Stärke brauchen Sie?"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Vakuumbeutel gibt es in verschiedenen Stärken – von 60 bis 160 µm. Wir erklären, was Mikron bedeuten, welche Stärke für Fleisch, Fisch, Gemüse oder Sous-vide passt und warum dicker nicht automatisch besser ist."

export const META_TITLE =
  "Vakuumbeutel-Stärke: 70, 90, 120 oder 160 Mikron?"

export const META_DESCRIPTION =
  "Die Unterschiede zwischen 70, 90, 100 und 120 µm Vakuumbeuteln einfach erklärt. Welche Stärke eignet sich für Fleisch, Fisch, Gemüse und Sous-vide – und ist dicker wirklich besser?"

export const BODY = `
<p>Vakuumbeutel gibt es in unterschiedlichen Stärken – und die richtige Wahl ist wichtig, um Lebensmittel zu schützen, undichte Stellen zu vermeiden und das beste Ergebnis aus Ihrem <strong>Vakuumierer</strong> herauszuholen.</p>
<p>Doch was bedeutet die Beutelstärke eigentlich? Ist ein dickerer <strong>Vakuumbeutel</strong> immer besser? Und welche Stärke sollten Sie für Fleisch, Fisch, Gemüse oder die Langzeitlagerung im Gefrierfach verwenden? Schauen wir es uns an.</p>

<h2>1. Vakuumbeutel-Stärke verstehen</h2>
<p>Die Stärke von Vakuumbeuteln wird üblicherweise in Mikron (µm) oder Mil angegeben.</p>
<ul>
  <li><strong>Mikron (µm):</strong> ein Tausendstel Millimeter.</li>
  <li><strong>Mil:</strong> ein Tausendstel Zoll (entspricht 25,4 Mikron).</li>
</ul>
<p>Zur Orientierung, Mikron ↔ Mil:</p>
<ul>
  <li><strong>60 µm</strong> ≈ 2,36 mil</li>
  <li><strong>70 µm</strong> ≈ 2,76 mil</li>
  <li><strong>80 µm</strong> ≈ 3,15 mil</li>
  <li><strong>90 µm</strong> ≈ 3,54 mil</li>
  <li><strong>100 µm</strong> ≈ 3,94 mil</li>
  <li><strong>120 µm</strong> ≈ 4,72 mil</li>
</ul>
<p>Ein dickerer Beutel bietet in der Regel einen besseren Schutz gegen Durchstiche und mechanische Beschädigungen. Entscheidend sind aber auch Materialqualität, Aufbau und die Kompatibilität mit Ihrem Gerät.</p>

<h2>2. Die gängigen Beutelstärken im Vergleich</h2>
<p>Ein praktischer Überblick über die häufigsten Stärkebereiche und ihre Einsatzgebiete:</p>
<ul>
  <li><strong>60–70 µm:</strong> für Gemüse, Obst, Fleisch ohne Knochen und Trockenlebensmittel. <strong>Vorteil:</strong> flexibel und günstig.</li>
  <li><strong>80–90 µm:</strong> für Rind, Schwein, Hähnchen, Fisch und Käse. <strong>Vorteil:</strong> gute Balance aus Stärke und Flexibilität.</li>
  <li><strong>100–120 µm:</strong> für Fleisch mit Knochen, größere Stücke und härtere Lebensmittel. <strong>Vorteil:</strong> bessere Durchstichfestigkeit.</li>
  <li><strong>140–160 µm:</strong> für schwere Produkte, scharfe Kanten und anspruchsvolle Lagerung. <strong>Vorteil:</strong> zusätzlicher mechanischer Schutz.</li>
</ul>
<p>Das sind allgemeine Richtwerte. Die tatsächliche Leistung hängt von Material, Anzahl der Schichten, Fertigungsqualität und Verwendungszweck ab.</p>

<h2>3. Welche Vakuumbeutel-Stärke sollten Sie verwenden?</h2>
<h3>60–70 Mikron – für die tägliche Lagerung</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-60.jpg" alt="60-Mikron-Vakuumbeutel für die tägliche Lagerung" title="60 Mikron" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>Geeignet für Hähnchen ohne Knochen, Gemüse, Obst, Brot, Nüsse und andere relativ weiche Produkte. Eine gute, günstige Wahl für alltägliche Portionen.</p>
<h3>80–90 Mikron – der Allrounder</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-90.jpg" alt="90-Mikron-Vakuumbeutel als vielseitiger Allrounder" title="90 Mikron" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>Eine vielseitige Option für Rindersteaks, Schwein, Hähnchenteile, Fischfilets, Käse und die alltägliche Lagerung im Gefrierfach.</p>
<h3>100–120 Mikron – für anspruchsvollere Produkte</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-120.jpg" alt="120-Mikron-Vakuumbeutel für anspruchsvollere Produkte" title="120 Mikron" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>Besser geeignet für Fleisch mit Knochen, größere Stücke, Produkte mit harten Kanten und Lebensmittel, die häufig bewegt werden.</p>
<h3>140–160 Mikron – für den harten Einsatz</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-160.jpg" alt="160-Mikron-Vakuumbeutel für den harten Einsatz" title="160 Mikron" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>Für anspruchsvolle Anwendungen: schwere Produkte, scharfe Kanten und die gewerbliche Lebensmittelverpackung, bei der zusätzliche Robustheit gefragt ist.</p>

<h2>4. Ist ein dickerer Vakuumbeutel immer die bessere Qualität?</h2>
<p>Nicht unbedingt! Ein dickerer Beutel ist widerstandsfähiger gegen Durchstiche und Risse – eine bessere Haltbarkeit der Lebensmittel bedeutet das aber nicht automatisch. Es gibt mehrere weitere Faktoren:</p>
<ul>
  <li><strong>Materialzusammensetzung:</strong> PA/PE-Mehrschichtfolien verbinden mechanische Festigkeit mit einer Sauerstoffbarriere und einer siegelfähigen Schicht.</li>
  <li><strong>Sauerstoffbarriere:</strong> wichtig, um Oxidation zu verlangsamen und die Qualität zu erhalten.</li>
  <li><strong>Nahtfestigkeit:</strong> eine zuverlässige Schweißnaht verhindert, dass Luft in die Verpackung gelangt.</li>
  <li><strong>Gerätekompatibilität:</strong> der Beutel muss zu Ihrem konkreten Vakuumierer passen.</li>
  <li><strong>Temperaturbeständigkeit:</strong> nicht jeder Vakuumbeutel eignet sich für Sous-vide oder zum Erhitzen.</li>
</ul>
<p>Beispiel: Ein hochwertiger 80-µm-Mehrschichtbeutel kann besser abschneiden als ein schlecht verarbeiteter 100-µm-Beutel.</p>

<h2>5. Glatt oder geprägt: Spielt die Stärke eine Rolle?</h2>
<p>Neben der Stärke ist die Oberflächenstruktur eines Vakuumbeutels ein weiterer wichtiger Punkt.</p>
<h3>Glatte Vakuumbeutel</h3>
<ul>
  <li>beidseitig glatte Oberfläche,</li>
  <li>in erster Linie für Kammervakuumierer gedacht,</li>
  <li>verbreitet in Metzgereien, Restaurants und der Lebensmittelproduktion.</li>
</ul>
<h3>Geprägte (strukturierte) Vakuumbeutel</h3>
<ul>
  <li>strukturierte oder gemusterte Oberfläche,</li>
  <li>für Außenvakuumierer (Absaugvakuumierer) konzipiert,</li>
  <li>die Prägung bildet Kanäle, durch die die Luft entweichen kann.</li>
</ul>
<blockquote><p><strong>Wichtig:</strong> Ein dickerer Beutel ist nicht automatisch mit jedem Vakuumierer kompatibel. Prüfen Sie immer den vom Hersteller empfohlenen Beuteltyp und die maximale Stärke.</p></blockquote>

<h2>6. Und beim Sous-vide-Garen?</h2>
<p>Wenn Sie Lebensmittel im Wasserbad nach der Sous-vide-Methode garen möchten, ist die Beutelwahl besonders wichtig. Nicht jeder Vakuumbeutel ist dafür ausgelegt, längere Zeit hohen Temperaturen standzuhalten.</p>
<p>Achten Sie auf Beutel, die ausdrücklich für Sous-vide zertifiziert bzw. geeignet sind, und prüfen Sie die maximale Temperatur und Gardauer. Manche Spezialbeutel vertragen je nach Aufbau Temperaturen von 100–121 °C.</p>

<h2>7. So wählen Sie den richtigen Vakuumbeutel</h2>
<p>Eine schnelle Empfehlung als Ausgangspunkt:</p>
<ul>
  <li><strong>Alltägliche Lagerung:</strong> 70–90 µm</li>
  <li><strong>Fleisch und Fisch:</strong> 80–90 µm</li>
  <li><strong>Fleisch mit Knochen:</strong> 100–120 µm</li>
  <li><strong>Schwere Verpackung / gewerblich:</strong> 140–160 µm</li>
  <li><strong>Sous-vide:</strong> temperaturbeständiger, dafür zugelassener Beutel</li>
</ul>

<h2>Fazit: Die richtige Stärke für Ihren Bedarf</h2>
<p>Den richtigen Vakuumbeutel zu wählen heißt, die passende Balance aus Robustheit, Flexibilität, Schutz und Preis zu finden. Für die meisten Haushalte bieten <strong>80–90-µm-Vakuumbeutel</strong> ein praktisches Gleichgewicht für die alltägliche Lagerung. Wer regelmäßig Fleisch mit Knochen oder Produkte mit scharfen Kanten verpackt, sollte zu dickeren Varianten greifen.</p>
<p>Denken Sie daran: Der beste Vakuumbeutel ist nicht zwangsläufig der dickste. Es ist der, der zu Ihren Lebensmitteln, Ihrem Vakuumierer und Ihren Lageranforderungen passt.</p>

<h2>Häufige Fragen (FAQ)</h2>
<h3>Was bedeutet die Angabe in Mikron (µm)?</h3>
<p>Mikron ist das Maß für die Folienstärke – ein Mikron ist ein Tausendstel Millimeter. Je höher der Wert, desto dicker und in der Regel robuster der Beutel gegen Durchstiche.</p>
<h3>Welche Stärke ist für den Haushalt ideal?</h3>
<p>Für die meisten Anwendungen sind 80–90 µm der beste Kompromiss aus Stärke, Flexibilität und Preis. Für Fleisch mit Knochen oder scharfkantige Produkte sind 100–120 µm sinnvoll.</p>
<h3>Kann ich geprägte Beutel im Kammervakuumierer verwenden?</h3>
<p>Kammervakuumierer arbeiten mit glatten Beuteln. Geprägte Beutel sind für Außenvakuumierer gedacht – die Kanäle der Prägung ermöglichen dort das Absaugen der Luft.</p>
<h3>Sind alle Vakuumbeutel für Sous-vide geeignet?</h3>
<p>Nein. Verwenden Sie nur Beutel, die ausdrücklich für Sous-vide zugelassen sind, und beachten Sie die angegebene Maximaltemperatur und Gardauer.</p>

<p>Sie suchen die passenden <a href="/de/categories/vakuumspeicherung">Vakuumbeutel, Rollen und Vakuumierer</a>? Entdecken Sie die Vakuumierlösungen von Planeta – oder sprechen Sie uns an, wir helfen Ihnen gern bei der Auswahl.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "Vacuum bag thickness explained: which thickness do you need?"

export const EXCERPT_EN =
  "Vacuum bags come in different thicknesses, from 60 to 160 µm. We explain what microns mean, which thickness suits meat, fish, vegetables or sous-vide, and why thicker isn't automatically better."

export const META_TITLE_EN =
  "Vacuum Bag Thickness Guide: 70, 90, 120 or 160 Microns?"

export const META_DESCRIPTION_EN =
  "Learn the differences between 70, 90, 100 and 120 micron vacuum bags. Discover which thickness is best for meat, fish, vegetables and sous-vide cooking."

export const BODY_EN = `
<p>Vacuum bags come in different thicknesses, and choosing the right one is important for protecting food, preventing leaks and getting the best results from your <strong>vacuum sealer</strong>.</p>
<p>But what does bag thickness actually mean? Is a thicker vacuum bag always better? And which thickness should you use for meat, fish, vegetables or long-term freezer storage? Let's break it down.</p>

<h2>1. Understanding vacuum bag thickness</h2>
<p>Vacuum bag thickness is usually measured in microns (µm) or mils.</p>
<ul>
  <li><strong>Micron (µm):</strong> one thousandth of a millimetre.</li>
  <li><strong>Mil:</strong> one thousandth of an inch (25.4 microns).</li>
</ul>
<p>For reference, microns ↔ mils:</p>
<ul>
  <li><strong>60 µm</strong> ≈ 2.36 mil</li>
  <li><strong>70 µm</strong> ≈ 2.76 mil</li>
  <li><strong>80 µm</strong> ≈ 3.15 mil</li>
  <li><strong>90 µm</strong> ≈ 3.54 mil</li>
  <li><strong>100 µm</strong> ≈ 3.94 mil</li>
  <li><strong>120 µm</strong> ≈ 4.72 mil</li>
</ul>
<p>A thicker bag generally provides better resistance to punctures and mechanical damage. However, material quality, construction and sealing compatibility also matter.</p>

<h2>2. Comparing different vacuum bag thicknesses</h2>
<p>A practical guide to the most common thickness ranges and their applications:</p>
<ul>
  <li><strong>60–70 µm:</strong> vegetables, fruit, boneless meat, dry food. <strong>Main advantage:</strong> flexible and economical.</li>
  <li><strong>80–90 µm:</strong> beef, pork, chicken, fish, cheese. <strong>Main advantage:</strong> good balance of strength and flexibility.</li>
  <li><strong>100–120 µm:</strong> bone-in meat, larger cuts, harder foods. <strong>Main advantage:</strong> better puncture resistance.</li>
  <li><strong>140–160 µm:</strong> heavy products, sharp edges, demanding storage. <strong>Main advantage:</strong> extra mechanical protection.</li>
</ul>
<p>These are general guidelines. Actual performance depends on the bag material, number of layers, manufacturing quality and intended use.</p>

<h2>3. Which vacuum bag thickness should you use?</h2>
<h3>60–70 microns – everyday food storage</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-60.jpg" alt="60-micron vacuum bag for everyday food storage" title="60 microns" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>Suitable for boneless chicken, vegetables, fruit, bread, nuts and other relatively soft products. A good economical choice for everyday portions.</p>
<h3>80–90 microns – general-purpose storage</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-90.jpg" alt="90-micron vacuum bag for general-purpose storage" title="90 microns" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>A versatile option for beef steaks, pork, chicken portions, fish fillets, cheese and everyday freezer storage.</p>
<h3>100–120 microns – more demanding products</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-120.jpg" alt="120-micron vacuum bag for more demanding products" title="120 microns" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>Better suited to bone-in meat, larger cuts, products with harder edges and food that will be handled frequently.</p>
<h3>140–160 microns – heavy-duty protection</h3>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumbeutel-staerke-160.jpg" alt="160-micron vacuum bag for heavy-duty protection" title="160 microns" style="max-width:340px;width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p>Designed for demanding applications, including heavy products, sharp edges and commercial food packaging where additional durability is needed.</p>

<h2>4. Does a thicker vacuum bag always mean better quality?</h2>
<p>Not necessarily! A thicker bag offers better resistance to punctures and tearing, but it doesn't automatically provide better food preservation. There are several other factors to consider:</p>
<ul>
  <li><strong>Material composition:</strong> PA/PE multilayer films combine mechanical strength with an oxygen barrier and a heat-sealable layer.</li>
  <li><strong>Oxygen barrier:</strong> important for slowing oxidation and preserving food quality.</li>
  <li><strong>Seal strength:</strong> a reliable seal prevents air from entering the package.</li>
  <li><strong>Machine compatibility:</strong> the bag must work with your particular vacuum sealer.</li>
  <li><strong>Temperature resistance:</strong> not every vacuum bag is suitable for sous-vide cooking or boiling.</li>
</ul>
<p>For example, an 80-micron high-quality multilayer bag can perform better than a poorly manufactured 100-micron bag.</p>

<h2>5. Smooth vs. embossed vacuum bags: does thickness matter?</h2>
<p>Besides thickness, the surface structure of a vacuum bag is another important consideration.</p>
<h3>Smooth vacuum bags</h3>
<ul>
  <li>flat surfaces on both sides,</li>
  <li>designed primarily for chamber vacuum sealers,</li>
  <li>commonly used in butcher shops, restaurants and food production.</li>
</ul>
<h3>Embossed vacuum bags</h3>
<ul>
  <li>textured or patterned surface,</li>
  <li>designed for external suction vacuum sealers,</li>
  <li>the texture creates channels that allow air to escape.</li>
</ul>
<blockquote><p><strong>Important:</strong> a thicker bag is not automatically compatible with every vacuum sealer. Always check the manufacturer's recommended bag type and maximum thickness.</p></blockquote>

<h2>6. What about sous-vide cooking?</h2>
<p>If you plan to cook food in a water bath using the sous-vide method, choosing the correct bag is particularly important. Not every vacuum bag is designed to withstand prolonged exposure to high temperatures.</p>
<p>Look for bags specifically certified or rated for sous-vide cooking, and check their maximum temperature and cooking duration. Some specialised bags support temperatures up to 100–121 °C, depending on their construction.</p>

<h2>7. How to choose the right vacuum bag</h2>
<p>A quick recommendation as a starting point:</p>
<ul>
  <li><strong>Everyday food storage:</strong> 70–90 µm</li>
  <li><strong>Meat and fish:</strong> 80–90 µm</li>
  <li><strong>Bone-in meat:</strong> 100–120 µm</li>
  <li><strong>Heavy-duty / commercial packaging:</strong> 140–160 µm</li>
  <li><strong>Sous-vide cooking:</strong> a temperature-rated bag</li>
</ul>

<h2>Conclusion: choose the right thickness for your needs</h2>
<p>Choosing the right vacuum bag is about finding the right balance between durability, flexibility, protection and price. For most households, <strong>80–90 micron vacuum bags</strong> offer a practical balance for everyday food storage. If you regularly package bone-in meat or products with sharp edges, consider thicker options.</p>
<p>Remember: the best vacuum bag isn't necessarily the thickest one. It's the one that matches your food, your vacuum sealer and your storage requirements.</p>

<h2>Frequently asked questions (FAQ)</h2>
<h3>What does the micron (µm) figure mean?</h3>
<p>Microns measure the film thickness – one micron is a thousandth of a millimetre. The higher the number, the thicker and generally more puncture-resistant the bag.</p>
<h3>Which thickness is ideal for home use?</h3>
<p>For most applications, 80–90 µm is the best compromise of strength, flexibility and price. For bone-in meat or sharp-edged products, 100–120 µm makes sense.</p>
<h3>Can I use embossed bags in a chamber sealer?</h3>
<p>Chamber sealers work with smooth bags. Embossed bags are made for external sealers – the channels in the texture are what let the air be drawn out there.</p>
<h3>Are all vacuum bags suitable for sous-vide?</h3>
<p>No. Only use bags explicitly rated for sous-vide, and observe the stated maximum temperature and cooking time.</p>

<p>Looking for the right <a href="/en/categories/vakuumspeicherung">vacuum bags, rolls and sealers</a>? Explore Planeta's vacuum sealing products – or get in touch, we are happy to help you choose.</p>
`.trim()

export default async function seedArticle({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const service: any = container.resolve(ARTICLE_MODULE)

  const [existing] = await service.listArticles({ slug: SLUG }, { take: 1 })
  if (existing) {
    logger.info(
      `[seed-article] '${SLUG}' already exists (id=${existing.id}, status=${existing.status}) — skipping, nothing changed.`
    )
    return
  }

  const author_id = await ensureArticleAuthor(container)

  const article = await service.createArticles({
    slug: SLUG,
    title: TITLE,
    status: "draft",
    published_at: null,
    category: CATEGORY,
    excerpt: EXCERPT,
    body: BODY,
    meta_title: META_TITLE,
    meta_description: META_DESCRIPTION,
    title_en: TITLE_EN,
    excerpt_en: EXCERPT_EN,
    body_en: BODY_EN,
    meta_title_en: META_TITLE_EN,
    meta_description_en: META_DESCRIPTION_EN,
    author_id,
  })

  logger.info(
    `[seed-article] created draft '${SLUG}' (id=${article.id}). Review and publish it from the admin Articles page.`
  )
}
