import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine RECIPE article "Ananas vakuumieren: Tropische Früchte
 * aromatisieren" as a DRAFT (hidden until published from the admin Articles
 * page). Idempotent: skips if the slug already exists.
 *
 * Content lives in exported constants so the local updater
 * (_publish-ananas-limette-minze-local.ts) can reuse the exact same copy and
 * inject the image for local preview. Body is rich-text HTML (h2/h3/p/strong/
 * a/ul/li/ol/li/blockquote — no table styling; ol renders as a numbered recipe).
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-ananas-limette-minze.ts
 */

export const SLUG = "ananas-vakuumieren-limette-minze"

export const TITLE = "Ananas vakuumieren: Tropische Früchte aromatisieren"

export const CATEGORY = "Rezept"

export const EXCERPT =
  "Frische Ananas mit Limette, Minze und einem leichten Honig- oder Zuckersirup vakuumieren – so zieht das Aroma schnell ein. Ein frisches Topping für Joghurt, Eis oder Cocktails."

export const META_TITLE =
  "Ananas vakuumieren mit Limette & Minze – Rezept"

export const META_DESCRIPTION =
  "Ananas mit Limette, Minze und leichtem Honig- oder Zuckersirup vakuumieren: schnelles Aroma, frisches Topping für Joghurt, Eis oder Cocktails."

export const BODY = `
<p>Frische Ananas, Limette und Minze ergeben ein spritzig-tropisches Dessert – und mit dem Vakuumierer zieht das Aroma besonders schnell und gleichmäßig in die Frucht ein. Ein leichter Honig- oder Zuckersirup rundet alles ab. Perfekt als Topping für Joghurt, Eis oder Cocktails.</p>

<p><strong>Vorbereitung:</strong> 10 Min · <strong>Ziehzeit:</strong> ab 1 Std · <strong>Schwierigkeit:</strong> Einfach</p>

<h2>Warum Ananas vakuumieren?</h2>
<p>Beim Vakuumieren wird die Luft aus dem Beutel gezogen, sodass sich Sirup, Limette und Minze eng an die Ananasstücke legen. Die Aromen dringen dadurch schneller und gleichmäßiger ein als beim offenen Marinieren – ganz ohne Kochen.</p>

<h2>Zutaten (für 2–4 Portionen)</h2>
<ul>
  <li>1/2 frische Ananas, geschält und in mundgerechte Stücke geschnitten</li>
  <li>Schale und Saft von 1 Limette</li>
  <li>einige frische Minzblätter</li>
  <li>Leichter Sirup – nach Wahl:
    <ul>
      <li>2 EL Honig, oder</li>
      <li>50 ml Zuckersirup (50 g Zucker in 50 ml Wasser auflösen)</li>
    </ul>
  </li>
  <li>Optional: 1 Prise Vanille</li>
</ul>

<h2>Zubereitung</h2>
<ol>
  <li>Für die Süße den Honig leicht erwärmen, bis er flüssig ist – oder den Zucker in Wasser auflösen und den Sirup vollständig abkühlen lassen.</li>
  <li>Ananas schälen, den Strunk entfernen und das Fruchtfleisch in mundgerechte Stücke schneiden.</li>
  <li>Ananas mit Limettenschale, Limettensaft, Minze und Sirup in einen Vakuumbeutel geben.</li>
  <li>Sanft bzw. mit der Puls-Funktion vakuumieren, damit die Stücke nicht zerdrückt werden. Für Flüssigkeiten ist ein Kammervakuumierer ideal; beim Balkengerät den Beutel nicht zu voll füllen. Der Unterdruck presst die Aromen in die Frucht.</li>
  <li>Den verschlossenen Beutel mindestens 1 Stunde – oder über Nacht – im Kühlschrank ziehen lassen.</li>
  <li>Vor dem Servieren die mitgezogene Minze entfernen und nach Geschmack mit frischer Minze garnieren.</li>
</ol>

<h2>Serviervorschlag</h2>
<p>Die aromatisierte Ananas schmeckt als Topping auf Joghurt, Quark oder Eis, zu Pancakes – oder als fruchtige Einlage in Cocktails wie Piña Colada. Zum Schluss großzügig mit dem Sirup aus dem Beutel beträufeln.</p>

<h2>Tipp zum Beutel</h2>
<p>Für Flüssigkeiten ist ein Kammervakuumierer am komfortabelsten; möchten Sie die Früchte zusätzlich sous-vide garen, verwenden Sie einen kochfesten Beutel. Welcher Beuteltyp zu Ihrem Gerät passt, lesen Sie im Ratgeber <a href="/de/magazin/welche-vakuumbeutel-sind-die-richtigen">Welche Vakuumbeutel sind die richtigen?</a></p>

<p>Sie suchen passende Beutel oder Rollen? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN = "Vacuum-sealing pineapple: flavouring tropical fruit"

export const EXCERPT_EN =
  "Vacuum-seal fresh pineapple with lime, mint and a light honey or sugar syrup – the flavour infuses quickly. A fresh topping for yoghurt, ice cream or cocktails."

export const META_TITLE_EN = "Vacuum-sealing pineapple with lime & mint – Recipe"

export const META_DESCRIPTION_EN =
  "Vacuum-seal pineapple with lime, mint and a light honey or sugar syrup: quick flavour, a fresh topping for yoghurt, ice cream or cocktails."

export const BODY_EN = `
<p>Fresh pineapple, lime and mint make a zingy, tropical dessert – and with the vacuum sealer the flavour infuses the fruit particularly quickly and evenly. A light honey or sugar syrup rounds it off. Perfect as a topping for yoghurt, ice cream or cocktails.</p>

<p><strong>Preparation:</strong> 10 min · <strong>Infusing:</strong> from 1 hr · <strong>Difficulty:</strong> Easy</p>

<h2>Why vacuum-seal pineapple?</h2>
<p>Vacuum sealing draws the air out of the bag so that syrup, lime and mint cling closely to the pineapple pieces. The aromas penetrate faster and more evenly than with open marinating – and without any cooking.</p>

<h2>Ingredients (for 2–4 servings)</h2>
<ul>
  <li>1/2 fresh pineapple, peeled and cut into bite-sized pieces</li>
  <li>zest and juice of 1 lime</li>
  <li>a few fresh mint leaves</li>
  <li>Light syrup – your choice:
    <ul>
      <li>2 tbsp honey, or</li>
      <li>50 ml sugar syrup (dissolve 50 g sugar in 50 ml water)</li>
    </ul>
  </li>
  <li>Optional: a pinch of vanilla</li>
</ul>

<h2>Preparation</h2>
<ol>
  <li>For the sweetness, warm the honey gently until liquid – or dissolve the sugar in water and let the syrup cool completely.</li>
  <li>Peel the pineapple, remove the core and cut the flesh into bite-sized pieces.</li>
  <li>Place the pineapple with lime zest, lime juice, mint and syrup in a vacuum bag.</li>
  <li>Vacuum gently or with the pulse function so the pieces are not crushed. For liquids a chamber vacuum machine is ideal; with an external sealer do not overfill the bag. The vacuum presses the aromas into the fruit.</li>
  <li>Refrigerate the sealed bag for at least 1 hour – or overnight.</li>
  <li>Before serving, remove the infused mint and garnish with fresh mint to taste.</li>
</ol>

<h2>Serving suggestion</h2>
<p>The flavoured pineapple is great as a topping on yoghurt, quark or ice cream, with pancakes – or as a fruity addition to cocktails such as piña colada. To finish, drizzle generously with the syrup from the bag.</p>

<h2>Bag tip</h2>
<p>For liquids a chamber vacuum machine is the most convenient; if you also want to cook the fruit sous-vide, use a boil-safe pouch. To find out which bag type suits your machine, read our guide <a href="/en/magazin/welche-vakuumbeutel-sind-die-richtigen">Which vacuum bags are the right ones?</a></p>

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
