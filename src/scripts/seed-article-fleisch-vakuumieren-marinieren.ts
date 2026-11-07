import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"

/**
 * Seeds the magazine article "Fleisch vakuumieren und marinieren" as a DRAFT
 * (hidden on the storefront until you publish it from the admin Articles page).
 * Idempotent: if an article with this slug already exists it is left untouched.
 *
 * Content lives in exported constants so the publisher
 * (publish-article-fleisch-vakuumieren-marinieren.ts) can reuse the exact copy.
 *
 * Body is rich-text HTML — the magazine renders only h2/h3/p/strong/a/ul/li/
 * ol/li/blockquote (NO table styling), so the "comparison tables" (marinating
 * times, vacuum vs. traditional) are expressed as structured lists, not <table>s.
 *
 * Claims are deliberately conservative: the vacuum improves even surface contact,
 * convenience and storage — it does NOT guarantee deeper flavour penetration or a
 * fixed-percentage time saving. Marinating times are general guidelines.
 *
 * Run locally:
 *   npx medusa exec ./src/scripts/seed-article-fleisch-vakuumieren-marinieren.ts
 */

export const SLUG = "fleisch-vakuumieren-und-marinieren"

export const TITLE =
  "Fleisch vakuumieren und marinieren: So gelingt die perfekte Marinade"

export const CATEGORY = "Ratgeber"

export const EXCERPT =
  "Hähnchen, Schwein, Rind und Fisch im Vakuum marinieren – schneller, sauberer und gleichmäßiger. Wir zeigen Schritt für Schritt, wie es funktioniert, mit Rezepten, Richtzeiten und Sicherheitstipps."

export const META_TITLE =
  "Fleisch vakuumieren und marinieren: So gelingt die perfekte Marinade"

export const META_DESCRIPTION =
  "Fleisch vakuumieren mit Marinade: Anleitung, Rezepte für Hähnchen, Schwein, Rind und Fisch, Marinierzeiten und Sicherheitstipps – so benutzen Sie Ihren Vakuumierer richtig."

export const BODY = `
<p>Marinieren im Vakuum liegt im Trend – und das aus gutem Grund. Wer <strong>Fleisch vakuumieren und marinieren</strong> kombiniert, spart Zeit, arbeitet sauberer und bringt die Würze gleichmäßig rund um jedes Stück. In diesem Ratgeber erklären wir, wie das <strong>Fleisch vakuumieren mit Marinade</strong> wirklich funktioniert, was ein <strong>Vakuumierer</strong> dabei kann (und was nicht), und führen Sie Schritt für Schritt durch den Prozess – mit Rezepten für Hähnchen, Schwein, Rind und Fisch, Richtzeiten und den wichtigsten Sicherheitsregeln.</p>

<h2>Wie funktioniert das Vakuumieren und Marinieren?</h2>
<p>Beim Vakuumieren wird die Luft aus dem Beutel gezogen. Dadurch liegt die Marinade lückenlos und von allen Seiten am Fleisch an – anders als in der offenen Schüssel, wo nur die Unterseite im Sud liegt. Zusätzlich dehnt der Unterdruck die oberflächennahen Strukturen des Fleisches leicht, sodass die Marinade besser an der Oberfläche haftet.</p>
<ul>
  <li><strong>Was realistisch passiert:</strong> Die Würze verteilt sich gleichmäßig und haftet gut an der <strong>Oberfläche</strong> und in den äußeren Schichten.</li>
  <li><strong>Was nicht passiert:</strong> Das Vakuum presst die Marinade nicht tief ins Innere großer Stücke. Eine Garantie für „tiefere" Geschmacksdurchdringung gibt es nicht – bei Fleisch bleibt Aroma überwiegend außen.</li>
  <li><strong>Ist es schneller?</strong> Für eine gute Oberflächenmarinade oft ja, weil der Kontakt durchgehend eng ist und kein Wenden nötig ist. Einen festen Prozentwert („50 % schneller") sollte man aber nicht versprechen.</li>
  <li><strong>Der echte Mehrwert:</strong> gleichmäßige Würze, sauberes Arbeiten ohne Umrühren, und marinieren + lagern/einfrieren in einem Schritt.</li>
</ul>
<p><strong>Marinier-Modus nötig?</strong> Manche Geräte haben eine Puls- oder Marinierfunktion, die das Vakuum rhythmisch an- und abschaltet und die Marinade so „einmassiert". Das ist nützlich, aber kein Muss – ein manuelles Pulsvakuum (Vorgang kurz stoppen) erreicht Ähnliches.</p>

<h2>Welche Lebensmittel eignen sich?</h2>
<ul>
  <li><strong>Hähnchen:</strong> Brust, Schenkel, Flügel – nimmt Marinade sehr gut an.</li>
  <li><strong>Schwein:</strong> Steaks, Koteletts, Rippchen, Filet.</li>
  <li><strong>Rind:</strong> Steaks, Roastbeef, größere Braten.</li>
  <li><strong>Fisch:</strong> Lachs, Thunfisch, helles Filet – nur <strong>kurz</strong> marinieren (siehe Sicherheit).</li>
  <li><strong>Gemüse (optional):</strong> Zucchini, Paprika, Pilze – ideal zum schnellen Durchziehen vor dem Grillen.</li>
</ul>

<h2>Schritt für Schritt: Fleisch vakuumieren mit Marinade</h2>
<ol>
  <li><strong>Fleisch vorbereiten:</strong> abspülen (bei Bedarf), trocken tupfen und in Portionen teilen.</li>
  <li><strong>Marinade anrühren:</strong> lieber etwas dickflüssiger (Öl, Paste, Gewürze) als eine dünne Brühe.</li>
  <li><strong>In den Beutel geben:</strong> lebensmittelechten Vakuumbeutel wählen und oben genug Rand frei lassen.</li>
  <li><strong>Marinade zufügen:</strong> sparsam dosieren – es muss nicht „schwimmen".</li>
  <li><strong>Beutel positionieren:</strong> Öffnung sauber und trocken halten; den Beutel beim Absaugen aufrecht bzw. leicht erhöht halten.</li>
  <li><strong>Programm wählen:</strong> „Feucht"-/Marinier-Modus oder manuelles Pulsvakuum verwenden.</li>
  <li><strong>Verschweißen:</strong> Vakuum stoppen, sobald die Flüssigkeit der Schweißnaht nahekommt, dann versiegeln.</li>
  <li><strong>Im Kühlschrank marinieren:</strong> nach den Richtzeiten weiter unten.</li>
  <li><strong>Garen:</strong> entnehmen, überschüssige Marinade abstreifen, trocken tupfen und zubereiten.</li>
</ol>

<h3>Flüssige Marinade – ohne dass Flüssigkeit ins Gerät gelangt</h3>
<p>Das häufigste Problem bei Außenvakuumierern: Flüssigkeit wird mit eingesaugt. So vermeiden Sie das:</p>
<ul>
  <li>Marinade <strong>vorkühlen oder leicht anfrieren</strong> (zähflüssig = kein Mitsaugen).</li>
  <li>Weniger dünne Flüssigkeit, mehr <strong>Öl und Würzpaste</strong>.</li>
  <li>Beutel beim Vakuumieren <strong>aufrecht halten</strong> oder über die Tischkante nach unten hängen lassen.</li>
  <li>Den <strong>„Feucht"-Modus</strong> nutzen oder das Vakuum <strong>manuell stoppen</strong>, bevor die Flüssigkeit die Naht erreicht.</li>
  <li>Für regelmäßig flüssige Marinaden sind <strong>Kammervakuumierer</strong> die zuverlässigste Lösung.</li>
</ul>

<h2>Marinade-Rezepte</h2>
<p>Zwei erprobte Rezepte je Kategorie. Mengen sind Richtwerte und lassen sich nach Geschmack anpassen.</p>

<h3>Hähnchen vakuumieren</h3>
<ul>
  <li><strong>Knoblauch, Zitrone, Olivenöl &amp; Rosmarin</strong> – für ca. 600 g Brust/Schenkel: 4 EL Olivenöl, Saft ½ Zitrone, 2 gepresste Knoblauchzehen, 1 EL gehackter Rosmarin, Salz &amp; Pfeffer. Verrühren, Fleisch rundum einstreichen. <strong>Marinierzeit:</strong> vakuumiert 1–3 Std, klassisch 4–6 Std. <strong>Garen:</strong> braten, grillen oder im Ofen.</li>
  <li><strong>Honig, Sojasauce, Ingwer &amp; Knoblauch</strong> – für ca. 600 g Schenkel/Flügel: 3 EL Sojasauce, 2 EL Honig, 1 EL geriebener Ingwer, 2 Knoblauchzehen, 1 TL Sesamöl. <strong>Marinierzeit:</strong> vakuumiert 1–3 Std, klassisch 4–8 Std. <strong>Garen:</strong> Ofen oder Grill bei mittlerer Hitze (Honig karamellisiert schnell).</li>
</ul>

<h3>Schwein</h3>
<ul>
  <li><strong>Senf, Honig, Knoblauch &amp; Thymian</strong> – für ca. 600 g Nackensteaks/Koteletts: 2 EL mittelscharfer Senf, 1 EL Honig, 2 Knoblauchzehen, 1 EL Thymian, 3 EL Öl, Salz &amp; Pfeffer. <strong>Marinierzeit:</strong> vakuumiert 2–4 Std, klassisch 6–12 Std. <strong>Garen:</strong> Grill oder Pfanne.</li>
  <li><strong>Paprika, Olivenöl, Knoblauch &amp; Kräuter</strong> – für ca. 600 g Koteletts/Rippchen: 4 EL Olivenöl, 1 EL Paprika edelsüß, 1 TL geräuchertes Paprika, 2 Knoblauchzehen, 1 TL Oregano, Salz &amp; Pfeffer. <strong>Marinierzeit:</strong> vakuumiert 2–4 Std, klassisch 8–12 Std. <strong>Garen:</strong> Rippchen niedrig und langsam im Ofen/Grill.</li>
</ul>

<h3>Steak vakuumieren (Rind)</h3>
<ul>
  <li><strong>Olivenöl, Rosmarin, Knoblauch &amp; schwarzer Pfeffer</strong> – für ca. 500 g Steaks (Rib-Eye/Entrecôte): 4 EL Olivenöl, 1 EL Rosmarin, 2 Knoblauchzehen, 1 TL grob gemahlener Pfeffer. <strong>Marinierzeit:</strong> vakuumiert 1–3 Std, klassisch 4–8 Std. <strong>Garen:</strong> scharf anbraten oder grillen. <strong>Tipp:</strong> Salz erst kurz vor dem Braten zugeben.</li>
  <li><strong>Sojasauce, Worcestersauce &amp; Senf</strong> – für ca. 600 g Roastbeef/größeres Stück: 3 EL Sojasauce, 1 EL Worcestersauce, 1 EL Senf, 2 EL Öl, 1 Knoblauchzehe, Pfeffer. <strong>Marinierzeit:</strong> vakuumiert 3–6 Std, klassisch 12–24 Std. <strong>Garen:</strong> Niedrigtemperatur im Ofen, Schmoren oder Grill.</li>
</ul>

<h3>Fisch vakuumieren</h3>
<ul>
  <li><strong>Zitrone, Dill, Olivenöl &amp; Knoblauch</strong> – für ca. 400 g Lachs-/Fischfilet: 3 EL Olivenöl, Saft ¼ Zitrone, 1 EL Dill, 1 Knoblauchzehe, Salz &amp; Pfeffer. <strong>Marinierzeit:</strong> vakuumiert 20–40 Min, klassisch 30–60 Min. <strong>Wichtig:</strong> Fisch nur kurz marinieren – Säure „gart" das Eiweiß. <strong>Garen:</strong> braten, dünsten oder im Ofen.</li>
  <li><strong>Sojasauce, Ingwer &amp; Sesamöl</strong> – für ca. 400 g Thunfisch/Lachs: 3 EL Sojasauce, 1 TL geriebener Ingwer, 1 TL Sesamöl, 1 TL Honig. <strong>Marinierzeit:</strong> vakuumiert 20–40 Min, klassisch 30–60 Min. <strong>Garen:</strong> kurz scharf anbraten.</li>
</ul>

<h3>Gemüse (optional)</h3>
<ul>
  <li><strong>Olivenöl, Balsamico, Knoblauch &amp; Kräuter</strong> – für ca. 500 g Zucchini, Paprika oder Pilze: 4 EL Olivenöl, 2 EL Balsamico, 1 Knoblauchzehe, 1 TL Kräuter der Provence, Salz &amp; Pfeffer. <strong>Marinierzeit:</strong> vakuumiert 30–60 Min. <strong>Garen:</strong> Grill oder Ofen.</li>
</ul>

<h2>Wie lange marinieren? Richtwerte im Vergleich</h2>
<blockquote><p><strong>Hinweis:</strong> Dies sind <strong>allgemeine Richtwerte</strong>, keine im Labor getesteten Zeiten. Das Vakuum verkürzt die Marinierzeit nicht um einen festen Prozentsatz – es sorgt vor allem für gleichmäßigen Kontakt. Dickere Stücke profitieren weniger als dünne.</p></blockquote>
<ul>
  <li><strong>Hähnchenbrust &amp; -schenkel:</strong> klassisch 4–8 Std → vakuumunterstützt ca. 1–3 Std.</li>
  <li><strong>Hähnchenflügel:</strong> klassisch 4–8 Std → ca. 1–3 Std.</li>
  <li><strong>Schweinekoteletts &amp; Rippchen:</strong> klassisch 8–12 Std → ca. 2–4 Std.</li>
  <li><strong>Rindersteaks:</strong> klassisch 4–8 Std → ca. 1–3 Std.</li>
  <li><strong>Größere Rinderstücke/Braten:</strong> klassisch 12–24 Std → ca. 3–6 Std.</li>
  <li><strong>Lachs &amp; Fischfilet:</strong> klassisch 30–60 Min → ca. 20–40 Min (nicht länger, besonders bei säurehaltiger Marinade).</li>
</ul>

<h2>Vakuumieren vs. klassisches Marinieren</h2>
<ul>
  <li><strong>Vorbereitungszeit:</strong> Vakuum → etwas mehr (Beutel, Gerät); klassisch → schnell (Schüssel).</li>
  <li><strong>Marinierzeit:</strong> Vakuum → an der Oberfläche tendenziell kürzer; klassisch → länger.</li>
  <li><strong>Geschmacksverteilung:</strong> Vakuum → gleichmäßig von allen Seiten; klassisch → ungleichmäßig, Wenden nötig.</li>
  <li><strong>Bequemlichkeit:</strong> Vakuum → sauber, kein Umrühren; klassisch → offene Schüssel, mehrfach wenden.</li>
  <li><strong>Lagerung &amp; Frische:</strong> Vakuum → marinieren, lagern und einfrieren in einem Schritt; klassisch → getrennt.</li>
  <li><strong>Lebensmittelverschwendung:</strong> Vakuum → portionsweise und luftdicht, weniger Verderb; klassisch → mehr Luftkontakt.</li>
  <li><strong>Ausrüstungskosten:</strong> Vakuum → Gerät + Beutel nötig; klassisch → nur Schüssel oder wiederverschließbarer Beutel.</li>
</ul>
<p><strong>Wann lohnt sich der Vakuumierer?</strong> Besonders beim Vorkochen auf Vorrat (Meal Prep), wenn Sie marinieren und direkt einfrieren möchten, für gleichmäßige Würze und sauberes Arbeiten. <strong>Wann reicht die Schüssel?</strong> Für eine schnelle, einmalige Portion, für sehr kurze Fischmarinaden oder empfindliche Zutaten genügt oft ein normaler Behälter oder wiederverschließbarer Beutel.</p>

<h2>Lebensmittelsicherheit und häufige Fehler</h2>
<ul>
  <li><strong>Immer im Kühlschrank marinieren</strong>, nie bei Zimmertemperatur.</li>
  <li><strong>Vakuum sterilisiert nicht.</strong> Es macht Lebensmittel bei Raumtemperatur nicht sicher – im Gegenteil, die luftarme Umgebung kann bestimmte Keime begünstigen. Kühl halten ist Pflicht.</li>
  <li><strong>Kreuzkontamination vermeiden:</strong> Brett, Messer und Hände nach rohem Fleisch/Fisch gründlich reinigen.</li>
  <li><strong>Marinade nicht roh wiederverwenden:</strong> Was mit rohem Fleisch Kontakt hatte, nur gut durchgekocht (z. B. als Sauce) weiterverwenden.</li>
  <li><strong>Sichere Kerntemperaturen:</strong> Geflügel durchgaren (ca. 72–74 °C), Schwein gut durch, Fisch bis glasig-fest – im Zweifel ein Thermometer nutzen.</li>
  <li><strong>Vorsicht bei Fisch und sehr sauren Marinaden:</strong> Zitronensaft, Essig &amp; Co. denaturieren das Eiweiß und machen Fisch schnell mehlig – nur kurz marinieren.</li>
  <li><strong>Lebensmittelechte Beutel</strong> verwenden, die für Lebensmittelkontakt geeignet sind.</li>
</ul>
<p><strong>Typische Anfängerfehler:</strong> zu viel dünne Flüssigkeit (läuft ins Gerät), zu lange marinieren (vor allem Fisch), zu viel Salz über zu lange Zeit (entzieht Wasser), den Beutel bei Zimmertemperatur stehen lassen und Marinade vom rohen Fleisch wiederverwenden.</p>

<h2>Fazit: Lohnt sich das Marinieren mit Vakuumierer?</h2>
<p>Ja – wenn Sie Wert auf gleichmäßige Würze, sauberes Arbeiten und praktische Vorratshaltung legen. Das Vakuum ist kein Zaubermittel für „tiefere" Aromen, aber es macht das <strong>Fleisch marinieren</strong> schneller, gleichmäßiger und bequemer, besonders beim Vorbereiten größerer Mengen. Für die schnelle Einzelportion tut es auch die Schüssel. Wer regelmäßig vorkocht, grillt oder einfriert, wird den Vakuumierer dagegen nicht mehr missen wollen – vorausgesetzt, man <strong>benutzt ihn richtig</strong> und beachtet die Sicherheitsregeln.</p>

<h2>Häufige Fragen (FAQ)</h2>
<h3>Verkürzt Vakuumieren die Marinierzeit wirklich?</h3>
<p>Für die Oberfläche meist ja, weil die Marinade durchgehend eng anliegt und nicht gewendet werden muss. Einen festen Prozentwert gibt es aber nicht, und tief ins Innere großer Stücke dringt die Würze auch im Vakuum nicht.</p>
<h3>Brauche ich einen speziellen Marinier-Modus?</h3>
<p>Nein. Ein Marinier-/Pulsmodus ist praktisch, aber kein Muss. Mit manuellem Pulsvakuum und einem „Feucht"-Programm erzielen Sie ähnliche Ergebnisse.</p>
<h3>Wie verhindere ich, dass Marinade ins Gerät läuft?</h3>
<p>Marinade vorkühlen oder leicht anfrieren, sparsam dosieren, den Beutel aufrecht halten und das Vakuum stoppen, bevor Flüssigkeit die Naht erreicht. Kammervakuumierer handhaben Flüssigkeiten am besten.</p>
<h3>Kann ich mariniertes Fleisch direkt einfrieren?</h3>
<p>Ja – das ist ein großer Vorteil: marinieren und einfrieren in einem Schritt. Beim Auftauen im Kühlschrank zieht die Würze weiter ein.</p>
<h3>Wie lange sollte Fisch im Vakuum marinieren?</h3>
<p>Nur kurz, etwa 20–40 Minuten. Säurehaltige Marinaden „garen" den Fisch sonst und machen ihn fest und mehlig.</p>

<p>Sie suchen die passenden Beutel, Rollen oder ein Gerät? <a href="/de/products">Zu unseren Vakuumbeuteln und Vakuumierern</a> – oder sprechen Sie uns an, wir beraten Sie gern.</p>
`.trim()

// ─── English ────────────────────────────────────────────────────────────────
export const TITLE_EN =
  "Vacuum marinating meat: how to get the perfect marinade"

export const EXCERPT_EN =
  "Marinate chicken, pork, beef and fish in a vacuum bag – faster, cleaner and more evenly. A step-by-step guide with recipes, timings and safety tips."

export const META_TITLE_EN =
  "Vacuum marinating meat: how to get the perfect marinade – Guide"

export const META_DESCRIPTION_EN =
  "Vacuum marinating meat and fish: step-by-step instructions, marinade recipes for chicken, pork, beef and fish, timings and safety tips for using your vacuum sealer."

export const BODY_EN = `
<p>Vacuum marinating is on the rise – and for good reason. Combining a <strong>vacuum sealer</strong> with a marinade saves time, keeps things clean and coats every piece evenly on all sides. In this guide we explain how vacuum marinating really works, what a vacuum sealer can (and cannot) do, and we walk you through the whole process step by step – with recipes for chicken, pork, beef and fish, suggested timings and the key safety rules.</p>

<h2>How does vacuum marinating work?</h2>
<p>Vacuum sealing removes the air from the bag, so the marinade sits against the meat on all sides – unlike an open bowl, where only the underside is in the liquid. The reduced pressure also slightly expands the surface structure of the meat, helping the marinade cling to it.</p>
<ul>
  <li><strong>What realistically happens:</strong> the seasoning spreads evenly and clings well to the <strong>surface</strong> and outer layers.</li>
  <li><strong>What doesn't happen:</strong> the vacuum does not push the marinade deep into large cuts. There is no guarantee of "deeper" flavour penetration – with meat, flavour stays mostly on the outside.</li>
  <li><strong>Is it faster?</strong> For good surface marinating, often yes, because contact is constant and no turning is needed. But you shouldn't promise a fixed figure ("50% faster").</li>
  <li><strong>The real benefit:</strong> even seasoning, clean handling without stirring, and marinating + storing/freezing in one step.</li>
</ul>
<p><strong>Do you need a marinade mode?</strong> Some machines have a pulse or marinade function that switches the vacuum on and off rhythmically to "massage" in the marinade. It's useful but not essential – a manual pulse vacuum (briefly stopping the process) achieves something similar.</p>

<h2>Which foods are suitable?</h2>
<ul>
  <li><strong>Chicken:</strong> breast, thighs, wings – takes marinade very well.</li>
  <li><strong>Pork:</strong> steaks, chops, ribs, tenderloin.</li>
  <li><strong>Beef:</strong> steaks, roast beef, larger roasts.</li>
  <li><strong>Fish:</strong> salmon, tuna, white fillet – marinate only <strong>briefly</strong> (see safety).</li>
  <li><strong>Vegetables (optional):</strong> courgette, peppers, mushrooms – great for a quick soak before grilling.</li>
</ul>

<h2>Step by step: vacuum-marinating meat</h2>
<ol>
  <li><strong>Prepare the meat:</strong> rinse if needed, pat dry and cut into portions.</li>
  <li><strong>Mix the marinade:</strong> slightly thicker (oil, paste, spices) is better than a thin broth.</li>
  <li><strong>Into the bag:</strong> use a food-grade vacuum bag and leave enough room at the top.</li>
  <li><strong>Add the marinade:</strong> use sparingly – it doesn't need to "swim".</li>
  <li><strong>Position the bag:</strong> keep the opening clean and dry; hold the bag upright or slightly raised while sealing.</li>
  <li><strong>Choose the setting:</strong> use the "moist"/marinade mode or a manual pulse vacuum.</li>
  <li><strong>Seal:</strong> stop the vacuum before the liquid reaches the seal, then seal the bag.</li>
  <li><strong>Marinate in the fridge:</strong> following the guideline timings below.</li>
  <li><strong>Cook:</strong> remove, wipe off excess marinade, pat dry and cook.</li>
</ol>

<h3>Liquid marinades – without letting liquid into the machine</h3>
<p>The most common problem with external sealers: liquid gets sucked in. How to avoid it:</p>
<ul>
  <li><strong>Pre-chill or lightly freeze</strong> the marinade (thick = won't get drawn in).</li>
  <li>Less thin liquid, more <strong>oil and spice paste</strong>.</li>
  <li>Hold the bag <strong>upright</strong> while sealing, or let it hang over the table edge.</li>
  <li>Use the <strong>"moist" mode</strong> or <strong>stop the vacuum manually</strong> before the liquid reaches the seal.</li>
  <li>For regularly liquid marinades, a <strong>chamber vacuum sealer</strong> is the most reliable option.</li>
</ul>

<h2>Marinade recipes</h2>
<p>Two tried-and-tested recipes per category. Quantities are guidelines and can be adjusted to taste.</p>

<h3>Chicken</h3>
<ul>
  <li><strong>Garlic, lemon, olive oil &amp; rosemary</strong> – for approx. 600 g breast/thighs: 4 tbsp olive oil, juice of ½ lemon, 2 pressed garlic cloves, 1 tbsp chopped rosemary, salt &amp; pepper. Mix and coat all over. <strong>Time:</strong> vacuum 1–3 h, traditional 4–6 h. <strong>Cook:</strong> pan-fry, grill or roast.</li>
  <li><strong>Honey, soy sauce, ginger &amp; garlic</strong> – for approx. 600 g thighs/wings: 3 tbsp soy sauce, 2 tbsp honey, 1 tbsp grated ginger, 2 garlic cloves, 1 tsp sesame oil. <strong>Time:</strong> vacuum 1–3 h, traditional 4–8 h. <strong>Cook:</strong> oven or grill on medium heat (honey caramelises quickly).</li>
</ul>

<h3>Pork</h3>
<ul>
  <li><strong>Mustard, honey, garlic &amp; thyme</strong> – for approx. 600 g neck steaks/chops: 2 tbsp medium mustard, 1 tbsp honey, 2 garlic cloves, 1 tbsp thyme, 3 tbsp oil, salt &amp; pepper. <strong>Time:</strong> vacuum 2–4 h, traditional 6–12 h. <strong>Cook:</strong> grill or pan.</li>
  <li><strong>Paprika, olive oil, garlic &amp; herbs</strong> – for approx. 600 g chops/ribs: 4 tbsp olive oil, 1 tbsp sweet paprika, 1 tsp smoked paprika, 2 garlic cloves, 1 tsp oregano, salt &amp; pepper. <strong>Time:</strong> vacuum 2–4 h, traditional 8–12 h. <strong>Cook:</strong> ribs low and slow in the oven/grill.</li>
</ul>

<h3>Beef</h3>
<ul>
  <li><strong>Olive oil, rosemary, garlic &amp; black pepper</strong> – for approx. 500 g steaks (rib-eye/entrecôte): 4 tbsp olive oil, 1 tbsp rosemary, 2 garlic cloves, 1 tsp coarse pepper. <strong>Time:</strong> vacuum 1–3 h, traditional 4–8 h. <strong>Cook:</strong> sear hard or grill. <strong>Tip:</strong> add salt only just before cooking.</li>
  <li><strong>Soy sauce, Worcestershire sauce &amp; mustard</strong> – for approx. 600 g roast beef/larger cut: 3 tbsp soy sauce, 1 tbsp Worcestershire sauce, 1 tbsp mustard, 2 tbsp oil, 1 garlic clove, pepper. <strong>Time:</strong> vacuum 3–6 h, traditional 12–24 h. <strong>Cook:</strong> low-temperature oven, braise or grill.</li>
</ul>

<h3>Fish</h3>
<ul>
  <li><strong>Lemon, dill, olive oil &amp; garlic</strong> – for approx. 400 g salmon/fish fillet: 3 tbsp olive oil, juice of ¼ lemon, 1 tbsp dill, 1 garlic clove, salt &amp; pepper. <strong>Time:</strong> vacuum 20–40 min, traditional 30–60 min. <strong>Important:</strong> marinate fish only briefly – acid "cooks" the protein. <strong>Cook:</strong> pan-fry, steam or bake.</li>
  <li><strong>Soy sauce, ginger &amp; sesame oil</strong> – for approx. 400 g tuna/salmon: 3 tbsp soy sauce, 1 tsp grated ginger, 1 tsp sesame oil, 1 tsp honey. <strong>Time:</strong> vacuum 20–40 min, traditional 30–60 min. <strong>Cook:</strong> sear briefly.</li>
</ul>

<h3>Vegetables (optional)</h3>
<ul>
  <li><strong>Olive oil, balsamic, garlic &amp; herbs</strong> – for approx. 500 g courgette, peppers or mushrooms: 4 tbsp olive oil, 2 tbsp balsamic, 1 garlic clove, 1 tsp herbes de Provence, salt &amp; pepper. <strong>Time:</strong> vacuum 30–60 min. <strong>Cook:</strong> grill or oven.</li>
</ul>

<h2>How long should different foods marinate?</h2>
<blockquote><p><strong>Note:</strong> these are <strong>general guidelines</strong>, not lab-tested times. The vacuum does not cut marinating time by a fixed percentage – it mainly ensures even contact. Thicker cuts benefit less than thin ones.</p></blockquote>
<ul>
  <li><strong>Chicken breast &amp; thighs:</strong> traditional 4–8 h → vacuum-assisted approx. 1–3 h.</li>
  <li><strong>Chicken wings:</strong> traditional 4–8 h → approx. 1–3 h.</li>
  <li><strong>Pork chops &amp; ribs:</strong> traditional 8–12 h → approx. 2–4 h.</li>
  <li><strong>Beef steaks:</strong> traditional 4–8 h → approx. 1–3 h.</li>
  <li><strong>Larger beef cuts/roasts:</strong> traditional 12–24 h → approx. 3–6 h.</li>
  <li><strong>Salmon &amp; fish fillet:</strong> traditional 30–60 min → approx. 20–40 min (no longer, especially with acidic marinades).</li>
</ul>

<h2>Vacuum vs. traditional marinating</h2>
<ul>
  <li><strong>Preparation time:</strong> vacuum → a little more (bag, machine); traditional → quick (bowl).</li>
  <li><strong>Marinating time:</strong> vacuum → tends to be shorter at the surface; traditional → longer.</li>
  <li><strong>Flavour distribution:</strong> vacuum → even, all sides; traditional → uneven, needs turning.</li>
  <li><strong>Convenience:</strong> vacuum → clean, no stirring; traditional → open bowl, turn several times.</li>
  <li><strong>Storage &amp; freshness:</strong> vacuum → marinate, store and freeze in one step; traditional → separate.</li>
  <li><strong>Food waste:</strong> vacuum → portioned and airtight, less spoilage; traditional → more air contact.</li>
  <li><strong>Equipment cost:</strong> vacuum → machine + bags needed; traditional → just a bowl or resealable bag.</li>
</ul>
<p><strong>When is a vacuum sealer worth it?</strong> Especially for batch cooking/meal prep, when you want to marinate and freeze straight away, for even seasoning and clean handling. <strong>When is a bowl enough?</strong> For a quick single portion, very short fish marinades or delicate ingredients a normal container or resealable bag is often fine.</p>

<h2>Food safety and common mistakes</h2>
<ul>
  <li><strong>Always marinate in the fridge</strong>, never at room temperature.</li>
  <li><strong>The vacuum does not sterilise.</strong> It does not make food safe at room temperature – in fact the low-oxygen environment can favour certain bacteria. Keeping it cold is essential.</li>
  <li><strong>Avoid cross-contamination:</strong> clean board, knife and hands thoroughly after raw meat/fish.</li>
  <li><strong>Don't reuse raw marinade:</strong> anything that touched raw meat should only be reused well cooked (e.g. as a sauce).</li>
  <li><strong>Safe core temperatures:</strong> cook poultry through (approx. 72–74 °C), pork well done, fish until opaque and firm – use a thermometer if unsure.</li>
  <li><strong>Be careful with fish and very acidic marinades:</strong> lemon juice, vinegar etc. denature the protein and quickly make fish mushy – marinate only briefly.</li>
  <li><strong>Use food-grade bags</strong> suitable for food contact.</li>
</ul>
<p><strong>Typical beginner mistakes:</strong> too much thin liquid (runs into the machine), marinating too long (especially fish), too much salt over too long (draws out water), leaving the bag at room temperature, and reusing marinade from raw meat.</p>

<h2>Conclusion: is vacuum marinating worth it?</h2>
<p>Yes – if you value even seasoning, clean handling and practical storage. The vacuum is no magic trick for "deeper" flavour, but it makes marinating faster, more even and more convenient, especially when preparing larger quantities. For a quick single portion a bowl will do. But anyone who regularly batch-cooks, grills or freezes won't want to be without a vacuum sealer – provided you use it correctly and follow the safety rules.</p>

<h2>Frequently asked questions (FAQ)</h2>
<h3>Does vacuuming really shorten marinating time?</h3>
<p>For the surface, usually yes, because the marinade stays in constant close contact and no turning is needed. But there is no fixed percentage, and flavour still won't penetrate deep into large cuts.</p>
<h3>Do I need a special marinade mode?</h3>
<p>No. A marinade/pulse mode is handy but not essential. With a manual pulse vacuum and a "moist" setting you get similar results.</p>
<h3>How do I stop marinade getting into the machine?</h3>
<p>Pre-chill or lightly freeze the marinade, use it sparingly, hold the bag upright and stop the vacuum before liquid reaches the seal. Chamber vacuum sealers handle liquids best.</p>
<h3>Can I freeze marinated meat straight away?</h3>
<p>Yes – a big advantage: marinate and freeze in one step. As it thaws in the fridge, the seasoning keeps working in.</p>
<h3>How long should fish marinate in a vacuum?</h3>
<p>Only briefly, about 20–40 minutes. Acidic marinades otherwise "cook" the fish and make it firm and mushy.</p>

<p>Looking for the right bags, rolls or a machine? <a href="/en/products">Browse our vacuum bags and sealers</a> – or get in touch, we are happy to help.</p>
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
