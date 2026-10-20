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

const META_TITLE = "Gläser vakuumieren: Pesto & Saucen richtig lagern"

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

// ─── English ────────────────────────────────────────────────────────────────
const TITLE_EN =
  "Vacuum Sealing Jars: Keep Homemade Pesto, Tomato Sauce and Sauces Fresh for Longer"
const EXCERPT_EN =
  "Vacuum sealing homemade pesto, tomato sauce or herb oil in jars: how to " +
  "preserve aroma and freshness for longer – with a step-by-step guide and the " +
  "most important food-safety notes."
const META_TITLE_EN = "Vacuum Sealing Jars: Store Pesto & Sauces Right"
const META_DESCRIPTION_EN =
  "Vacuum seal pesto, tomato sauce & co. in jars: step-by-step guide, practical " +
  "tips and key safety advice so homemade sauces stay fresh for longer."
const IMG_ALT_EN =
  "Homemade pesto and tomato sauce in jars being vacuum sealed with a Planeta vacuum sealer"

const BODY_EN = `
<p>A freshly made basil pesto, a slow-simmered tomato sauce or an aromatic herb oil – homemade sauces simply taste better. But there is often more left over than you can use in a day. To make sure nothing goes to waste and the flavour lasts as long as possible, it is worth <strong>vacuum sealing jars</strong>.</p>

<p>In this guide you will learn why vacuum sealing sauces in jars is worthwhile, which foods are suitable, how to proceed step by step – and which safety rules you absolutely must follow. Because one thing up front: vacuum sealing keeps food fresh for longer, but it does not replace a proper preservation method.</p>

<h2>Why vacuum seal homemade sauces in jars?</h2>

<p>When you vacuum seal, most of the air is drawn out of the jar. Less oxygen means that oxidation and the growth of many spoilage microbes are slowed down. For your homemade sauces, this has several benefits:</p>

<ul>
  <li><strong>Aroma and colour last longer:</strong> pesto browns more slowly, herbs keep their fresh green.</li>
  <li><strong>Less food waste:</strong> leftovers can be stored in portions instead of being thrown away.</li>
  <li><strong>Order and overview:</strong> jars stack neatly, are reusable and show their contents at a glance.</li>
  <li><strong>Practical portions:</strong> small jars for single meals save time and reduce opened leftovers.</li>
</ul>

<p>The idea of <strong>storing sauce in a jar</strong> gains a whole new quality through vacuum sealing – provided the basic storage rules are right.</p>

<h2>Which foods are suitable for vacuum sealing in jars?</h2>

<p>In principle, many sauces and preparations can be vacuum sealed. What matters is not only the consistency, but also how you store the jar afterwards.</p>

<h3>Particularly suitable</h3>
<ul>
  <li><strong>Vacuum sealing pesto:</strong> basil, rocket or tomato pesto benefits greatly from removing oxygen. A thin layer of oil on top additionally helps protect the aroma.</li>
  <li><strong>Tomato and pasta sauce:</strong> a homemade tomato sauce can be vacuum sealed in portions and kept in the fridge or freezer.</li>
  <li><strong>Vegetable and herb sauces:</strong> puréed vegetable sauces, herb oils and spice pastes stay noticeably fresher when vacuum sealed.</li>
</ul>

<h3>With caution</h3>
<ul>
  <li><strong>Very liquid sauces</strong> can be sucked up during vacuum sealing. If available, use your device's liquid or pulse mode, or freeze the sauce slightly beforehand.</li>
  <li><strong>Warm preparations</strong> should always be left to cool before you close and vacuum seal the jar.</li>
</ul>

<h2>Important: vacuum sealing is not preservation</h2>

<p>This point is crucial for your health: <strong>vacuum sealing alone does not make a sauce safe to store at room temperature.</strong> Removing oxygen slows many spoilage processes, but it does not kill bacteria or their spores.</p>

<p>On the contrary: a low-oxygen environment can even favour certain microbes. <strong>Clostridium botulinum</strong>, the pathogen that causes dangerous botulism, prefers to grow in airtight, low-acid foods at room temperature. Therefore:</p>

<ul>
  <li><strong>Fresh pesto and perishable sauces</strong> always belong in the <strong>fridge</strong> or <strong>freezer</strong> – even when vacuum sealed.</li>
  <li><strong>Making tomato sauce shelf-stable</strong> for storage at room temperature only works through a <strong>tested canning recipe</strong> with sufficient acidity and correct processing times – not through vacuum sealing.</li>
  <li><strong>Never</strong> rely on a merely vacuum-sealed jar being safe in the cupboard.</li>
</ul>

<p>Vacuum sealing is therefore an excellent way to <strong>extend freshness in the fridge or freezer</strong> – but it is no substitute for proper canning.</p>

<h2>Vacuum sealing jars: step by step</h2>

<p>To vacuum seal jars you need a vacuum sealer with a jar or accessory function and a matching hose, compatible lids or special vacuum containers. With a chamber vacuum sealer, even liquid sauces work particularly reliably.</p>

<ol>
  <li><strong>Clean the jar and lid:</strong> rinse both thoroughly and dry them. For a longer shelf life you can also boil the jars.</li>
  <li><strong>Prepare the sauce:</strong> let warm sauces cool completely. Chill very liquid sauces or freeze them slightly beforehand.</li>
  <li><strong>Fill leaving headspace:</strong> leave about 2 cm of space at the top so the vacuum can form without sauce being sucked up.</li>
  <li><strong>Clean the rim:</strong> wipe the jar rim carefully. Residue on the rim prevents a clean vacuum.</li>
  <li><strong>Place the lid and attach the connector:</strong> attach the vacuum connector or hose according to your device's instructions.</li>
  <li><strong>Draw the vacuum:</strong> start the process. For liquid sauces, use the liquid or pulse mode to avoid over-suction.</li>
  <li><strong>Check, label, store:</strong> make sure the lid sits firmly, label the jar with contents and date, and place it in the fridge or freezer.</li>
</ol>

<h2>Practical tips for filling, sealing and storing</h2>

<ul>
  <li><strong>Don't overfill:</strong> headspace is important for a good vacuum.</li>
  <li><strong>Oil layer for pesto:</strong> a thin layer of olive oil over the pesto further protects against oxidation.</li>
  <li><strong>Chill liquids first:</strong> chilled or slightly frozen sauces vacuum seal more cleanly.</li>
  <li><strong>Clean rims:</strong> a grease-free, dry rim ensures a tight seal.</li>
  <li><strong>Always label:</strong> note contents and date to keep track.</li>
  <li><strong>Choose small jars:</strong> portion sizes avoid opened leftovers.</li>
  <li><strong>Store correctly:</strong> perishable sauces in the fridge, for longer storage in the freezer.</li>
</ul>

<h2>Vacuum sealing, refrigerating, freezing or canning – the difference</h2>

<p>These four methods are often confused but serve different purposes:</p>

<ul>
  <li><strong>Refrigerating:</strong> slows spoilage in the short term. Combined with vacuum sealing, sauces stay fresh a few days longer.</li>
  <li><strong>Vacuum sealing:</strong> removes oxygen and thus extends freshness – always <em>in addition</em> to refrigerating or freezing, never as the sole protection.</li>
  <li><strong>Freezing:</strong> largely stops the growth of microorganisms and is excellent for pesto, tomato and vegetable sauces for weeks to months.</li>
  <li><strong>Canning (preserving):</strong> the only one of these methods that – with a tested recipe – allows storage at room temperature, because the food is heated sufficiently.</li>
</ul>

<h2>Common mistakes and how to avoid them</h2>

<ul>
  <li><strong>Jar filled too full:</strong> without headspace, sauce is sucked up and the seal fails.</li>
  <li><strong>Wet or greasy rims:</strong> prevent a tight vacuum – always wipe the rim.</li>
  <li><strong>Liquid sauce without the right mode:</strong> leads to over-suction. Chill first or use pulse mode.</li>
  <li><strong>Storing at room temperature:</strong> the most dangerous mistake. Vacuum-sealed, non-canned sauces belong in the fridge or freezer.</li>
  <li><strong>No date noted:</strong> without labelling you quickly lose track of freshness.</li>
  <li><strong>Unsuitable lids:</strong> a reliable vacuum only forms with compatible lids or vacuum containers.</li>
</ul>

<h2>FAQ – Common questions about vacuum sealing sauces in jars</h2>

<h3>How long does vacuum-sealed pesto last in the fridge?</h3>
<p>Vacuum-sealed pesto usually stays fresh in the fridge a few days longer than an open jar. Rely on its appearance and smell, always keep it refrigerated, and when in doubt, throw it away.</p>

<h3>Can I store tomato sauce at room temperature by vacuum sealing it?</h3>
<p>No. For storage at room temperature, the tomato sauce must be processed using a tested canning recipe with sufficient acidity and correct heating. Vacuum sealing alone is not enough.</p>

<h3>Which jars and lids are suitable?</h3>
<p>Use sturdy jars with compatible vacuum lids or special vacuum containers. Check your vacuum sealer's instructions for which accessories are supported.</p>

<h3>Can I freeze vacuum-sealed sauces?</h3>
<p>Yes. Leave enough headspace, as the contents expand when freezing, and use freezer-safe jars.</p>

<h3>How do I recognise that a sauce has gone off?</h3>
<p>Signs include an unusual smell, a bulging lid, bubbling or discolouration. Never taste suspicious sauces – dispose of them when in doubt.</p>

<h3>Do I need a special vacuum sealer for jars?</h3>
<p>To vacuum seal jars you need a device with a jar or accessory function and a matching hose, or a vacuum container with a suitable connector. Plain bag sealers without an accessory port are generally not suitable. A chamber vacuum sealer gives the best results for liquid sauces, as the vacuum is built up evenly throughout the chamber.</p>

<h3>Can I reuse the same jar?</h3>
<p>Yes. Jars and compatible vacuum lids are usually reusable – clean them thoroughly between uses and check the lids for damage so the vacuum holds reliably.</p>

<h2>Conclusion: extend freshness with the right equipment</h2>

<p>Vacuum sealing jars is a simple and effective way to give homemade pesto, tomato sauce and other sauces more freshness and to save food. The key remains: vacuum sealing extends shelf life in the fridge or freezer, but does not replace proper canning for storage at room temperature.</p>

<p>If you regularly want to <strong>vacuum seal food</strong>, the right equipment is worthwhile: a reliable <strong>vacuum sealer</strong>, reusable <strong>vacuum containers and jars</strong> as well as the right <strong>vacuum accessories</strong> such as hoses and compatible lids. In our shop you will find a suitable selection – for more freshness, less waste and full flavour from your own kitchen.</p>
`.trim()

const FIGURE_EN =
  `<p><img src="${COVER_IMAGE}" alt="${IMG_ALT_EN}" title="${IMG_ALT_EN}" ` +
  `style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:0 0 6px;"/></p>`
const BODY_EN_WITH_IMG = `${FIGURE_EN}\n\n${BODY_EN}`

// ─── Italian ────────────────────────────────────────────────────────────────
const TITLE_IT =
  "Vasetti sottovuoto: mantenere freschi più a lungo pesto, salsa di pomodoro e salse fatte in casa"
const EXCERPT_IT =
  "Mettere sottovuoto pesto, salsa di pomodoro o olio alle erbe fatti in casa nei " +
  "vasetti: come preservare aroma e freschezza più a lungo, con guida passo passo " +
  "e le note di sicurezza alimentare più importanti."
const META_TITLE_IT = "Vasetti sottovuoto: conservare pesto e salse"
const META_DESCRIPTION_IT =
  "Mettere sottovuoto pesto, salsa di pomodoro e altro nei vasetti: guida passo " +
  "passo, consigli pratici e avvertenze di sicurezza per salse fatte in casa più fresche a lungo."
const IMG_ALT_IT =
  "Pesto e salsa di pomodoro fatti in casa nei vasetti messi sottovuoto con un apparecchio Planeta"

const BODY_IT = `
<p>Un pesto appena preparato, una salsa di pomodoro cotta lentamente o un aromatico olio alle erbe: le salse fatte in casa hanno semplicemente un sapore migliore. Spesso però ne avanza più di quanta se ne possa consumare in un giorno. Per non sprecare nulla e mantenere l'aroma il più a lungo possibile, vale la pena <strong>mettere sottovuoto i vasetti</strong>.</p>

<p>In questa guida scoprirai perché conviene mettere sottovuoto le salse nei vasetti, quali alimenti sono adatti, come procedere passo passo e quali regole di sicurezza devi assolutamente rispettare. Perché una cosa è certa fin da subito: il sottovuoto mantiene gli alimenti freschi più a lungo, ma non sostituisce un vero metodo di conservazione.</p>

<h2>Perché mettere sottovuoto le salse fatte in casa nei vasetti?</h2>

<p>Durante la messa sottovuoto, gran parte dell'aria viene estratta dal vasetto. Meno ossigeno significa rallentare l'ossidazione e la crescita di molti microrganismi responsabili del deterioramento. Per le tue salse fatte in casa questo comporta diversi vantaggi:</p>

<ul>
  <li><strong>Aroma e colore durano più a lungo:</strong> il pesto si scurisce più lentamente, le erbe mantengono il loro verde fresco.</li>
  <li><strong>Meno spreco alimentare:</strong> gli avanzi si conservano in porzioni invece di essere gettati.</li>
  <li><strong>Ordine e visione d'insieme:</strong> i vasetti si impilano ordinatamente, sono riutilizzabili e mostrano il contenuto a colpo d'occhio.</li>
  <li><strong>Porzioni pratiche:</strong> vasetti piccoli per singoli pasti fanno risparmiare tempo e riducono gli avanzi aperti.</li>
</ul>

<p>Il concetto di <strong>conservare la salsa nel vasetto</strong> acquista così una qualità del tutto nuova grazie al sottovuoto, a condizione che le regole di base per la conservazione siano rispettate.</p>

<h2>Quali alimenti sono adatti al sottovuoto nei vasetti?</h2>

<p>In linea di principio molte salse e preparazioni possono essere messe sottovuoto. Ciò che conta non è solo la consistenza, ma anche come conservi il vasetto in seguito.</p>

<h3>Particolarmente adatti</h3>
<ul>
  <li><strong>Mettere sottovuoto il pesto:</strong> il pesto di basilico, rucola o pomodoro trae grande beneficio dall'eliminazione dell'ossigeno. Un sottile strato d'olio in superficie aiuta inoltre a proteggere l'aroma.</li>
  <li><strong>Salsa di pomodoro e per la pasta:</strong> una salsa di pomodoro fatta in casa può essere messa sottovuoto in porzioni e conservata in frigorifero o nel congelatore.</li>
  <li><strong>Salse di verdure ed erbe:</strong> salse di verdure frullate, oli alle erbe e paste di spezie restano decisamente più fresche se messe sottovuoto.</li>
</ul>

<h3>Con cautela</h3>
<ul>
  <li><strong>Le salse molto liquide</strong> possono essere risucchiate durante il sottovuoto. Se disponibile, usa la modalità liquidi o a impulsi del tuo apparecchio, oppure congela leggermente la salsa in anticipo.</li>
  <li><strong>Le preparazioni calde</strong> vanno sempre lasciate raffreddare prima di chiudere e mettere sottovuoto il vasetto.</li>
</ul>

<h2>Importante: il sottovuoto non è conservazione</h2>

<p>Questo punto è fondamentale per la tua salute: <strong>il sottovuoto da solo non rende una salsa sicura da conservare a temperatura ambiente.</strong> L'eliminazione dell'ossigeno rallenta molti processi di deterioramento, ma non uccide i batteri né le loro spore.</p>

<p>Al contrario: un ambiente povero di ossigeno può addirittura favorire alcuni microrganismi. Il <strong>Clostridium botulinum</strong>, l'agente del pericoloso botulismo, si sviluppa preferibilmente in alimenti poco acidi e chiusi ermeticamente a temperatura ambiente. Perciò:</p>

<ul>
  <li><strong>Il pesto fresco e le salse deperibili</strong> vanno sempre in <strong>frigorifero</strong> o nel <strong>congelatore</strong>, anche se messi sottovuoto.</li>
  <li><strong>Rendere conservabile la salsa di pomodoro</strong> per lo stoccaggio a temperatura ambiente funziona solo tramite una <strong>ricetta di conservazione collaudata</strong> con sufficiente acidità e tempi di riscaldamento corretti, non con il sottovuoto.</li>
  <li><strong>Non</strong> fare mai affidamento sul fatto che un vasetto semplicemente messo sottovuoto sia sicuro nella dispensa.</li>
</ul>

<p>Il sottovuoto è quindi un ottimo mezzo per <strong>prolungare la freschezza in frigorifero o nel congelatore</strong>, ma non sostituisce una corretta conservazione tramite cottura.</p>

<h2>Mettere sottovuoto i vasetti: passo passo</h2>

<p>Per mettere sottovuoto i vasetti ti serve una macchina sottovuoto con funzione per vasetti o accessori e tubo adatto, coperchi compatibili o appositi contenitori sottovuoto. Con una macchina sottovuoto a campana anche le salse liquide riescono in modo particolarmente affidabile.</p>

<ol>
  <li><strong>Pulisci vasetto e coperchio:</strong> sciacqua bene entrambi e asciugali. Per una durata maggiore puoi anche bollire i vasetti.</li>
  <li><strong>Prepara la salsa:</strong> lascia raffreddare completamente le salse calde. Raffredda le salse molto liquide o congelale leggermente prima.</li>
  <li><strong>Riempi lasciando spazio:</strong> lascia circa 2 cm liberi in alto, così il vuoto può formarsi senza risucchiare la salsa.</li>
  <li><strong>Pulisci il bordo:</strong> pulisci con cura il bordo del vasetto. I residui sul bordo impediscono un vuoto pulito.</li>
  <li><strong>Posiziona il coperchio e collega l'attacco:</strong> collega l'attacco o il tubo del sottovuoto secondo le istruzioni del tuo apparecchio.</li>
  <li><strong>Crea il vuoto:</strong> avvia il processo. Per le salse liquide usa la modalità liquidi o a impulsi per evitare il risucchio eccessivo.</li>
  <li><strong>Controlla, etichetta, conserva:</strong> verifica che il coperchio sia ben saldo, etichetta il vasetto con contenuto e data e riponilo in frigorifero o nel congelatore.</li>
</ol>

<h2>Consigli pratici per riempire, chiudere e conservare</h2>

<ul>
  <li><strong>Non riempire troppo:</strong> lo spazio in alto è importante per un buon vuoto.</li>
  <li><strong>Strato d'olio per il pesto:</strong> un sottile strato di olio d'oliva sul pesto protegge ulteriormente dall'ossidazione.</li>
  <li><strong>Raffredda prima i liquidi:</strong> le salse fredde o leggermente congelate si mettono sottovuoto in modo più pulito.</li>
  <li><strong>Bordi puliti:</strong> un bordo asciutto e privo di grasso garantisce una chiusura ermetica.</li>
  <li><strong>Etichetta sempre:</strong> annota contenuto e data per non perdere il conto.</li>
  <li><strong>Scegli vasetti piccoli:</strong> le porzioni evitano avanzi aperti.</li>
  <li><strong>Conserva correttamente:</strong> le salse deperibili in frigorifero, per una conservazione più lunga nel congelatore.</li>
</ul>

<h2>Sottovuoto, frigorifero, congelatore o conservazione sotto cottura: la differenza</h2>

<p>Questi quattro metodi vengono spesso confusi, ma hanno scopi diversi:</p>

<ul>
  <li><strong>Frigorifero:</strong> rallenta il deterioramento a breve termine. In combinazione con il sottovuoto, le salse restano fresche qualche giorno in più.</li>
  <li><strong>Sottovuoto:</strong> elimina l'ossigeno e prolunga così la freschezza, sempre <em>in aggiunta</em> al frigorifero o al congelatore, mai come unica protezione.</li>
  <li><strong>Congelatore:</strong> arresta in gran parte la crescita dei microrganismi ed è ideale per pesto, salse di pomodoro e di verdure per settimane o mesi.</li>
  <li><strong>Conservazione sotto cottura (invasettatura):</strong> l'unico di questi metodi che, con una ricetta collaudata, consente la conservazione a temperatura ambiente, poiché l'alimento viene riscaldato a sufficienza.</li>
</ul>

<h2>Errori comuni e come evitarli</h2>

<ul>
  <li><strong>Vasetto troppo pieno:</strong> senza spazio in alto la salsa viene risucchiata e la chiusura non riesce.</li>
  <li><strong>Bordi bagnati o unti:</strong> impediscono un vuoto ermetico, pulisci sempre il bordo.</li>
  <li><strong>Salsa liquida senza la modalità adatta:</strong> provoca il risucchio. Raffredda prima o usa la modalità a impulsi.</li>
  <li><strong>Conservazione a temperatura ambiente:</strong> l'errore più pericoloso. Le salse messe sottovuoto ma non cotte in conserva vanno in frigorifero o nel congelatore.</li>
  <li><strong>Nessuna data annotata:</strong> senza etichetta si perde rapidamente il conto della freschezza.</li>
  <li><strong>Coperchi non adatti:</strong> un vuoto affidabile si forma solo con coperchi compatibili o contenitori sottovuoto.</li>
</ul>

<h2>FAQ – Domande frequenti sul sottovuoto delle salse nei vasetti</h2>

<h3>Quanto dura il pesto sottovuoto in frigorifero?</h3>
<p>Il pesto sottovuoto di solito resta fresco in frigorifero qualche giorno in più rispetto a un vasetto aperto. Affidati all'aspetto e all'odore, conservalo sempre in frigorifero e, nel dubbio, è meglio gettarlo.</p>

<h3>Posso conservare la salsa di pomodoro a temperatura ambiente mettendola sottovuoto?</h3>
<p>No. Per la conservazione a temperatura ambiente la salsa di pomodoro deve essere lavorata secondo una ricetta di conservazione collaudata con sufficiente acidità e corretto riscaldamento. Il solo sottovuoto non basta.</p>

<h3>Quali vasetti e coperchi sono adatti?</h3>
<p>Usa vasetti robusti con coperchi sottovuoto compatibili o appositi contenitori sottovuoto. Controlla nelle istruzioni della tua macchina sottovuoto quali accessori sono supportati.</p>

<h3>Posso congelare le salse messe sottovuoto?</h3>
<p>Sì. Lascia spazio sufficiente, poiché il contenuto si espande congelando, e usa vasetti adatti al congelatore.</p>

<h3>Come capisco che una salsa è andata a male?</h3>
<p>I segnali sono un odore insolito, un coperchio gonfio, la formazione di bolle o alterazioni del colore. Non assaggiare mai le salse sospette: nel dubbio eliminale.</p>

<h3>Serve una macchina sottovuoto speciale per i vasetti?</h3>
<p>Per mettere sottovuoto i vasetti serve un apparecchio con funzione per vasetti o accessori e tubo adatto, oppure un contenitore sottovuoto con attacco idoneo. Le semplici sigillatrici per sacchetti senza attacco per accessori di solito non sono adatte. Una macchina sottovuoto a campana offre i risultati migliori con le salse liquide, poiché il vuoto si crea in modo uniforme in tutta la camera.</p>

<h3>Posso riutilizzare lo stesso vasetto?</h3>
<p>Sì. Vasetti e coperchi sottovuoto compatibili sono generalmente riutilizzabili: puliscili a fondo tra un uso e l'altro e controlla che i coperchi non siano danneggiati, così il vuoto tiene in modo affidabile.</p>

<h2>Conclusione: prolunga la freschezza con l'attrezzatura giusta</h2>

<p>Mettere sottovuoto i vasetti è un modo semplice ed efficace per donare più freschezza a pesto, salsa di pomodoro e altre salse fatte in casa e per ridurre gli sprechi. Resta però fondamentale: il sottovuoto prolunga la durata in frigorifero o nel congelatore, ma non sostituisce una corretta conservazione sotto cottura per lo stoccaggio a temperatura ambiente.</p>

<p>Se desideri <strong>mettere sottovuoto gli alimenti</strong> con regolarità, vale la pena avere l'attrezzatura adatta: una <strong>macchina sottovuoto</strong> affidabile, <strong>contenitori e vasetti sottovuoto</strong> riutilizzabili e i giusti <strong>accessori per il sottovuoto</strong> come tubi e coperchi compatibili. Nel nostro shop troverai una selezione adeguata, per più freschezza, meno sprechi e tutto il gusto della tua cucina.</p>
`.trim()

const FIGURE_IT =
  `<p><img src="${COVER_IMAGE}" alt="${IMG_ALT_IT}" title="${IMG_ALT_IT}" ` +
  `style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:0 0 6px;"/></p>`
const BODY_IT_WITH_IMG = `${FIGURE_IT}\n\n${BODY_IT}`

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
    // English
    title_en: TITLE_EN,
    excerpt_en: EXCERPT_EN,
    body_en: BODY_EN_WITH_IMG,
    meta_title_en: META_TITLE_EN,
    meta_description_en: META_DESCRIPTION_EN,
    // Italian
    title_it: TITLE_IT,
    excerpt_it: EXCERPT_IT,
    body_it: BODY_IT_WITH_IMG,
    meta_title_it: META_TITLE_IT,
    meta_description_it: META_DESCRIPTION_IT,
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
