import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * "Vakuumverpackungsmaschinen in der Elektronik" magazine article (MULTIVAC
 * focus, Planeta Industries). Localised: German base, English *_en (IT falls
 * back to DE). Scoped to the Industries sales channel.
 *
 * Run: npx medusa exec ./src/scripts/seed-article-electronics-vacuum.ts
 */

const SLUG = "vacuum-packaging-machines-electronics"
const SALES_CHANNEL_NAME = "IndustriesWebshop"
const COVER_IMAGE: string | null = null

const C70 = "/de/product/multivac-c70-tabletop-chamber-machine"
const P200 = "/de/product/multivac-baseline-p200"
const P360 = "/de/product/multivac-baseline-p360"

const BODY_DE = `
<p>Elektronische Bauteile und Baugruppen sind empfindlich gegenüber Feuchtigkeit, Oxidation und Korrosion. Leiterplatten, Halbleiter und feuchtigkeitsempfindliche Bauteile (MSD) können bei falscher Lagerung oder falschem Versand Schaden nehmen. Eine professionelle <strong>Vakuumverpackungsmaschine</strong> hilft Elektronikfertigung und -laboren, solche Teile sauber, kompakt und reproduzierbar zu verpacken und so vor äußeren Einflüssen zu schützen.</p>

<p>In diesem Artikel zeigen wir, wie Vakuumverpackung in der Elektronik eingesetzt wird und wie Sie die richtige <strong>MULTIVAC Vakuumverpackungsmaschine</strong> für Ihre Abläufe finden.</p>

<h2>Warum Vakuumverpackung in der Elektronik?</h2>
<p>Beim Vakuumverpacken wird die Luft entfernt und das Bauteil in einem Beutel versiegelt. In Kombination mit geeigneten Materialien bringt das mehrere Vorteile:</p>
<ul>
  <li><strong>Feuchtigkeits- und Korrosionsschutz</strong> – zusammen mit Feuchtigkeitsschutzbeuteln (MBB), Trockenmittel und Feuchtigkeitsindikator schützt die luftfreie Verpackung feuchtigkeitsempfindliche Bauteile.</li>
  <li><strong>Schutz beim Transport und bei der Lagerung</strong> – die versiegelte Verpackung schützt vor Staub, Schmutz und Feuchtigkeit.</li>
  <li><strong>Kompakte, geordnete Handhabung</strong> – vakuumierte Pakete sind fest und platzsparend und lassen sich sauber beschriften.</li>
  <li><strong>Reproduzierbarkeit</strong> – ein maschinengesteuerter Prozess liefert jedes Mal dieselbe zuverlässige Versiegelung.</li>
</ul>
<p>Für ESD-empfindliche Elektronik werden dabei geeignete, antistatische bzw. ESD-sichere Verpackungsmaterialien verwendet – die Maschine übernimmt das saubere, dichte Versiegeln.</p>

<h2>Typische Anwendungen</h2>
<p>Je nach Betrieb wird Vakuumverpackung in der Elektronik unter anderem eingesetzt für:</p>
<ul>
  <li>Leiterplatten (PCBs) und bestückte Baugruppen</li>
  <li>Feuchtigkeitsempfindliche Bauteile (MSD) und Halbleiter</li>
  <li>Elektronische Komponenten und Ersatzteile</li>
  <li>Langzeitlagerung und Versand empfindlicher Elektronik</li>
  <li>Baugruppen für Rücksendungen, Reparatur oder Archivierung</li>
</ul>
<p>Nicht jedes Elektronikteil muss vakuumverpackt werden – die richtige Methode hängt vom Bauteil, seiner Empfindlichkeit und vom Lager- bzw. Transportprozess ab.</p>

<h2>Die richtige MULTIVAC Vakuumverpackungsmaschine wählen</h2>
<p><strong>MULTIVAC Vakuumverpackungsmaschinen</strong> sind für professionelle, wiederholbare Verpackungsprozesse gebaut. Das passende Modell hängt von einigen Faktoren ab:</p>
<ul>
  <li><strong>Die Größe der Bauteile bzw. Baugruppen</strong>, die Sie verpacken</li>
  <li><strong>Die benötigte Beutelgröße</strong> (auch für Feuchtigkeitsschutzbeutel)</li>
  <li><strong>Die Anzahl der Verpackungen pro Tag</strong> – gelegentlicher Einsatz oder kontinuierlicher Durchsatz</li>
</ul>
<p>Beliebte Optionen sind die kompakte <a href="${C70}">MULTIVAC C 70 Tischkammermaschine</a> für einzelne Bauteile und kleinere Serien sowie die <a href="${P200}">MULTIVAC BASELINE P 200</a> und <a href="${P360}">MULTIVAC BASELINE P 360</a> für höheren Tagesdurchsatz.</p>
<p>Planeta Industries hilft Betrieben, diese Faktoren mit der passenden Lösung abzustimmen – von kompakten Maschinen bis zu Systemen für höhere Mengen.</p>

<h2>Beratung zur Vakuumverpackung für Ihre Elektronik</h2>
<p>Wenn Sie Leiterplatten, Bauteile oder Baugruppen vakuumverpacken möchten, hilft Ihnen Planeta Industries, eine passende MULTIVAC Lösung und die richtigen Verpackungsmaterialien dazu zu finden. <a href="/de/kontakt">Kontaktieren Sie uns</a>, um Ihre Anforderungen zu besprechen.</p>

<h2>Häufig gestellte Fragen</h2>
<h3>Schützt Vakuumverpackung Elektronik vor Feuchtigkeit?</h3>
<p>In Kombination mit Feuchtigkeitsschutzbeuteln (MBB), Trockenmittel und einem Feuchtigkeitsindikator hilft die luftfreie Verpackung, feuchtigkeitsempfindliche Bauteile bei Lagerung und Transport zu schützen.</p>
<h3>Welche MULTIVAC Maschine passt für die Elektronik?</h3>
<p>Das hängt von Bauteilgröße, Beutelgröße und Menge pro Tag ab. MULTIVAC bietet Maschinen vom gelegentlichen Einsatz bis zu höheren Durchsätzen; Planeta Industries berät Sie bei der Auswahl.</p>
`.trim()

const BODY_EN = `
<p>Electronic components and assemblies are sensitive to moisture, oxidation and corrosion. Printed circuit boards, semiconductors and moisture-sensitive devices (MSD) can be damaged by incorrect storage or shipping. A professional <strong>vacuum packaging machine</strong> helps electronics manufacturing and labs package such parts cleanly, compactly and reproducibly, protecting them from external influences.</p>

<p>In this article we look at how vacuum packaging is used in electronics and how to choose the right <strong>MULTIVAC vacuum packaging machine</strong> for your workflow.</p>

<h2>Why Vacuum Packaging in Electronics?</h2>
<p>Vacuum packaging removes the air and seals the component in a bag. Combined with the right materials, that brings several benefits:</p>
<ul>
  <li><strong>Moisture and corrosion protection</strong> — together with moisture-barrier bags (MBB), desiccant and a humidity indicator, the air-free package protects moisture-sensitive components.</li>
  <li><strong>Protection in transit and storage</strong> — the sealed package guards against dust, dirt and moisture.</li>
  <li><strong>Compact, organised handling</strong> — vacuum-packed parts are firm, space-efficient and easy to label.</li>
  <li><strong>Reproducibility</strong> — a machine-controlled process delivers the same reliable seal every time.</li>
</ul>
<p>For ESD-sensitive electronics, suitable antistatic / ESD-safe packaging materials are used — the machine handles the clean, tight sealing.</p>

<h2>Typical Applications</h2>
<p>Depending on the operation, vacuum packaging in electronics is used for, among others:</p>
<ul>
  <li>Printed circuit boards (PCBs) and populated assemblies</li>
  <li>Moisture-sensitive devices (MSD) and semiconductors</li>
  <li>Electronic components and spare parts</li>
  <li>Long-term storage and shipping of sensitive electronics</li>
  <li>Assemblies for returns, repair or archiving</li>
</ul>
<p>Not every electronic part needs vacuum packaging — the right method depends on the component, its sensitivity and the storage or transport process.</p>

<h2>Choosing the Right MULTIVAC Vacuum Packaging Machine</h2>
<p><strong>MULTIVAC vacuum packaging machines</strong> are built for professional, repeatable packaging processes. The right model depends on a few factors:</p>
<ul>
  <li><strong>The size of the components or assemblies</strong> you package</li>
  <li><strong>The bag size</strong> you need (including moisture-barrier bags)</li>
  <li><strong>The number of packages per day</strong> — occasional use or continuous throughput</li>
</ul>
<p>Popular options include the compact <a href="${C70}">MULTIVAC C 70 table-top chamber machine</a> for individual components and smaller runs, and the <a href="${P200}">MULTIVAC BASELINE P 200</a> and <a href="${P360}">MULTIVAC BASELINE P 360</a> for higher daily throughput.</p>
<p>Planeta Industries helps operations match these factors to the right solution — from compact machines to systems for higher volumes.</p>

<h2>Get Advice on Vacuum Packaging for Your Electronics</h2>
<p>If you want to vacuum package PCBs, components or assemblies, Planeta Industries can help you find a suitable MULTIVAC solution and the right packaging materials. <a href="/en/kontakt">Contact us</a> to discuss your requirements.</p>

<h2>Frequently Asked Questions</h2>
<h3>Does vacuum packaging protect electronics from moisture?</h3>
<p>Combined with moisture-barrier bags (MBB), desiccant and a humidity indicator, the air-free package helps protect moisture-sensitive components during storage and transport.</p>
<h3>Which MULTIVAC machine suits electronics?</h3>
<p>It depends on component size, bag size and quantity per day. MULTIVAC offers machines from occasional use to higher throughput; Planeta Industries can help you choose.</p>
`.trim()

export default async function seedArticleElectronicsVacuum({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: any = container.resolve(ARTICLE_MODULE)
  const salesChannelModule: any = container.resolve(Modules.SALES_CHANNEL)

  let [author] = await service.listArticleAuthors({ slug: "evgenije" }, { take: 1 })
  if (!author) {
    author = await service.createArticleAuthors({
      name: "Evgenije",
      slug: "evgenije",
      role: "Author",
      active: true,
    })
    logger.info(`Created author Evgenije (${author.id})`)
  }

  const [industries] = await salesChannelModule.listSalesChannels(
    { name: [SALES_CHANNEL_NAME] },
    { select: ["id", "name"] }
  )
  if (!industries) {
    logger.warn(
      `Sales channel "${SALES_CHANNEL_NAME}" not found — article will be global (all channels).`
    )
  }

  const fields = {
    status: "published" as const,
    category: "Anwendungen",
    cover_image: COVER_IMAGE,
    author_id: author.id,
    sales_channel_id: industries?.id ?? null,
    title: "Vakuumverpackungsmaschinen in der Elektronik",
    title_en: "Vacuum Packaging Machines in Electronics",
    excerpt:
      "Wie Elektronikfertigung und -labore MULTIVAC Vakuumverpackungsmaschinen einsetzen, um feuchtigkeitsempfindliche Bauteile und Baugruppen zu schützen – Anwendungen und Maschinenwahl.",
    excerpt_en:
      "How electronics manufacturing and labs use MULTIVAC vacuum packaging machines to protect moisture-sensitive components and assemblies — applications and machine selection.",
    meta_title: "Vakuumverpackung in der Elektronik | MULTIVAC",
    meta_title_en: "Vacuum Packaging in Electronics | MULTIVAC",
    meta_description:
      "Vakuumverpackung in der Elektronik: feuchtigkeitsempfindliche Bauteile, Leiterplatten und Baugruppen vor Feuchtigkeit und Korrosion schützen mit MULTIVAC. Anwendungen und Maschinenwahl.",
    meta_description_en:
      "Vacuum packaging in electronics: protect moisture-sensitive components, PCBs and assemblies from moisture and corrosion with MULTIVAC. Applications and machine selection.",
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

  console.log(`ELECTRONICS ARTICLE SEED DONE: slug=${SLUG} channel=${industries?.name ?? "GLOBAL"}`)
}
