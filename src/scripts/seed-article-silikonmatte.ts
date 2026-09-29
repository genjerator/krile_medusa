import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * "Silikonmatte hitzebeständig" — consumer SEO article for planeta.de about
 * heat-resistant silicone mats, focused on the iron-rest use case. German base
 * + English *_en (IT falls back to DE). Scoped to the planeta.de sales channel;
 * links to the Planeta Silikonmatte product (heat-resistant iron rest).
 *
 * Run: npx medusa exec ./src/scripts/seed-article-silikonmatte.ts
 */

const SLUG = "silikonmatte-hitzebestaendig"
const SALES_CHANNEL_NAME = "PlanetaWebshop"
const COVER_IMAGE: string | null =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/silikonmatte-hitzebestaendig.jpg"

const MAT_DE = "/de/product/silikonmatte"
const MAT_EN = "/en/product/silikonmatte"

const BODY_DE = `
<p>Ein heißes Bügeleisen, eine empfindliche Arbeitsfläche und wenig Platz – schnell entstehen Brandflecken oder Kratzer. Eine <strong>hitzebeständige Silikonmatte</strong> löst dieses Problem: Sie legen das heiße Gerät einfach flach ab, ohne Ihre Oberfläche zu beschädigen. In diesem Ratgeber erfahren Sie, worauf es bei einer hitzebeständigen Silikonmatte ankommt und wofür Sie sie im Alltag nutzen können.</p>

<h2>Was ist eine hitzebeständige Silikonmatte?</h2>
<p>Eine Silikonmatte ist eine flexible Unterlage aus hochwertigem Silikon. Der entscheidende Vorteil: Silikon hält hohe Temperaturen aus, ohne zu schmelzen oder sich zu verformen. Eine <strong>hitzebeständige</strong> Matte schützt daher Tisch, Arbeitsplatte oder Bügeltisch zuverlässig vor Hitze.</p>

<h2>Warum ist die Hitzebeständigkeit so wichtig?</h2>
<ul>
  <li><strong>Schutz vor Hitze:</strong> Heiße Geräte und Töpfe hinterlassen keine Brandflecken auf der Arbeitsfläche.</li>
  <li><strong>Sicherheit:</strong> Eine feste, rutschfeste Ablage beugt Verbrennungen und Unfällen vor.</li>
  <li><strong>Langlebigkeit:</strong> Hochwertiges Silikon bleibt formstabil und wird auch bei Hitze nicht spröde.</li>
</ul>

<h2>Wofür lässt sich eine hitzebeständige Silikonmatte nutzen?</h2>
<p>Die häufigste Anwendung ist die <strong>Ablage fürs Bügeleisen</strong>. Statt das heiße Bügeleisen umständlich aufzustellen, legen Sie es flach auf die Matte – das spart Zeit und schützt den Bügeltisch. Darüber hinaus eignet sich eine Silikonmatte als:</p>
<ul>
  <li>Untersetzer für heiße Töpfe, Pfannen und Auflaufformen</li>
  <li>hitzefeste Unterlage für Glätteisen und Lockenstäbe</li>
  <li>rutschfeste Arbeitsunterlage in Küche, Wäscherei oder Nähzimmer</li>
</ul>

<h2>Worauf sollten Sie beim Kauf achten?</h2>
<ul>
  <li><strong>Hitzebeständigkeit:</strong> Die Matte sollte für die Temperaturen Ihres Geräts ausgelegt sein.</li>
  <li><strong>Rutschfestigkeit:</strong> Eine griffige Unterseite hält die Matte sicher an Ort und Stelle.</li>
  <li><strong>Größe:</strong> groß genug für Ihr Bügeleisen oder Ihre Töpfe.</li>
  <li><strong>Reinigung:</strong> Silikon lässt sich einfach abwischen und nimmt keine Gerüche an.</li>
</ul>

<h2>Die Planeta Silikonmatte</h2>
<p>Die <a href="${MAT_DE}">Planeta Silikonmatte</a> ist eine rutschfeste, hitzebeständige Unterlage, die vor allem als <strong>Bügeleisen-Ablage</strong> gedacht ist – ob im Haushalt, in der Wäscherei oder in der Änderungsschneiderei. Sie legen das heiße Bügeleisen einfach flach ab, schützen Ihre Arbeitsfläche vor Hitze und beugen Brandflecken vor.</p>

<h2>Häufig gestellte Fragen</h2>
<h3>Wie hitzebeständig ist eine Silikonmatte?</h3>
<p>Hochwertige Silikonmatten halten hohe Temperaturen aus, ohne zu schmelzen. Beachten Sie die Angaben des jeweiligen Produkts und legen Sie kein Gerät ab, das heißer ist als angegeben.</p>
<h3>Kann ich ein heißes Bügeleisen direkt auf die Matte legen?</h3>
<p>Ja – genau dafür ist eine hitzebeständige Silikonmatte als Bügeleisen-Ablage gemacht. Sie legen das Bügeleisen flach ab, statt es aufzustellen.</p>
<h3>Wie reinige ich eine Silikonmatte?</h3>
<p>In der Regel genügt ein feuchtes Tuch. Silikon nimmt keine Gerüche an und lässt sich leicht sauber halten.</p>

<h2>Fazit</h2>
<p>Eine hitzebeständige Silikonmatte ist ein kleines, praktisches Helferlein, das Ihre Arbeitsfläche schützt und den Alltag – besonders beim Bügeln – erleichtert. <a href="${MAT_DE}">Entdecken Sie die Planeta Silikonmatte</a>.</p>
`.trim()

const BODY_EN = `
<p>A hot iron, a delicate work surface and little space – scorch marks or scratches happen fast. A <strong>heat-resistant silicone mat</strong> solves this: you simply lay the hot appliance down flat without damaging your surface. In this guide you'll learn what matters in a heat-resistant silicone mat and how to use one in everyday life.</p>

<h2>What Is a Heat-Resistant Silicone Mat?</h2>
<p>A silicone mat is a flexible pad made of high-quality silicone. Its key advantage: silicone withstands high temperatures without melting or warping. A <strong>heat-resistant</strong> mat therefore reliably protects your table, worktop or ironing board from heat.</p>

<h2>Why Does Heat Resistance Matter?</h2>
<ul>
  <li><strong>Protection from heat:</strong> hot appliances and pots leave no scorch marks on your surface.</li>
  <li><strong>Safety:</strong> a firm, non-slip rest helps prevent burns and accidents.</li>
  <li><strong>Durability:</strong> high-quality silicone keeps its shape and doesn't become brittle in the heat.</li>
</ul>

<h2>What Can You Use a Heat-Resistant Silicone Mat For?</h2>
<p>The most common use is as a <strong>rest for the iron</strong>. Instead of standing the hot iron up awkwardly, you lay it flat on the mat – saving time and protecting the ironing board. A silicone mat also works well as:</p>
<ul>
  <li>a trivet for hot pots, pans and baking dishes</li>
  <li>a heat-proof base for hair straighteners and curling irons</li>
  <li>a non-slip work surface in the kitchen, laundry or sewing room</li>
</ul>

<h2>What to Look For When Buying</h2>
<ul>
  <li><strong>Heat resistance:</strong> the mat should be rated for the temperatures of your appliance.</li>
  <li><strong>Non-slip grip:</strong> a grippy underside keeps the mat firmly in place.</li>
  <li><strong>Size:</strong> large enough for your iron or your pots.</li>
  <li><strong>Cleaning:</strong> silicone wipes clean easily and doesn't absorb odours.</li>
</ul>

<h2>The Planeta Silicone Mat</h2>
<p>The <a href="${MAT_EN}">Planeta silicone mat</a> is a non-slip, heat-resistant pad designed above all as a <strong>rest for your iron</strong> – at home, in the laundry or in the alterations workshop. You simply lay the hot iron down flat, protect your work surface from heat and prevent scorch marks.</p>

<h2>Frequently Asked Questions</h2>
<h3>How heat-resistant is a silicone mat?</h3>
<p>High-quality silicone mats withstand high temperatures without melting. Follow the specifications for the individual product and don't rest an appliance that is hotter than stated.</p>
<h3>Can I put a hot iron directly on the mat?</h3>
<p>Yes – that's exactly what a heat-resistant silicone mat used as an iron rest is made for. You lay the iron down flat instead of standing it up.</p>
<h3>How do I clean a silicone mat?</h3>
<p>A damp cloth is usually enough. Silicone doesn't absorb odours and is easy to keep clean.</p>

<h2>Conclusion</h2>
<p>A heat-resistant silicone mat is a small, practical helper that protects your work surface and makes everyday tasks – especially ironing – easier. <a href="${MAT_EN}">Discover the Planeta silicone mat</a>.</p>
`.trim()

export default async function seedArticleSilikonmatte({ container }: ExecArgs) {
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
    title: "Silikonmatte hitzebeständig: wofür sie gut ist und worauf Sie achten sollten",
    title_en: "Heat-Resistant Silicone Mat: What It's For and What to Look For",
    excerpt:
      "Eine hitzebeständige Silikonmatte schützt Ihre Arbeitsfläche vor Hitze – ideal als Bügeleisen-Ablage. Worauf es ankommt und wofür Sie die Matte nutzen können.",
    excerpt_en:
      "A heat-resistant silicone mat protects your work surface from heat — ideal as an iron rest. What matters and what you can use the mat for.",
    meta_title: "Silikonmatte hitzebeständig – Bügeleisen-Ablage & mehr | Planeta",
    meta_title_en: "Heat-Resistant Silicone Mat – Iron Rest & More | Planeta",
    meta_description:
      "Hitzebeständige Silikonmatte: schützt vor Brandflecken, rutschfest und vielseitig – ideal als Bügeleisen-Ablage. Worauf beim Kauf achten? Alle Antworten.",
    meta_description_en:
      "Heat-resistant silicone mat: protects against scorch marks, non-slip and versatile — ideal as an iron rest. What to look for when buying? All the answers.",
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

  console.log(`SILIKONMATTE ARTICLE SEED DONE: slug=${SLUG} channel=${shop?.name ?? "GLOBAL"}`)
}
