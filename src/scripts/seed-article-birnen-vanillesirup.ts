import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine RECIPE article "Birnen in Vanillesirup vakuumieren" as a
 * DRAFT (hidden until published from the admin Articles page). Idempotent: skips
 * if the slug already exists.
 *
 * Content lives in exported constants so the local updater
 * (_publish-birnen-vanillesirup-local.ts) can reuse the exact same copy and
 * inject the image for local preview. Body is rich-text HTML (h2/h3/p/strong/
 * a/ul/li/ol/li/blockquote — no table styling; ol renders as a numbered recipe).
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-birnen-vanillesirup.ts
 */

export const SLUG = "birnen-in-vanillesirup-vakuumieren"

export const TITLE =
  "Birnen in Vanillesirup vakuumieren – ein einfaches Dessert mit intensivem Aroma"

export const CATEGORY = "Rezept"

export const EXCERPT =
  "Ein einfaches Dessert: Das Vakuum lässt den Vanillesirup gleichmäßig in die Birnen einziehen und sorgt für ein besonders intensives Aroma. Mit Vanille, Zitrone und Zimt."

export const META_TITLE =
  "Birnen in Vanillesirup vakuumieren – einfaches Dessert – Rezept"

export const META_DESCRIPTION =
  "Birnen in Vanillesirup vakuumieren: So zieht der Sirup gleichmäßig ein und das Aroma wird intensiver. Einfaches Dessert mit Vanille, Zitrone und Zimt."

export const BODY = `
<p>Pochierte Birnen in Vanillesirup sind ein Klassiker – im Vakuumbeutel aromatisiert gelingen sie besonders fein. Das Vakuum kann helfen, dass Sirup und Aromen die Frucht gleichmäßiger erreichen. Ein einfaches Dessert, das sich gut vorbereiten lässt.</p>

<p><strong>Vorbereitung:</strong> 15 Min · <strong>Garen:</strong> 15–25 Min · <strong>Schwierigkeit:</strong> Einfach</p>

<h2>Zutaten (für 2 Portionen)</h2>
<ul>
  <li>2 feste, reife Birnen</li>
  <li>250 ml Wasser</li>
  <li>100 g Zucker</li>
  <li>1 Vanilleschote (oder etwas Vanilleextrakt)</li>
  <li>1 Streifen Zitronenschale</li>
  <li>1 kleine Zimtstange (optional)</li>
</ul>

<h2>Zubereitung</h2>
<ol>
  <li><strong>Sirup zubereiten:</strong> Wasser und Zucker erhitzen, bis sich der Zucker gelöst hat. Vanille, Zitronenschale und Zimt zugeben. Den Sirup anschließend <strong>vollständig abkühlen</strong> lassen.</li>
  <li><strong>Birnen vorbereiten:</strong> Schälen, halbieren und das Kerngehäuse entfernen. Die Hälften ganz lassen oder in Spalten schneiden.</li>
  <li><strong>Vakuumieren:</strong> Birnen und den abgekühlten Sirup in einen geeigneten Vakuumbeutel geben. Verwenden Sie idealerweise einen Kammervakuumierer mit flüssigkeitsgeeignetem Programm. Bei einem Balken-/Außenvakuumierer für den Hausgebrauch eine geeignete Technik gegen das Einsaugen von Flüssigkeit nutzen oder den Sirup zuvor leicht anfrieren – beachten Sie dabei die Hinweise Ihres Geräts.</li>
  <li><strong>Durchziehen lassen:</strong> Den verschlossenen Beutel mehrere Stunden oder über Nacht im Kühlschrank ziehen lassen, dann probieren. Das Vakuum kann helfen, dass Sirup und Aromen die Frucht gleichmäßiger erreichen.</li>
  <li><strong>Servieren:</strong> Für ein weicheres, gegartes Dessert die Birnen vor dem Kühlen und Vakuumieren separat im Sirup sanft pochieren. Alternativ nur sous-vide in einem für die vorgesehene Temperatur geeigneten Beutel garen.</li>
</ol>

<h2>Serviervorschlag</h2>
<p>Die Birnen schmecken warm oder gekühlt – klassisch zu Vanilleeis, Panna cotta oder mit etwas geschmolzener Schokolade. Zum Schluss großzügig mit dem Vanillesirup beträufeln.</p>

<h2>Tipp zum Beutel</h2>
<p>Zum Garen im Sous-vide einen kochfesten, für die Temperatur geeigneten Beutel verwenden; für Flüssigkeiten ist ein Kammervakuumierer am komfortabelsten. Welcher Beuteltyp zu Ihrem Gerät passt, lesen Sie im Ratgeber <a href="/de/magazin/welche-vakuumbeutel-sind-die-richtigen">Welche Vakuumbeutel sind die richtigen?</a></p>

<p>Sie suchen passende Beutel oder Rollen? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "Vacuum-sealing pears in vanilla syrup – a simple dessert with intense flavour"

export const EXCERPT_EN =
  "A simple dessert: the vacuum lets the vanilla syrup soak into the pears evenly for a particularly intense flavour. With vanilla, lemon and cinnamon."

export const META_TITLE_EN =
  "Vacuum-sealing pears in vanilla syrup – simple dessert – Recipe"

export const META_DESCRIPTION_EN =
  "Vacuum-sealing pears in vanilla syrup: the syrup infuses evenly and the flavour becomes more intense. A simple dessert with vanilla, lemon and cinnamon."

export const BODY_EN = `
<p>Poached pears in vanilla syrup are a classic – flavoured in a vacuum bag, they turn out particularly fine. The vacuum can help the syrup and aromas reach the fruit more evenly. A simple dessert that is easy to prepare ahead.</p>

<p><strong>Preparation:</strong> 15 min · <strong>Cooking:</strong> 15–25 min · <strong>Difficulty:</strong> Easy</p>

<h2>Ingredients (for 2 servings)</h2>
<ul>
  <li>2 firm, ripe pears</li>
  <li>250 ml water</li>
  <li>100 g sugar</li>
  <li>1 vanilla pod (or a little vanilla extract)</li>
  <li>1 strip of lemon peel</li>
  <li>1 small cinnamon stick (optional)</li>
</ul>

<h2>Preparation</h2>
<ol>
  <li><strong>Make the syrup:</strong> heat the water and sugar until the sugar has dissolved. Add the vanilla, lemon peel and cinnamon. Then let the syrup <strong>cool completely</strong>.</li>
  <li><strong>Prepare the pears:</strong> peel, halve and core them. Keep the halves whole or cut them into wedges.</li>
  <li><strong>Vacuum seal:</strong> place the pears and the cooled syrup in a suitable vacuum pouch. Ideally use a chamber vacuum machine with a liquid-compatible programme. For a domestic external-suction machine, use a suitable technique to stop liquid being drawn in, or freeze the syrup slightly first – follow your machine's instructions.</li>
  <li><strong>Infuse:</strong> refrigerate the sealed pouch for several hours or overnight, then taste. The vacuum can help the syrup and aromas reach the fruit more evenly.</li>
  <li><strong>Serve:</strong> for a softer, cooked dessert, gently poach the pears separately in the syrup before chilling and sealing them. Alternatively, cook them sous-vide only in a pouch rated for the intended temperature.</li>
</ol>

<h2>Serving suggestion</h2>
<p>The pears taste good warm or chilled – classically with vanilla ice cream, panna cotta or a little melted chocolate. To finish, drizzle generously with the vanilla syrup.</p>

<h2>Bag tip</h2>
<p>For sous-vide cooking, use a boil-safe pouch rated for the temperature; for liquids a chamber vacuum machine is the most convenient. To find out which bag type suits your machine, read our guide <a href="/en/magazin/welche-vakuumbeutel-sind-die-richtigen">Which vacuum bags are the right ones?</a></p>

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
