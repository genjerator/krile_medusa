import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Käse, Wurst und Aufschnitt vakuumieren: Was ist zu
 * beachten?" as a DRAFT (hidden until published from the admin Articles page).
 * Idempotent: skips if the slug already exists.
 *
 * Content lives in exported constants so the local updater
 * (_publish-kaese-wurst-aufschnitt-local.ts) can reuse the exact same copy and
 * inject the image for local preview. Body is rich-text HTML (h2/h3/p/strong/
 * a/ul/li/blockquote — no table styling).
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-kaese-wurst-aufschnitt.ts
 */

export const SLUG = "kaese-wurst-aufschnitt-vakuumieren"

export const TITLE =
  "Käse, Wurst und Aufschnitt vakuumieren: Was ist zu beachten?"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Vakuumieren hält Käse, Wurst und Aufschnitt länger frisch – wenn man ein paar Dinge beachtet. Worauf es bei Portionen, Kühlung und den einzelnen Sorten ankommt."

export const META_TITLE =
  "Käse, Wurst & Aufschnitt vakuumieren – worauf achten? – Ratgeber"

export const META_DESCRIPTION =
  "Käse, Wurst und Aufschnitt richtig vakuumieren: passende Portionsgrößen, Kühlung und was bei Hart-, Weich- und Schimmelkäse zu beachten ist."

export const BODY = `
<p>Vakuumieren ist eine einfache Möglichkeit, Käse, Wurst und Aufschnitt länger frisch zu halten – vorausgesetzt, man beachtet ein paar Besonderheiten. Denn nicht jede Sorte verträgt das Vakuum gleich gut, und die Kühlung bleibt in jedem Fall Pflicht.</p>

<h2>Was bringt das Vakuumieren bei Käse, Wurst &amp; Aufschnitt?</h2>
<ul>
  <li><strong>Längere Haltbarkeit:</strong> Ohne Sauerstoff bleiben die Produkte im Kühlschrank deutlich länger frisch.</li>
  <li><strong>Kein Austrocknen:</strong> Der dichte Beutel schützt vor dem Verlust von Feuchtigkeit und vor Gefrierbrand.</li>
  <li><strong>Aroma bleibt im Beutel:</strong> Strenge Gerüche breiten sich nicht im Kühlschrank aus.</li>
  <li><strong>Platzsparend und portionsgerecht:</strong> Ideal, um Vorräte sauber aufzuteilen.</li>
</ul>

<h2>Käse: nicht jede Sorte mag Vakuum</h2>
<h3>Hart- und Schnittkäse</h3>
<p>Fester Käse wie Bergkäse, Gouda oder Emmentaler lässt sich sehr gut vakuumieren und hält so besonders lange. Hier ist das Vakuum nahezu ideal.</p>
<h3>Weichkäse (Camembert, Brie)</h3>
<p>Weichkäse reift weiter und braucht etwas Luft. Ein starkes Vakuum kann ihn zusammendrücken und die Reifung stören. Besser locker verpacken, eine Dose verwenden oder nur sanft (mit reduziertem Druck) vakuumieren.</p>
<h3>Blau- und Schimmelkäse</h3>
<p>Der Edelschimmel benötigt Sauerstoff. Vakuumieren Sie Blauschimmelkäse daher nur kurz und separat – sein kräftiges Aroma überträgt sich sonst leicht auf andere Lebensmittel.</p>
<h3>Frischkäse</h3>
<p>Frischkäse ist feucht und empfindlich. Er gehört immer gekühlt, sollte zügig verbraucht und nicht über lange Zeiträume vakuumiert gelagert werden.</p>

<h2>Wurst und Aufschnitt</h2>
<p>Aufschnitt und Scheibenware lassen sich hervorragend vakuumieren – das verhindert das typische Antrocknen der Ränder und verlängert die Haltbarkeit im Kühlschrank. Luftgetrocknete oder gereifte Wurst (Salami &amp; Co.) ist von Natur aus lange haltbar; frische oder rohe Wurstwaren behandeln Sie wie leicht verderbliche Ware und kühlen sie durchgehend.</p>

<h2>Die richtige Portionsgröße</h2>
<p>Vakuumieren Sie in Portionen, die Sie auf einmal verbrauchen. Sobald ein Beutel geöffnet ist, sinkt die Haltbarkeit wieder auf das normale Maß. Beschriften Sie die Beutel mit dem Datum und verzichten Sie auf zu große Gebinde – so bleibt der Vorteil des Vakuums bis zum letzten Stück erhalten.</p>

<h2>Kühlung bleibt Pflicht</h2>
<p>Käse, Wurst und Aufschnitt sind leicht verderbliche Lebensmittel. Das Vakuum verlängert die Haltbarkeit, ersetzt aber <strong>nicht</strong> die Kühlung.</p>
<blockquote><p><strong>Wichtig:</strong> Vakuumierte verderbliche Ware gehört durchgehend in den Kühlschrank oder ins Gefrierfach – niemals bei Raumtemperatur lagern. Die sauerstoffarme Umgebung bremst zwar viele Keime, bietet aber keinen vollständigen Schutz.</p></blockquote>
<p>Zum Einfrieren ist das Vakuum besonders praktisch: Es verhindert Gefrierbrand und erhält Geschmack und Konsistenz.</p>

<h2>Praktische Tipps</h2>
<ul>
  <li>Weiche oder saftige Produkte nur sanft bzw. mit Puls-Funktion vakuumieren, damit sie nicht zerdrückt werden.</li>
  <li>Sauber arbeiten und nur frische Ware verpacken – Vakuumieren macht nichts wieder frisch.</li>
  <li>Den passenden Beuteltyp für Ihr Gerät wählen – mehr dazu im Ratgeber <a href="/de/magazin/welche-vakuumbeutel-sind-die-richtigen">Welche Vakuumbeutel sind die richtigen?</a></li>
</ul>

<p>Sie suchen passende Beutel oder Rollen? <a href="/de/products">Zu unseren Vakuumbeuteln und -rollen</a> – wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "Vacuum-sealing cheese, sausage and cold cuts: what to keep in mind"

export const EXCERPT_EN =
  "Vacuum sealing keeps cheese, sausage and cold cuts fresh for longer – if you keep a few things in mind. What matters for portions, refrigeration and the individual types."

export const META_TITLE_EN =
  "Vacuum-sealing cheese, sausage & cold cuts – what to know – Guide"

export const META_DESCRIPTION_EN =
  "Vacuum-sealing cheese, sausage and cold cuts correctly: suitable portion sizes, refrigeration and what to consider for hard, soft and blue cheese."

export const BODY_EN = `
<p>Vacuum sealing is an easy way to keep cheese, sausage and cold cuts fresh for longer – provided you keep a few specifics in mind. Not every type tolerates the vacuum equally well, and refrigeration remains essential in every case.</p>

<h2>What does vacuum sealing do for cheese, sausage &amp; cold cuts?</h2>
<ul>
  <li><strong>Longer shelf life:</strong> without oxygen, the products stay fresh much longer in the fridge.</li>
  <li><strong>No drying out:</strong> the sealed bag protects against moisture loss and freezer burn.</li>
  <li><strong>Aroma stays in the bag:</strong> strong smells do not spread through the fridge.</li>
  <li><strong>Space-saving and portioned:</strong> ideal for dividing up supplies cleanly.</li>
</ul>

<h2>Cheese: not every type likes the vacuum</h2>
<h3>Hard and semi-hard cheese</h3>
<p>Firm cheese such as mountain cheese, Gouda or Emmental vacuum-seals very well and keeps particularly long. Here the vacuum is almost ideal.</p>
<h3>Soft cheese (Camembert, Brie)</h3>
<p>Soft cheese keeps ripening and needs a little air. A strong vacuum can crush it and disturb the ripening. It is better to wrap it loosely, use a container, or vacuum only gently (with reduced pressure).</p>
<h3>Blue and mould-ripened cheese</h3>
<p>The noble mould needs oxygen. Vacuum-seal blue cheese only briefly and separately – its strong aroma otherwise transfers easily to other foods.</p>
<h3>Fresh cheese</h3>
<p>Fresh cheese is moist and sensitive. It always belongs in the fridge, should be used up quickly and not stored vacuum-sealed for long periods.</p>

<h2>Sausage and cold cuts</h2>
<p>Cold cuts and sliced products vacuum-seal excellently – this prevents the typical drying of the edges and extends shelf life in the fridge. Air-dried or cured sausage (salami &amp; co.) keeps long by nature; treat fresh or raw sausage products like perishable goods and keep them continuously chilled.</p>

<h2>The right portion size</h2>
<p>Vacuum-seal in portions you will use at once. As soon as a bag is opened, shelf life drops back to normal. Label the bags with the date and avoid oversized packs – that way the benefit of the vacuum lasts to the final piece.</p>

<h2>Refrigeration remains essential</h2>
<p>Cheese, sausage and cold cuts are perishable foods. The vacuum extends shelf life but does <strong>not</strong> replace refrigeration.</p>
<blockquote><p><strong>Important:</strong> vacuum-sealed perishable goods belong continuously in the fridge or freezer – never store them at room temperature. The low-oxygen environment slows many germs but offers no complete protection.</p></blockquote>
<p>Vacuum is especially handy for freezing: it prevents freezer burn and preserves taste and texture.</p>

<h2>Practical tips</h2>
<ul>
  <li>Vacuum soft or juicy products only gently or with the pulse function so they are not crushed.</li>
  <li>Work cleanly and only pack fresh goods – vacuum sealing does not make anything fresh again.</li>
  <li>Choose the right bag type for your machine – more on that in our guide <a href="/en/magazin/welche-vakuumbeutel-sind-die-richtigen">Which vacuum bags are the right ones?</a></li>
</ul>

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
