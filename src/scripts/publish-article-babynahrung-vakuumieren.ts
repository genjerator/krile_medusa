import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Publishes the Planeta.de Magazin article "Babynahrung vakuumieren" (preparing,
 * portioning & freezing homemade baby food with a vacuum sealer and vacuum bags).
 * Create-or-update by slug, scoped to the PlanetaWebshop sales channel. Idempotent.
 *
 * Run (local dev): npx medusa exec ./src/scripts/publish-article-babynahrung-vakuumieren.ts
 * Run (prod):      ... npx medusa exec ./src/scripts/publish-article-babynahrung-vakuumieren.js
 */

const SLUG = "babynahrung-vakuumieren"
const CATEGORY = "Lebensmittel haltbar machen & lagern"
const SHOP_CHANNEL_NAME = "PlanetaWebshop"

// Cover image lives in S3 (single copy, served to every storefront). Bucket
// policy makes it publicly readable.
const COVER_IMAGE =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/babynahrung-vakuumieren.jpg"

// Lead image shown at the top of the article body (localised alt per language).
const figure = (alt: string) =>
  `<p><img src="${COVER_IMAGE}" alt="${alt}" title="${alt}" ` +
  `style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:0 0 6px;"/></p>`
const IMG_ALT_DE =
  "Selbst gemachter Babybrei portionsweise in beschrifteten Vakuumbeuteln neben einem Vakuumiergerät"
const IMG_ALT_EN =
  "Homemade baby food portioned into labelled vacuum bags next to a vacuum sealer"
const IMG_ALT_IT =
  "Pappa fatta in casa porzionata in sacchetti sottovuoto etichettati accanto a una macchina sottovuoto"

const TITLE =
  "Babynahrung vakuumieren: Babybrei vorbereiten, portionieren und einfrieren"

const EXCERPT =
  "Selbst gemachten Babybrei vakuumieren, portionsweise einfrieren und sicher " +
  "aufbewahren: praktische Tipps für die Beikost-Zubereitung – mit den wichtigsten " +
  "Hinweisen zur Lebensmittelsicherheit für Babys."

const META_TITLE = "Babynahrung vakuumieren: Babybrei vorbereiten & einfrieren"

const META_DESCRIPTION =
  "Selbst gemachten Babybrei vakuumieren, portionsweise einfrieren und sicher " +
  "aufbewahren: praktische Meal-Prep-Tipps für Eltern – mit wichtigen Sicherheitshinweisen."

const BODY = `
<p>Selbst gemachter Babybrei ist frisch, ohne unnötiges Salz oder Zucker – und mit etwas Vorbereitung lässt er sich prima auf Vorrat kochen. Wer mehrere Portionen auf einmal zubereitet, spart an stressigen Tagen viel Zeit. Das <strong>Babynahrung vakuumieren</strong> kann dabei helfen, Portionen ordentlich zu verpacken, platzsparend einzufrieren und den Überblick zu behalten.</p>

<p>In diesem Ratgeber zeigen wir, wie Sie Babybrei in größeren Mengen vorbereiten, mit Vakuumbeuteln portionieren und sicher einfrieren. Wichtig vorab: Vakuumieren hält Lebensmittel ordentlich verpackt und platzsparend – es ersetzt aber weder Kühlen noch Einfrieren und macht Babynahrung nicht bei Raumtemperatur haltbar.</p>

<h2>Warum Babynahrung selbst zubereiten?</h2>

<p>Selbst gekochte Beikost hat für viele Eltern klare Vorteile:</p>

<ul>
  <li><strong>Zutaten unter Kontrolle:</strong> Sie entscheiden, was in den Brei kommt, und können auf zugesetztes Salz und Zucker verzichten.</li>
  <li><strong>Frische und Abwechslung:</strong> saisonales Gemüse und Obst lassen sich altersgerecht kombinieren.</li>
  <li><strong>Weniger Verpackungsmüll und Kosten:</strong> größere Mengen selbst kochen ist oft günstiger als fertige Gläschen.</li>
  <li><strong>Gewohnheiten fördern:</strong> Ihr Kind lernt frühzeitig unterschiedliche Geschmacksrichtungen kennen.</li>
</ul>

<p>Wann und wie Sie mit Beikost starten, besprechen Sie am besten anhand kinderärztlicher Empfehlungen – jedes Kind entwickelt sich individuell.</p>

<h2>Welche Lebensmittel eignen sich für selbst gemachten Babybrei?</h2>

<h3>Gemüse</h3>
<p>Gut geeignet sind mild schmeckende, weich gegarte Gemüsesorten wie <strong>Karotten, Kürbis, Süßkartoffeln und Zucchini</strong>. Sie lassen sich fein pürieren und sind bei vielen Babys beliebt.</p>

<h3>Obst</h3>
<p>Fruchtpürees aus <strong>Apfel und Birne</strong> eignen sich gut als erste Obstbeikost. Reifes Obst schonend dünsten und anschließend fein pürieren.</p>

<h3>Altersgerechte Kombinationen</h3>
<p>Mit zunehmendem Alter lassen sich Breie um sättigende Komponenten wie <strong>Kartoffeln, Reis oder andere geeignete Getreide</strong> ergänzen. Orientieren Sie sich bei Zutaten, Konsistenz und dem Einführen von Allergenen an aktuellen Beikost-Empfehlungen (siehe Quellen am Ende).</p>

<h2>Babybrei vorbereiten: Schritt für Schritt</h2>

<p>So bereiten Sie mehrere Portionen auf einmal zu:</p>

<ol>
  <li><strong>Waschen und schälen:</strong> Gemüse und Obst gründlich waschen und – wo sinnvoll – schälen.</li>
  <li><strong>Weich garen:</strong> in wenig Wasser dünsten oder dämpfen, bis alles sehr weich ist. Dämpfen erhält mehr Nährstoffe.</li>
  <li><strong>Pürieren oder zerdrücken:</strong> auf die altersgerechte Konsistenz bringen – fein püriert für den Anfang, später gröber.</li>
  <li><strong>Zügig abkühlen:</strong> den Brei nach dem Garen rasch abkühlen lassen, zum Beispiel in flachen Gefäßen, und nicht lange bei Raumtemperatur stehen lassen.</li>
  <li><strong>Portionieren:</strong> den abgekühlten Brei in einzelne Portionen aufteilen – so taut später nur auf, was gerade gebraucht wird.</li>
</ol>

<h2>Babynahrung vakuumieren: so gelingt es mit Vakuumbeuteln</h2>

<p>Für das Vakuumieren brauchen Sie ein geeignetes Vakuumiergerät – zum Beispiel ein Edelstahl-Tischgerät – und dazu passende, lebensmittelechte <strong>Vakuumbeutel</strong>. So gehen Sie vor:</p>

<ul>
  <li><strong>Erst abkühlen, dann abfüllen:</strong> Füllen Sie nur vollständig abgekühlten Brei ein. Warme Speisen gehören nicht in den Beutel, da das Abkühlen sonst verzögert wird.</li>
  <li><strong>Platz zum Verschweißen lassen:</strong> Lassen Sie oben genügend Rand frei, damit die Schweißnaht sauber schließt.</li>
  <li><strong>Schweißbereich sauber halten:</strong> Der Beutelrand muss trocken und frei von Breiresten sein – sonst hält die Naht nicht zuverlässig.</li>
  <li><strong>Flüssiges bedenken:</strong> Dünne Pürees und Flüssigkeiten können in das Gerät gezogen werden. Nutzen Sie – falls vorhanden – eine geeignete Funktion für feuchte Lebensmittel bzw. den Puls-Modus, frieren Sie den Brei vorher leicht an oder verwenden Sie passende Behälter.</li>
  <li><strong>Herstellerhinweise beachten:</strong> Richten Sie sich nach der Bedienungsanleitung Ihres Geräts und verwenden Sie nur dafür vorgesehene Beutel.</li>
</ul>

<p>Wichtig: Vakuumieren ist <strong>kein Garen und keine Sterilisation</strong>. Es entfernt lediglich Luft aus dem Beutel und schützt vor Gefrierbrand – Keime werden dadurch nicht abgetötet.</p>

<h2>Einfrieren und Aufbewahren</h2>

<p>Vakuumierte Portionen lassen sich platzsparend und ordentlich einfrieren. Beachten Sie dabei:</p>

<ul>
  <li><strong>Babybrei portionsweise einfrieren:</strong> einzelne Portionen frieren schneller durch und lassen sich bedarfsgerecht entnehmen.</li>
  <li><strong>Beschriften:</strong> Notieren Sie Inhalt und Zubereitungsdatum auf jedem Beutel.</li>
  <li><strong>Sicher auftauen:</strong> Portionen im Kühlschrank auftauen, nicht bei Raumtemperatur. Aufgetauten Brei vor dem Füttern gut durcherhitzen und anschließend auf Esstemperatur abkühlen lassen.</li>
  <li><strong>Nicht wieder einfrieren:</strong> einmal aufgetaute Portionen nicht erneut einfrieren.</li>
</ul>

<p>Als grobe Orientierung hält sich frisch zubereiteter Babybrei im Kühlschrank meist nur etwa ein bis zwei Tage und im Gefrierfach einige Wochen bis wenige Monate. Verlassen Sie sich nicht auf pauschale Angaben, sondern orientieren Sie sich an offiziellen Empfehlungen (siehe Quellen) und an Aussehen und Geruch. <strong>Vakuumieren verlängert diese Zeiten nicht automatisch</strong> und macht Babynahrung nicht bei Raumtemperatur haltbar.</p>

<h2>Praktischer Meal-Prep-Ablauf für Eltern</h2>

<p>So bereiten Sie an einem ruhigen Tag Vorräte für die Woche vor:</p>

<ol>
  <li>Mehrere Gemüse- oder Obstsorten gleichzeitig weich garen.</li>
  <li>Getrennt pürieren und zügig abkühlen lassen.</li>
  <li>In kindgerechte Portionen aufteilen.</li>
  <li>In Vakuumbeutel füllen, verschweißen und beschriften.</li>
  <li>Flach einfrieren – so lassen sich die Portionen platzsparend stapeln.</li>
</ol>

<p>An stressigen Tagen nehmen Sie einfach eine Portion aus dem Gefrierfach, tauen sie im Kühlschrank auf und erwärmen sie frisch.</p>

<h2>Vakuumbeutel oder Vakuumbehälter?</h2>

<p>Beide Varianten haben ihre Stärken – welche besser passt, hängt von Konsistenz und Gewohnheiten ab:</p>

<ul>
  <li><strong>Vakuumbeutel:</strong> platzsparend im Gefrierfach, gut stapelbar und ideal für flach eingefrorene Portionen. Für sehr dünne Pürees ist jedoch Vorsicht beim Vakuumieren nötig.</li>
  <li><strong>Vakuumbehälter:</strong> wiederverwendbar, stabil und praktisch für flüssigere Breie, die sonst ins Gerät gezogen würden – benötigen aber mehr Platz.</li>
</ul>

<p>Beutel sind also nicht automatisch die bessere Wahl. Für viele Eltern ist eine Kombination sinnvoll: Behälter für flüssige, Beutel für festere Breie.</p>

<h2>Sicherheit für Babys</h2>

<p>Gerade bei Säuglingen ist sorgfältige Hygiene besonders wichtig:</p>

<ul>
  <li><strong>Altersgerechte Konsistenz:</strong> am Anfang fein püriert, später der Entwicklung entsprechend gröber.</li>
  <li><strong>Allergene bewusst einführen:</strong> orientieren Sie sich an aktuellen Beikost-Empfehlungen und besprechen Sie Unsicherheiten mit Ihrer Kinderärztin oder Ihrem Kinderarzt.</li>
  <li><strong>Hygienisch arbeiten:</strong> Hände, Arbeitsflächen und Geräte sauber halten; rohe und gegarte Lebensmittel trennen, um Kreuzkontamination zu vermeiden.</li>
  <li><strong>Sicher garen und kühlen:</strong> gründlich durchgaren und anschließend zügig abkühlen.</li>
  <li><strong>Ohne Salz und Zucker:</strong> auf zugesetztes Salz und Zucker verzichten.</li>
  <li><strong>Reste nach der Mahlzeit entsorgen:</strong> Brei, von dem Ihr Baby bereits gegessen hat, nicht aufbewahren – über den Löffel gelangt Speichel in den Brei und kann die Keimbildung fördern. Entnehmen Sie daher immer nur so viel, wie gegessen wird.</li>
</ul>

<h2>Wichtig: Vakuumieren ersetzt keine Konservierung</h2>

<p>Dieser Punkt ist entscheidend: <strong>Vakuumieren allein sterilisiert nicht, beseitigt keine Krankheitserreger und macht selbst gemachte Babynahrung nicht bei Raumtemperatur haltbar.</strong> Das Entfernen von Luft kann zudem eine sauerstoffarme Umgebung schaffen, in der sich bestimmte Keime unter ungünstigen Bedingungen vermehren können. Vakuumieren ist deshalb kein Ersatz für fachgerechtes Kühlen und Einfrieren, sondern eine praktische Ergänzung für Ordnung und Portionierung.</p>

<h2>FAQ – Häufige Fragen zum Vakuumieren von Babynahrung</h2>

<h3>Kann ich Babybrei warm vakuumieren?</h3>
<p>Nein. Füllen Sie nur vollständig abgekühlten Brei ein. Warmes Vakuumieren verzögert das Abkühlen und ist aus Sicherheitsgründen nicht empfehlenswert.</p>

<h3>Kann ich vakuumierte Babynahrung ohne Kühlung lagern?</h3>
<p>Nein. Vakuumieren macht Babybrei nicht bei Raumtemperatur haltbar. Bewahren Sie Portionen immer im Kühlschrank oder Gefrierfach auf.</p>

<h3>Lassen sich Pürees vakuumieren, ohne dass Flüssigkeit ins Gerät gezogen wird?</h3>
<p>Dünne Pürees können angesaugt werden. Nutzen Sie eine geeignete Funktion für feuchte Lebensmittel bzw. den Puls-Modus, frieren Sie den Brei vorher leicht an oder verwenden Sie Vakuumbehälter statt Beutel.</p>

<h3>Kann ich Vakuumbeutel wiederverwenden?</h3>
<p>Beutel, die mit rohen oder bereits angegessenen Lebensmitteln in Kontakt waren, sollten Sie aus Hygienegründen nicht wiederverwenden. Für Babynahrung empfiehlt sich im Zweifel ein frischer Beutel oder ein reinigbarer Vakuumbehälter.</p>

<h2>Fazit: Mehr Organisation mit dem richtigen Zubehör</h2>

<p>Mit etwas Vorbereitung lässt sich selbst gemachter Babybrei bequem auf Vorrat kochen, portionieren und einfrieren. Das Vakuumieren hilft dabei, Portionen ordentlich und platzsparend zu verpacken – ersetzt aber kein Kühlen oder Einfrieren und verlängert die Haltbarkeit nicht von allein.</p>

<p>Wer regelmäßig Beikost vorbereitet, profitiert von passendem Zubehör: einem zuverlässigen <strong>Vakuumiergerät</strong> und dazu kompatiblen, lebensmittelechten <strong>Vakuumbeuteln</strong>. In unserem Shop finden Sie eine passende Auswahl – als praktische Helfer für gut organisierte Babybrei-Portionen im Alltag.</p>

<h2>Weiterführende Quellen</h2>

<ul>
  <li><a href="https://www.gesund-ins-leben.de" target="_blank" rel="noopener noreferrer">Gesund ins Leben – Netzwerk Junge Familie</a> (Empfehlungen zu Beikost und Allergieprävention)</li>
  <li><a href="https://www.bzfe.de" target="_blank" rel="noopener noreferrer">Bundeszentrum für Ernährung (BZfE)</a></li>
  <li><a href="https://www.bfr.bund.de" target="_blank" rel="noopener noreferrer">Bundesinstitut für Risikobewertung (BfR)</a> (Lebensmittelhygiene und -sicherheit)</li>
  <li><a href="https://www.kindergesundheit-info.de" target="_blank" rel="noopener noreferrer">kindergesundheit-info.de (BZgA)</a></li>
</ul>

<p>Bei Fragen zur individuellen Ernährung Ihres Kindes wenden Sie sich bitte an Ihre Kinderärztin, Ihren Kinderarzt oder eine qualifizierte Ernährungsfachkraft.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
const TITLE_EN =
  "Vacuum Sealing Baby Food: Prepare, Portion and Freeze Homemade Purées"
const EXCERPT_EN =
  "Vacuum sealing homemade baby food, freezing it in portions and storing it " +
  "safely: practical meal-prep tips for parents – with the most important " +
  "food-safety notes for babies."
const META_TITLE_EN = "Vacuum Sealing Baby Food: Prepare & Freeze Purées"
const META_DESCRIPTION_EN =
  "Vacuum seal homemade baby food, freeze it in portions and store it safely: " +
  "practical meal-prep tips for parents – with important safety notes."

const BODY_EN = `
<p>Homemade baby food is fresh, free of unnecessary salt or sugar – and with a little preparation it can easily be cooked in advance. Anyone who prepares several portions at once saves a lot of time on hectic days. <strong>Vacuum sealing baby food</strong> can help to pack portions neatly, freeze them in a space-saving way and keep track of everything.</p>

<p>In this guide we show you how to prepare baby food in larger quantities, portion it with vacuum bags and freeze it safely. One thing up front: vacuum sealing keeps food neatly packed and space-saving – but it replaces neither refrigerating nor freezing and does not make baby food shelf-stable at room temperature.</p>

<h2>Why prepare homemade baby food?</h2>

<p>For many parents, home-cooked complementary food has clear advantages:</p>

<ul>
  <li><strong>Ingredients under control:</strong> you decide what goes into the purée and can avoid added salt and sugar.</li>
  <li><strong>Freshness and variety:</strong> seasonal vegetables and fruit can be combined in an age-appropriate way.</li>
  <li><strong>Less packaging waste and cost:</strong> cooking larger amounts yourself is often cheaper than ready-made jars.</li>
  <li><strong>Encouraging habits:</strong> your child gets to know different flavours early on.</li>
</ul>

<p>When and how to start complementary feeding is best discussed based on paediatric recommendations – every child develops individually.</p>

<h2>Which foods are suitable for homemade baby food?</h2>

<h3>Vegetables</h3>
<p>Mild, soft-cooked vegetables such as <strong>carrots, pumpkin, sweet potatoes and zucchini</strong> are well suited. They purée finely and are popular with many babies.</p>

<h3>Fruit</h3>
<p>Fruit purées of <strong>apple and pear</strong> are good as a first fruit food. Gently steam ripe fruit and then purée it finely.</p>

<h3>Age-appropriate combinations</h3>
<p>As your child grows, purées can be supplemented with filling components such as <strong>potatoes, rice or other suitable grains</strong>. For ingredients, consistency and the introduction of allergens, follow current complementary-feeding recommendations (see sources at the end).</p>

<h2>Preparing baby food step by step</h2>

<p>Here's how to prepare several portions at once:</p>

<ol>
  <li><strong>Wash and peel:</strong> wash vegetables and fruit thoroughly and – where useful – peel them.</li>
  <li><strong>Cook until soft:</strong> steam or simmer in a little water until everything is very soft. Steaming preserves more nutrients.</li>
  <li><strong>Purée or mash:</strong> bring to an age-appropriate consistency – finely puréed at first, coarser later.</li>
  <li><strong>Cool quickly:</strong> let the purée cool rapidly after cooking, for example in shallow containers, and don't leave it standing at room temperature for long.</li>
  <li><strong>Portion:</strong> divide the cooled purée into individual portions – so later only what is needed is thawed.</li>
</ol>

<h2>Vacuum sealing baby food: how it works with vacuum bags</h2>

<p>For vacuum sealing you need a suitable vacuum sealer – for example a stainless-steel countertop machine – and matching, food-safe <strong>vacuum bags</strong>. Here's how:</p>

<ul>
  <li><strong>Cool first, then fill:</strong> only fill in fully cooled purée. Warm food does not belong in the bag, as it would otherwise delay cooling.</li>
  <li><strong>Leave room for sealing:</strong> leave enough space at the top so the seam closes cleanly.</li>
  <li><strong>Keep the sealing area clean:</strong> the bag edge must be dry and free of food residue – otherwise the seam won't hold reliably.</li>
  <li><strong>Mind liquids:</strong> thin purées and liquids can be drawn into the machine. If available, use a suitable moist-food function or pulse mode, freeze the purée slightly beforehand, or use suitable containers.</li>
  <li><strong>Follow the manufacturer's instructions:</strong> go by your device's manual and use only the bags intended for it.</li>
</ul>

<p>Important: vacuum sealing is <strong>not cooking and not sterilization</strong>. It merely removes air from the bag and protects against freezer burn – it does not kill germs.</p>

<h2>Freezing and storage</h2>

<p>Vacuum-sealed portions freeze neatly and save space. Keep in mind:</p>

<ul>
  <li><strong>Freeze baby food in portions:</strong> individual portions freeze through faster and can be taken out as needed.</li>
  <li><strong>Label:</strong> note the contents and preparation date on each bag.</li>
  <li><strong>Thaw safely:</strong> thaw portions in the fridge, not at room temperature. Reheat thawed purée thoroughly before feeding, then let it cool to eating temperature.</li>
  <li><strong>Don't refreeze:</strong> do not freeze thawed portions again.</li>
</ul>

<p>As a rough guide, freshly prepared baby food usually keeps only about one to two days in the fridge and a few weeks to a few months in the freezer. Don't rely on blanket figures; follow official recommendations (see sources) and check appearance and smell. <strong>Vacuum sealing does not automatically extend these times</strong> and does not make baby food shelf-stable at room temperature.</p>

<h2>A practical meal-prep workflow for parents</h2>

<p>Here's how to prepare supplies for the week on a quiet day:</p>

<ol>
  <li>Cook several types of vegetables or fruit soft at the same time.</li>
  <li>Purée separately and let cool quickly.</li>
  <li>Divide into child-friendly portions.</li>
  <li>Fill into vacuum bags, seal and label.</li>
  <li>Freeze flat – so the portions stack in a space-saving way.</li>
</ol>

<p>On hectic days, simply take a portion from the freezer, thaw it in the fridge and warm it up fresh.</p>

<h2>Vacuum bags or vacuum containers?</h2>

<p>Both options have their strengths – which suits better depends on consistency and habits:</p>

<ul>
  <li><strong>Vacuum bags:</strong> space-saving in the freezer, easy to stack and ideal for flat-frozen portions. For very thin purées, however, caution is needed when vacuum sealing.</li>
  <li><strong>Vacuum containers:</strong> reusable, sturdy and practical for runnier purées that would otherwise be drawn into the machine – but they take up more space.</li>
</ul>

<p>So bags are not automatically the better choice. For many parents a combination makes sense: containers for liquid, bags for firmer purées.</p>

<h2>Safety for babies</h2>

<p>Careful hygiene is especially important with infants:</p>

<ul>
  <li><strong>Age-appropriate consistency:</strong> finely puréed at first, coarser later as development allows.</li>
  <li><strong>Introduce allergens mindfully:</strong> follow current complementary-feeding recommendations and discuss uncertainties with your paediatrician.</li>
  <li><strong>Work hygienically:</strong> keep hands, surfaces and devices clean; separate raw and cooked foods to avoid cross-contamination.</li>
  <li><strong>Cook and cool safely:</strong> cook thoroughly and then cool quickly.</li>
  <li><strong>No salt and sugar:</strong> avoid added salt and sugar.</li>
  <li><strong>Discard leftovers after the meal:</strong> do not store purée your baby has already eaten from – saliva gets into the purée via the spoon and can promote bacterial growth. Always take out only as much as will be eaten.</li>
</ul>

<h2>Important: vacuum sealing is not preservation</h2>

<p>This point is crucial: <strong>vacuum sealing alone does not sterilize, does not eliminate pathogens and does not make homemade baby food shelf-stable at room temperature.</strong> Removing air can also create a low-oxygen environment in which certain germs can multiply under unfavourable conditions. Vacuum sealing is therefore no substitute for proper refrigerating and freezing, but a practical addition for order and portioning.</p>

<h2>FAQ – Common questions about vacuum sealing baby food</h2>

<h3>Can I vacuum seal baby food while warm?</h3>
<p>No. Only fill in fully cooled purée. Vacuum sealing while warm delays cooling and is not advisable for safety reasons.</p>

<h3>Can I store vacuum-sealed baby food without refrigeration?</h3>
<p>No. Vacuum sealing does not make baby food shelf-stable at room temperature. Always keep portions in the fridge or freezer.</p>

<h3>Can purées be vacuum sealed without liquid being drawn into the machine?</h3>
<p>Thin purées can be drawn in. Use a suitable moist-food function or pulse mode, freeze the purée slightly beforehand, or use vacuum containers instead of bags.</p>

<h3>Can I reuse vacuum bags?</h3>
<p>Bags that have been in contact with raw or already-eaten food should not be reused for hygiene reasons. For baby food, a fresh bag or a cleanable vacuum container is preferable when in doubt.</p>

<h2>Conclusion: more organisation with the right equipment</h2>

<p>With a little preparation, homemade baby food can conveniently be cooked in advance, portioned and frozen. Vacuum sealing helps to pack portions neatly and save space – but it does not replace refrigerating or freezing and does not extend shelf life on its own.</p>

<p>If you regularly prepare complementary food, you will benefit from the right equipment: a reliable <strong>vacuum sealer</strong> and compatible, food-safe <strong>vacuum bags</strong>. In our shop you will find a suitable selection – as practical helpers for well-organised baby-food portions in everyday life.</p>

<h2>Further sources</h2>

<ul>
  <li><a href="https://www.gesund-ins-leben.de" target="_blank" rel="noopener noreferrer">Gesund ins Leben – Netzwerk Junge Familie</a> (recommendations on complementary feeding and allergy prevention, in German)</li>
  <li><a href="https://www.bzfe.de" target="_blank" rel="noopener noreferrer">Bundeszentrum für Ernährung (BZfE)</a> (German Federal Centre for Nutrition)</li>
  <li><a href="https://www.bfr.bund.de" target="_blank" rel="noopener noreferrer">Bundesinstitut für Risikobewertung (BfR)</a> (food hygiene and safety, in German)</li>
  <li><a href="https://www.kindergesundheit-info.de" target="_blank" rel="noopener noreferrer">kindergesundheit-info.de (BZgA)</a></li>
</ul>

<p>For questions about your child's individual nutrition, please consult your paediatrician or a qualified nutrition professional.</p>
`.trim()

// ─── Italian ────────────────────────────────────────────────────────────────
const TITLE_IT =
  "Mettere sottovuoto le pappe: preparare, porzionare e congelare gli omogeneizzati fatti in casa"
const EXCERPT_IT =
  "Mettere sottovuoto le pappe fatte in casa, congelarle in porzioni e conservarle " +
  "in sicurezza: consigli pratici di meal prep per i genitori, con le note di " +
  "sicurezza alimentare più importanti per i bambini."
const META_TITLE_IT = "Pappe sottovuoto: preparare e congelare gli omogeneizzati"
const META_DESCRIPTION_IT =
  "Mettere sottovuoto le pappe fatte in casa, congelarle in porzioni e conservarle " +
  "in sicurezza: consigli pratici per i genitori, con importanti note di sicurezza."

const BODY_IT = `
<p>La pappa fatta in casa è fresca, senza sale o zucchero aggiunti inutilmente – e con un po' di preparazione si può cucinare comodamente in anticipo. Chi prepara più porzioni in una volta risparmia molto tempo nelle giornate frenetiche. <strong>Mettere sottovuoto la pappa</strong> può aiutare a confezionare le porzioni in modo ordinato, a congelarle salvaspazio e a non perdere il conto.</p>

<p>In questa guida ti mostriamo come preparare la pappa in quantità maggiori, porzionarla con i sacchetti sottovuoto e congelarla in sicurezza. Una cosa è certa fin da subito: il sottovuoto mantiene gli alimenti confezionati in modo ordinato e salvaspazio, ma non sostituisce né la refrigerazione né il congelamento e non rende la pappa conservabile a temperatura ambiente.</p>

<h2>Perché preparare la pappa in casa?</h2>

<p>Per molti genitori la pappa cucinata in casa ha chiari vantaggi:</p>

<ul>
  <li><strong>Ingredienti sotto controllo:</strong> decidi tu cosa mettere nella pappa e puoi evitare sale e zucchero aggiunti.</li>
  <li><strong>Freschezza e varietà:</strong> verdura e frutta di stagione si possono combinare in modo adatto all'età.</li>
  <li><strong>Meno imballaggi e costi:</strong> cucinare quantità maggiori in casa è spesso più economico degli omogeneizzati pronti.</li>
  <li><strong>Favorire le abitudini:</strong> il bambino conosce presto gusti diversi.</li>
</ul>

<p>Quando e come iniziare lo svezzamento è bene discuterlo sulla base delle indicazioni pediatriche: ogni bambino si sviluppa in modo individuale.</p>

<h2>Quali alimenti sono adatti per la pappa fatta in casa?</h2>

<h3>Verdure</h3>
<p>Sono adatte verdure dal sapore delicato e cotte fino a diventare morbide, come <strong>carote, zucca, patate dolci e zucchine</strong>. Si frullano finemente e piacciono a molti bambini.</p>

<h3>Frutta</h3>
<p>Le puree di <strong>mela e pera</strong> sono adatte come prima frutta. Cuoci a vapore delicatamente la frutta matura e poi frullala finemente.</p>

<h3>Combinazioni adatte all'età</h3>
<p>Con la crescita, le pappe si possono arricchire con componenti sazianti come <strong>patate, riso o altri cereali adatti</strong>. Per ingredienti, consistenza e introduzione degli allergeni, segui le attuali raccomandazioni sullo svezzamento (vedi fonti in fondo).</p>

<h2>Preparare la pappa passo passo</h2>

<p>Ecco come preparare più porzioni in una volta:</p>

<ol>
  <li><strong>Lava e sbuccia:</strong> lava bene verdura e frutta e, dove utile, sbucciale.</li>
  <li><strong>Cuoci fino a morbidezza:</strong> cuoci a vapore o in poca acqua finché tutto è molto morbido. La cottura a vapore conserva più nutrienti.</li>
  <li><strong>Frulla o schiaccia:</strong> porta alla consistenza adatta all'età – finemente frullata all'inizio, più grossolana in seguito.</li>
  <li><strong>Raffredda rapidamente:</strong> lascia raffreddare velocemente la pappa dopo la cottura, ad esempio in contenitori bassi, e non lasciarla a lungo a temperatura ambiente.</li>
  <li><strong>Porziona:</strong> dividi la pappa raffreddata in singole porzioni, così dopo scongeli solo ciò che serve.</li>
</ol>

<h2>Mettere sottovuoto la pappa: come fare con i sacchetti sottovuoto</h2>

<p>Per il sottovuoto serve una macchina adatta – ad esempio un apparecchio da banco in acciaio inox – e appositi <strong>sacchetti sottovuoto</strong> per alimenti. Ecco come procedere:</p>

<ul>
  <li><strong>Prima raffredda, poi riempi:</strong> metti solo pappa completamente raffreddata. Gli alimenti caldi non vanno nel sacchetto, perché ritarderebbero il raffreddamento.</li>
  <li><strong>Lascia spazio per la saldatura:</strong> lascia abbastanza bordo libero in alto affinché la saldatura si chiuda in modo pulito.</li>
  <li><strong>Mantieni pulita la zona di saldatura:</strong> il bordo del sacchetto deve essere asciutto e privo di residui, altrimenti la saldatura non tiene in modo affidabile.</li>
  <li><strong>Attenzione ai liquidi:</strong> le puree liquide e i liquidi possono essere risucchiati nell'apparecchio. Se disponibile, usa una funzione adatta per alimenti umidi o la modalità a impulsi, congela leggermente la pappa prima, oppure usa contenitori adatti.</li>
  <li><strong>Segui le istruzioni del produttore:</strong> attieniti al manuale del tuo apparecchio e usa solo i sacchetti previsti.</li>
</ul>

<p>Importante: il sottovuoto <strong>non è cottura né sterilizzazione</strong>. Elimina soltanto l'aria dal sacchetto e protegge dalle bruciature da freddo, ma non uccide i germi.</p>

<h2>Congelare e conservare</h2>

<p>Le porzioni sottovuoto si congelano in modo ordinato e salvaspazio. Tieni presente:</p>

<ul>
  <li><strong>Congela la pappa in porzioni:</strong> le singole porzioni si congelano più in fretta e si prelevano secondo necessità.</li>
  <li><strong>Etichetta:</strong> annota contenuto e data di preparazione su ogni sacchetto.</li>
  <li><strong>Scongela in sicurezza:</strong> scongela le porzioni in frigorifero, non a temperatura ambiente. Riscalda bene la pappa scongelata prima di darla al bambino, poi lasciala raffreddare alla temperatura giusta.</li>
  <li><strong>Non ricongelare:</strong> non congelare di nuovo le porzioni scongelate.</li>
</ul>

<p>Come orientamento di massima, la pappa appena preparata si conserva di solito solo circa uno o due giorni in frigorifero e da qualche settimana ad alcuni mesi nel congelatore. Non affidarti a cifre generiche: segui le raccomandazioni ufficiali (vedi fonti) e controlla aspetto e odore. <strong>Il sottovuoto non prolunga automaticamente questi tempi</strong> e non rende la pappa conservabile a temperatura ambiente.</p>

<h2>Un flusso di meal prep pratico per i genitori</h2>

<p>Ecco come preparare scorte per la settimana in una giornata tranquilla:</p>

<ol>
  <li>Cuoci contemporaneamente diversi tipi di verdura o frutta fino a renderli morbidi.</li>
  <li>Frulla separatamente e lascia raffreddare rapidamente.</li>
  <li>Dividi in porzioni adatte al bambino.</li>
  <li>Riempi i sacchetti sottovuoto, saldali ed etichettali.</li>
  <li>Congela in piano, così le porzioni si impilano salvaspazio.</li>
</ol>

<p>Nelle giornate frenetiche basta prendere una porzione dal congelatore, scongelarla in frigorifero e riscaldarla al momento.</p>

<h2>Sacchetti sottovuoto o contenitori sottovuoto?</h2>

<p>Entrambe le soluzioni hanno i loro punti di forza: quale sia più adatta dipende dalla consistenza e dalle abitudini:</p>

<ul>
  <li><strong>Sacchetti sottovuoto:</strong> salvaspazio nel congelatore, facili da impilare e ideali per porzioni congelate in piano. Per puree molto liquide serve però attenzione durante il sottovuoto.</li>
  <li><strong>Contenitori sottovuoto:</strong> riutilizzabili, robusti e pratici per pappe più liquide che altrimenti verrebbero risucchiate nell'apparecchio, ma occupano più spazio.</li>
</ul>

<p>I sacchetti non sono quindi automaticamente la scelta migliore. Per molti genitori ha senso una combinazione: contenitori per le pappe liquide, sacchetti per quelle più dense.</p>

<h2>Sicurezza per i bambini</h2>

<p>Proprio con i lattanti un'igiene accurata è particolarmente importante:</p>

<ul>
  <li><strong>Consistenza adatta all'età:</strong> finemente frullata all'inizio, più grossolana in seguito con lo sviluppo.</li>
  <li><strong>Introduci gli allergeni con consapevolezza:</strong> segui le attuali raccomandazioni sullo svezzamento e discuti i dubbi con il pediatra.</li>
  <li><strong>Lavora in modo igienico:</strong> mantieni puliti mani, superfici e apparecchi; separa alimenti crudi e cotti per evitare contaminazioni crociate.</li>
  <li><strong>Cuoci e raffredda in sicurezza:</strong> cuoci bene e poi raffredda rapidamente.</li>
  <li><strong>Senza sale e zucchero:</strong> evita sale e zucchero aggiunti.</li>
  <li><strong>Elimina gli avanzi dopo il pasto:</strong> non conservare la pappa da cui il bambino ha già mangiato: attraverso il cucchiaio la saliva finisce nella pappa e può favorire la proliferazione di batteri. Preleva quindi sempre solo la quantità che verrà mangiata.</li>
</ul>

<h2>Importante: il sottovuoto non è conservazione</h2>

<p>Questo punto è fondamentale: <strong>il solo sottovuoto non sterilizza, non elimina gli agenti patogeni e non rende la pappa fatta in casa conservabile a temperatura ambiente.</strong> L'eliminazione dell'aria può inoltre creare un ambiente povero di ossigeno in cui, in condizioni sfavorevoli, alcuni germi possono moltiplicarsi. Il sottovuoto non sostituisce quindi una corretta refrigerazione e congelamento, ma è un'utile aggiunta per ordine e porzionamento.</p>

<h2>FAQ – Domande frequenti sul sottovuoto della pappa</h2>

<h3>Posso mettere sottovuoto la pappa ancora calda?</h3>
<p>No. Metti solo pappa completamente raffreddata. Il sottovuoto a caldo ritarda il raffreddamento e, per motivi di sicurezza, è sconsigliato.</p>

<h3>Posso conservare la pappa sottovuoto senza refrigerazione?</h3>
<p>No. Il sottovuoto non rende la pappa conservabile a temperatura ambiente. Conserva sempre le porzioni in frigorifero o nel congelatore.</p>

<h3>Si possono mettere sottovuoto le puree senza che il liquido venga risucchiato nell'apparecchio?</h3>
<p>Le puree liquide possono essere risucchiate. Usa una funzione adatta per alimenti umidi o la modalità a impulsi, congela leggermente la pappa prima, oppure usa contenitori sottovuoto al posto dei sacchetti.</p>

<h3>Posso riutilizzare i sacchetti sottovuoto?</h3>
<p>I sacchetti entrati in contatto con alimenti crudi o già consumati non dovrebbero essere riutilizzati per motivi igienici. Per la pappa, nel dubbio è preferibile un sacchetto nuovo o un contenitore sottovuoto lavabile.</p>

<h2>Conclusione: più organizzazione con l'attrezzatura giusta</h2>

<p>Con un po' di preparazione, la pappa fatta in casa si può cucinare comodamente in anticipo, porzionare e congelare. Il sottovuoto aiuta a confezionare le porzioni in modo ordinato e salvaspazio, ma non sostituisce la refrigerazione o il congelamento e non prolunga da solo la conservabilità.</p>

<p>Chi prepara regolarmente la pappa trae vantaggio dall'attrezzatura giusta: una <strong>macchina sottovuoto</strong> affidabile e <strong>sacchetti sottovuoto</strong> compatibili e per alimenti. Nel nostro shop trovi una selezione adeguata, come pratici aiutanti per porzioni di pappa ben organizzate nella vita di tutti i giorni.</p>

<h2>Fonti utili</h2>

<ul>
  <li><a href="https://www.gesund-ins-leben.de" target="_blank" rel="noopener noreferrer">Gesund ins Leben – Netzwerk Junge Familie</a> (raccomandazioni su svezzamento e prevenzione delle allergie, in tedesco)</li>
  <li><a href="https://www.bzfe.de" target="_blank" rel="noopener noreferrer">Bundeszentrum für Ernährung (BZfE)</a> (Centro federale tedesco per l'alimentazione)</li>
  <li><a href="https://www.bfr.bund.de" target="_blank" rel="noopener noreferrer">Bundesinstitut für Risikobewertung (BfR)</a> (igiene e sicurezza alimentare, in tedesco)</li>
  <li><a href="https://www.kindergesundheit-info.de" target="_blank" rel="noopener noreferrer">kindergesundheit-info.de (BZgA)</a></li>
</ul>

<p>Per domande sull'alimentazione specifica del tuo bambino, rivolgiti al pediatra o a un professionista qualificato della nutrizione.</p>
`.trim()

export default async function publishBabynahrungVakuumieren({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const service: any = container.resolve(ARTICLE_MODULE)
  const scModule: any = container.resolve(Modules.SALES_CHANNEL)

  const author_id = await ensureArticleAuthor(container)

  const [shopChannel] = await scModule.listSalesChannels({ name: SHOP_CHANNEL_NAME })
  const sales_channel_id = shopChannel?.id ?? null
  if (!sales_channel_id) {
    logger.warn(
      `[publish-babynahrung-vakuumieren] sales channel '${SHOP_CHANNEL_NAME}' not found — publishing as global (all channels).`
    )
  }

  const fields = {
    title: TITLE,
    category: CATEGORY,
    excerpt: EXCERPT,
    body: `${figure(IMG_ALT_DE)}\n\n${BODY}`,
    cover_image: COVER_IMAGE,
    meta_title: META_TITLE,
    meta_description: META_DESCRIPTION,
    // English
    title_en: TITLE_EN,
    excerpt_en: EXCERPT_EN,
    body_en: `${figure(IMG_ALT_EN)}\n\n${BODY_EN}`,
    meta_title_en: META_TITLE_EN,
    meta_description_en: META_DESCRIPTION_EN,
    // Italian
    title_it: TITLE_IT,
    excerpt_it: EXCERPT_IT,
    body_it: `${figure(IMG_ALT_IT)}\n\n${BODY_IT}`,
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
    logger.info(`[publish-babynahrung-vakuumieren] updated + published '${SLUG}' (id=${existing.id}).`)
  } else {
    const created = await service.createArticles({
      slug: SLUG,
      ...fields,
      published_at: new Date(),
    })
    logger.info(`[publish-babynahrung-vakuumieren] created + published '${SLUG}' (id=${created.id}).`)
  }
}
