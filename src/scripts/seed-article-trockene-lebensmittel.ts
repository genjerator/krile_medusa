import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Nüsse, Kaffee und trockene Lebensmittel
 * vakuumieren: Lohnt sich das?" as a DRAFT (hidden until published from the
 * admin Articles page). Idempotent: skips if the slug already exists.
 *
 * Content lives in exported constants so the local updater
 * (_publish-trockene-lebensmittel-local.ts) can reuse the exact same copy and
 * inject the image for local preview. Body is rich-text HTML (h2/h3/p/strong/
 * a/ul/li/blockquote — no table styling).
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-trockene-lebensmittel.ts
 */

export const SLUG = "trockene-lebensmittel-vakuumieren"

export const TITLE =
  "Nüsse, Kaffee und trockene Lebensmittel vakuumieren: Lohnt sich das?"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Vakuumieren schützt trockene Lebensmittel vor Feuchtigkeit, Sauerstoff und Schädlingen – und verlängert die Haltbarkeit deutlich. Wann es sich wirklich lohnt."

export const META_TITLE =
  "Trockene Lebensmittel vakuumieren – lohnt sich das? – Ratgeber"

export const META_DESCRIPTION =
  "Nüsse, Kaffee, Reis & Co. vakuumieren: Wie Vakuum vor Oxidation und Feuchtigkeit schützt, die richtige Lagerung und wann es sich wirklich lohnt."

export const BODY = `
<p>Vakuumieren verbindet man meist mit Fleisch, Fisch oder Sous-vide. Dabei lohnt es sich gerade bei <strong>trockenen Lebensmitteln</strong> wie Nüssen, Kaffee, Reis oder Hülsenfrüchten – denn sie verderben vor allem durch Sauerstoff, Feuchtigkeit und Schädlinge. Wir erklären, was Vakuum bewirkt und wann es sich wirklich auszahlt.</p>

<h2>Warum verderben trockene Lebensmittel überhaupt?</h2>
<p>Auch ohne hohen Wassergehalt verlieren trockene Lebensmittel mit der Zeit an Qualität – aus mehreren Gründen:</p>
<ul>
  <li><strong>Oxidation:</strong> Sauerstoff lässt fetthaltige Lebensmittel ranzig werden – besonders Nüsse, Samen und Vollkornprodukte.</li>
  <li><strong>Feuchtigkeit:</strong> Sie führt zu Verklumpen, Schimmel und Verlust der Knusprigkeit.</li>
  <li><strong>Aromaverlust:</strong> Flüchtige Aromen – etwa bei Kaffee und Gewürzen – entweichen an die Umgebungsluft.</li>
  <li><strong>Schädlinge:</strong> Lebensmittelmotten und andere Vorratsschädlinge befallen offen gelagerte Ware.</li>
</ul>

<h2>Was Vakuumieren bewirkt</h2>
<p>Beim Vakuumieren wird die Luft – und damit der größte Teil des Sauerstoffs – aus dem Beutel entfernt. Das bringt gleich mehrere Vorteile:</p>
<ul>
  <li><strong>Weniger Oxidation:</strong> Ohne Sauerstoff werden Fette deutlich langsamer ranzig.</li>
  <li><strong>Aroma bleibt erhalten:</strong> Der Beutel hält flüchtige Aromen im Inneren.</li>
  <li><strong>Schutz vor Feuchtigkeit und Schädlingen:</strong> Der dichte Beutel wirkt als Barriere.</li>
  <li><strong>Längere Haltbarkeit:</strong> Je nach Produkt lässt sich die Lagerdauer um ein Vielfaches verlängern.</li>
</ul>
<blockquote><p><strong>Wichtig:</strong> Vakuumieren ist keine Sterilisation. Es verlangsamt den Verderb, ersetzt aber keine kühle, trockene und dunkle Lagerung – und bei <em>feuchten</em> Lebensmitteln keine Kühlung oder Tiefkühlung.</p></blockquote>

<h2>Nüsse und Samen</h2>
<p>Nüsse und Samen haben einen hohen Fettanteil und werden an der Luft schnell ranzig. Vakuumiert und kühl, dunkel gelagert bleiben sie deutlich länger frisch. Für sehr lange Lagerung lassen sie sich vakuumiert auch einfrieren.</p>

<h2>Kaffee</h2>
<p>Kaffee verliert sein Aroma vor allem durch Sauerstoff – gemahlener Kaffee noch schneller als ganze Bohnen. Vakuumieren hält das Aroma frisch; lagern Sie den Beutel kühl und dunkel, aber nicht im Kühlschrank (Feuchtigkeit und Fremdgerüche).</p>
<p>Ein Hinweis zu frisch geröstetem Kaffee: Er gast noch Kohlendioxid aus. Lassen Sie die Bohnen vor dem Vakuumieren ein bis zwei Tage ruhen oder verwenden Sie Beutel mit Aromaventil, damit sich der Beutel nicht wieder aufbläht.</p>

<h2>Reis, Nudeln, Hülsenfrüchte, Mehl &amp; Co.</h2>
<p>Bei diesen Vorräten steht der Schutz vor Feuchtigkeit und Vorratsschädlingen im Vordergrund. Vakuumiert lassen sich auch Großpackungen platzsparend und sicher lagern – ideal, wenn Sie in größeren Mengen einkaufen.</p>

<h2>Wann lohnt sich das Vakuumieren?</h2>
<p>Besonders sinnvoll ist es, wenn mindestens einer dieser Punkte zutrifft:</p>
<ul>
  <li>Sie kaufen in <strong>größeren Mengen</strong> oder lagern <strong>über längere Zeit</strong>.</li>
  <li>Das Produkt ist <strong>fettreich</strong> (Nüsse, Samen, Vollkorn) und wird leicht ranzig.</li>
  <li>Das <strong>Aroma</strong> ist entscheidend (Kaffee, Gewürze).</li>
  <li>Sie möchten Vorräte vor <strong>Lebensmittelmotten</strong> schützen.</li>
</ul>
<p>Für Lebensmittel, die Sie ohnehin rasch verbrauchen, bringt das Vakuumieren dagegen wenig zusätzlichen Nutzen.</p>

<h2>Richtig lagern: Vakuum ist nur die halbe Miete</h2>
<p>Den besten Effekt erzielen Sie, wenn Sie Vakuum mit guten Lagerbedingungen kombinieren: kühl, trocken und dunkel. Für sehr lange Haltbarkeit ist zusätzliches Einfrieren möglich. Achten Sie außerdem auf den passenden Beuteltyp für Ihr Gerät – mehr dazu im Ratgeber <a href="/de/magazin/welche-vakuumbeutel-sind-die-richtigen">Welche Vakuumbeutel sind die richtigen?</a></p>

<p>Sie suchen passende Beutel oder Rollen für Ihre Vorräte? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN = "Vacuum-sealing nuts, coffee and dry foods: is it worth it?"

export const EXCERPT_EN =
  "Vacuum sealing protects dry foods from moisture, oxygen and pests – and extends their shelf life considerably. When it really pays off."

export const META_TITLE_EN = "Vacuum-sealing dry foods – is it worth it? – Guide"

export const META_DESCRIPTION_EN =
  "Vacuum-sealing nuts, coffee, rice & co.: how vacuum protects against oxidation and moisture, correct storage and when it is really worth it."

export const BODY_EN = `
<p>Vacuum sealing is usually associated with meat, fish or sous-vide. Yet it is particularly worthwhile for <strong>dry foods</strong> such as nuts, coffee, rice or pulses – because they spoil mainly through oxygen, moisture and pests. Here is what vacuum does and when it really pays off.</p>

<h2>Why do dry foods spoil at all?</h2>
<p>Even without a high water content, dry foods lose quality over time – for several reasons:</p>
<ul>
  <li><strong>Oxidation:</strong> oxygen turns high-fat foods rancid – especially nuts, seeds and wholegrain products.</li>
  <li><strong>Moisture:</strong> it causes clumping, mould and a loss of crispness.</li>
  <li><strong>Loss of aroma:</strong> volatile aromas – for example in coffee and spices – escape into the surrounding air.</li>
  <li><strong>Pests:</strong> pantry moths and other storage pests attack openly stored goods.</li>
</ul>

<h2>What vacuum sealing does</h2>
<p>Vacuum sealing removes the air – and with it most of the oxygen – from the bag. This brings several benefits at once:</p>
<ul>
  <li><strong>Less oxidation:</strong> without oxygen, fats turn rancid much more slowly.</li>
  <li><strong>Aroma is preserved:</strong> the bag keeps volatile aromas inside.</li>
  <li><strong>Protection from moisture and pests:</strong> the sealed bag acts as a barrier.</li>
  <li><strong>Longer shelf life:</strong> depending on the product, storage time can be extended many times over.</li>
</ul>
<blockquote><p><strong>Important:</strong> vacuum sealing is not sterilisation. It slows spoilage but does not replace cool, dry and dark storage – and for <em>moist</em> foods it does not replace refrigeration or freezing.</p></blockquote>

<h2>Nuts and seeds</h2>
<p>Nuts and seeds have a high fat content and quickly turn rancid in the air. Vacuum-sealed and stored cool and dark, they stay fresh considerably longer. For very long storage they can also be frozen while vacuum-sealed.</p>

<h2>Coffee</h2>
<p>Coffee loses its aroma mainly through oxygen – ground coffee even faster than whole beans. Vacuum sealing keeps the aroma fresh; store the bag cool and dark, but not in the fridge (moisture and foreign odours).</p>
<p>A note on freshly roasted coffee: it still releases carbon dioxide. Let the beans rest for one to two days before vacuum sealing, or use bags with an aroma valve so the bag does not puff up again.</p>

<h2>Rice, pasta, pulses, flour &amp; co.</h2>
<p>For these staples, protection from moisture and storage pests is the main point. Vacuum-sealed, even large packs can be stored compactly and safely – ideal if you buy in bulk.</p>

<h2>When is vacuum sealing worth it?</h2>
<p>It is especially useful if at least one of these applies:</p>
<ul>
  <li>You buy in <strong>larger quantities</strong> or store <strong>for a long time</strong>.</li>
  <li>The product is <strong>high in fat</strong> (nuts, seeds, wholegrain) and turns rancid easily.</li>
  <li><strong>Aroma</strong> is decisive (coffee, spices).</li>
  <li>You want to protect supplies from <strong>pantry moths</strong>.</li>
</ul>
<p>For foods you use up quickly anyway, vacuum sealing brings little additional benefit.</p>

<h2>Store correctly: vacuum is only half the job</h2>
<p>You get the best result by combining vacuum with good storage conditions: cool, dry and dark. For very long shelf life, additional freezing is possible. Also make sure to use the right bag type for your machine – more on that in our guide <a href="/en/magazin/welche-vakuumbeutel-sind-die-richtigen">Which vacuum bags are the right ones?</a></p>

<p>Looking for the right bags or rolls for your supplies? <a href="/en/products">Browse our vacuum bags and rolls</a> – we are happy to help.</p>
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
