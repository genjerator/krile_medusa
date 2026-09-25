import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * Create the "Vacuum Packaging Machines in Dental Laboratories" magazine article
 * (MULTIVAC focus, Planeta Industries). SEO-optimised; English content on the
 * base columns so it renders for every locale until DE/IT translations are added.
 * Scoped to the Industries sales channel so it appears on planetaindustries.de.
 *
 * Idempotent: re-running updates the article in place (matched by slug).
 *
 * Run: npx medusa exec ./src/scripts/seed-article-dental-vacuum.ts
 */

const SLUG = "vacuum-packaging-machines-dental-laboratories"
const SALES_CHANNEL_NAME = "IndustriesWebshop"

// Cover image: upload one in Admin → Magazin → this article (metadata image),
// or drop a URL here later. Left null for now.
const COVER_IMAGE: string | null = null

const BODY = `
<p>Dental laboratories work with delicate, high-value items every day — dental models, prosthetic work, splints, and custom-made components. Each piece is unique and often difficult or costly to reproduce. When these items need to be stored or shipped, protecting them from dust, moisture, and handling damage becomes just as important as the craftsmanship that went into them. A professional <strong>vacuum packaging machine</strong> offers dental labs a clean, compact, and repeatable way to do exactly that.</p>

<p>In this article we look at how vacuum packaging is used in dental laboratories, a real-world example from a Planeta Industries customer, and how to choose the right <strong>MULTIVAC vacuum packaging machine</strong> for your workflow.</p>

<h2>Why Vacuum Packaging in a Dental Lab?</h2>
<p>Vacuum packaging removes the air around a product and seals it inside a protective bag. For a dental laboratory, that brings several practical benefits:</p>
<ul>
  <li><strong>Protection during transport</strong> — a sealed, air-free package shields models and prosthetics from dust, dirt, and moisture on their way to the practice or client.</li>
  <li><strong>Clean, hygienic storage</strong> — sealed packaging keeps sensitive items contamination-free until they're needed.</li>
  <li><strong>Compact, organised handling</strong> — vacuum-sealed packages are firm and space-efficient, making them easier to label, store, and ship.</li>
  <li><strong>Consistent, professional presentation</strong> — a neatly sealed package reflects the quality of the work inside.</li>
</ul>

<h2>Real-World Example: Vacuum Packaging Dental Models</h2>
<p>One of Planeta Industries' customers uses a <strong>MULTIVAC vacuum packaging machine</strong> to package dental models for transport.</p>
<p>The process is simple and repeatable: the model is placed in a suitable vacuum bag, the machine extracts the air, and a strong sealing seam closes the bag. The result is a compact, closed package that helps protect the model from dust, dirt, and external influences while it's being moved. Because the process is machine-controlled, every package comes out consistent — the same reliable seal, every time.</p>

<h2>Which Dental Products Can Be Vacuum Packaged?</h2>
<p>Depending on the application, dental laboratories can vacuum package a wide range of items, such as:</p>
<ul>
  <li>Dental and plaster models</li>
  <li>3D-printed dental models</li>
  <li>Dental prosthetics and laboratory work</li>
  <li>Dental splints and orthodontic products</li>
  <li>Dental components and laboratory supplies</li>
</ul>
<p>Not every dental product needs vacuum packaging. The right method always depends on the product, its material, and how it will be stored or transported — a fragile printed model has different needs than a batch of small components. When in doubt, it's worth matching the packaging approach to the specific item.</p>

<h2>Choosing the Right MULTIVAC Vacuum Packaging Machine</h2>
<p><strong>MULTIVAC vacuum packaging machines</strong> are built for professional packaging processes where reliable, consistent results matter. For a dental laboratory, the right model depends on a few key factors:</p>
<ul>
  <li><strong>The size of your dental models</strong> and the largest items you package</li>
  <li><strong>The vacuum bag size</strong> you need to accommodate them</li>
  <li><strong>The number of packages per day</strong> — occasional use versus continuous daily throughput</li>
</ul>
<p>Popular options for dental laboratories include the compact <a href="/de/product/multivac-c70-tabletop-chamber-machine">MULTIVAC C 70 table-top chamber machine</a> for individual models and smaller batches, and the <a href="/de/product/multivac-baseline-p200">MULTIVAC BASELINE P 200</a> and <a href="/de/product/multivac-baseline-p360">MULTIVAC BASELINE P 360</a> for higher daily throughput.</p>
<p>A lab packaging a handful of models per week has very different requirements from one running commercial-scale packaging. Planeta Industries helps businesses match these factors to the right solution — from compact machines for individual dental products to larger systems for higher-volume packaging processes.</p>

<h2>Get Advice on Vacuum Packaging for Your Dental Lab</h2>
<p>If you want to vacuum package dental models or other dental laboratory products, Planeta Industries can help you find a suitable MULTIVAC solution and the right vacuum bags to go with it. <a href="/de/kontakt">Contact us</a> to discuss your requirements.</p>

<h2>Frequently Asked Questions</h2>
<h3>Can dental models be vacuum packaged for transport?</h3>
<p>Yes. Placing a model in a suitable vacuum bag and sealing it with a vacuum packaging machine creates a compact, air-free package that helps protect it from dust, dirt, and moisture during transport — as one Planeta Industries customer does with a MULTIVAC machine.</p>
<h3>Which vacuum packaging machine is right for a dental laboratory?</h3>
<p>It depends on your model sizes, the bag size you need, and how many packages you produce per day. MULTIVAC offers machines for everything from occasional use to high-volume packaging; Planeta Industries can help you choose.</p>
<h3>Does every dental product need vacuum packaging?</h3>
<p>No. The appropriate packaging method depends on the product, its material, and the storage or transport process. Vacuum packaging is one option among several.</p>
`.trim()

export default async function seedArticleDentalVacuum({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: any = container.resolve(ARTICLE_MODULE)
  const salesChannelModule: any = container.resolve(Modules.SALES_CHANNEL)

  // 1) Author (reuse the existing "Evgenije", create if missing).
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

  // 2) Scope to the Industries sales channel so it shows on planetaindustries.de.
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
    // English on the base columns (storefront falls back to these for every
    // locale until German/Italian translations are added).
    title: "Vacuum Packaging Machines in Dental Laboratories",
    excerpt:
      "How dental laboratories use MULTIVAC vacuum packaging machines to protect and transport dental models — a real customer case and how to choose the right machine.",
    meta_title: "Vacuum Packaging for Dental Laboratories | MULTIVAC",
    meta_description:
      "How dental labs use MULTIVAC vacuum packaging machines to protect and transport dental models. A real customer case plus how to choose the right machine.",
    body: BODY,
  }

  const [existing] = await service.listArticles({ slug: SLUG }, { take: 1 })
  let article
  if (existing) {
    article = await service.updateArticles({ id: existing.id, ...fields })
    logger.info(`Updated article '${SLUG}' (${existing.id})`)
  } else {
    article = await service.createArticles({
      slug: SLUG,
      published_at: new Date(),
      ...fields,
    })
    logger.info(`Created article '${SLUG}' (${article.id})`)
  }

  logger.info(`View: /de/magazin/${SLUG}  and  /en/magazin/${SLUG}`)
  console.log(
    `DENTAL ARTICLE SEED DONE: slug=${SLUG} channel=${industries?.name ?? "GLOBAL"}`
  )
}
