import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine RECIPE article "Mozzarella aromatisieren mit Vakuum" as a
 * DRAFT (hidden until published from the admin Articles page). Idempotent: skips
 * if the slug already exists.
 *
 * Content lives in exported constants so the local updater
 * (_publish-mozzarella-kraeuter-local.ts) can reuse the exact same copy and
 * inject the image for local preview. Body is rich-text HTML (h2/h3/p/strong/
 * a/ul/li/ol/li/blockquote — no table styling; ol renders as a numbered recipe).
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-mozzarella-kraeuter.ts
 */

export const SLUG = "mozzarella-aromatisieren-vakuum"

export const TITLE =
  "Mozzarella aromatisieren mit Vakuum: Kräuter, Zitrone und Olivenöl"

export const CATEGORY = "Rezept"

export const EXCERPT =
  "Mozzarella mit Basilikum, Zitronenschale und Kräutern im Olivenöl vakuumieren – das Vakuum lässt die Aromen schneller verschmelzen. Nur sanft vakuumieren, der Käse ist empfindlich."

export const META_TITLE =
  "Mozzarella aromatisieren mit Vakuum – Kräuter & Zitrone – Rezept"

export const META_DESCRIPTION =
  "Mozzarella mit Basilikum, Zitrone, Kräutern und Olivenöl vakuumieren: So verschmelzen die Aromen schneller. Nur sanft vakuumieren – der zarte Käse wird sonst gedrückt."

export const BODY = `
<p>Mozzarella mit Basilikum, Zitrone und Kräutern im Olivenöl ist ein Klassiker der italienischen Küche. Mit dem Vakuumierer verschmelzen die Aromen schneller – allerdings ist der weiche Käse empfindlich und sollte nur sanft vakuumiert werden.</p>

<p><strong>Vorbereitung:</strong> 10 Min · <strong>Ziehzeit:</strong> 30–60 Min · <strong>Schwierigkeit:</strong> Einfach</p>

<h2>Warum Mozzarella vakuumieren?</h2>
<p>Durch den Unterdruck legen sich Öl, Zitrone und Kräuter eng an den Käse. Die Aromen verteilen sich dadurch gleichmäßiger und ziehen schneller ein als beim offenen Einlegen – ideal, um Mozzarella im Handumdrehen zu aromatisieren.</p>

<blockquote><p><strong>Wichtig:</strong> Mozzarella ist weich und feucht. Vakuumieren Sie ihn nur sanft bzw. mit der Puls-Funktion – ein volles Vakuum drückt den Käse zusammen. Alternativ eignet sich eine vakuumierbare Dose oder ein Kammergerät mit reduziertem Vakuum.</p></blockquote>

<h2>Zutaten (für 2 Portionen)</h2>
<ul>
  <li>250 g Mozzarella (Kugeln oder Mini-Mozzarella), gut abgetropft</li>
  <li>einige frische Basilikumblätter</li>
  <li>Schale von 1/2 unbehandelten Zitrone</li>
  <li>ausgewählte Kräuter (z. B. Oregano, Thymian)</li>
  <li>2–3 EL Olivenöl</li>
  <li>Salz und Pfeffer</li>
</ul>

<h2>Zubereitung</h2>
<ol>
  <li>Den Mozzarella gut abtropfen lassen, größere Kugeln bei Bedarf halbieren.</li>
  <li>Olivenöl mit Zitronenschale, Basilikum und Kräutern verrühren und mit Salz und Pfeffer abschmecken.</li>
  <li>Mozzarella mit der Kräutermischung vorsichtig in einen Vakuumbeutel geben und flach verteilen.</li>
  <li><strong>Sanft</strong> bzw. mit der Puls-Funktion vakuumieren, damit der Käse nicht zerdrückt wird. Stoppen Sie, sobald der Beutel anliegt.</li>
  <li>30 bis 60 Minuten im Kühlschrank ziehen lassen – nicht zu lange, damit der Mozzarella zart bleibt.</li>
  <li>Vor dem Servieren aus dem Beutel nehmen und mit dem aromatisierten Öl beträufeln.</li>
</ol>

<h2>Serviervorschlag</h2>
<p>Der aromatisierte Mozzarella passt als Caprese mit Tomaten, auf frischem Brot, in Salaten oder als Teil einer Antipasti-Platte. Ein paar frische Basilikumblätter runden das Ganze ab.</p>

<h2>Tipp zum Beutel</h2>
<p>Für empfindliche Lebensmittel und Flüssigkeiten ist ein Kammervakuumierer am besten geeignet. Welcher Beuteltyp zu Ihrem Gerät passt, lesen Sie im Ratgeber <a href="/de/magazin/welche-vakuumbeutel-sind-die-richtigen">Welche Vakuumbeutel sind die richtigen?</a></p>

<p>Sie suchen passende Beutel oder Rollen? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "Flavouring mozzarella with vacuum: herbs, lemon and olive oil"

export const EXCERPT_EN =
  "Vacuum-seal mozzarella with basil, lemon zest and herbs in olive oil – the vacuum lets the flavours mingle faster. Vacuum only gently, the cheese is delicate."

export const META_TITLE_EN =
  "Flavouring mozzarella with vacuum – herbs & lemon – Recipe"

export const META_DESCRIPTION_EN =
  "Vacuum-seal mozzarella with basil, lemon, herbs and olive oil: the flavours mingle faster. Vacuum only gently – the delicate cheese gets crushed otherwise."

export const BODY_EN = `
<p>Mozzarella with basil, lemon and herbs in olive oil is a classic of Italian cuisine. With the vacuum sealer the flavours mingle faster – though the soft cheese is delicate and should only be vacuumed gently.</p>

<p><strong>Preparation:</strong> 10 min · <strong>Infusing:</strong> 30–60 min · <strong>Difficulty:</strong> Easy</p>

<h2>Why vacuum-seal mozzarella?</h2>
<p>The low pressure presses oil, lemon and herbs close to the cheese. The flavours spread more evenly and infuse faster than with open marinating – ideal for flavouring mozzarella in next to no time.</p>

<blockquote><p><strong>Important:</strong> mozzarella is soft and moist. Vacuum it only gently or with the pulse function – a full vacuum crushes the cheese. A vacuum-sealable container or a chamber machine with reduced vacuum works as an alternative.</p></blockquote>

<h2>Ingredients (for 2 servings)</h2>
<ul>
  <li>250 g mozzarella (balls or mini mozzarella), well drained</li>
  <li>a few fresh basil leaves</li>
  <li>zest of 1/2 unwaxed lemon</li>
  <li>selected herbs (e.g. oregano, thyme)</li>
  <li>2–3 tbsp olive oil</li>
  <li>salt and pepper</li>
</ul>

<h2>Preparation</h2>
<ol>
  <li>Drain the mozzarella well; halve larger balls if needed.</li>
  <li>Mix the olive oil with lemon zest, basil and herbs and season with salt and pepper.</li>
  <li>Carefully place the mozzarella with the herb mixture in a vacuum bag and spread it out flat.</li>
  <li><strong>Vacuum gently</strong> or with the pulse function so the cheese is not crushed. Stop as soon as the bag hugs the contents.</li>
  <li>Let it infuse in the fridge for 30 to 60 minutes – not too long, so the mozzarella stays tender.</li>
  <li>Before serving, remove from the bag and drizzle with the flavoured oil.</li>
</ol>

<h2>Serving suggestion</h2>
<p>The flavoured mozzarella works as a caprese with tomatoes, on fresh bread, in salads or as part of an antipasti platter. A few fresh basil leaves round it off.</p>

<h2>Bag tip</h2>
<p>For delicate foods and liquids a chamber vacuum machine is best suited. To find out which bag type suits your machine, read our guide <a href="/en/magazin/welche-vakuumbeutel-sind-die-richtigen">Which vacuum bags are the right ones?</a></p>

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
