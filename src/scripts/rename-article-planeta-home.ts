import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * One-off: rebrand the "Käse im Angebot" magazine article from "Multivac Home"
 * to "Planeta Home" (copyright — the product is now made/sold by Planeta) and
 * rename its slug. First body mention keeps a factual "(früher Multivac Home)"
 * note for recognition; the manufacturer name Multivac itself is not otherwise used here.
 * A 301 redirect for the old slug is added in the planeta.de storefront.
 *
 * Run: npx medusa exec ./src/scripts/rename-article-planeta-home.ts
 */
const ARTICLE_ID = "01KZRX74QGHBQ2Q3KN6EY12DTV"
const NEW_SLUG = "planeta-home-kaese-im-angebot"

export default async function renameArticlePlanetaHome({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: any = container.resolve(ARTICLE_MODULE)

  const [article] = await service.listArticles({ id: ARTICLE_ID }, { take: 1 })
  if (!article) throw new Error(`Article ${ARTICLE_ID} not found in this database.`)

  await service.updateArticles({
    id: ARTICLE_ID,
    slug: NEW_SLUG,
    title: `Käse im Angebot? So kaufen Sie clever – und halten ihn mit dem Planeta Home wochenlang frisch`,
    excerpt: `Ein Laib Käse zum Aktionspreis lohnt sich nur, wenn nichts verdirbt. So machen Sie mit dem Planeta Home aus dem Angebot wochenlangen Vorrat.`,
    meta_title: `Käse im Angebot vakuumieren & haltbar machen | Planeta Home`,
    meta_description: `Großpackung Käse im Angebot gekauft? Mit dem Planeta Home (früher Multivac Home) portionieren, vakuumieren und wochenlang frisch halten – Geld sparen, Verschwendung vermeiden.`,
    body: `<figure>
  <img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/edamer-whole.jpg" alt="Ein ganzer Edamer-Laib – im Angebot clever kaufen und mit dem Planeta Home wochenlang frisch halten." />
</figure>

<p>Ein großer Laib Käse zum Aktionspreis – das Kilo deutlich günstiger als die kleine Packung. Ein gutes Geschäft. Aber nur dann, wenn der Käse nicht in der Schublade austrocknet, bevor Sie ihn aufgebraucht haben. Genau hier kommt der Planeta Home (früher Multivac Home) ins Spiel: Ganzen Block kaufen, portionieren, vakuumieren – und aus einem einmaligen Angebot wochenlangen Vorrat machen. Wir zeigen es am Beispiel eines Laibs Edamer.</p>

<h2>Warum sich der Großeinkauf im Angebot wirklich lohnt</h2>
<p>Große Gebinde sind pro Kilo fast immer günstiger als abgepackte Scheiben – im Angebot noch einmal deutlich mehr. Der Haken: Angebrochener Käse verliert im Kühlschrank schnell an Qualität. Er trocknet aus, nimmt fremde Gerüche an und setzt an der Schnittfläche Schimmel an. Was Sie beim Einkauf gespart haben, landet dann im Müll.</p>
<p>Die Lösung ist simpel: Sie kaufen groß, <strong>portionieren sofort</strong> und versiegeln jede Portion luftdicht. So zahlen Sie den Aktionspreis pro Kilo, greifen aber wochenlang immer nur auf eine frische Einzelportion zu – der Rest bleibt unberührt und geschützt.</p>

<h2>In 4 Schritten: Vom Angebot zum Vorrat</h2>
<h3>1. Ganzen Laib kaufen</h3>
<p>Nutzen Sie das Angebot und nehmen Sie den ganzen Block statt der kleinen Packung. Bei Hartkäse wie Edamer, Gouda oder Bergkäse ist das ideal – er lässt sich hervorragend portionieren und vakuumieren.</p>
<h3>2. In Portionen schneiden</h3>
<p>Schneiden Sie den Laib in Stücke, wie Sie sie tatsächlich verbrauchen – zum Beispiel Wochenportionen. Lieber etwas kleiner: Eine einmal geöffnete Portion sollten Sie innerhalb weniger Tage aufbrauchen, alle anderen bleiben versiegelt.</p>
<figure style="margin:28px 0;"><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/edamer-sliced.jpg" alt="Käselaib in gleichmäßige Portionen geschnitten" loading="lazy" style="width:100%;height:auto;display:block;border:1px solid #D9E0DD;border-radius:4px;" /><figcaption style="font-family:var(--font-montserrat),sans-serif;font-size:12px;color:#7C8890;margin-top:8px;">In gleichmäßige Portionen geschnitten – so, wie Sie den Käse tatsächlich verbrauchen.</figcaption></figure>
<h3>3. Mit dem Planeta Home vakuumieren</h3>
<p>Legen Sie jede Portion in einen Beutel und ziehen Sie mit dem Planeta Home das Vakuum. Weil der Planeta Home nach dem <strong>Kammerprinzip</strong> arbeitet, wird die Luft rundum entzogen und der Beutel sauber versiegelt – fest genug für langen Schutz, ohne den Käse zu quetschen.</p>
<figure style="margin:28px 0;"><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/edamer-vakuumed.jpg" alt="Einzelne Käseportionen vakuumiert im Beutel" loading="lazy" style="width:100%;height:auto;display:block;border:1px solid #D9E0DD;border-radius:4px;" /><figcaption style="font-family:var(--font-montserrat),sans-serif;font-size:12px;color:#7C8890;margin-top:8px;">Jede Portion einzeln vakuumiert und luftdicht versiegelt.</figcaption></figure>
<h3>4. Im Kühlschrank stapeln und lagern</h3>
<p>Die flachen, vakuumierten Portionen lassen sich platzsparend stapeln und behalten den Überblick. Tipp: Beschriften Sie jeden Beutel mit dem Datum – so gilt „first in, first out“ ganz automatisch.</p>
<figure style="margin:28px 0;"><img src="https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/edamer-fridge.jpg" alt="Vakuumierte Käseportionen gestapelt im Kühlschrank" loading="lazy" style="width:100%;height:auto;display:block;border:1px solid #D9E0DD;border-radius:4px;" /><figcaption style="font-family:var(--font-montserrat),sans-serif;font-size:12px;color:#7C8890;margin-top:8px;">Platzsparend gestapelt und wochenlang frisch – ganz ohne Austrocknen.</figcaption></figure>

<h2>Wie lange hält vakuumierter Käse?</h2>
<p>Durch das Entfernen des Sauerstoffs verlangsamen Sie die Prozesse, die Käse altern lassen. Als Orientierung für Hartkäse wie Edamer:</p>
<table style="width:100%;border-collapse:collapse;margin:8px 0 4px;font-size:.98rem;">
<thead><tr>
<th style="text-align:left;border-bottom:2px solid #14181C;padding:8px 10px;font-family:var(--font-montserrat),sans-serif;">Lagerung</th>
<th style="text-align:left;border-bottom:2px solid #14181C;padding:8px 10px;font-family:var(--font-montserrat),sans-serif;">Richtwert Haltbarkeit</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px 10px;border-bottom:1px solid #D9E0DD;">Offen im Kühlschrank</td><td style="padding:8px 10px;border-bottom:1px solid #D9E0DD;">wenige Tage bis ~1 Woche</td></tr>
<tr><td style="padding:8px 10px;border-bottom:1px solid #D9E0DD;"><strong>Vakuumiert im Kühlschrank</strong></td><td style="padding:8px 10px;border-bottom:1px solid #D9E0DD;"><strong>mehrere Wochen</strong></td></tr>
<tr><td style="padding:8px 10px;border-bottom:1px solid #D9E0DD;">Vakuumiert im Gefrierfach</td><td style="padding:8px 10px;border-bottom:1px solid #D9E0DD;">mehrere Monate</td></tr>
</tbody>
</table>
<p>Die Werte sind Richtwerte und hängen von Käsesorte, Frische beim Kauf und Kühltemperatur ab. Klar ist: Vakuumiert hält der Käse ein Vielfaches länger als offen.</p>

<h2>Profi-Tipps für vakuumierten Käse</h2>
<ul>
<li><strong>Hartkäse ist ideal.</strong> Edamer, Gouda, Bergkäse &amp; Co. lassen sich problemlos vakuumieren. Sehr weiche oder edelschimmelgereifte Käse reagieren empfindlicher – hier lieber sanfter versiegeln.</li>
<li><strong>Datum notieren.</strong> Ein Stift auf dem Beutel spart später das Rätselraten.</li>
<li><strong>Sauber schneiden.</strong> Je glatter die Schnittfläche und je frischer der Käse beim Vakuumieren, desto besser das Ergebnis.</li>
<li><strong>Nach dem Öffnen zügig verbrauchen.</strong> Sobald ein Beutel offen ist, gilt wieder die normale Haltbarkeit – deshalb in sinnvollen Portionsgrößen einteilen.</li>
</ul>

<h2>Häufige Fragen</h2>
<h3>Kann man Käse vakuumieren?</h3>
<p>Ja. Besonders Hartkäse wie Edamer eignet sich hervorragend. Durch das Vakuum bleibt er deutlich länger frisch.</p>
<h3>Wie lange hält vakuumierter Käse?</h3>
<p>Im Kühlschrank vakuumiert mehrere Wochen, im Gefrierfach mehrere Monate – ein Vielfaches der offenen Lagerung.</p>
<h3>Kann man vakuumierten Käse einfrieren?</h3>
<p>Ja. Vakuumiert schützt der Beutel zusätzlich vor Gefrierbrand. Nach dem Auftauen kann Hartkäse etwas krümeliger werden – zum Überbacken oder Reiben ideal.</p>
<h3>Lohnt sich der Kauf im Angebot überhaupt?</h3>
<p>Ja – vorausgesetzt, der Käse landet nicht im Müll. Genau das verhindern Sie durch Portionieren und Vakuumieren.</p>

<h2>Fazit</h2>
<p>Ein Angebot ist nur dann ein Schnäppchen, wenn nichts verdirbt. Mit dem Planeta Home verwandeln Sie den günstigen Groß-Käse in wochenlangen, portionsgerechten Vorrat – Sie sparen Geld, sparen Wege und werfen nichts weg. Clever einkaufen, richtig lagern, länger genießen.</p>`,
  })

  logger.info(`✅ Rebranded article ${ARTICLE_ID} → slug "${NEW_SLUG}" (Multivac Home → Planeta Home)`)
}
