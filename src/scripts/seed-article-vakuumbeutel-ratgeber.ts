import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Warum sind manche Vakuumbeutel strukturiert und
 * andere glatt?" as a DRAFT (hidden on the storefront until you publish it from
 * the admin Articles page). Idempotent: if an article with this slug already
 * exists it is left untouched, so re-running never clobbers edits made in the
 * admin.
 *
 * Content lives in exported constants so the local updater
 * (_publish-vakuumbeutel-local.ts) can reuse the exact same copy.
 *
 * Body is rich-text HTML — the magazine renders only h2/h3/p/strong/a/ul/li/
 * ol/li/blockquote (no table styling), so the comparison is expressed as lists.
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-vakuumbeutel-ratgeber.ts
 */

export const SLUG = "welche-vakuumbeutel-sind-die-richtigen"

export const TITLE = "Warum sind manche Vakuumbeutel strukturiert und andere glatt?"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Strukturiert oder glatt? Vakuumbeutel gibt es in zwei Varianten – weil sie für unterschiedliche Vakuumiergeräte gemacht sind. Wir erklären den Unterschied."

export const META_TITLE =
  "Warum sind Vakuumbeutel strukturiert oder glatt? – Ratgeber"

export const META_DESCRIPTION =
  "Strukturierte (geprägte) Beutel für Außenvakuumierer, glatte Beutel für Kammergeräte: Warum es zwei Typen gibt und welcher Beutel wozu passt."

export const BODY = `
<p>Vakuumbeutel gibt es in einer strukturierten (geprägten) und einer glatten Variante. Der Grund dafür ist einfach: Die beiden Typen sind für unterschiedliche Vakuumiergeräte gemacht. Der entscheidende Unterschied liegt darin, <strong>wie die Luft aus dem Beutel entweicht</strong>.</p>

<h2>Die zwei Beuteltypen</h2>

<h3>1. Strukturierte (geprägte) Beutel</h3>
<p>Diese Beutel haben auf einer Seite ein erhabenes Rauten-, Netz- oder Rippenmuster.</p>
<ul>
  <li><strong>Geeignet für:</strong> die meisten Außen- bzw. Absaug-Vakuumierer, wie sie auch im Haushalt verbreitet sind.</li>
  <li><strong>Funktionsweise:</strong> Die Prägung bildet feine Kanäle, durch die die Luft entweichen kann, während das Gerät sie absaugt.</li>
  <li><strong>Typische Anwendung:</strong> Fleisch, Fisch, Käse, Gemüse, Reste und Sous-vide-Garen.</li>
</ul>

<h3>2. Glatte Beutel</h3>
<p>Diese Beutel haben eine glatte Oberfläche ohne Prägung.</p>
<ul>
  <li><strong>Geeignet für:</strong> die meisten Kammervakuumierer.</li>
  <li><strong>Funktionsweise:</strong> Der gesamte Beutel liegt in der Kammer. Dort wird der Druck rund um Beutel und Inhalt reduziert, sodass die Luft auch ohne Prägekanäle entweicht.</li>
  <li><strong>Typische Anwendung:</strong> Profiküchen, Metzgereien, Lebensmittelproduktion und Großgebinde.</li>
</ul>

<h2>Strukturiert oder glatt? Der Vergleich auf einen Blick</h2>
<ul>
  <li><strong>Gerätetyp:</strong> strukturiert → Außenvakuumierer; glatt → Kammervakuumierer.</li>
  <li><strong>Typische Nutzer:</strong> strukturiert → Haushalte und kleine Küchen; glatt → Metzgereien, Restaurants und Lebensmittelbetriebe.</li>
  <li><strong>Als Rolle erhältlich:</strong> strukturiert → ja, häufig und individuell zuschneidbar; glatt → seltener, meist als fertige Beutel.</li>
  <li><strong>Hauptvorteil:</strong> strukturiert → Luft entweicht durch die Prägekanäle; glatt → oft wirtschaftlich bei großen Mengen.</li>
</ul>

<h2>Worauf Sie außerdem achten sollten</h2>
<p>Neben dem passenden Typ zählen auch die richtige <strong>Stärke</strong>, das <strong>Material</strong> und die <strong>Lebensmittelechtheit</strong> (Food-Contact-Zertifizierung). Achten Sie darauf, dass der Beutel für Ihren Einsatzzweck geeignet ist – etwa kochfest für Sous-vide oder ausreichend stark zum Einfrieren.</p>
<blockquote><p><strong>Tipp:</strong> Prüfen Sie Kompatibilitätsangaben immer gegen die Herstellerangaben Ihres Vakuumiergeräts, bevor Sie sich festlegen.</p></blockquote>

<p>Sie suchen die passenden Beutel oder Rollen? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – oder sprechen Sie uns an, wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN = "Why are some vacuum bags textured and others smooth?"

export const EXCERPT_EN =
  "Textured or smooth? Vacuum bags come in two versions – because they are made for different vacuum-sealing machines. Here is the difference."

export const META_TITLE_EN = "Why are vacuum bags textured or smooth? – Guide"

export const META_DESCRIPTION_EN =
  "Textured (embossed) bags for external sealers, smooth bags for chamber machines: why there are two types and which bag suits which use."

export const BODY_EN = `
<p>Vacuum bags come in a textured (embossed) and a smooth version. The reason is simple: the two types are made for different vacuum-sealing machines. The key difference is <strong>how the air escapes from the bag</strong>.</p>

<h2>The two bag types</h2>

<h3>1. Textured (embossed) bags</h3>
<p>These bags have a raised diamond, mesh or ribbed pattern on one side.</p>
<ul>
  <li><strong>Suitable for:</strong> most external or suction-type vacuum sealers, as commonly used at home.</li>
  <li><strong>How they work:</strong> the embossing creates fine channels that let the air escape while the machine draws it out.</li>
  <li><strong>Typical use:</strong> meat, fish, cheese, vegetables, leftovers and sous-vide cooking.</li>
</ul>

<h3>2. Smooth bags</h3>
<p>These bags have a flat, non-embossed surface.</p>
<ul>
  <li><strong>Suitable for:</strong> most chamber vacuum sealers.</li>
  <li><strong>How they work:</strong> the entire bag sits inside the chamber, where the pressure is reduced around the bag and its contents, so the air escapes without embossed channels.</li>
  <li><strong>Typical use:</strong> commercial kitchens, butchers, food production and bulk packaging.</li>
</ul>

<h2>Textured or smooth? The comparison at a glance</h2>
<ul>
  <li><strong>Machine type:</strong> textured → external vacuum sealer; smooth → chamber vacuum sealer.</li>
  <li><strong>Typical users:</strong> textured → households and small kitchens; smooth → butchers, restaurants and food businesses.</li>
  <li><strong>Available as rolls:</strong> textured → yes, commonly, and can be cut to length; smooth → less common, usually as pre-made bags.</li>
  <li><strong>Main advantage:</strong> textured → air escapes through the embossed channels; smooth → often economical for high volumes.</li>
</ul>

<h2>What else to look out for</h2>
<p>Besides the right type, the correct <strong>thickness</strong>, <strong>material</strong> and <strong>food-contact certification</strong> also matter. Make sure the bag is suitable for your intended use – for example boil-safe for sous-vide or thick enough for freezing.</p>
<blockquote><p><strong>Tip:</strong> always check compatibility details against your vacuum sealer's manufacturer specifications before you decide.</p></blockquote>

<p>Looking for the right bags or rolls? <a href="/en/products">Browse our vacuum bags and rolls</a> – or get in touch, we are happy to help.</p>
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
