import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Wie lange hält Fleisch? Normale Beutel vs.
 * Vakuumieren" as a DRAFT (hidden on the storefront until you publish it from
 * the admin Articles page). Idempotent: if an article with this slug already
 * exists it is left untouched.
 *
 * Content lives in exported constants so the publisher
 * (publish-article-wie-lange-haelt-fleisch.ts) can reuse the exact copy.
 *
 * Body is rich-text HTML — the magazine renders only h2/h3/p/strong/a/ul/li/
 * ol/li/blockquote (NO table styling), so the "comparison tables" (fridge
 * storage times, freezer quality comparison) are expressed as structured
 * lists, not <table>s.
 *
 * Claims are deliberately conservative: vacuum sealing improves QUALITY
 * preservation (less oxidation, less freezer burn) — it does NOT sterilise
 * food, stop all bacterial growth or guarantee longer microbiological safety.
 * Freezer-storage figures are indicative quality estimates, not guarantees.
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-wie-lange-haelt-fleisch.ts
 */

export const SLUG = "wie-lange-haelt-fleisch-vakuumieren"

export const TITLE =
  "Wie lange hält Fleisch? Normale Beutel vs. Vakuumieren"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Fleisch verdirbt schnell, sobald es Luft ausgesetzt ist. Wir vergleichen die Haltbarkeit im normalen Beutel und im Vakuumbeutel – im Kühlschrank und im Gefrierfach – und zeigen, wie Sie Gefrierbrand vermeiden und mehr aus jedem Einkauf herausholen."

export const META_TITLE =
  "Wie lange hält Fleisch? Normale Beutel vs. Vakuumieren"

export const META_DESCRIPTION =
  "Wie lange bleibt Fleisch frisch – im normalen Beutel oder vakuumiert? Lagerzeiten im Kühlschrank und Gefrierfach im Vergleich und wie Vakuumieren Gefrierbrand und Lebensmittelverschwendung reduziert."

export const BODY = `
<p>Fleisch gehört zu den Lebensmitteln, die relativ schnell verderben – besonders, wenn es Luft ausgesetzt ist und falsch gelagert wird. Egal, ob Sie Fleisch auf Vorrat kaufen, Mahlzeiten vorbereiten oder einfach <strong>Lebensmittelverschwendung reduzieren</strong> möchten: Die richtige Lagerung macht einen großen Unterschied.</p>
<p>Eine der wirksamsten Methoden, um die Qualität von Fleisch zu erhalten, ist das <strong>Vakuumieren</strong>. Doch <strong>wie lange hält Fleisch</strong> im Vakuumbeutel tatsächlich länger als in einem herkömmlichen Plastikbeutel? Schauen wir uns die Unterschiede an.</p>

<h2>1. Wie lange hält Fleisch in normaler Verpackung?</h2>
<p>Wird Fleisch in gewöhnlichen Plastikbeuteln, Dosen oder der Supermarktverpackung gelagert, bleibt es einer gewissen Menge Sauerstoff ausgesetzt. Das begünstigt Oxidation, Qualitätsverlust und Gefrierbrand.</p>
<p>Für rohes Fleisch im Kühlschrank bei 0–4 °C gelten üblicherweise diese Richtwerte:</p>
<ul>
  <li><strong>Hähnchen:</strong> 1–2 Tage</li>
  <li><strong>Hackfleisch (Rind):</strong> 1–2 Tage</li>
  <li><strong>Schwein:</strong> 2–3 Tage</li>
  <li><strong>Rindersteaks:</strong> 3–5 Tage</li>
  <li><strong>Lamm:</strong> 3–5 Tage</li>
  <li><strong>Frischer Fisch:</strong> 1–2 Tage</li>
</ul>
<p>Diese Angaben setzen eine sachgemäße Kühlung und Handhabung voraus. Beachten Sie immer das Verbrauchsdatum und die Lagerhinweise des Herstellers.</p>

<h2>2. Wie verlängert Vakuumieren die Frische?</h2>
<p>Beim Vakuumieren wird einem speziell dafür vorgesehenen Beutel vor dem Verschweißen der größte Teil der Luft entzogen. Das reduziert den Sauerstoffkontakt deutlich, verlangsamt die Oxidation und hilft, die Qualität der Lebensmittel zu bewahren.</p>
<p>Die wichtigsten Vorteile:</p>
<ul>
  <li><strong>Weniger Oxidation:</strong> Weniger Sauerstoff hilft, Farbe, Geschmack und Textur des Fleisches zu erhalten.</li>
  <li><strong>Weniger Gefrierbrand:</strong> Die Vakuumverpackung schützt das Fleisch vor direktem Kontakt mit kalter, trockener Luft.</li>
  <li><strong>Bessere Organisation:</strong> Vakuumierte Portionen sind kompakt, lassen sich leicht beschriften und stapeln.</li>
  <li><strong>Weniger Lebensmittelverschwendung:</strong> Sie können größere Einkäufe in kleinere Portionen aufteilen und das, was Sie nicht sofort brauchen, einlagern.</li>
</ul>
<blockquote><p><strong>Wichtig:</strong> Vakuumieren sterilisiert Lebensmittel nicht und stoppt nicht jedes Bakterienwachstum. Fleisch muss weiterhin bei der richtigen Temperatur gekühlt oder eingefroren werden.</p></blockquote>

<h2>3. Normale Beutel vs. Vakuumbeutel im Gefrierfach</h2>
<p>Einfrieren ist eine der besten Methoden, um Fleisch über längere Zeit haltbar zu machen. Herkömmliche Verpackungen lassen jedoch oft Luft an das Lebensmittel – das Ergebnis sind Gefrierbrand sowie Einbußen bei Textur und Geschmack. Vakuumieren bildet eine deutlich bessere Barriere gegen Luftkontakt.</p>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/wie-lange-haelt-fleisch-regular.jpg" alt="Fleisch in herkömmlicher Verpackung – Luft bleibt rund um das Produkt zurück" title="Normale Verpackung" style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p><strong>Normale Verpackung:</strong> Rund um das Fleisch bleibt Luft zurück – das begünstigt Oxidation und Gefrierbrand.</p>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/wie-lange-haelt-fleisch-vacuum.jpg" alt="Vakuumiertes Fleisch – der Beutel liegt eng an, kaum Luft bleibt zurück" title="Vakuumverpackung" style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p><strong>Vakuumverpackung:</strong> Der Beutel liegt eng am Fleisch an, kaum Luft bleibt zurück – deutlich besserer Schutz vor Gefrierbrand.</p>
<p>Orientierungswerte für die <strong>Qualitäts</strong>-Lagerung bei −18 °C oder kälter (normale Verpackung → Vakuumverpackung):</p>
<ul>
  <li><strong>Rind:</strong> 6–12 Monate → 2–3 Jahre</li>
  <li><strong>Schwein:</strong> 4–6 Monate → 2–3 Jahre</li>
  <li><strong>Hähnchen:</strong> 9–12 Monate → 2–3 Jahre</li>
  <li><strong>Hackfleisch:</strong> 3–4 Monate → 1–2 Jahre</li>
  <li><strong>Fisch:</strong> 2–8 Monate → 1–2 Jahre</li>
</ul>
<p>Diese Vakuum-Zeiten sind indikative Qualitätsschätzungen, keine allgemeingültigen Garantien. Bei konstant −18 °C bleibt korrekt eingefrorenes Fleisch grundsätzlich unbegrenzt sicher – die Qualität kann mit der Zeit jedoch nachlassen.</p>

<h2>4. Warum ist vakuumiertes Fleisch besser geschützt?</h2>
<p>Der entscheidende Unterschied ist der Luftkontakt. In einem herkömmlichen Beutel bleibt Luft rund um das Produkt zurück. Beim Einfrieren begünstigt das Feuchtigkeitsverlust und Gefrierbrand.</p>
<p>Vakuumbeutel liegen eng am Fleisch an und verringern so die eingeschlossene Luftmenge. Das hilft, zu bewahren:</p>
<ul>
  <li>die natürliche Feuchtigkeit,</li>
  <li>die ursprüngliche Textur,</li>
  <li>Geschmack und Gesamtqualität,</li>
  <li>das Aussehen nach dem Auftauen.</li>
</ul>
<p>Das Ergebnis ist Fleisch in besserer Qualität, wenn Sie Ihre nächste Mahlzeit zubereiten.</p>

<h2>5. Fleisch richtig vakuumieren – Schritt für Schritt</h2>
<ol>
  <li><strong>Fleisch vorbereiten:</strong> in Portionen teilen, die zu einzelnen Mahlzeiten passen.</li>
  <li><strong>Kühl arbeiten:</strong> mit gekühltem Fleisch arbeiten und es nicht bei Zimmertemperatur liegen lassen.</li>
  <li><strong>Passenden Beutel wählen:</strong> Beutel verwenden, die für Ihren Vakuumierer vorgesehen sind.</li>
  <li><strong>Genug Platz lassen:</strong> den Schweißbereich sauber halten und oben ausreichend Rand frei lassen.</li>
  <li><strong>Vakuumieren und verschweißen:</strong> die Luft entfernen und darauf achten, dass die Naht vollständig verschlossen ist.</li>
  <li><strong>Beschriften:</strong> Fleischart und Einfrierdatum notieren.</li>
  <li><strong>Sofort lagern:</strong> das Paket ohne Verzögerung kühlen oder einfrieren.</li>
</ol>
<p>Für die Langzeitlagerung ist das Einfrieren die bevorzugte Variante. Vakuumieren allein macht rohes Fleisch nicht über die üblichen lebensmittelhygienischen Empfehlungen hinaus kühlschranktauglich.</p>
<blockquote><p><strong>Wichtig:</strong> Vakuumverpacktes rohes Fleisch muss gekühlt oder eingefroren bleiben. Bestimmte schädliche Keime können sich auch in sauerstoffarmer Umgebung vermehren – verlassen Sie sich daher niemals auf das Vakuum als Ersatz für die Temperaturkontrolle.</p></blockquote>

<h2>6. Lohnt sich ein Vakuumierer?</h2>
<p>Wenn Sie regelmäßig größere Mengen Fleisch kaufen, Mahlzeiten vorbereiten oder Lebensmittel für später einfrieren, kann ein <strong>Vakuumierer</strong> eine sinnvolle Investition sein. Das spricht dafür:</p>
<ul>
  <li>größere Mengen kaufen und in praktische Portionen aufteilen,</li>
  <li>gefrorenes Fleisch vor Gefrierbrand schützen,</li>
  <li>Ordnung im Gefrierfach behalten,</li>
  <li>die Qualität der Lebensmittel länger erhalten,</li>
  <li>unnötige Lebensmittelverschwendung reduzieren.</li>
</ul>
<p>Mit der Zeit hilft eine bessere Lagerung, Ihr Lebensmittelbudget effizienter zu nutzen.</p>

<h2>Fazit: Bessere Lagerung beginnt mit besserer Verpackung</h2>
<p>Normale Plastikbeutel können für die kurzfristige Aufbewahrung ausreichen, bieten aber weniger Schutz gegen Luftkontakt – vor allem im Gefrierfach. Vakuumieren ist der wirksamere Weg, die Qualität von Fleisch zu schützen, Gefrierbrand zu reduzieren und die Vorratshaltung zu organisieren.</p>
<p>Ob Hähnchen, Rind, Schwein oder Fisch: Ein Vakuumierer hilft Ihnen, aus jedem Einkauf mehr herauszuholen.</p>

<h2>Häufige Fragen (FAQ)</h2>
<h3>Wie lange hält vakuumiertes Fleisch im Kühlschrank?</h3>
<p>Vakuumieren verlängert vor allem die Qualität bei der Lagerung, ersetzt aber nicht die Kühlung. Halten Sie sich für rohes Fleisch an die üblichen Kühlschrank-Richtwerte und das Verbrauchsdatum des Herstellers. Für eine lange Lagerung ist Einfrieren die bessere Wahl.</p>
<h3>Macht Vakuumieren Fleisch länger sicher?</h3>
<p>Nein. Vakuumieren verbessert die Qualitätserhaltung – es sterilisiert nicht und stoppt nicht jedes Bakterienwachstum. Die Temperaturkontrolle (Kühlen oder Einfrieren) bleibt entscheidend.</p>
<h3>Verhindert Vakuumieren Gefrierbrand?</h3>
<p>Es reduziert ihn deutlich. Weil kaum Luft im Beutel verbleibt, ist das Fleisch besser vor kalter, trockener Luft geschützt – Feuchtigkeit, Textur und Geschmack bleiben länger erhalten.</p>
<h3>Welche Beutel soll ich verwenden?</h3>
<p>Verwenden Sie lebensmittelechte Beutel oder Rollen, die für Ihren Vakuumierer geeignet sind. Für regelmäßig feuchtes Gut oder sehr große Mengen bieten sich Kammervakuumierer an.</p>

<p>Sie suchen die passenden <a href="/de/categories/vakuumspeicherung">Vakuumierer, Vakuumbeutel und Rollen</a>? Entdecken Sie die Vakuumierlösungen von Planeta und lagern Sie Lebensmittel klüger – oder sprechen Sie uns an, wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "How long does meat last? Regular bags vs. vacuum sealing"

export const EXCERPT_EN =
  "Meat spoils quickly once it is exposed to air. We compare how long meat stays fresh in regular bags and vacuum bags – in the fridge and the freezer – and show how vacuum sealing cuts freezer burn and food waste."

export const META_TITLE_EN =
  "How Long Does Meat Last? Regular Bags vs. Vacuum Sealing"

export const META_DESCRIPTION_EN =
  "Discover how long meat stays fresh in regular and vacuum bags. Compare storage times and learn how vacuum sealing helps reduce freezer burn and food waste."

export const BODY_EN = `
<p>Meat is one of the foods that spoils relatively quickly, especially when it is exposed to air and stored incorrectly. Whether you buy meat in bulk, prepare meals in advance or simply want to reduce food waste, proper storage makes a big difference.</p>
<p>One of the most effective ways to preserve meat quality is <strong>vacuum sealing</strong>. But <strong>how long does meat last</strong> in a vacuum bag compared to conventional plastic bags? Let's compare the differences.</p>

<h2>1. How long does meat last in regular packaging?</h2>
<p>When meat is stored in ordinary plastic bags, containers or supermarket packaging, it remains exposed to some amount of oxygen. This contributes to oxidation, quality deterioration and freezer burn.</p>
<p>For raw meat stored in a refrigerator at 0–4 °C, typical storage recommendations are:</p>
<ul>
  <li><strong>Chicken:</strong> 1–2 days</li>
  <li><strong>Ground beef:</strong> 1–2 days</li>
  <li><strong>Pork:</strong> 2–3 days</li>
  <li><strong>Beef steaks:</strong> 3–5 days</li>
  <li><strong>Lamb:</strong> 3–5 days</li>
  <li><strong>Fresh fish:</strong> 1–2 days</li>
</ul>
<p>These recommendations assume proper refrigeration and handling. Always follow the use-by date and the manufacturer's storage instructions.</p>

<h2>2. How does vacuum sealing extend freshness?</h2>
<p>Vacuum sealing removes most of the air from a specially designed bag before sealing it. This significantly reduces oxygen exposure, helping to slow oxidation and preserve the quality of food.</p>
<p>The main advantages include:</p>
<ul>
  <li><strong>Reduced oxidation:</strong> less oxygen helps preserve the colour, flavour and texture of meat.</li>
  <li><strong>Less freezer burn:</strong> vacuum packaging protects meat from direct exposure to cold, dry air.</li>
  <li><strong>Better storage organisation:</strong> vacuum-sealed portions are compact and easy to label and stack.</li>
  <li><strong>Less food waste:</strong> you can divide larger purchases into smaller portions and store what you don't need immediately.</li>
</ul>
<blockquote><p><strong>Important:</strong> vacuum sealing does not sterilise food or stop all bacterial growth. Meat must still be refrigerated or frozen at the correct temperature.</p></blockquote>

<h2>3. Regular bags vs. vacuum bags in the freezer</h2>
<p>Freezing is one of the best ways to preserve meat for longer periods. However, conventional packaging often allows air to reach the food, resulting in freezer burn and deterioration in texture and flavour. Vacuum sealing provides a much better barrier against air exposure.</p>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/wie-lange-haelt-fleisch-regular.jpg" alt="Meat in regular packaging – air remains around the product" title="Regular packaging" style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p><strong>Regular packaging:</strong> air stays around the meat – this encourages oxidation and freezer burn.</p>
<p><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/wie-lange-haelt-fleisch-vacuum.jpg" alt="Vacuum-sealed meat – the bag fits closely with almost no trapped air" title="Vacuum packaging" style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>
<p><strong>Vacuum packaging:</strong> the bag fits closely around the meat with almost no trapped air – far better protection against freezer burn.</p>
<p>Indicative <strong>quality</strong>-storage comparisons at −18 °C or colder (regular packaging → vacuum packaging):</p>
<ul>
  <li><strong>Beef:</strong> 6–12 months → 2–3 years</li>
  <li><strong>Pork:</strong> 4–6 months → 2–3 years</li>
  <li><strong>Chicken:</strong> 9–12 months → 2–3 years</li>
  <li><strong>Ground meat:</strong> 3–4 months → 1–2 years</li>
  <li><strong>Fish:</strong> 2–8 months → 1–2 years</li>
</ul>
<p>These vacuum-storage periods are indicative quality estimates, not universal guarantees. Properly frozen food remains safe indefinitely at a constant −18 °C, but its quality can deteriorate over time.</p>

<h2>4. Why is vacuum-sealed meat better protected?</h2>
<p>The main difference is air exposure. When meat is stored in a conventional bag, air can remain around the product. During freezing, this can contribute to moisture loss and freezer burn.</p>
<p>Vacuum bags fit closely around the meat, reducing the amount of air trapped inside. This helps preserve:</p>
<ul>
  <li>natural moisture,</li>
  <li>original texture,</li>
  <li>flavour and overall quality,</li>
  <li>appearance after thawing.</li>
</ul>
<p>The result is better-quality meat when you're ready to prepare your next meal.</p>

<h2>5. How to vacuum seal meat properly</h2>
<ol>
  <li><strong>Prepare the meat:</strong> divide it into portions suitable for individual meals.</li>
  <li><strong>Keep it cold:</strong> work with chilled meat and avoid leaving it at room temperature.</li>
  <li><strong>Choose the right bag:</strong> use bags designed specifically for your vacuum sealer.</li>
  <li><strong>Leave enough space:</strong> keep the sealing area clean and leave sufficient room at the top.</li>
  <li><strong>Vacuum and seal:</strong> remove the air and make sure the seal is complete.</li>
  <li><strong>Label the package:</strong> write down the type of meat and freezing date.</li>
  <li><strong>Store immediately:</strong> refrigerate or freeze the package without delay.</li>
</ol>
<p>For long-term storage, freezing is the preferred option. Vacuum sealing alone does not make raw meat safe to keep refrigerated beyond standard food-safety recommendations.</p>
<blockquote><p><strong>Important:</strong> vacuum-packed raw meat must remain refrigerated or frozen. Some harmful bacteria can grow in low-oxygen environments, so never rely on the vacuum seal as a substitute for temperature control.</p></blockquote>

<h2>6. Is a vacuum sealer worth it?</h2>
<p>If you regularly buy meat in larger quantities, prepare meals ahead of time or freeze food for later, a <strong>vacuum sealer</strong> can be a useful investment. Consider these benefits:</p>
<ul>
  <li>buy larger quantities and divide them into convenient portions,</li>
  <li>protect frozen meat against freezer burn,</li>
  <li>keep your freezer organised,</li>
  <li>preserve food quality for longer,</li>
  <li>reduce unnecessary food waste.</li>
</ul>
<p>Over time, better food storage can help you make more efficient use of your grocery budget.</p>

<h2>Conclusion: better food storage starts with better packaging</h2>
<p>Regular plastic bags can be sufficient for short-term storage, but they offer less protection against air exposure, especially in the freezer. Vacuum sealing provides a more effective way to protect meat quality, reduce freezer burn and organise food storage.</p>
<p>Whether you store chicken, beef, pork or fish, a vacuum sealer can help you get more out of every purchase.</p>

<h2>Frequently asked questions (FAQ)</h2>
<h3>How long does vacuum-sealed meat last in the fridge?</h3>
<p>Vacuum sealing mainly extends quality during storage; it does not replace refrigeration. For raw meat, stick to the usual fridge guidelines and the manufacturer's use-by date. For long storage, freezing is the better choice.</p>
<h3>Does vacuum sealing make meat safe for longer?</h3>
<p>No. Vacuum sealing improves quality preservation – it does not sterilise food or stop all bacterial growth. Temperature control (refrigerating or freezing) remains essential.</p>
<h3>Does vacuum sealing prevent freezer burn?</h3>
<p>It reduces it significantly. Because almost no air remains in the bag, the meat is better protected from cold, dry air, so moisture, texture and flavour last longer.</p>
<h3>Which bags should I use?</h3>
<p>Use food-grade bags or rolls suitable for your vacuum sealer. For regularly moist foods or very large quantities, chamber vacuum sealers are a good option.</p>

<p>Looking for the right <a href="/en/categories/vakuumspeicherung">vacuum sealers, bags and rolls</a>? Explore Planeta's vacuum sealing solutions and discover a smarter way to store food – or get in touch, we are happy to help.</p>
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
