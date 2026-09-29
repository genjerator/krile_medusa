import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * "Zu viel gekocht? Reste mit einem Vakuumierer haltbar machen" — a practical
 * consumer SEO article for planeta.de. Starts from the everyday problem
 * ("I cooked too much again") and introduces vacuum sealing as the solution.
 * German base + English *_en (targets the keyword "vacuum sealer for
 * leftovers"; IT falls back to DE). Scoped to the planeta.de sales channel and
 * links to the Planeta Home chamber vacuum sealer (which also handles liquids).
 *
 * Run: npx medusa exec ./src/scripts/seed-article-leftovers-vacuum.ts
 */

const SLUG = "zu-viel-gekocht-reste-vakuumieren"
const SALES_CHANNEL_NAME = "PlanetaWebshop"
const COVER_IMAGE: string | null =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/leftovers.png"

const HOME_DE = "/de/product/vakuumierer-planeta-home"
const HOME_EN = "/en/product/vakuumierer-planeta-home"

const BODY_DE = `
<p>Sie haben mit Liebe gekocht &ndash; und am Ende bleibt die H&auml;lfte &uuml;brig. Der Topf wandert in den K&uuml;hlschrank, ger&auml;t in Vergessenheit und landet zwei Tage sp&auml;ter doch im M&uuml;ll. Kommt Ihnen bekannt vor? <strong>Reste sind kein Problem &ndash; schlechte Aufbewahrung ist es.</strong> Ein <strong>Vakuumierer</strong> h&auml;lt &uuml;brig gebliebene Gerichte deutlich l&auml;nger frisch, spart Geld und verhindert, dass gutes Essen weggeworfen wird.</p>

<h2>Warum verderben Reste so schnell?</h2>
<p>Der gr&ouml;&szlig;te Feind von Lebensmitteln ist <strong>Sauerstoff</strong>. Er l&auml;sst Aromen verfliegen, f&ouml;rdert das Wachstum von Bakterien und sorgt im Gefrierfach f&uuml;r Gefrierbrand. In einer offenen Sch&uuml;ssel oder locker verschlossenen Dose ist immer Luft im Spiel &ndash; und genau die verk&uuml;rzt die Haltbarkeit.</p>
<p>Beim Vakuumieren wird die Luft entzogen und das Lebensmittel luftdicht versiegelt. Ohne Sauerstoff bleiben Geschmack, Farbe und N&auml;hrstoffe deutlich l&auml;nger erhalten &ndash; im K&uuml;hlschrank wie im Gefrierfach.</p>

<h2>Reste vakuumieren: So geht&rsquo;s Schritt f&uuml;r Schritt</h2>
<ol>
  <li><strong>Abk&uuml;hlen lassen:</strong> Warme Speisen vor dem Vakuumieren immer erst abk&uuml;hlen lassen &ndash; am besten im K&uuml;hlschrank.</li>
  <li><strong>Portionieren:</strong> Teilen Sie die Reste in Portionen auf, die Sie sp&auml;ter auf einmal verbrauchen. Das erspart mehrfaches Auftauen.</li>
  <li><strong>Vakuumieren &amp; versiegeln:</strong> Legen Sie die Portion in einen Beutel und ziehen Sie mit dem Vakuumierer die Luft ab.</li>
  <li><strong>Beschriften:</strong> Inhalt und Datum notieren &ndash; so behalten Sie den &Uuml;berblick.</li>
  <li><strong>Richtig lagern:</strong> in den K&uuml;hlschrank f&uuml;r die n&auml;chsten Tage oder ins Gefrierfach f&uuml;r Wochen bis Monate.</li>
</ol>

<h2>Was l&auml;sst sich alles vakuumieren?</h2>
<ul>
  <li><strong>Fertige Gerichte:</strong> Aufl&auml;ufe, Eint&ouml;pfe, Pasta, Reis, Currys.</li>
  <li><strong>Suppen, Saucen und Marinaden:</strong> auch fl&uuml;ssige Reste &ndash; dazu gleich mehr.</li>
  <li><strong>Fleisch, Fisch und Gem&uuml;se:</strong> roh oder gegart.</li>
  <li><strong>Brot, K&auml;se und Wurst:</strong> bleiben l&auml;nger frisch und aromatisch.</li>
</ul>
<p>Ein wichtiger Hinweis: Nicht jeder Vakuumierer kann <strong>Fl&uuml;ssigkeiten</strong>. Einfache Au&szlig;envakuumierer saugen Suppen und Saucen an. Wer auch fl&uuml;ssige Reste sicher verpacken m&ouml;chte, braucht einen <strong>Kammer-Vakuumierer</strong>.</p>

<h2>Weniger wegwerfen, mehr sparen</h2>
<ul>
  <li><strong>Weniger Lebensmittelverschwendung:</strong> Reste halten ein Vielfaches l&auml;nger.</li>
  <li><strong>Meal Prep leicht gemacht:</strong> Kochen Sie bewusst mehr und frieren Sie fertige Portionen ein.</li>
  <li><strong>Sous-vide-f&auml;hig:</strong> Vakuumierte Beutel lassen sich sp&auml;ter schonend im Wasserbad erw&auml;rmen &ndash; das Essen schmeckt wie frisch gekocht.</li>
</ul>

<h2>Der richtige Vakuumierer f&uuml;r Reste: Planeta Home</h2>
<p>F&uuml;r den Haushalt empfehlen wir den <a href="${HOME_DE}">Planeta Home</a> &ndash; einen Kammer-Vakuumierer f&uuml;r die K&uuml;che. Sein gro&szlig;er Vorteil: Er vakuumiert auch <strong>Fl&uuml;ssigkeiten</strong> wie Suppen, Saucen und Marinaden sicher &ndash; im Beutel wie im Schraubglas. So verpacken Sie wirklich jeden Rest, nicht nur trockene Lebensmittel.</p>
<p>Weitere Pluspunkte: ein besonders starkes Vakuum, eine Marinierfunktion und eine wartungsfreie Pumpe &ndash; Made in Germany.</p>

<h2>Tipps f&uuml;r l&auml;ngere Frische</h2>
<ul>
  <li>Beutel vor dem Verschwei&szlig;en sauber und trocken halten &ndash; Fett und Feuchtigkeit an der Schwei&szlig;naht schw&auml;chen die Versiegelung.</li>
  <li>Fl&uuml;ssige Gerichte vor dem Vakuumieren gut durchk&uuml;hlen.</li>
  <li>Portionsgr&ouml;&szlig;en w&auml;hlen, die zu Ihrem Alltag passen.</li>
  <li>Eingefrorene Portionen im K&uuml;hlschrank auftauen lassen.</li>
</ul>

<h2>H&auml;ufig gestellte Fragen</h2>
<h3>Wie lange halten vakuumierte Reste?</h3>
<p>Das h&auml;ngt vom Lebensmittel ab, aber vakuumiert halten Reste im K&uuml;hlschrank meist mehrere Tage l&auml;nger und im Gefrierfach deutlich l&auml;nger als offen gelagert &ndash; oft ein Vielfaches. Gefrierbrand wird zuverl&auml;ssig vermieden.</p>
<h3>Kann ich warme Reste direkt vakuumieren?</h3>
<p>Lassen Sie Speisen vor dem Vakuumieren abk&uuml;hlen. Das ist hygienischer und schont sowohl den Beutel als auch das Ger&auml;t.</p>
<h3>Kann ich Suppen und Saucen vakuumieren?</h3>
<p>Ja &ndash; aber nur mit einem Kammer-Vakuumierer wie dem <a href="${HOME_DE}">Planeta Home</a>. Einfache Au&szlig;envakuumierer sind f&uuml;r Fl&uuml;ssigkeiten nicht geeignet.</p>

<h2>Fazit</h2>
<p>Zu viel gekocht ist kein Grund zum Wegwerfen. Mit einem Vakuumierer machen Sie aus Resten einen Vorrat &ndash; frisch, portioniert und ohne Verschwendung. <a href="${HOME_DE}">Entdecken Sie den Planeta Home</a> und holen Sie mehr aus jeder Mahlzeit heraus.</p>
`.trim()

const BODY_EN = `
<p>You cooked with care &ndash; and half of it is left over. The pot goes into the fridge, gets forgotten and ends up in the bin two days later. Sound familiar? <strong>Leftovers aren&rsquo;t the problem &ndash; poor storage is.</strong> A <strong>vacuum sealer for leftovers</strong> keeps cooked food fresh far longer, saves money and stops good food from going to waste.</p>

<h2>Why Do Leftovers Spoil So Quickly?</h2>
<p>The biggest enemy of food is <strong>oxygen</strong>. It makes flavours fade, encourages bacteria to grow and causes freezer burn in the freezer. An open bowl or a loosely closed container always traps air &ndash; and that air is exactly what shortens shelf life.</p>
<p>Vacuum sealing removes the air and seals the food airtight. Without oxygen, taste, colour and nutrients last much longer &ndash; in the fridge and in the freezer alike.</p>

<h2>How to Vacuum-Seal Leftovers, Step by Step</h2>
<ol>
  <li><strong>Let it cool:</strong> always cool warm food before sealing &ndash; ideally in the fridge.</li>
  <li><strong>Portion it:</strong> divide leftovers into portions you&rsquo;ll use in one go, so you don&rsquo;t have to thaw everything at once.</li>
  <li><strong>Vacuum and seal:</strong> place the portion in a bag and let the sealer draw out the air.</li>
  <li><strong>Label it:</strong> note the contents and date so nothing gets lost.</li>
  <li><strong>Store it right:</strong> the fridge for the next few days, or the freezer for weeks to months.</li>
</ol>

<h2>What Can You Vacuum-Seal?</h2>
<ul>
  <li><strong>Cooked meals:</strong> bakes, stews, pasta, rice, curries.</li>
  <li><strong>Soups, sauces and marinades:</strong> liquid leftovers too &ndash; more on that below.</li>
  <li><strong>Meat, fish and vegetables:</strong> raw or cooked.</li>
  <li><strong>Bread, cheese and cold cuts:</strong> stay fresh and flavourful for longer.</li>
</ul>
<p>One important note: not every vacuum sealer can handle <strong>liquids</strong>. Simple external sealers suck up soups and sauces. To seal liquid leftovers safely, you need a <strong>chamber vacuum sealer</strong>.</p>

<h2>Waste Less, Save More</h2>
<ul>
  <li><strong>Less food waste:</strong> leftovers keep many times longer.</li>
  <li><strong>Meal prep made easy:</strong> cook a little more on purpose and freeze ready portions.</li>
  <li><strong>Sous-vide ready:</strong> sealed bags can be gently reheated in a water bath later &ndash; the food tastes freshly cooked.</li>
</ul>

<h2>The Right Vacuum Sealer for Leftovers: Planeta Home</h2>
<p>For the home kitchen we recommend the <a href="${HOME_EN}">Planeta Home</a> &ndash; a chamber vacuum sealer for everyday use. Its big advantage: it seals <strong>liquids</strong> such as soups, sauces and marinades safely, in bags as well as screw-top jars. That means you can pack every leftover, not just dry foods.</p>
<p>Other plus points: an especially strong vacuum, a marinating function and a maintenance-free pump &ndash; made in Germany.</p>

<h2>Tips for Longer Freshness</h2>
<ul>
  <li>Keep the bag clean and dry at the seal &ndash; grease and moisture weaken the seal.</li>
  <li>Chill liquid dishes thoroughly before sealing.</li>
  <li>Choose portion sizes that fit your everyday routine.</li>
  <li>Thaw frozen portions in the fridge.</li>
</ul>

<h2>Frequently Asked Questions</h2>
<h3>How long do vacuum-sealed leftovers last?</h3>
<p>It depends on the food, but sealed leftovers usually keep several days longer in the fridge and much longer in the freezer than food stored openly &ndash; often many times longer. Freezer burn is reliably avoided.</p>
<h3>Can I vacuum-seal warm leftovers straight away?</h3>
<p>Let food cool before sealing. It&rsquo;s more hygienic and is kinder to both the bag and the machine.</p>
<h3>Can I vacuum-seal soups and sauces?</h3>
<p>Yes &ndash; but only with a chamber vacuum sealer such as the <a href="${HOME_EN}">Planeta Home</a>. Simple external sealers aren&rsquo;t suitable for liquids.</p>

<h2>Conclusion</h2>
<p>Cooking too much is no reason to throw food away. With a vacuum sealer, leftovers become a ready-made supply &ndash; fresh, portioned and waste-free. <a href="${HOME_EN}">Discover the Planeta Home</a> and get more out of every meal.</p>
`.trim()

export default async function seedArticleLeftoversVacuum({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: any = container.resolve(ARTICLE_MODULE)
  const salesChannelModule: any = container.resolve(Modules.SALES_CHANNEL)

  // Use the existing "Evgenije Medjesi" author — never create a new one.
  const [author] = await service.listArticleAuthors({ slug: "evgenije-medjesi" }, { take: 1 })
  if (!author) {
    throw new Error(
      'Author "evgenije-medjesi" (Evgenije Medjesi) not found — add it once via admin. Seed scripts never create authors.'
    )
  }

  const [shop] = await salesChannelModule.listSalesChannels(
    { name: [SALES_CHANNEL_NAME] },
    { select: ["id", "name"] }
  )
  if (!shop) {
    logger.warn(
      `Sales channel "${SALES_CHANNEL_NAME}" not found — article will be global (all channels).`
    )
  }

  const fields = {
    status: "published" as const,
    category: "Ratgeber",
    cover_image: COVER_IMAGE,
    author_id: author.id,
    sales_channel_id: shop?.id ?? null,
    title: "Zu viel gekocht? So machen Sie Reste mit einem Vakuumierer länger haltbar",
    title_en: "Cooked Too Much? How to Preserve Leftovers with a Vacuum Sealer",
    excerpt:
      "Schon wieder zu viel gekocht? Mit einem Vakuumierer halten Reste deutlich länger – frisch, ohne Gefrierbrand und ohne Verschwendung. So geht's Schritt für Schritt.",
    excerpt_en:
      "Cooked too much again? A vacuum sealer keeps leftovers fresh far longer — no freezer burn, no waste. Here's how to do it, step by step.",
    meta_title: "Reste vakuumieren: länger frisch statt wegwerfen | Planeta",
    meta_title_en: "Vacuum Sealer for Leftovers: Keep Food Fresh Longer | Planeta",
    meta_description:
      "Zu viel gekocht? So machen Sie Reste mit einem Vakuumierer länger haltbar – frisch halten, Gefrierbrand vermeiden, Geld sparen. Anleitung, Tipps und passendes Gerät.",
    meta_description_en:
      "Cooked too much? Learn how to preserve leftovers with a vacuum sealer — keep food fresh, prevent freezer burn and cut waste. Step-by-step guide, tips and the right device.",
    body: BODY_DE,
    body_en: BODY_EN,
  }

  const [existing] = await service.listArticles({ slug: SLUG }, { take: 1 })
  if (existing) {
    await service.updateArticles({ id: existing.id, ...fields })
    logger.info(`Updated article '${SLUG}' (${existing.id})`)
  } else {
    const article = await service.createArticles({ slug: SLUG, published_at: new Date(), ...fields })
    logger.info(`Created article '${SLUG}' (${article.id})`)
  }

  console.log(`LEFTOVERS ARTICLE SEED DONE: slug=${SLUG} channel=${shop?.name ?? "GLOBAL"}`)
}
