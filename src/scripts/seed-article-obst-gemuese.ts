import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Obst und Gemüse vakuumieren: Was funktioniert und
 * was nicht?" as a DRAFT (hidden until published from the admin Articles page).
 * Idempotent: skips if the slug already exists.
 *
 * Content lives in exported constants so the local updater
 * (_publish-obst-gemuese-local.ts) can reuse the exact same copy and inject the
 * image for local preview. Body is rich-text HTML (h2/h3/p/strong/a/ul/li/
 * blockquote — no table styling).
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-obst-gemuese.ts
 */

export const SLUG = "obst-gemuese-vakuumieren"

export const TITLE =
  "Obst und Gemüse vakuumieren: Was funktioniert und was nicht?"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Empfindliche Früchte, Blanchieren vor dem Einfrieren und warum Vakuum frisches Obst und Gemüse nicht bei Raumtemperatur haltbar macht – das Wichtigste im Überblick."

export const META_TITLE =
  "Obst und Gemüse vakuumieren – was funktioniert? – Ratgeber"

export const META_DESCRIPTION =
  "Obst und Gemüse vakuumieren: empfindliche Früchte, Blanchieren vor dem Einfrieren und warum Vakuum keine Lagerung bei Raumtemperatur erlaubt."

export const BODY = `
<p>Obst und Gemüse zu vakuumieren spart Platz, schützt vor Gefrierbrand und hält Vorräte länger frisch. Allerdings eignet sich nicht jede Sorte gleich gut – und frisches Obst und Gemüse wird durch Vakuum nicht automatisch bei Raumtemperatur haltbar. Worauf es ankommt, zeigt dieser Überblick.</p>

<h2>Nicht jedes Obst und Gemüse eignet sich gleich gut</h2>
<p>Festes Gemüse und feste Früchte lassen sich problemlos vakuumieren. Weiche, saftige oder empfindliche Ware braucht dagegen etwas mehr Sorgfalt, damit sie nicht zerdrückt wird oder im Beutel Saft verliert.</p>

<h2>Empfindliche Früchte: Vorsicht beim Zerdrücken</h2>
<p>Beeren, Trauben oder reife, weiche Früchte werden vom vollen Vakuum leicht zerquetscht. So vermeiden Sie das:</p>
<ul>
  <li><strong>Sanft vakuumieren:</strong> Nutzen Sie die Puls- oder Soft-Funktion und stoppen Sie, bevor der Beutel die Früchte zusammendrückt.</li>
  <li><strong>Vorfrieren:</strong> Beeren zunächst auf einem Tablett anfrieren und erst dann vakuumieren – gefroren behalten sie ihre Form.</li>
  <li><strong>Behälter nutzen:</strong> Für besonders empfindliche Ware eignen sich vakuumierbare Dosen besser als Beutel.</li>
</ul>

<h2>Vorbereitung ist entscheidend</h2>
<p>Waschen Sie Obst und Gemüse und <strong>trocknen Sie es gut ab</strong> – überschüssige Feuchtigkeit sammelt sich sonst im Beutel und begünstigt den Verderb. Schneiden Sie die Ware auf die gewünschte Portionsgröße zu.</p>

<h2>Gemüse vor dem Einfrieren blanchieren</h2>
<p>Viele Gemüsesorten sollten vor dem Vakuumieren und Einfrieren blanchiert werden. Das kurze Überbrühen stoppt Enzyme, die sonst für Farb-, Geschmacks- und Vitaminverluste sorgen.</p>
<ul>
  <li><strong>So geht's:</strong> Gemüse kurz in kochendem Wasser garen, sofort in Eiswasser abschrecken, gut abtrocknen, dann vakuumieren und einfrieren.</li>
  <li><strong>Sinnvoll bei:</strong> Bohnen, Brokkoli, Karotten, Erbsen, Blumenkohl und ähnlichem Gemüse.</li>
  <li><strong>Meist nicht nötig:</strong> Paprika, Zwiebeln und Kräuter.</li>
</ul>

<h2>Was sich gut eignet – und was nicht</h2>
<ul>
  <li><strong>Gut geeignet:</strong> festes Gemüse, blanchierte Ware zum Einfrieren und vorgefrorene Beeren.</li>
  <li><strong>Heikel:</strong> rohe, weiche Früchte (zerdrücken leicht) sowie feuchte Pilze, die im Beutel schnell verderben.</li>
  <li><strong>Gasende Sorten:</strong> Manche frische Produkte „atmen" weiter und geben Gase ab – der Beutel kann sich dann wieder aufblähen. Hier ist Blanchieren und Einfrieren die bessere Wahl.</li>
</ul>

<h2>Wichtig: Vakuum macht Frisches nicht bei Raumtemperatur haltbar</h2>
<p>Das ist der häufigste Irrtum: Vakuumieren entzieht zwar Sauerstoff, macht frisches Obst und Gemüse aber <strong>nicht</strong> lagerfähig bei Zimmertemperatur.</p>
<blockquote><p><strong>Sicherheitshinweis:</strong> In einer sauerstoffarmen, feuchten Umgebung bei Raumtemperatur können sich gefährliche Keime (z. B. Clostridium botulinum) vermehren. Vakuumiertes frisches Obst und Gemüse gehört deshalb immer in den Kühlschrank oder ins Gefrierfach – besondere Vorsicht gilt bei Knoblauch in Öl.</p></blockquote>

<h2>Einfrieren: hier spielt das Vakuum seine Stärke aus</h2>
<p>Beim Einfrieren ist Vakuum ideal: Es verhindert Gefrierbrand und erhält Aroma, Farbe und Konsistenz. Frieren Sie empfindliche Früchte vor, blanchieren Sie Gemüse und portionieren Sie so, wie Sie es später verbrauchen. Achten Sie auf den passenden Beuteltyp für Ihr Gerät – mehr dazu im Ratgeber <a href="/de/magazin/welche-vakuumbeutel-sind-die-richtigen">Welche Vakuumbeutel sind die richtigen?</a></p>

<p>Sie suchen passende Beutel oder Rollen? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "Vacuum-sealing fruit and vegetables: what works and what doesn't"

export const EXCERPT_EN =
  "Delicate fruit, blanching before freezing, and why vacuum sealing does not make fresh produce safe at room temperature – the essentials at a glance."

export const META_TITLE_EN =
  "Vacuum-sealing fruit and vegetables – what works? – Guide"

export const META_DESCRIPTION_EN =
  "Vacuum-sealing fruit and vegetables: delicate fruit, blanching before freezing and why vacuum does not allow room-temperature storage."

export const BODY_EN = `
<p>Vacuum-sealing fruit and vegetables saves space, protects against freezer burn and keeps supplies fresh for longer. However, not every type is equally suitable – and fresh fruit and vegetables do not become room-temperature-stable through vacuum sealing. This overview shows what matters.</p>

<h2>Not every fruit and vegetable is equally suitable</h2>
<p>Firm vegetables and firm fruit can be vacuum-sealed without any problem. Soft, juicy or delicate produce, on the other hand, needs a little more care so that it is not crushed or loses juice in the bag.</p>

<h2>Delicate fruit: careful not to crush</h2>
<p>Berries, grapes or ripe, soft fruit are easily crushed by a full vacuum. Here is how to avoid that:</p>
<ul>
  <li><strong>Vacuum gently:</strong> use the pulse or soft function and stop before the bag presses the fruit together.</li>
  <li><strong>Pre-freeze:</strong> freeze berries on a tray first and only then vacuum-seal them – frozen, they keep their shape.</li>
  <li><strong>Use containers:</strong> for particularly delicate produce, vacuum-sealable containers work better than bags.</li>
</ul>

<h2>Preparation is key</h2>
<p>Wash the fruit and vegetables and <strong>dry them well</strong> – excess moisture otherwise collects in the bag and encourages spoilage. Cut the produce to the desired portion size.</p>

<h2>Blanch vegetables before freezing</h2>
<p>Many vegetables should be blanched before vacuum-sealing and freezing. Brief scalding stops enzymes that would otherwise cause losses of colour, flavour and vitamins.</p>
<ul>
  <li><strong>How to do it:</strong> briefly cook the vegetables in boiling water, immediately plunge into iced water, dry well, then vacuum-seal and freeze.</li>
  <li><strong>Useful for:</strong> beans, broccoli, carrots, peas, cauliflower and similar vegetables.</li>
  <li><strong>Usually not necessary:</strong> peppers, onions and herbs.</li>
</ul>

<h2>What works well – and what doesn't</h2>
<ul>
  <li><strong>Well suited:</strong> firm vegetables, blanched produce for freezing and pre-frozen berries.</li>
  <li><strong>Tricky:</strong> raw, soft fruit (crushes easily) and moist mushrooms, which spoil quickly in the bag.</li>
  <li><strong>Gassing types:</strong> some fresh produce keeps breathing and releases gases – the bag can then puff up again. Here, blanching and freezing is the better choice.</li>
</ul>

<h2>Important: vacuum does not make fresh produce room-temperature-stable</h2>
<p>This is the most common misconception: vacuum sealing removes oxygen but does <strong>not</strong> make fresh fruit and vegetables storable at room temperature.</p>
<blockquote><p><strong>Safety note:</strong> in a low-oxygen, moist environment at room temperature, dangerous germs (e.g. Clostridium botulinum) can multiply. Vacuum-sealed fresh fruit and vegetables therefore always belong in the fridge or freezer – take particular care with garlic in oil.</p></blockquote>

<h2>Freezing: where vacuum shows its strength</h2>
<p>For freezing, vacuum is ideal: it prevents freezer burn and preserves aroma, colour and texture. Pre-freeze delicate fruit, blanch vegetables and portion the way you will use it later. Make sure to use the right bag type for your machine – more on that in our guide <a href="/en/magazin/welche-vakuumbeutel-sind-die-richtigen">Which vacuum bags are the right ones?</a></p>

<p>Looking for the right bags or rolls? <a href="/en/products">Browse our vacuum bags and rolls</a> – we are happy to help.</p>
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
