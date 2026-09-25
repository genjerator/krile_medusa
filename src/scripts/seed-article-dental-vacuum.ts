import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * Create the "Vakuumverpackungsmaschinen im Dentallabor" magazine article
 * (MULTIVAC focus, Planeta Industries). SEO-optimised, localised: German on the
 * base columns, English on the *_en columns (Italian falls back to German).
 * Scoped to the Industries sales channel so it appears on planetaindustries.de.
 *
 * Idempotent: re-running updates the article in place (matched by slug).
 *
 * Run: npx medusa exec ./src/scripts/seed-article-dental-vacuum.ts
 */

const SLUG = "vacuum-packaging-machines-dental-laboratories"
const SALES_CHANNEL_NAME = "IndustriesWebshop"

// Cover image: upload one in Admin → Magazin → this article, or drop a URL here.
const COVER_IMAGE: string | null = null

// Product links (shared by both language bodies).
const C70 = "/de/product/multivac-c70-tabletop-chamber-machine"
const P200 = "/de/product/multivac-baseline-p200"
const P360 = "/de/product/multivac-baseline-p360"

const BODY_DE = `
<p>Dentallabore arbeiten täglich mit empfindlichen, hochwertigen Objekten – Zahnmodellen, prothetischen Arbeiten, Schienen und individuell gefertigten Bauteilen. Jedes Stück ist einzigartig und oft nur schwer oder kostspielig zu reproduzieren. Müssen diese Objekte gelagert oder versendet werden, wird ihr Schutz vor Staub, Feuchtigkeit und Beschädigung ebenso wichtig wie die handwerkliche Arbeit, die in ihnen steckt. Eine professionelle <strong>Vakuumverpackungsmaschine</strong> bietet Dentallaboren dafür eine saubere, kompakte und wiederholbare Lösung.</p>

<p>In diesem Artikel zeigen wir, wie Vakuumverpackung im Dentallabor eingesetzt wird, ein Praxisbeispiel eines Kunden von Planeta Industries und wie Sie die richtige <strong>MULTIVAC Vakuumverpackungsmaschine</strong> für Ihren Arbeitsablauf finden.</p>

<h2>Warum Vakuumverpackung im Dentallabor?</h2>
<p>Beim Vakuumverpacken wird die Luft rund um ein Produkt entfernt und dieses in einem Schutzbeutel versiegelt. Für ein Dentallabor bringt das mehrere praktische Vorteile:</p>
<ul>
  <li><strong>Schutz beim Transport</strong> – eine versiegelte, luftfreie Verpackung schützt Modelle und Prothetik vor Staub, Schmutz und Feuchtigkeit auf dem Weg zur Praxis oder zum Kunden.</li>
  <li><strong>Saubere, hygienische Lagerung</strong> – versiegelte Verpackungen halten empfindliche Objekte kontaminationsfrei, bis sie benötigt werden.</li>
  <li><strong>Kompakte, geordnete Handhabung</strong> – vakuumierte Pakete sind fest und platzsparend und lassen sich leichter beschriften, lagern und versenden.</li>
  <li><strong>Konsistente, professionelle Präsentation</strong> – eine sauber versiegelte Verpackung spiegelt die Qualität der darin enthaltenen Arbeit wider.</li>
</ul>

<h2>Praxisbeispiel: Vakuumverpackung von Zahnmodellen</h2>
<p>Einer der Kunden von Planeta Industries nutzt eine <strong>MULTIVAC Vakuumverpackungsmaschine</strong>, um Zahnmodelle für den Transport zu verpacken.</p>
<p>Der Ablauf ist einfach und wiederholbar: Das Modell wird in einen passenden Vakuumbeutel gelegt, die Maschine entzieht die Luft und eine feste Schweißnaht verschließt den Beutel. Das Ergebnis ist ein kompaktes, geschlossenes Paket, das das Modell während des Transports vor Staub, Schmutz und äußeren Einflüssen schützt. Da der Prozess maschinengesteuert ist, fällt jede Verpackung gleichmäßig aus – dieselbe zuverlässige Versiegelung, jedes Mal.</p>

<h2>Welche Dentalprodukte lassen sich vakuumverpacken?</h2>
<p>Je nach Anwendung können Dentallabore eine Vielzahl von Objekten vakuumverpacken, zum Beispiel:</p>
<ul>
  <li>Zahn- und Gipsmodelle</li>
  <li>3D-gedruckte Zahnmodelle</li>
  <li>Zahnprothetik und Laborarbeiten</li>
  <li>Dentalschienen und kieferorthopädische Produkte</li>
  <li>Dentalkomponenten und Laborbedarf</li>
</ul>
<p>Nicht jedes Dentalprodukt muss vakuumverpackt werden. Die richtige Methode hängt immer vom Produkt, vom Material und davon ab, wie es gelagert oder transportiert wird – ein empfindliches gedrucktes Modell hat andere Anforderungen als eine Charge kleiner Bauteile. Im Zweifel lohnt es sich, die Verpackungsart auf das jeweilige Objekt abzustimmen.</p>

<h2>Die richtige MULTIVAC Vakuumverpackungsmaschine wählen</h2>
<p><strong>MULTIVAC Vakuumverpackungsmaschinen</strong> sind für professionelle Verpackungsprozesse gebaut, bei denen zuverlässige, gleichbleibende Ergebnisse zählen. Für ein Dentallabor hängt das passende Modell von einigen wesentlichen Faktoren ab:</p>
<ul>
  <li><strong>Die Größe Ihrer Zahnmodelle</strong> und der größten Objekte, die Sie verpacken</li>
  <li><strong>Die benötigte Beutelgröße</strong>, um sie aufzunehmen</li>
  <li><strong>Die Anzahl der Verpackungen pro Tag</strong> – gelegentlicher Einsatz oder kontinuierlicher Tagesdurchsatz</li>
</ul>
<p>Beliebte Optionen für Dentallabore sind die kompakte <a href="${C70}">MULTIVAC C 70 Tischkammermaschine</a> für einzelne Modelle und kleinere Chargen sowie die <a href="${P200}">MULTIVAC BASELINE P 200</a> und <a href="${P360}">MULTIVAC BASELINE P 360</a> für höheren Tagesdurchsatz.</p>
<p>Ein Labor, das eine Handvoll Modelle pro Woche verpackt, hat ganz andere Anforderungen als eines mit gewerblichem Verpackungsvolumen. Planeta Industries hilft Unternehmen, diese Faktoren mit der passenden Lösung abzustimmen – von kompakten Maschinen für einzelne Dentalprodukte bis zu größeren Systemen für höhere Verpackungsmengen.</p>

<h2>Beratung zur Vakuumverpackung für Ihr Dentallabor</h2>
<p>Wenn Sie Zahnmodelle oder andere Produkte aus dem Dentallabor vakuumverpacken möchten, hilft Ihnen Planeta Industries, eine passende MULTIVAC Lösung und die richtigen Vakuumbeutel dazu zu finden. <a href="/de/kontakt">Kontaktieren Sie uns</a>, um Ihre Anforderungen zu besprechen.</p>

<h2>Häufig gestellte Fragen</h2>
<h3>Können Zahnmodelle für den Transport vakuumverpackt werden?</h3>
<p>Ja. Wird ein Modell in einen passenden Vakuumbeutel gelegt und mit einer Vakuumverpackungsmaschine versiegelt, entsteht ein kompaktes, luftfreies Paket, das es beim Transport vor Staub, Schmutz und Feuchtigkeit schützt – so wie es ein Kunde von Planeta Industries mit einer MULTIVAC Maschine handhabt.</p>
<h3>Welche Vakuumverpackungsmaschine ist die richtige für ein Dentallabor?</h3>
<p>Das hängt von der Größe Ihrer Modelle, der benötigten Beutelgröße und der Anzahl der Verpackungen pro Tag ab. MULTIVAC bietet Maschinen für alles vom gelegentlichen Einsatz bis zur Verpackung großer Mengen; Planeta Industries hilft Ihnen bei der Auswahl.</p>
<h3>Muss jedes Dentalprodukt vakuumverpackt werden?</h3>
<p>Nein. Die geeignete Verpackungsmethode hängt vom Produkt, vom Material und vom Lager- oder Transportprozess ab. Vakuumverpackung ist eine von mehreren Optionen.</p>
`.trim()

const BODY_EN = `
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
<p>Popular options for dental laboratories include the compact <a href="${C70}">MULTIVAC C 70 table-top chamber machine</a> for individual models and smaller batches, and the <a href="${P200}">MULTIVAC BASELINE P 200</a> and <a href="${P360}">MULTIVAC BASELINE P 360</a> for higher daily throughput.</p>
<p>A lab packaging a handful of models per week has very different requirements from one running commercial-scale packaging. Planeta Industries helps businesses match these factors to the right solution — from compact machines for individual dental products to larger systems for higher-volume packaging processes.</p>

<h2>Get Advice on Vacuum Packaging for Your Dental Lab</h2>
<p>If you want to vacuum package dental models or other dental laboratory products, Planeta Industries can help you find a suitable MULTIVAC solution and the right vacuum bags to go with it. <a href="/en/kontakt">Contact us</a> to discuss your requirements.</p>

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
    // German on the base columns; English on *_en (Italian falls back to German).
    title: "Vakuumverpackungsmaschinen im Dentallabor",
    title_en: "Vacuum Packaging Machines in Dental Laboratories",
    excerpt:
      "Wie Dentallabore MULTIVAC Vakuumverpackungsmaschinen einsetzen, um Zahnmodelle zu schützen und zu transportieren – ein Praxisbeispiel und wie Sie die passende Maschine wählen.",
    excerpt_en:
      "How dental laboratories use MULTIVAC vacuum packaging machines to protect and transport dental models — a real customer case and how to choose the right machine.",
    meta_title: "Vakuumverpackung fürs Dentallabor | MULTIVAC",
    meta_title_en: "Vacuum Packaging for Dental Laboratories | MULTIVAC",
    meta_description:
      "Wie Dentallabore MULTIVAC Vakuumverpackungsmaschinen nutzen, um Zahnmodelle zu schützen und zu transportieren. Praxisbeispiel und Hilfe bei der Maschinenwahl.",
    meta_description_en:
      "How dental labs use MULTIVAC vacuum packaging machines to protect and transport dental models. A real customer case plus how to choose the right machine.",
    body: BODY_DE,
    body_en: BODY_EN,
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
