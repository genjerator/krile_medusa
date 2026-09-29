import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * "Vakuumverpackungsmaschinen im Hotel" magazine article (MULTIVAC focus,
 * Planeta Industries). Localised: German base, English *_en (IT falls back to
 * DE). Scoped to the Industries sales channel.
 *
 * Run: npx medusa exec ./src/scripts/seed-article-hotel-vacuum.ts
 */

const SLUG = "vacuum-packaging-machines-hotels"
const SALES_CHANNEL_NAME = "IndustriesWebshop"
const COVER_IMAGE: string | null = null

// German article → /de product links; English article → /en product links.
const HOME = "/de/product/vakuumierer-multivac-home"
const C70 = "/de/product/multivac-c70-tabletop-chamber-machine"
const P200 = "/de/product/multivac-baseline-p200"
const HOME_EN = "/en/product/vakuumierer-multivac-home"
const C70_EN = "/en/product/multivac-c70-tabletop-chamber-machine"
const P200_EN = "/en/product/multivac-baseline-p200"

const BODY_DE = `
<p>In Hotelküchen und in der Gastronomie zählen Frische, Effizienz und Hygiene – und die Fähigkeit, Speisen vorzubereiten, sicher zu lagern und Lebensmittelverschwendung zu vermeiden. Eine professionelle <strong>Vakuumverpackungsmaschine</strong> hilft Hotels, Zutaten und Gerichte länger frisch zu halten, effizient vorzubereiten (Mise en place) und für Sous-vide, Bankett und Catering optimal zu organisieren.</p>

<p>In diesem Artikel zeigen wir, wie Vakuumverpackung im Hotel eingesetzt wird und wie Sie die richtige <strong>MULTIVAC Vakuumverpackungsmaschine</strong> für Ihren Betrieb finden.</p>

<h2>Warum Vakuumverpackung im Hotel?</h2>
<p>Beim Vakuumverpacken wird die Luft entfernt und das Produkt im Beutel versiegelt. Für eine Hotelküche bringt das mehrere Vorteile:</p>
<ul>
  <li><strong>Längere Haltbarkeit & weniger Verschwendung</strong> – ohne Sauerstoff bleiben Zutaten und Speisen länger frisch, das senkt Wareneinsatz und Foodwaste.</li>
  <li><strong>Effiziente Vorbereitung (Mise en place)</strong> – Komponenten können vorbereitet, portioniert und bis zum Service sicher gelagert werden.</li>
  <li><strong>Sous-vide</strong> – vakuumierte Beutel sind die Grundlage für das schonende Garen bei niedriger Temperatur.</li>
  <li><strong>Hygiene und Schutz</strong> – die versiegelte Verpackung schützt vor Austrocknung, Fremdgerüchen und Kontamination im Kühlhaus.</li>
  <li><strong>Schnelleres Marinieren</strong> – unter Vakuum zieht die Marinade schneller und gleichmäßiger ins Fleisch oder in den Fisch ein.</li>
</ul>

<h2>Typische Anwendungen</h2>
<p>Je nach Betrieb wird Vakuumverpackung im Hotel unter anderem eingesetzt für:</p>
<ul>
  <li>Vorbereitete Zutaten und Komponenten (Mise en place)</li>
  <li>Sous-vide-Garung von Fleisch, Fisch und Gemüse</li>
  <li>Portionsweise Lagerung frischer Lebensmittel</li>
  <li>Mariniertes Fleisch und Fisch</li>
  <li>Sicheres Lagern von Buffet- und Bankettvorbereitungen</li>
  <li>Catering: Transport vorbereiteter Speisen</li>
  <li>Einfrieren ohne Gefrierbrand</li>
</ul>
<p>Welche Verpackung sich eignet, hängt vom Produkt, von der geplanten Haltbarkeit und vom Serviceablauf ab.</p>

<h2>Die richtige MULTIVAC Vakuumverpackungsmaschine wählen</h2>
<p><strong>MULTIVAC Vakuumverpackungsmaschinen</strong> sind für professionelle, hygienische und wiederholbare Verpackungsprozesse gebaut. Das passende Modell hängt von einigen Faktoren ab:</p>
<ul>
  <li><strong>Die Menge</strong>, die Sie täglich vorbereiten und verpacken</li>
  <li><strong>Die Portions- und Beutelgröße</strong></li>
  <li><strong>Der Durchsatz</strong> – von der kleinen Hotelküche bis zum größeren Restaurant- und Bankettbetrieb</li>
</ul>
<p>Für den <strong>täglichen Einsatz in kleineren Hotels</strong> eignet sich der kompakte <a href="${HOME}">MULTIVAC Home Kammer-Vakuumierer</a> – ideal für leichte bis mittlere Mengen. Für <strong>mehr Volumen und Sous-vide im laufenden Betrieb</strong> bieten sich die <a href="${C70}">MULTIVAC C 70 Tischkammermaschine</a> und die <a href="${P200}">MULTIVAC BASELINE P 200</a> an.</p>
<p>Planeta Industries hilft Hotels und Gastronomiebetrieben, diese Faktoren mit der passenden Lösung abzustimmen – von der Boutique-Küche bis zum großen Bankettbetrieb.</p>

<h2>Beratung zur Vakuumverpackung für Ihr Hotel</h2>
<p>Wenn Sie in Ihrer Hotelküche vakuumverpacken möchten, hilft Ihnen Planeta Industries, eine passende MULTIVAC Lösung und die richtigen Vakuumbeutel dazu zu finden. <a href="/de/kontakt">Kontaktieren Sie uns</a>, um Ihre Anforderungen zu besprechen.</p>

<h2>Häufig gestellte Fragen</h2>
<h3>Wofür nutzen Hotelküchen Vakuumverpackung?</h3>
<p>Vor allem für Mise en place, Sous-vide, portionsweise Lagerung, Marinieren und die Reduzierung von Lebensmittelverschwendung – sowie für Catering und Bankett.</p>
<h3>Welche MULTIVAC Maschine passt für ein Hotel?</h3>
<p>Das hängt von Menge, Portions- bzw. Beutelgröße und Durchsatz ab. MULTIVAC bietet Maschinen von der kompakten Tischmaschine bis zu leistungsstarken Doppelkammermaschinen; Planeta Industries berät Sie bei der Auswahl.</p>
<h3>Eignet sich Vakuumverpackung für Sous-vide?</h3>
<p>Ja. Vakuumierte Beutel sind die Grundlage für das schonende Garen bei niedriger Temperatur und ein Standard in der professionellen Küche.</p>
`.trim()

const BODY_EN = `
<p>In hotel kitchens and hospitality, freshness, efficiency and hygiene are everything — along with the ability to prep dishes ahead, store them safely and reduce food waste. A professional <strong>vacuum packaging machine</strong> helps hotels keep ingredients and dishes fresh for longer, prep efficiently (mise en place) and organise perfectly for sous-vide, banquets and catering.</p>

<p>In this article we look at how vacuum packaging is used in hotels and how to choose the right <strong>MULTIVAC vacuum packaging machine</strong> for your operation.</p>

<h2>Why Vacuum Packaging in a Hotel?</h2>
<p>Vacuum packaging removes the air and seals the product in a bag. For a hotel kitchen, that brings several benefits:</p>
<ul>
  <li><strong>Longer shelf life & less waste</strong> — without oxygen, ingredients and dishes stay fresh longer, cutting food costs and waste.</li>
  <li><strong>Efficient prep (mise en place)</strong> — components can be prepared, portioned and safely stored until service.</li>
  <li><strong>Sous-vide</strong> — vacuum-sealed bags are the basis for gentle low-temperature cooking.</li>
  <li><strong>Hygiene and protection</strong> — the sealed package guards against drying-out, foreign odours and contamination in the cold store.</li>
  <li><strong>Faster marinating</strong> — under vacuum, marinades penetrate meat or fish faster and more evenly.</li>
</ul>

<h2>Typical Applications</h2>
<p>Depending on the operation, vacuum packaging in a hotel is used for, among others:</p>
<ul>
  <li>Prepared ingredients and components (mise en place)</li>
  <li>Sous-vide cooking of meat, fish and vegetables</li>
  <li>Portioned storage of fresh food</li>
  <li>Marinated meat and fish</li>
  <li>Safely storing buffet and banquet prep</li>
  <li>Catering: transporting prepared dishes</li>
  <li>Freezing without freezer burn</li>
</ul>
<p>Which packaging suits best depends on the product, the intended shelf life and the service workflow.</p>

<h2>Choosing the Right MULTIVAC Vacuum Packaging Machine</h2>
<p><strong>MULTIVAC vacuum packaging machines</strong> are built for professional, hygienic and repeatable packaging processes. The right model depends on a few factors:</p>
<ul>
  <li><strong>The volume</strong> you prep and package daily</li>
  <li><strong>The portion and bag size</strong></li>
  <li><strong>The throughput</strong> — from a small hotel kitchen to a larger restaurant and banquet operation</li>
</ul>
<p>For <strong>daily use in smaller hotels</strong>, the compact <a href="${HOME_EN}">MULTIVAC Home chamber vacuum sealer</a> is ideal for light to medium volumes. For <strong>more volume and sous-vide during service</strong>, the <a href="${C70_EN}">MULTIVAC C 70 table-top chamber machine</a> and the <a href="${P200_EN}">MULTIVAC BASELINE P 200</a> are a great fit.</p>
<p>Planeta Industries helps hotels and hospitality businesses match these factors to the right solution — from the boutique kitchen to large banquet operations.</p>

<h2>Get Advice on Vacuum Packaging for Your Hotel</h2>
<p>If you want to vacuum package in your hotel kitchen, Planeta Industries can help you find a suitable MULTIVAC solution and the right vacuum bags. <a href="/en/kontakt">Contact us</a> to discuss your requirements.</p>

<h2>Frequently Asked Questions</h2>
<h3>What do hotel kitchens use vacuum packaging for?</h3>
<p>Mainly for mise en place, sous-vide, portioned storage, marinating and reducing food waste — as well as for catering and banquets.</p>
<h3>Which MULTIVAC machine suits a hotel?</h3>
<p>It depends on volume, portion/bag size and throughput. MULTIVAC offers machines from a compact table-top unit to powerful double chamber machines; Planeta Industries can help you choose.</p>
<h3>Is vacuum packaging suitable for sous-vide?</h3>
<p>Yes. Vacuum-sealed bags are the basis for gentle low-temperature cooking and a standard in professional kitchens.</p>
`.trim()

export default async function seedArticleHotelVacuum({ container }: ExecArgs) {
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
    title: "Vakuumverpackungsmaschinen im Hotel",
    title_en: "Vacuum Packaging Machines in Hotels",
    excerpt:
      "Wie Hotels und Gastronomiebetriebe MULTIVAC Vakuumverpackungsmaschinen für Mise en place, Sous-vide, Lagerung und Catering einsetzen – Anwendungen und Maschinenwahl.",
    excerpt_en:
      "How hotels and hospitality businesses use MULTIVAC vacuum packaging machines for mise en place, sous-vide, storage and catering — applications and machine selection.",
    meta_title: "Vakuumverpackung im Hotel & in der Gastronomie | MULTIVAC",
    meta_title_en: "Vacuum Packaging in Hotels & Catering | MULTIVAC",
    meta_description:
      "Vakuumverpackung im Hotel: Mise en place, Sous-vide, Lagerung und Catering effizient und hygienisch mit MULTIVAC. Weniger Foodwaste. Anwendungen und Maschinenwahl.",
    meta_description_en:
      "Vacuum packaging in hotels: mise en place, sous-vide, storage and catering — efficient and hygienic with MULTIVAC, with less food waste. Applications and machine selection.",
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

  console.log(`HOTEL ARTICLE SEED DONE: slug=${SLUG} channel=${industries?.name ?? "GLOBAL"}`)
}
