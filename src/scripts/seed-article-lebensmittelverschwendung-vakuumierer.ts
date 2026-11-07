import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Lebensmittelverschwendung reduzieren – wie ein
 * Vakuumierer Geld sparen kann" as a DRAFT (hidden until published from admin).
 * Idempotent: if an article with this slug already exists it is left untouched.
 *
 * Content lives in exported constants so the publisher
 * (publish-article-lebensmittelverschwendung-vakuumierer.ts) can reuse the copy.
 *
 * Body is rich-text HTML — the magazine renders only h2/h3/p/strong/a/ul/li/
 * ol/li/blockquote (NO table styling), so the source tables (per-capita
 * projection, weekly shop, saving scenarios, benefit calc) are expressed as
 * structured lists, not <table>s.
 *
 * All figures are framed as projections/model calculations, not measured or
 * scientifically proven savings — matching the source copy.
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-lebensmittelverschwendung-vakuumierer.ts
 */

export const SLUG = "lebensmittelverschwendung-reduzieren-vakuumierer"

export const TITLE =
  "Wie viel wirft eine vierköpfige Familie weg – und wie hilft ein Vakuumierer beim Sparen?"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Lebensmittelverschwendung kostet Familien jedes Jahr viel Geld. Mit der richtigen Lagerung, cleverer Portionierung und einem Vakuumierer lässt sich ein Teil davon vermeiden. Wir zeigen anhand konkreter Zahlen das Sparpotenzial."

export const META_TITLE =
  "Lebensmittelverschwendung reduzieren: Wie ein Vakuumierer Geld sparen kann"

export const META_DESCRIPTION =
  "Wie viel Essen wirft eine vierköpfige Familie weg? Erfahren Sie, wie Vakuumieren Lebensmittel schützt, Verschwendung reduziert und langfristig Geld sparen kann."

export const BODY = `
<p>Lebensmittelverschwendung kostet Familien jedes Jahr viel Geld. Doch mit der richtigen Lagerung, cleverer Portionierung und einem <strong>Vakuumierer</strong> lässt sich ein Teil davon vermeiden. Wir zeigen anhand konkreter Zahlen, wie viel eine vierköpfige Familie wegwirft und welches Sparpotenzial im <strong>Lebensmittel vakuumieren</strong> steckt.</p>

<h2>1. Wie viel Essen landet jedes Jahr im Müll?</h2>
<p>Viele Familien kennen diese Situation: Man kauft größere Mengen Fleisch im Angebot, öffnet eine Packung Käse, kocht zu viel zum Abendessen oder vergisst Gemüse im Kühlschrank. Ein paar Tage später landen diese Lebensmittel im Müll. Das Problem ist größer, als viele denken.</p>
<p>Eine 2025 veröffentlichte Untersuchung zum Lebensmittelabfall in Deutschland ermittelte im Durchschnitt:</p>
<ul>
  <li><strong>36 kg</strong> vermeidbare Lebensmittelabfälle pro Person und Jahr.</li>
  <li>Einen geschätzten finanziellen Verlust von <strong>149 €</strong> pro Person und Jahr.</li>
</ul>
<p>Rechnet man diesen Durchschnitt auf eine vierköpfige Familie hoch, ergibt sich folgende Größenordnung:</p>
<ul>
  <li><strong>Lebensmittel pro Jahr:</strong> 144 kg.</li>
  <li><strong>Finanzieller Verlust pro Jahr:</strong> 596 €.</li>
  <li><strong>Lebensmittel pro Monat:</strong> 12 kg.</li>
  <li><strong>Geldverlust pro Monat:</strong> 49,67 €.</li>
</ul>
<blockquote><p><strong>Wichtig:</strong> Das ist eine einfache Hochrechnung des Pro-Kopf-Durchschnitts, keine direkte Messung einer vierköpfigen Familie. Größere Haushalte verschwenden statistisch tendenziell etwas weniger pro Person. Trotzdem wird deutlich, wie viel Geld in der Küche verloren gehen kann.</p></blockquote>

<h2>2. Warum werfen Familien so viele Lebensmittel weg?</h2>
<p>Es gibt verschiedene Gründe, warum Lebensmittel nicht rechtzeitig verbraucht werden. Die häufigsten Situationen im Alltag:</p>
<ul>
  <li><strong>Zu große Einkaufsmengen:</strong> Fleisch, Gemüse und Co. werden oft in großen Verpackungen gekauft, um von Mengenrabatten zu profitieren – nicht alles wird rechtzeitig verbraucht.</li>
  <li><strong>Geöffnete Verpackungen:</strong> Nach dem Öffnen verlieren Käse, Wurst, Fleisch und andere empfindliche Produkte schneller an Qualität und werden vergessen.</li>
  <li><strong>Falsche Lagerung:</strong> Luft, Feuchtigkeit und Temperaturschwankungen beeinträchtigen die Qualität.</li>
  <li><strong>Zu große Portionen:</strong> Beim Kochen bleiben Reste übrig, die ohne geeignete Aufbewahrung entsorgt werden.</li>
  <li><strong>Gefrierbrand:</strong> Nicht ausreichend vor Luft geschützte Lebensmittel trocknen im Gefrierschrank aus und verlieren an Geschmack und Qualität.</li>
</ul>

<h2>3. Wie kann ein Vakuumierer Lebensmittelverschwendung reduzieren?</h2>
<p>Ein <strong>Vakuumierer</strong> entfernt einen großen Teil der Luft aus einer geeigneten Verpackung und verschließt sie luftdicht. Das hilft, <strong>Lebensmittelverschwendung zu vermeiden</strong> und <strong>Lebensmittel länger haltbar zu machen</strong>.</p>
<h3>Fleisch und Fisch portionsweise verpacken</h3>
<p>Statt eine große Fleischpackung geöffnet im Kühlschrank aufzubewahren, teilt man das Fleisch direkt nach dem Einkauf in einzelne Mahlzeiten auf. Beispiel: Eine Familie kauft 2 kg Hähnchenbrust und bereitet vier Portionen à 500 g vor, die einzeln vakuumiert werden. So taut man genau die Menge auf, die man braucht.</p>
<h3>Lebensmittel länger im Gefrierschrank schützen</h3>
<p>Durch das Entfernen der Luft wird der Kontakt mit Sauerstoff reduziert. Das hilft, Gefrierbrand zu vermeiden und die Qualität gefrorener Lebensmittel besser zu erhalten – ideal, um <strong>Lebensmittel einzufrieren</strong>.</p>
<h3>Reste vom Abendessen aufbewahren</h3>
<p>Zu viel gekocht? Übrig gebliebenes Fleisch, Gemüse oder andere geeignete Speisen lassen sich portionsweise verpacken und einfrieren.</p>
<h3>Größere Einkäufe besser organisieren</h3>
<p>Wer regelmäßig größere Mengen einkauft, kann Lebensmittel direkt nach dem Einkauf sortieren, portionieren, beschriften und einfrieren. Das erleichtert die Essensplanung und reduziert vergessene Lebensmittel.</p>

<h2>4. Ein praktisches Beispiel: Eine Woche ohne Lebensmittelverschwendung</h2>
<p>Stellen wir uns eine vierköpfige Familie vor, die einmal pro Woche größere Einkäufe erledigt:</p>
<ul>
  <li><strong>Hähnchenbrust</strong> – 2 kg → 4 Portionen à 500 g.</li>
  <li><strong>Schweinefleisch</strong> – 1,5 kg → 3 Portionen à 500 g.</li>
  <li><strong>Hackfleisch</strong> – 1 kg → 2 Portionen à 500 g.</li>
  <li><strong>Fisch</strong> – 800 g → 2 Portionen à 400 g.</li>
  <li><strong>Käse</strong> – 1 kg → in kleinere Mengen aufteilen.</li>
  <li><strong>Gemüse</strong> – je nach Bedarf → geeignete Mengen vorbereiten.</li>
</ul>
<p>Mit einem Vakuumierer lassen sich geeignete Lebensmittel direkt nach dem Einkauf portionsweise verpacken. Die Familie muss nicht mehr überlegen, ob eine bereits geöffnete Fleischpackung noch rechtzeitig verbraucht wird.</p>
<blockquote><p><strong>Hinweis:</strong> Verderbliche Lebensmittel müssen weiterhin richtig gekühlt oder eingefroren werden. Vakuumieren ersetzt keine Kühlung.</p></blockquote>

<h2>5. Wie viel Geld kann eine Familie tatsächlich sparen?</h2>
<p>Wenn wir die geschätzten 596 € vermeidbaren Lebensmittelverluste pro Jahr als rechnerische Ausgangsbasis verwenden, lassen sich verschiedene Einsparszenarien durchspielen. Dabei handelt es sich ausdrücklich um <strong>Modellrechnungen</strong>, nicht um wissenschaftlich nachgewiesene Einsparungen durch einen Vakuumierer:</p>
<ul>
  <li><strong>5 % weniger Verlust:</strong> 7,2 kg → ca. <strong>29,80 €</strong> Ersparnis pro Jahr.</li>
  <li><strong>10 % weniger Verlust:</strong> 14,4 kg → ca. <strong>59,60 €</strong> pro Jahr.</li>
  <li><strong>15 % weniger Verlust:</strong> 21,6 kg → ca. <strong>89,40 €</strong> pro Jahr.</li>
  <li><strong>20 % weniger Verlust:</strong> 28,8 kg → ca. <strong>119,20 €</strong> pro Jahr.</li>
</ul>
<p>Selbst eine relativ kleine Reduzierung macht sich langfristig bemerkbar: Reduziert die Familie durch bessere Portionierung und Lagerung jährlich 10 % ihrer vermeidbaren Verluste, wären das rechnerisch knapp 60 € weniger. Zusätzliche Vorteile durch bessere Einkaufsplanung und weniger spontane Einkäufe sind dabei noch nicht eingerechnet.</p>

<h2>6. Wann lohnt sich die Anschaffung eines Vakuumierers?</h2>
<p>Ob sich ein <strong>Vakuumierer im Haushalt</strong> finanziell lohnt, hängt von mehreren Faktoren ab:</p>
<ul>
  <li>Wie häufig kauft die Familie größere Lebensmittelmengen?</li>
  <li>Wie viel Fleisch, Fisch und Gemüse wird eingefroren?</li>
  <li>Wie oft bleiben Lebensmittel übrig?</li>
  <li>Wie viel Geld geht regelmäßig durch verdorbene Lebensmittel verloren?</li>
  <li>Wie hoch sind Anschaffungskosten und die Kosten für Vakuumbeutel oder -rollen?</li>
</ul>
<p>Eine einfache Faustformel: <strong>Jährliche Ersparnis − laufende Verpackungskosten = tatsächlicher jährlicher Vorteil.</strong> Beispiel mit einer angenommenen Einsparung von 60 €:</p>
<ul>
  <li>Vermiedene Lebensmittelverluste: <strong>+60 €</strong>.</li>
  <li>Verpackungsmaterial pro Jahr (Beispiel): <strong>−20 €</strong>.</li>
  <li>Tatsächlicher Vorteil: <strong>40 €</strong>.</li>
</ul>
<p>Die Anschaffungskosten des Geräts kommen zusätzlich hinzu. Besonders lohnend ist ein Vakuumierer für Familien, die regelmäßig größere Mengen Fleisch oder andere geeignete Lebensmittel kaufen und einfrieren. Übrigens: Ob sich dabei <a href="/de/magazin/vakuumrollen-oder-vakuumbeutel">Vakuumrollen oder Vakuumbeutel</a> eher lohnen, haben wir in einem eigenen Beitrag durchgerechnet.</p>

<h2>7. Vakuumieren allein reicht nicht: Die richtigen Gewohnheiten</h2>
<p>Ein Vakuumierer ist ein hilfreiches Werkzeug, aber keine Wunderlösung. Damit möglichst wenig Essen im Müll landet, helfen ein paar einfache Regeln:</p>
<ol>
  <li>Einkauf planen und nur benötigte Mengen kaufen.</li>
  <li>Lebensmittel direkt nach dem Einkauf sortieren.</li>
  <li>Große Packungen in passende Portionen aufteilen.</li>
  <li>Lebensmittel mit Datum und Inhalt beschriften.</li>
  <li>Ältere Lebensmittel zuerst verbrauchen.</li>
  <li>Geeignete Lebensmittel rechtzeitig einfrieren.</li>
  <li>Regelmäßig Kühl- und Gefrierschrank kontrollieren.</li>
</ol>
<blockquote><p><strong>Wichtiger Hinweis zur Lebensmittelsicherheit:</strong> Vakuumierte Lebensmittel dürfen nicht einfach bei Raumtemperatur gelagert werden. Sauerstoffarme Verpackungen können unter ungünstigen Bedingungen das Wachstum bestimmter gefährlicher Bakterien ermöglichen. Frische, leicht verderbliche Lebensmittel müssen deshalb weiterhin entsprechend den Herstellerangaben gekühlt oder eingefroren werden.</p></blockquote>

<h2>8. Fazit: Weniger verschwenden und langfristig Geld sparen</h2>
<p>Eine vierköpfige Familie kann jedes Jahr eine erhebliche Menge an Lebensmitteln – und damit Geld – verlieren. Ein Vakuumierer kann dieses Problem reduzieren: durch bessere Portionierung, eine übersichtliche Vorratshaltung und besseren Schutz vor Gefrierbrand. Besonders Familien, die regelmäßig größere Mengen einkaufen, profitieren davon.</p>
<p>Der größte Vorteil liegt nicht nur darin, Lebensmittel länger in guter Qualität aufzubewahren, sondern auch darin, bewusster einzukaufen, besser zu planen und weniger wegzuwerfen. Ein Vakuumierer ist deshalb nicht nur ein praktischer Küchenhelfer, sondern auch ein sinnvoller Beitrag zum <strong>Geldsparen im Haushalt</strong>.</p>
<p>Sie möchten starten? <a href="/de/products">Zu unseren Vakuumierern, Vakuumrollen und Vakuumbeuteln</a> – oder sprechen Sie uns an, wir beraten Sie gern.</p>

<h2>Häufig gestellte Fragen (FAQ)</h2>
<h3>Wie viel Lebensmittel wirft eine vierköpfige Familie pro Jahr weg?</h3>
<p>Eine einfache Hochrechnung aktueller deutscher Pro-Kopf-Daten ergibt rund 144 kg vermeidbare Lebensmittel pro Jahr. Der tatsächliche Wert hängt von Haushaltsgröße und individuellen Gewohnheiten ab.</p>
<h3>Kann ein Vakuumierer Lebensmittel länger haltbar machen?</h3>
<p>Vakuumieren kann den Verderb verlangsamen und die Qualität besser erhalten. Es ersetzt jedoch weder Kühlung noch Einfrieren.</p>
<h3>Kann ich Fleisch direkt nach dem Einkauf vakuumieren und einfrieren?</h3>
<p>Ja. Frisches Fleisch kann portionsweise in geeigneten Gefrierbeuteln vakuumiert und anschließend eingefroren werden.</p>
<h3>Lohnt sich ein Vakuumierer für eine vierköpfige Familie?</h3>
<p>Das hängt davon ab, wie häufig die Familie portioniert, einfriert und größere Mengen einkauft. Je regelmäßiger der Einsatz, desto größer das mögliche Einsparpotenzial.</p>
<h3>Welche Lebensmittel eignen sich zum Vakuumieren?</h3>
<p>Besonders geeignet sind Fleisch, Fisch, Käse, bestimmte Gemüsesorten, trockene Lebensmittel und geeignete gekochte Speisen. Bei empfindlichen oder feuchten Lebensmitteln die Hinweise des Geräteherstellers beachten.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "How much does a family of four throw away – and how can a vacuum sealer help?"

export const EXCERPT_EN =
  "Food waste costs families a lot of money every year. With the right storage, smart portioning and a vacuum sealer, some of it can be avoided. We show the savings potential with concrete figures."

export const META_TITLE_EN =
  "Reduce food waste: how a vacuum sealer can save money – Guide"

export const META_DESCRIPTION_EN =
  "How much food does a family of four throw away? Learn how vacuum sealing protects food, reduces waste and can save money in the long run."

export const BODY_EN = `
<p>Food waste costs families a lot of money every year. But with the right storage, smart portioning and a <strong>vacuum sealer</strong>, some of it can be avoided. Using concrete figures, we show how much a family of four throws away and what savings potential lies in vacuum sealing.</p>

<h2>1. How much food ends up in the bin each year?</h2>
<p>Many families know the situation: you buy larger quantities of meat on offer, open a pack of cheese, cook too much for dinner or forget vegetables in the fridge. A few days later it all ends up in the bin. The problem is bigger than many think.</p>
<p>A study on food waste in Germany published in 2025 found, on average:</p>
<ul>
  <li><strong>36 kg</strong> of avoidable food waste per person per year.</li>
  <li>An estimated financial loss of <strong>€149</strong> per person per year.</li>
</ul>
<p>Projecting this average onto a family of four gives the following order of magnitude:</p>
<ul>
  <li><strong>Food per year:</strong> 144 kg.</li>
  <li><strong>Financial loss per year:</strong> €596.</li>
  <li><strong>Food per month:</strong> 12 kg.</li>
  <li><strong>Money lost per month:</strong> €49.67.</li>
</ul>
<blockquote><p><strong>Important:</strong> this is a simple projection of the per-capita average, not a direct measurement of a four-person household. Larger households statistically tend to waste slightly less per person. Even so, it shows how much money can be lost in the kitchen.</p></blockquote>

<h2>2. Why do families throw away so much food?</h2>
<p>There are various reasons why food isn't used in time. The most common everyday situations:</p>
<ul>
  <li><strong>Buying too much:</strong> meat, vegetables and more are often bought in large packs for bulk discounts – not all of it is used in time.</li>
  <li><strong>Opened packaging:</strong> once opened, cheese, cold cuts, meat and other sensitive products lose quality faster and get forgotten.</li>
  <li><strong>Wrong storage:</strong> air, moisture and temperature swings reduce quality.</li>
  <li><strong>Portions too large:</strong> cooking leaves leftovers that get thrown out without proper storage.</li>
  <li><strong>Freezer burn:</strong> food not protected from air dries out in the freezer and loses flavour and quality.</li>
</ul>

<h2>3. How can a vacuum sealer reduce food waste?</h2>
<p>A <strong>vacuum sealer</strong> removes much of the air from a suitable pack and seals it airtight. This helps to avoid food waste and keep food fresh for longer.</p>
<h3>Portion meat and fish</h3>
<p>Instead of keeping a large opened pack of meat in the fridge, divide it into single meals right after shopping. Example: a family buys 2 kg of chicken breast and prepares four 500 g portions, sealed individually. That way you only defrost what you need.</p>
<h3>Protect food longer in the freezer</h3>
<p>Removing the air reduces contact with oxygen, helping to avoid freezer burn and better preserve the quality of frozen food – ideal for freezing.</p>
<h3>Keep dinner leftovers</h3>
<p>Cooked too much? Leftover meat, vegetables or other suitable dishes can be packed in portions and frozen.</p>
<h3>Organise bigger shops better</h3>
<p>Anyone who regularly buys larger quantities can sort, portion, label and freeze food right after shopping. This makes meal planning easier and reduces forgotten food.</p>

<h2>4. A practical example: a week without food waste</h2>
<p>Imagine a family of four that does a big shop once a week:</p>
<ul>
  <li><strong>Chicken breast</strong> – 2 kg → 4 portions of 500 g.</li>
  <li><strong>Pork</strong> – 1.5 kg → 3 portions of 500 g.</li>
  <li><strong>Minced meat</strong> – 1 kg → 2 portions of 500 g.</li>
  <li><strong>Fish</strong> – 800 g → 2 portions of 400 g.</li>
  <li><strong>Cheese</strong> – 1 kg → split into smaller amounts.</li>
  <li><strong>Vegetables</strong> – as needed → prepare suitable amounts.</li>
</ul>
<p>With a vacuum sealer, suitable food can be packed in portions right after shopping. The family no longer has to wonder whether an already-opened pack of meat will be used in time.</p>
<blockquote><p><strong>Note:</strong> perishable food must still be properly chilled or frozen. Vacuum sealing does not replace refrigeration.</p></blockquote>

<h2>5. How much money can a family really save?</h2>
<p>Using the estimated €596 of avoidable food losses per year as a calculation basis, we can run through various saving scenarios. These are explicitly <strong>model calculations</strong>, not scientifically proven savings from a vacuum sealer:</p>
<ul>
  <li><strong>5% less loss:</strong> 7.2 kg → approx. <strong>€29.80</strong> saved per year.</li>
  <li><strong>10% less loss:</strong> 14.4 kg → approx. <strong>€59.60</strong> per year.</li>
  <li><strong>15% less loss:</strong> 21.6 kg → approx. <strong>€89.40</strong> per year.</li>
  <li><strong>20% less loss:</strong> 28.8 kg → approx. <strong>€119.20</strong> per year.</li>
</ul>
<p>Even a relatively small reduction adds up over time: if the family cuts 10% of its avoidable losses each year through better portioning and storage, that's nearly €60 less. Extra benefits from better shopping planning and fewer spontaneous purchases are not even included here.</p>

<h2>6. When is buying a vacuum sealer worth it?</h2>
<p>Whether a <strong>vacuum sealer for the household</strong> pays off financially depends on several factors:</p>
<ul>
  <li>How often does the family buy larger quantities of food?</li>
  <li>How much meat, fish and vegetables get frozen?</li>
  <li>How often is there food left over?</li>
  <li>How much money is regularly lost to spoiled food?</li>
  <li>What are the purchase costs and the cost of bags or rolls?</li>
</ul>
<p>A simple rule of thumb: <strong>annual saving − ongoing packaging cost = actual annual benefit.</strong> Example with an assumed saving of €60:</p>
<ul>
  <li>Avoided food losses: <strong>+€60</strong>.</li>
  <li>Packaging material per year (example): <strong>−€20</strong>.</li>
  <li>Actual benefit: <strong>€40</strong>.</li>
</ul>
<p>The purchase cost of the device comes on top. A vacuum sealer is especially worthwhile for families who regularly buy and freeze larger quantities of meat or other suitable food. By the way: whether <a href="/en/magazin/vakuumrollen-oder-vakuumbeutel">vacuum rolls or pre-made bags</a> make more sense is something we've worked out in a separate article.</p>

<h2>7. Vacuum sealing alone isn't enough: the right habits</h2>
<p>A vacuum sealer is a helpful tool, but not a miracle cure. A few simple rules help keep as little food as possible from being wasted:</p>
<ol>
  <li>Plan your shopping and buy only what you need.</li>
  <li>Sort food right after shopping.</li>
  <li>Split large packs into suitable portions.</li>
  <li>Label food with date and contents.</li>
  <li>Use older food first.</li>
  <li>Freeze suitable food in good time.</li>
  <li>Check the fridge and freezer regularly.</li>
</ol>
<blockquote><p><strong>Important food-safety note:</strong> vacuum-sealed food must not simply be stored at room temperature. Low-oxygen packaging can, under unfavourable conditions, allow certain dangerous bacteria to grow. Fresh, perishable food must therefore still be chilled or frozen according to the manufacturer's instructions.</p></blockquote>

<h2>8. Conclusion: waste less and save money long term</h2>
<p>A family of four can lose a significant amount of food – and money – every year. A vacuum sealer can reduce this: through better portioning, clearer storage and better protection from freezer burn. Families who regularly buy larger quantities benefit the most.</p>
<p>The biggest advantage isn't just keeping food in good quality for longer, but also shopping more consciously, planning better and throwing away less. A vacuum sealer is therefore not just a handy kitchen tool, but also a sensible contribution to a more economical household.</p>
<p>Ready to start? <a href="/en/products">Browse our vacuum sealers, rolls and bags</a> – or get in touch, we are happy to help.</p>

<h2>Frequently asked questions (FAQ)</h2>
<h3>How much food does a family of four throw away per year?</h3>
<p>A simple projection of current German per-capita data gives around 144 kg of avoidable food per year. The actual figure depends on household size and individual habits.</p>
<h3>Can a vacuum sealer make food last longer?</h3>
<p>Vacuum sealing can slow spoilage and better preserve quality. However, it replaces neither refrigeration nor freezing.</p>
<h3>Can I vacuum-seal and freeze meat right after shopping?</h3>
<p>Yes. Fresh meat can be sealed in portions in suitable freezer bags and then frozen.</p>
<h3>Is a vacuum sealer worth it for a family of four?</h3>
<p>It depends on how often the family portions, freezes and buys in bulk. The more regular the use, the greater the potential saving.</p>
<h3>Which foods are suitable for vacuum sealing?</h3>
<p>Especially suitable are meat, fish, cheese, certain vegetables, dry foods and suitable cooked dishes. For delicate or moist foods, follow the device manufacturer's instructions.</p>
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
