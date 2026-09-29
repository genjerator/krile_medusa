import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * "Vakuumverpackungsmaschinen in der Metzgerei" magazine article (MULTIVAC
 * focus, Planeta Industries). Localised: German base, English *_en (IT falls
 * back to DE). Scoped to the Industries sales channel.
 *
 * Run: npx medusa exec ./src/scripts/seed-article-butcher-vacuum.ts
 */

const SLUG = "vacuum-packaging-machines-butchers"
const SALES_CHANNEL_NAME = "IndustriesWebshop"
const COVER_IMAGE: string | null = null

const C70 = "/de/product/multivac-c70-tabletop-chamber-machine"
const P200 = "/de/product/multivac-baseline-p200"
const C500 = "/de/product/multivac-c500-double-chamber-machine"
const C550 = "/de/product/multivac-c550-double-chamber-machine"
// English variants — keep EN-article links on the /en storefront.
const C70_EN = "/en/product/multivac-c70-tabletop-chamber-machine"
const P200_EN = "/en/product/multivac-baseline-p200"
const C500_EN = "/en/product/multivac-c500-double-chamber-machine"
const C550_EN = "/en/product/multivac-c550-double-chamber-machine"

const BODY_DE = `
<p>In Metzgereien und Fleischereien zählt Frische – und die Zeit, in der ein Produkt frisch, hygienisch und verkaufsfähig bleibt, entscheidet über Qualität und Wirtschaftlichkeit. Eine professionelle <strong>Vakuumverpackungsmaschine</strong> hilft Fleischbetrieben, Fleisch und Wurst länger haltbar zu machen, sauber zu portionieren und ansprechend zu präsentieren.</p>

<p>In diesem Artikel zeigen wir, wie Vakuumverpackung in der Metzgerei eingesetzt wird und wie Sie die richtige <strong>MULTIVAC Vakuumverpackungsmaschine</strong> für Ihren Betrieb finden.</p>

<h2>Warum Vakuumverpackung in der Metzgerei?</h2>
<p>Beim Vakuumverpacken wird die Luft entfernt und das Produkt im Beutel versiegelt. Für einen Fleischbetrieb bringt das mehrere Vorteile:</p>
<ul>
  <li><strong>Längere Haltbarkeit</strong> – ohne Sauerstoff werden Oxidation und Keimwachstum verlangsamt, sodass Fleisch und Wurst deutlich länger frisch bleiben.</li>
  <li><strong>Hygiene und Schutz</strong> – die versiegelte Verpackung schützt vor Austrocknung, Fremdgerüchen und Kontamination bei Lagerung, Kühlung und Transport.</li>
  <li><strong>Portionierung</strong> – Fleisch lässt sich in verkaufs- oder küchengerechten Portionen verpacken und einfrieren, ohne Gefrierbrand.</li>
  <li><strong>Schnelleres Marinieren</strong> – unter Vakuum zieht die Marinade schneller und gleichmäßiger ins Fleisch ein, das spart Zeit und sorgt für gleichmäßigen Geschmack.</li>
  <li><strong>Präsentation und Verkauf</strong> – klar versiegelte Portionen wirken sauber und hochwertig, ideal für Theke, Selbstbedienung und Versand.</li>
</ul>

<h2>Typische Anwendungen</h2>
<p>Je nach Betrieb wird Vakuumverpackung in der Metzgerei unter anderem eingesetzt für:</p>
<ul>
  <li>Frischfleisch in Portionen (Steaks, Braten, Filets)</li>
  <li>Wurst, Schinken und Aufschnitt</li>
  <li>Mariniertes Fleisch und gewürzte Produkte</li>
  <li>Vorbereitung für die Sous-vide-Garung</li>
  <li>Einfrieren ohne Gefrierbrand</li>
  <li>Verkaufsfertige SB- und Versandpackungen</li>
</ul>
<p>Welche Verpackung sich eignet, hängt vom Produkt, von der geplanten Haltbarkeit und vom Verkaufsweg ab.</p>

<h2>Die richtige MULTIVAC Vakuumverpackungsmaschine wählen</h2>
<p><strong>MULTIVAC Vakuumverpackungsmaschinen</strong> sind für professionelle, hygienische und wiederholbare Verpackungsprozesse gebaut. Das passende Modell hängt von einigen Faktoren ab:</p>
<ul>
  <li><strong>Die Menge Fleisch und Wurst</strong>, die Sie täglich verpacken</li>
  <li><strong>Die Portions- und Beutelgröße</strong></li>
  <li><strong>Der Durchsatz</strong> – von der Metzgerei-Theke bis zur Fleischverarbeitung mit hohem Volumen</li>
</ul>
<p>Für <strong>kleinere Metzgereien</strong> eignen sich die kompakte <a href="${C70}">MULTIVAC C 70 Tischkammermaschine</a> und die <a href="${P200}">MULTIVAC BASELINE P 200</a> – ideal für die Theke und einzelne Portionen. Für <strong>größere Betriebe</strong> mit hohem Durchsatz bieten sich Doppelkammermaschinen wie die <a href="${C500}">MULTIVAC C 500 Doppelkammermaschine</a> und die noch leistungsstärkere <a href="${C550}">MULTIVAC C 550 Doppelkammermaschine</a> an.</p>
<p>Planeta Industries hilft Fleischbetrieben, diese Faktoren mit der passenden Lösung abzustimmen – von der Theke bis zur größeren Produktion.</p>

<h2>Beratung zur Vakuumverpackung für Ihre Metzgerei</h2>
<p>Wenn Sie Fleisch und Wurst vakuumverpacken möchten, hilft Ihnen Planeta Industries, eine passende MULTIVAC Lösung und die richtigen Vakuumbeutel dazu zu finden. <a href="/de/kontakt">Kontaktieren Sie uns</a>, um Ihre Anforderungen zu besprechen.</p>

<h2>Häufig gestellte Fragen</h2>
<h3>Wie lange bleibt vakuumverpacktes Fleisch frisch?</h3>
<p>Durch das Entfernen des Sauerstoffs bleibt Fleisch im Kühlschrank deutlich länger frisch als offen gelagert. Die genaue Haltbarkeit hängt von Produkt, Ausgangsfrische, Kühltemperatur und Hygiene ab.</p>
<h3>Welche MULTIVAC Maschine passt für eine Metzgerei?</h3>
<p>Das hängt von Menge, Portions- bzw. Beutelgröße und Durchsatz ab. MULTIVAC bietet Maschinen von der kompakten Tischmaschine bis zu höheren Durchsätzen; Planeta Industries berät Sie bei der Auswahl.</p>
<h3>Verhindert Vakuumverpackung Gefrierbrand?</h3>
<p>Ja. Da keine Luft am Produkt anliegt, wird Gefrierbrand beim Einfrieren deutlich reduziert.</p>
`.trim()

const BODY_EN = `
<p>In butcher shops and meat businesses, freshness is everything — and the length of time a product stays fresh, hygienic and saleable directly affects both quality and profitability. A professional <strong>vacuum packaging machine</strong> helps meat businesses keep meat and sausage fresh for longer, portion it cleanly and present it attractively.</p>

<p>In this article we look at how vacuum packaging is used in the butcher shop and how to choose the right <strong>MULTIVAC vacuum packaging machine</strong> for your operation.</p>

<h2>Why Vacuum Packaging in a Butcher Shop?</h2>
<p>Vacuum packaging removes the air and seals the product in a bag. For a meat business, that brings several benefits:</p>
<ul>
  <li><strong>Longer shelf life</strong> — without oxygen, oxidation and microbial growth are slowed, so meat and sausage stay fresh considerably longer.</li>
  <li><strong>Hygiene and protection</strong> — the sealed package guards against drying-out, foreign odours and contamination during storage, chilling and transport.</li>
  <li><strong>Portioning</strong> — meat can be packed and frozen in retail- or kitchen-sized portions without freezer burn.</li>
  <li><strong>Faster marinating</strong> — under vacuum, marinades penetrate the meat faster and more evenly, saving time and giving consistent flavour.</li>
  <li><strong>Presentation and sales</strong> — clearly sealed portions look clean and premium, ideal for the counter, self-service and shipping.</li>
</ul>

<h2>Typical Applications</h2>
<p>Depending on the operation, vacuum packaging in the butcher shop is used for, among others:</p>
<ul>
  <li>Fresh meat in portions (steaks, roasts, fillets)</li>
  <li>Sausage, ham and cold cuts</li>
  <li>Marinated meat and seasoned products</li>
  <li>Preparation for sous-vide cooking</li>
  <li>Freezing without freezer burn</li>
  <li>Ready-to-sell self-service and shipping packs</li>
</ul>
<p>Which packaging suits best depends on the product, the intended shelf life and the sales channel.</p>

<h2>Choosing the Right MULTIVAC Vacuum Packaging Machine</h2>
<p><strong>MULTIVAC vacuum packaging machines</strong> are built for professional, hygienic and repeatable packaging processes. The right model depends on a few factors:</p>
<ul>
  <li><strong>The amount of meat and sausage</strong> you package daily</li>
  <li><strong>The portion and bag size</strong></li>
  <li><strong>The throughput</strong> — from the butcher's counter to higher-volume meat processing</li>
</ul>
<p>For <strong>smaller butcher shops</strong>, the compact <a href="${C70_EN}">MULTIVAC C 70 table-top chamber machine</a> and the <a href="${P200_EN}">MULTIVAC BASELINE P 200</a> are ideal for the counter and individual portions. For <strong>larger operations</strong> with high throughput, double chamber machines such as the <a href="${C500_EN}">MULTIVAC C 500 Double Chamber Machine</a> and the even more powerful <a href="${C550_EN}">MULTIVAC C 550 Double Chamber Machine</a> are a great fit.</p>
<p>Planeta Industries helps meat businesses match these factors to the right solution — from the counter to larger production.</p>

<h2>Get Advice on Vacuum Packaging for Your Butcher Shop</h2>
<p>If you want to vacuum package meat and sausage, Planeta Industries can help you find a suitable MULTIVAC solution and the right vacuum bags. <a href="/en/kontakt">Contact us</a> to discuss your requirements.</p>

<h2>Frequently Asked Questions</h2>
<h3>How long does vacuum-packed meat stay fresh?</h3>
<p>Removing the oxygen keeps meat fresh in the fridge considerably longer than storing it open. The exact shelf life depends on the product, its initial freshness, the chilling temperature and hygiene.</p>
<h3>Which MULTIVAC machine suits a butcher shop?</h3>
<p>It depends on volume, portion/bag size and throughput. MULTIVAC offers machines from a compact table-top unit to higher throughput; Planeta Industries can help you choose.</p>
<h3>Does vacuum packaging prevent freezer burn?</h3>
<p>Yes. Because no air is in contact with the product, freezer burn is greatly reduced when freezing.</p>
`.trim()

export default async function seedArticleButcherVacuum({ container }: ExecArgs) {
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
    title: "Vakuumverpackungsmaschinen in der Metzgerei",
    title_en: "Vacuum Packaging Machines in Butcher Shops",
    excerpt:
      "Wie Metzgereien und Fleischereien MULTIVAC Vakuumverpackungsmaschinen einsetzen, um Fleisch und Wurst länger frisch zu halten, zu portionieren und zu präsentieren – Anwendungen und Maschinenwahl.",
    excerpt_en:
      "How butcher shops and meat processors use MULTIVAC vacuum packaging machines to keep meat and sausage fresh longer, portion and present it — applications and machine selection.",
    meta_title: "Vakuumverpackung in der Metzgerei | MULTIVAC",
    meta_title_en: "Vacuum Packaging in Butcher Shops | MULTIVAC",
    meta_description:
      "Vakuumverpackung in der Metzgerei: Fleisch und Wurst länger haltbar machen, hygienisch portionieren und ansprechend präsentieren mit MULTIVAC. Anwendungen und Maschinenwahl.",
    meta_description_en:
      "Vacuum packaging in the butcher shop: extend the shelf life of meat and sausage, portion hygienically and present attractively with MULTIVAC. Applications and machine selection.",
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

  console.log(`BUTCHER ARTICLE SEED DONE: slug=${SLUG} channel=${industries?.name ?? "GLOBAL"}`)
}
