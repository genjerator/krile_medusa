import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine RECIPE article "Rote Bete vakuumieren: Aromatische Beilagen
 * für die moderne Küche" as a DRAFT (hidden until published from the admin
 * Articles page). Idempotent: skips if the slug already exists.
 *
 * Content lives in exported constants so the local updater
 * (_publish-rote-bete-orange-local.ts) can reuse the exact same copy and inject
 * the image for local preview. Body is rich-text HTML (h2/h3/p/strong/a/ul/li/
 * ol/li/blockquote — no table styling; ol renders as a numbered recipe).
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-rote-bete-orange.ts
 */

export const SLUG = "rote-bete-vakuumieren"

export const TITLE =
  "Rote Bete vakuumieren: Aromatische Beilagen für die moderne Küche"

export const CATEGORY = "Rezept"

export const EXCERPT =
  "Gegarte Rote Bete mit Orange, Thymian und etwas Olivenöl vakuumieren – das Vakuum verteilt das Dressing gleichmäßig zwischen den Scheiben. Eine moderne, aromatische Beilage."

export const META_TITLE =
  "Rote Bete vakuumieren mit Orange & Thymian – Rezept"

export const META_DESCRIPTION =
  "Rote Bete mit Orange, Thymian und Olivenöl vakuumieren: So verteilt sich das Dressing gleichmäßig in den Scheiben. Aromatische Beilage für die moderne Küche."

export const BODY = `
<p>Rote Bete mit Orange und Thymian ist eine moderne, aromatische Beilage – und mit dem Vakuumierer wird sie besonders gut durchzogen. Das Vakuum sorgt dafür, dass sich das Dressing gleichmäßig zwischen den Scheiben verteilt und tief einzieht. Ideal zum Vorbereiten.</p>

<p><strong>Vorbereitung:</strong> 10 Min · <strong>Ziehzeit:</strong> ab 1 Std · <strong>Schwierigkeit:</strong> Einfach</p>

<h2>Warum Rote Bete vakuumieren?</h2>
<p>Beim Vakuumieren legt sich das Dressing durch den Unterdruck eng an jede Scheibe. So dringen Orangensaft, Thymian und Olivenöl gleichmäßig in die gegarte Rote Bete ein – intensiver und schneller als beim offenen Marinieren.</p>

<h2>Zutaten (für 2–4 Portionen)</h2>
<ul>
  <li>400 g gegarte, abgekühlte Rote Bete</li>
  <li>Saft von 1 Orange (nach Wunsch etwas Orangenschale)</li>
  <li>einige Zweige frischer Thymian</li>
  <li>1–2 EL Olivenöl</li>
  <li>Salz und Pfeffer</li>
</ul>

<h2>Zubereitung</h2>
<ol>
  <li>Die gegarte, abgekühlte Rote Bete schälen und in dünne Scheiben schneiden. (Tipp: Handschuhe verwenden – Rote Bete färbt stark.)</li>
  <li>Für das Dressing Orangensaft, Thymianblättchen und Olivenöl verrühren und mit Salz und Pfeffer abschmecken.</li>
  <li>Rote-Bete-Scheiben flach in einen Vakuumbeutel legen und das Dressing darüber verteilen.</li>
  <li>Sanft bzw. mit der Puls-Funktion vakuumieren. Für Flüssigkeiten ist ein Kammervakuumierer ideal; beim Balkengerät den Beutel nicht zu voll füllen. Der Unterdruck verteilt das Dressing gleichmäßig zwischen den Scheiben.</li>
  <li>Den Beutel mindestens 1 Stunde – oder über Nacht – im Kühlschrank ziehen lassen.</li>
  <li>Vor dem Servieren die Scheiben anrichten und mit dem Dressing aus dem Beutel beträufeln.</li>
</ol>

<h2>Serviervorschlag</h2>
<p>Die marinierte Rote Bete passt als Beilage zu Fisch und Fleisch oder als Salat mit Ziegenkäse bzw. Feta, Walnüssen und Rucola. Frische Orangenfilets und ein paar Thymianblättchen machen den Teller komplett.</p>

<h2>Tipp zum Beutel</h2>
<p>Für Dressings und andere Flüssigkeiten ist ein Kammervakuumierer am komfortabelsten. Welcher Beuteltyp zu Ihrem Gerät passt, lesen Sie im Ratgeber <a href="/de/magazin/welche-vakuumbeutel-sind-die-richtigen">Welche Vakuumbeutel sind die richtigen?</a></p>

<p>Sie suchen passende Beutel oder Rollen? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "Vacuum-sealing beetroot: aromatic sides for the modern kitchen"

export const EXCERPT_EN =
  "Vacuum-seal cooked beetroot with orange, thyme and a little olive oil – the vacuum distributes the dressing evenly between the slices. A modern, aromatic side."

export const META_TITLE_EN =
  "Vacuum-sealing beetroot with orange & thyme – Recipe"

export const META_DESCRIPTION_EN =
  "Vacuum-seal beetroot with orange, thyme and olive oil: the dressing distributes evenly in the slices. An aromatic side for the modern kitchen."

export const BODY_EN = `
<p>Beetroot with orange and thyme is a modern, aromatic side – and with the vacuum sealer it is particularly well infused. The vacuum ensures the dressing distributes evenly between the slices and soaks in deeply. Ideal for preparing ahead.</p>

<p><strong>Preparation:</strong> 10 min · <strong>Infusing:</strong> from 1 hr · <strong>Difficulty:</strong> Easy</p>

<h2>Why vacuum-seal beetroot?</h2>
<p>When vacuum-sealed, the low pressure presses the dressing closely against every slice. Orange juice, thyme and olive oil penetrate the cooked beetroot evenly – more intensely and faster than with open marinating.</p>

<h2>Ingredients (for 2–4 servings)</h2>
<ul>
  <li>400 g cooked, cooled beetroot</li>
  <li>juice of 1 orange (a little orange zest if you like)</li>
  <li>a few sprigs of fresh thyme</li>
  <li>1–2 tbsp olive oil</li>
  <li>salt and pepper</li>
</ul>

<h2>Preparation</h2>
<ol>
  <li>Peel the cooked, cooled beetroot and cut into thin slices. (Tip: wear gloves – beetroot stains strongly.)</li>
  <li>For the dressing, mix orange juice, thyme leaves and olive oil and season with salt and pepper.</li>
  <li>Lay the beetroot slices flat in a vacuum bag and spread the dressing over them.</li>
  <li>Vacuum gently or with the pulse function. For liquids a chamber vacuum machine is ideal; with an external sealer do not overfill the bag. The vacuum distributes the dressing evenly between the slices.</li>
  <li>Refrigerate the bag for at least 1 hour – or overnight.</li>
  <li>Before serving, arrange the slices and drizzle with the dressing from the bag.</li>
</ol>

<h2>Serving suggestion</h2>
<p>The marinated beetroot works as a side to fish and meat or as a salad with goat's cheese or feta, walnuts and rocket. Fresh orange segments and a few thyme leaves complete the plate.</p>

<h2>Bag tip</h2>
<p>For dressings and other liquids a chamber vacuum machine is the most convenient. To find out which bag type suits your machine, read our guide <a href="/en/magazin/welche-vakuumbeutel-sind-die-richtigen">Which vacuum bags are the right ones?</a></p>

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
