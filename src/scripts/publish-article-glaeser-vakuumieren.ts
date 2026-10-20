import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Publishes the Planeta.de Magazin article "Gläser vakuumieren" (pesto, tomato
 * & homemade sauces). Create-or-update by slug, scoped to the PlanetaWebshop
 * sales channel so it shows on planeta.de. Idempotent — safe to re-run.
 *
 * Run (local dev):  npx medusa exec ./src/scripts/publish-article-glaeser-vakuumieren.ts
 * Run (prod):       npx medusa exec ./src/scripts/publish-article-glaeser-vakuumieren.js
 *   (prod container runs the compiled build → .js, not .ts)
 */

const SLUG = "glaeser-vakuumieren-pesto-saucen"
const CATEGORY = "Lebensmittel haltbar machen & lagern"
const SHOP_CHANNEL_NAME = "PlanetaWebshop"

// Cover image lives in S3 (single copy, served to every storefront). Bucket
// policy makes it publicly readable.
const COVER_IMAGE =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/glaeser-vakuumieren-pesto-saucen.jpg"

const TITLE =
  "Gläser vakuumieren: Pesto, Tomatensauce und selbst gemachte Saucen länger frisch halten"

const EXCERPT =
  "Selbst gemachtes Pesto, Tomatensauce oder Kräuteröl im Glas vakuumieren: So " +
  "bleiben Aroma und Frische länger erhalten – mit Schritt-für-Schritt-Anleitung " +
  "und den wichtigsten Hinweisen zur Lebensmittelsicherheit."

const META_TITLE = "Gläser vakuumieren: Pesto & Saucen richtig lagern | Planeta"

const META_DESCRIPTION =
  "Pesto, Tomatensauce & Co. im Glas vakuumieren: Anleitung, praktische Tipps und " +
  "wichtige Sicherheitshinweise, damit selbst gemachte Saucen länger frisch bleiben."

const BODY = `
<p>Ein frisch gemörsertes Basilikumpesto, eine langsam eingekochte Tomatensauce oder ein aromatisches Kräuteröl – selbst gemachte Saucen schmecken einfach besser. Doch oft ist am Ende mehr übrig, als man an einem Tag verbraucht. Damit nichts im Müll landet und das Aroma möglichst lange erhalten bleibt, lohnt sich das <strong>Gläser vakuumieren</strong>.</p>

<p>In diesem Ratgeber erfahren Sie, warum sich das Vakuumieren von Saucen im Glas lohnt, welche Lebensmittel sich eignen, wie Sie Schritt für Schritt vorgehen – und welche Sicherheitsregeln Sie unbedingt beachten müssen. Denn eines vorweg: Vakuumieren hält Lebensmittel länger frisch, ersetzt aber kein echtes Konservierungsverfahren.</p>

<h2>Warum selbst gemachte Saucen im Glas vakuumieren?</h2>

<p>Beim Vakuumieren wird der größte Teil der Luft aus dem Glas gezogen. Weniger Sauerstoff bedeutet, dass Oxidation und das Wachstum vieler Verderbniskeime verlangsamt werden. Für Ihre selbst gemachten Saucen hat das mehrere Vorteile:</p>

<ul>
  <li><strong>Aroma und Farbe bleiben länger erhalten:</strong> Pesto wird weniger schnell braun, Kräuter behalten ihr frisches Grün.</li>
  <li><strong>Weniger Lebensmittelverschwendung:</strong> Reste lassen sich portionsweise aufbewahren, statt sie wegzuwerfen.</li>
  <li><strong>Ordnung und Übersicht:</strong> Gläser stapeln sich sauber, sind wiederverwendbar und zeigen den Inhalt auf einen Blick.</li>
  <li><strong>Praktische Portionen:</strong> Kleine Gläser für einzelne Mahlzeiten sparen Zeit und reduzieren angebrochene Reste.</li>
</ul>

<p>Das Stichwort <strong>Sauce im Glas aufbewahren</strong> bekommt durch das Vakuumieren also eine neue Qualität – vorausgesetzt, die Grundregeln der Lagerung stimmen.</p>

<h2>Welche Lebensmittel eignen sich zum Vakuumieren im Glas?</h2>

<p>Grundsätzlich lassen sich viele Saucen und Zubereitungen vakuumieren. Entscheidend ist dabei nicht nur die Konsistenz, sondern auch, wie Sie das Glas anschließend lagern.</p>

<h3>Besonders gut geeignet</h3>
<ul>
  <li><strong>Pesto vakuumieren:</strong> Basilikum-, Rucola- oder Tomatenpesto profitiert stark vom Sauerstoffentzug. Eine dünne Ölschicht oben hilft zusätzlich, das Aroma zu schützen.</li>
  <li><strong>Tomaten- und Pastasauce:</strong> Eine selbst gemachte Tomatensauce lässt sich portionsweise vakuumieren und im Kühlschrank oder Gefrierfach aufbewahren.</li>
  <li><strong>Gemüse- und Kräutersaucen:</strong> Pürierte Gemüsesaucen, Kräuteröle und Gewürzpasten halten sich vakuumiert spürbar länger frisch.</li>
</ul>

<h3>Mit Vorsicht</h3>
<ul>
  <li><strong>Sehr flüssige Saucen</strong> können beim Vakuumieren angesaugt werden. Nutzen Sie – falls vorhanden – den Flüssigkeits- oder Puls-Modus Ihres Geräts oder frieren Sie die Sauce vorher leicht an.</li>
  <li><strong>Warme Zubereitungen</strong> immer erst abkühlen lassen, bevor Sie das Glas verschließen und vakuumieren.</li>
</ul>

<h2>Wichtig: Vakuumieren ist keine Konservierung</h2>

<p>Dieser Punkt ist entscheidend für Ihre Gesundheit: <strong>Vakuumieren allein macht eine Sauce nicht haltbar bei Raumtemperatur.</strong> Das Entfernen von Sauerstoff verlangsamt zwar viele Verderbnisprozesse, es tötet aber keine Bakterien oder deren Sporen ab.</p>

<p>Im Gegenteil: Eine sauerstoffarme Umgebung kann bestimmte Keime sogar begünstigen. <strong>Clostridium botulinum</strong>, der Erreger des gefährlichen Botulismus, vermehrt sich bevorzugt in luftdicht verschlossenen, säurearmen Lebensmitteln bei Zimmertemperatur. Deshalb gilt:</p>

<ul>
  <li><strong>Frisches Pesto und verderbliche Saucen</strong> gehören immer in den <strong>Kühlschrank</strong> oder ins <strong>Gefrierfach</strong> – auch vakuumiert.</li>
  <li><strong>Tomatensauce haltbar machen</strong> für die Lagerung bei Raumtemperatur funktioniert nur über ein <strong>geprüftes Einkoch- bzw. Einmachrezept</strong> mit ausreichender Säure und korrekten Erhitzungszeiten – nicht durch Vakuumieren.</li>
  <li>Verlassen Sie sich <strong>nie</strong> darauf, dass ein bloß vakuumiertes Glas im Schrank sicher ist.</li>
</ul>

<p>Vakuumieren ist also ein hervorragendes Mittel, um die <strong>Frische im Kühl- oder Gefrierschrank zu verlängern</strong> – aber kein Ersatz für fachgerechtes Einkochen.</p>

<h2>Gläser vakuumieren: Schritt für Schritt</h2>

<p>Zum Vakuumieren von Gläsern benötigen Sie ein Vakuumiergerät mit Glas- bzw. Zubehörfunktion und passendem Schlauch, kompatible Deckel oder spezielle Vakuumbehälter. Mit einem Kammer-Vakuumiergerät gelingen auch flüssige Saucen besonders zuverlässig.</p>

<ol>
  <li><strong>Glas und Deckel reinigen:</strong> Spülen Sie beides gründlich und trocknen Sie es ab. Für längere Haltbarkeit können Sie die Gläser zusätzlich auskochen.</li>
  <li><strong>Sauce vorbereiten:</strong> Warme Saucen vollständig abkühlen lassen. Sehr flüssige Saucen vorab kühlen oder leicht anfrieren.</li>
  <li><strong>Befüllen mit Kopfraum:</strong> Lassen Sie oben etwa 2 cm Platz. So kann sich das Vakuum bilden, ohne dass Sauce angesaugt wird.</li>
  <li><strong>Rand säubern:</strong> Wischen Sie den Glasrand sorgfältig ab. Reste am Rand verhindern ein sauberes Vakuum.</li>
  <li><strong>Deckel auflegen und Ansatz ansetzen:</strong> Setzen Sie den Vakuumieransatz bzw. Schlauch gemäß Anleitung Ihres Geräts an.</li>
  <li><strong>Vakuum ziehen:</strong> Starten Sie den Vorgang. Bei flüssigen Saucen den Flüssigkeits- oder Puls-Modus verwenden, um Übersaugen zu vermeiden.</li>
  <li><strong>Prüfen, beschriften, lagern:</strong> Kontrollieren Sie, dass der Deckel fest sitzt, beschriften Sie das Glas mit Inhalt und Datum und stellen Sie es in Kühlschrank oder Gefrierfach.</li>
</ol>

<h2>Praktische Tipps für Befüllen, Verschließen und Lagern</h2>

<ul>
  <li><strong>Nicht überfüllen:</strong> Der Kopfraum ist wichtig für ein gutes Vakuum.</li>
  <li><strong>Ölschicht bei Pesto:</strong> Eine dünne Schicht Olivenöl über dem Pesto schützt zusätzlich vor Oxidation.</li>
  <li><strong>Flüssiges vorher kühlen:</strong> Gekühlte oder leicht angefrorene Saucen lassen sich sauberer vakuumieren.</li>
  <li><strong>Saubere Ränder:</strong> Ein fettfreier, trockener Rand sorgt für einen dichten Verschluss.</li>
  <li><strong>Immer beschriften:</strong> Inhalt und Datum notieren – so behalten Sie den Überblick.</li>
  <li><strong>Kleine Gläser wählen:</strong> Portionsgrößen vermeiden angebrochene Reste.</li>
  <li><strong>Richtig lagern:</strong> Verderbliche Saucen in den Kühlschrank, für längere Lagerung ins Gefrierfach.</li>
</ul>

<h2>Vakuumieren, Kühlen, Einfrieren oder Einkochen – der Unterschied</h2>

<p>Diese vier Methoden werden oft verwechselt, erfüllen aber unterschiedliche Zwecke:</p>

<ul>
  <li><strong>Kühlen:</strong> Verlangsamt den Verderb kurzfristig. In Kombination mit Vakuumieren bleiben Saucen einige Tage länger frisch.</li>
  <li><strong>Vakuumieren:</strong> Entzieht Sauerstoff und verlängert so die Frische – immer <em>zusätzlich</em> zum Kühlen oder Einfrieren, nie als alleiniger Schutz.</li>
  <li><strong>Einfrieren:</strong> Stoppt das Wachstum von Mikroorganismen weitgehend und eignet sich hervorragend für Pesto, Tomaten- und Gemüsesaucen über Wochen bis Monate.</li>
  <li><strong>Einkochen (Einwecken):</strong> Das einzige dieser Verfahren, das – mit geprüftem Rezept – eine Lagerung bei Raumtemperatur ermöglicht, da das Lebensmittel ausreichend erhitzt wird.</li>
</ul>

<h2>Häufige Fehler und wie Sie sie vermeiden</h2>

<ul>
  <li><strong>Glas zu voll gefüllt:</strong> Ohne Kopfraum wird Sauce angesaugt und der Verschluss misslingt.</li>
  <li><strong>Nasse oder fettige Ränder:</strong> Verhindern ein dichtes Vakuum – Rand immer abwischen.</li>
  <li><strong>Flüssige Sauce ohne passenden Modus:</strong> Führt zum Übersaugen. Vorher kühlen oder Puls-Modus nutzen.</li>
  <li><strong>Lagerung bei Raumtemperatur:</strong> Der gefährlichste Fehler. Vakuumierte, nicht eingekochte Saucen gehören in Kühl- oder Gefrierschrank.</li>
  <li><strong>Kein Datum notiert:</strong> Ohne Beschriftung verliert man schnell den Überblick über die Frische.</li>
  <li><strong>Ungeeignete Deckel:</strong> Nur mit kompatiblen Deckeln oder Vakuumbehältern entsteht ein zuverlässiges Vakuum.</li>
</ul>

<h2>FAQ – Häufige Fragen zum Vakuumieren von Saucen im Glas</h2>

<h3>Wie lange hält vakuumiertes Pesto im Kühlschrank?</h3>
<p>Vakuumiertes Pesto bleibt im Kühlschrank meist einige Tage länger frisch als ein offenes Glas. Verlassen Sie sich auf Aussehen und Geruch, lagern Sie es stets gekühlt und werfen Sie es im Zweifel lieber weg.</p>

<h3>Kann ich Tomatensauce durch Vakuumieren bei Raumtemperatur lagern?</h3>
<p>Nein. Für eine Lagerung bei Raumtemperatur muss die Tomatensauce nach einem geprüften Einkochrezept mit ausreichender Säure und korrekter Erhitzung verarbeitet werden. Vakuumieren allein reicht nicht aus.</p>

<h3>Welche Gläser und Deckel eignen sich?</h3>
<p>Verwenden Sie stabile Gläser mit kompatiblen Vakuumdeckeln oder spezielle Vakuumbehälter. Achten Sie auf die Angaben Ihres Vakuumiergeräts, welche Zubehörteile unterstützt werden.</p>

<h3>Kann ich vakuumierte Saucen einfrieren?</h3>
<p>Ja. Lassen Sie dabei ausreichend Kopfraum, da sich der Inhalt beim Gefrieren ausdehnt, und verwenden Sie gefriergeeignete Gläser.</p>

<h3>Woran erkenne ich, dass eine Sauce verdorben ist?</h3>
<p>Anzeichen sind ein ungewöhnlicher Geruch, ein gewölbter Deckel, Blasenbildung oder Verfärbungen. Probieren Sie verdächtige Saucen nie – entsorgen Sie sie im Zweifel.</p>

<h3>Brauche ich ein spezielles Vakuumiergerät für Gläser?</h3>
<p>Für das Vakuumieren von Gläsern benötigen Sie ein Gerät mit Glas- oder Zubehörfunktion und passendem Schlauch oder einen Vakuumbehälter mit entsprechendem Anschluss. Reine Folienschweißgeräte ohne Zubehöranschluss eignen sich dafür in der Regel nicht. Ein Kammer-Vakuumiergerät bietet bei flüssigen Saucen die besten Ergebnisse, da das Vakuum gleichmäßig im gesamten Raum aufgebaut wird.</p>

<h3>Kann ich das gleiche Glas mehrfach verwenden?</h3>
<p>Ja. Gläser und kompatible Vakuumdeckel sind in der Regel wiederverwendbar – reinigen Sie sie zwischen den Anwendungen gründlich und prüfen Sie die Deckel auf Beschädigungen, damit das Vakuum zuverlässig hält.</p>

<h2>Fazit: Frische verlängern mit dem richtigen Zubehör</h2>

<p>Das Vakuumieren von Gläsern ist eine einfache und wirkungsvolle Methode, um selbst gemachtem Pesto, Tomatensauce und anderen Saucen mehr Frische zu schenken und Lebensmittel zu sparen. Entscheidend bleibt: Vakuumieren verlängert die Haltbarkeit im Kühl- oder Gefrierschrank, ersetzt aber kein fachgerechtes Einkochen für die Lagerung bei Raumtemperatur.</p>

<p>Wenn Sie regelmäßig Saucen und <strong>Lebensmittel vakuumieren</strong> möchten, lohnt sich die passende Ausstattung: ein zuverlässiges <strong>Vakuumiergerät</strong>, wiederverwendbare <strong>Vakuumbehälter und Vakuumgläser</strong> sowie das richtige <strong>Vakuumzubehör</strong> wie Schläuche und kompatible Deckel. In unserem Shop finden Sie dafür eine passende Auswahl – für mehr Frische, weniger Abfall und vollen Geschmack aus der eigenen Küche.</p>
`.trim()

// Lead image shown at the top of the article body (the cover_image itself is
// only used for the listing card / og:image / JSON-LD, not rendered inline).
const IMG_ALT =
  "Selbst gemachtes Pesto und Tomatensauce in Gläsern werden mit einem Planeta Vakuumiergerät vakuumiert"
const FIGURE =
  `<p><img src="${COVER_IMAGE}" alt="${IMG_ALT}" title="${IMG_ALT}" ` +
  `style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:0 0 6px;"/></p>`
const BODY_WITH_IMG = `${FIGURE}\n\n${BODY}`

export default async function publishGlaeserVakuumieren({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const service: any = container.resolve(ARTICLE_MODULE)
  const scModule: any = container.resolve(Modules.SALES_CHANNEL)

  const author_id = await ensureArticleAuthor(container)

  // Scope to the Planeta GmbH shop channel (planeta.de). If the channel can't be
  // resolved, fall back to null (global) rather than failing.
  const [shopChannel] = await scModule.listSalesChannels({ name: SHOP_CHANNEL_NAME })
  const sales_channel_id = shopChannel?.id ?? null
  if (!sales_channel_id) {
    logger.warn(
      `[publish-glaeser-vakuumieren] sales channel '${SHOP_CHANNEL_NAME}' not found — publishing as global (all channels).`
    )
  }

  const fields = {
    title: TITLE,
    category: CATEGORY,
    excerpt: EXCERPT,
    body: BODY_WITH_IMG,
    cover_image: COVER_IMAGE,
    meta_title: META_TITLE,
    meta_description: META_DESCRIPTION,
    author_id,
    sales_channel_id,
    status: "published",
  }

  const [existing] = await service.listArticles({ slug: SLUG }, { take: 1 })

  if (existing) {
    await service.updateArticles({
      id: existing.id,
      ...fields,
      published_at: existing.published_at ?? new Date(),
    })
    logger.info(`[publish-glaeser-vakuumieren] updated + published '${SLUG}' (id=${existing.id}).`)
  } else {
    const created = await service.createArticles({
      slug: SLUG,
      ...fields,
      published_at: new Date(),
    })
    logger.info(`[publish-glaeser-vakuumieren] created + published '${SLUG}' (id=${created.id}).`)
  }
}
