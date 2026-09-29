import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * Creates the "Cremiges Kirsch-Gelato" recipe magazine article (German on the
 * base columns). Adapted from a blackberry purée gelato recipe, rewritten in
 * original wording and switched to cherries. Idempotent by slug — safe to re-run.
 *
 * Run: npx medusa exec ./src/scripts/seed-article-kirsch-gelato.ts
 */
const SLUG = "kirsch-gelato"

const IMAGE =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/planeta_admin/magazin/kirsch-gelato.png"

const BODY = `
<p>Sobald die Kirschen reif sind, gibt es kaum etwas Schöneres als selbst gemachtes Gelato. Diese Variante ist wunderbar cremig, angenehm fruchtig und kommt ohne komplizierte Technik aus: ein glattes Kirschpüree, eine seidige Milch-Sahne-Basis – fertig. Perfekt für heiße Sommertage und für alle, die den vollen Geschmack reifer Kirschen lieben.</p>

<figure>
  <img src="${IMAGE}" alt="Cremiges Kirsch-Gelato in einer Schale" />
  <figcaption>Cremiges Kirsch-Gelato – fruchtig und selbst gemacht.</figcaption>
</figure>

<h2>Zutaten für 8 Portionen</h2>
<ul>
  <li>600 g Kirschen (entsteint)</li>
  <li>120 g Ahornsirup</li>
  <li>40 ml Zitronensaft</li>
  <li>650 ml Vollmilch</li>
  <li>300 ml Sahne</li>
  <li>225 g feiner Zucker</li>
  <li>2 EL Speisestärke</li>
  <li>1 Eigelb</li>
  <li>1 EL Vanilleextrakt</li>
</ul>

<h2>Zubereitung</h2>

<h3>Das Kirschpüree</h3>
<ol>
  <li>Die Kirschen entsteinen und fein pürieren. Anschließend durch ein feines Sieb streichen, um Schalenreste und Stückchen zu entfernen, sodass ein glattes Püree entsteht.</li>
  <li>Das Püree mit dem Ahornsirup und dem Zitronensaft in einen Topf geben und bei milder Hitze erwärmen. Dabei rühren, bis sich alles gut verbunden hat.</li>
  <li>Die Masse noch einmal passieren, damit wirklich keine Stückchen zurückbleiben.</li>
  <li>Das Kirschpüree mindestens 4 Stunden vollständig kühlen. Es wird später zur ebenfalls kalten Gelato-Basis gegeben.</li>
</ol>

<h3>Die Gelato-Basis</h3>
<ol start="5">
  <li>100 ml der Vollmilch in eine Schüssel geben und mit der Speisestärke, dem Zucker und dem Vanilleextrakt glatt rühren. Beiseitestellen.</li>
  <li>Die restliche Vollmilch (550 ml) mit der Sahne in einem Topf erhitzen, bis sich am Rand kleine Bläschen bilden – die Mischung darf nicht kochen.</li>
  <li>Die angerührte Stärke-Zucker-Mischung einrühren und bei niedriger Hitze unter ständigem Rühren eindicken, bis die Basis die Konsistenz von leicht geschlagener Sahne hat und den Rücken eines Löffels überzieht.</li>
  <li>Den Topf vom Herd nehmen und das verquirlte Eigelb zügig unterrühren. Die Masse wird blassgelb und sollte völlig glatt sein, ohne Klümpchen.</li>
  <li>Die Basis durch ein Sieb passieren und im Kühlschrank vollständig abkühlen lassen – am besten 6 Stunden oder über Nacht.</li>
</ol>

<h3>Fertigstellen</h3>
<ol start="10">
  <li>Das kalte Kirschpüree zur kalten Gelato-Basis geben und mit einem Teigschaber gründlich verrühren.</li>
  <li>Die Mischung in die Eismaschine geben und mit der Gelato-Funktion gefrieren, bis das Gelato cremig ist. Sofort servieren oder in einen gefriergeeigneten Behälter füllen.</li>
</ol>

<h2>Tipps</h2>
<ul>
  <li><strong>Kirschsorte:</strong> Süßkirschen ergeben ein mildes, rundes Gelato, Sauerkirschen einen fruchtig-frischen Kontrast. Den Zucker je nach Süße der Kirschen etwas anpassen.</li>
  <li><strong>Tiefkühlkirschen</strong> funktionieren außerhalb der Saison genauso gut – einfach aufgetaut pürieren.</li>
  <li><strong>Gut durchkühlen:</strong> Je kälter Püree und Basis vor dem Gefrieren sind, desto feiner und cremiger wird das Gelato.</li>
</ul>
`.trim()

const BODY_EN = `
<p>As soon as cherries are in season, there's little better than homemade gelato. This version is wonderfully creamy, pleasantly fruity and needs no complicated technique: a smooth cherry purée, a silky milk-and-cream base — done. Perfect for hot summer days and for anyone who loves the full flavour of ripe cherries.</p>

<figure>
  <img src="${IMAGE}" alt="Creamy cherry gelato in a bowl" />
  <figcaption>Creamy cherry gelato – fruity and homemade.</figcaption>
</figure>

<h2>Ingredients for 8 servings</h2>
<ul>
  <li>600 g cherries (pitted)</li>
  <li>120 g maple syrup</li>
  <li>40 ml lemon juice</li>
  <li>650 ml full-cream milk</li>
  <li>300 ml cream</li>
  <li>225 g caster sugar</li>
  <li>2 tbsp cornflour</li>
  <li>1 egg yolk</li>
  <li>1 tbsp vanilla extract</li>
</ul>

<h2>Method</h2>

<h3>The cherry purée</h3>
<ol>
  <li>Pit the cherries and blend to a fine purée. Pass it through a fine sieve to remove skins and any pieces, leaving a smooth purée.</li>
  <li>Put the purée in a saucepan with the maple syrup and lemon juice and warm gently, stirring until everything is well combined.</li>
  <li>Strain the mixture once more so that no pieces remain.</li>
  <li>Chill the cherry purée completely for at least 4 hours. It is added later to the equally cold gelato base.</li>
</ol>

<h3>The gelato base</h3>
<ol start="5">
  <li>Put 100 ml of the milk into a bowl and whisk smooth with the cornflour, sugar and vanilla extract. Set aside.</li>
  <li>Heat the remaining milk (550 ml) with the cream in a saucepan until small bubbles form around the edge — do not let it boil.</li>
  <li>Stir in the cornflour-and-sugar mixture and thicken over low heat, stirring constantly, until the base has the consistency of lightly whipped cream and coats the back of a spoon.</li>
  <li>Remove the pan from the heat and quickly stir in the whisked egg yolk. The mixture turns pale yellow and should be perfectly smooth, with no lumps.</li>
  <li>Pass the base through a sieve and let it cool completely in the fridge — ideally 6 hours or overnight.</li>
</ol>

<h3>Finishing</h3>
<ol start="10">
  <li>Add the cold cherry purée to the cold gelato base and mix thoroughly with a spatula.</li>
  <li>Pour into the ice cream maker and churn on the gelato setting until the gelato is creamy. Serve straight away or transfer to a freezer-safe container.</li>
</ol>

<h2>Tips</h2>
<ul>
  <li><strong>Cherry variety:</strong> sweet cherries give a mild, rounded gelato, sour cherries a fresh, tangy contrast. Adjust the sugar to the sweetness of your cherries.</li>
  <li><strong>Frozen cherries</strong> work just as well out of season — simply thaw and purée.</li>
  <li><strong>Chill well:</strong> the colder the purée and base are before churning, the finer and creamier the gelato.</li>
</ul>
`.trim()

export default async function seedArticleKirschGelato({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: any = container.resolve(ARTICLE_MODULE)

  const fields = {
    status: "published" as const,
    category: "Rezepte",
    cover_image: IMAGE,
    // German content on the base columns (storefront falls back to these for
    // every locale until EN/IT translations are added).
    title: "Cremiges Kirsch-Gelato selbst gemacht",
    excerpt:
      "Cremiges Kirsch-Gelato zum Selbermachen – fruchtig, unkompliziert und für 8 Portionen. Schritt für Schritt erklärt.",
    meta_title: "Kirsch-Gelato selbst machen – cremiges Rezept | Planeta",
    meta_description:
      "Cremiges Kirsch-Gelato selbst gemacht: fruchtiges Rezept mit Kirschen, Vanille und Sahne für 8 Portionen – Schritt für Schritt erklärt.",
    body: BODY,

    // English translation.
    title_en: "Creamy Homemade Cherry Gelato",
    excerpt_en:
      "Creamy homemade cherry gelato — fruity, simple, and serves 8. Explained step by step.",
    meta_title_en: "Homemade Cherry Gelato – Creamy Recipe | Planeta",
    meta_description_en:
      "Creamy homemade cherry gelato: a fruity recipe with cherries, vanilla and cream for 8 servings – explained step by step.",
    body_en: BODY_EN,
  }

  const [existing] = await service.listArticles({ slug: SLUG }, { take: 1 })
  if (existing) {
    await service.updateArticles({ id: existing.id, ...fields })
    logger.info(`Updated article '${SLUG}' (${existing.id})`)
  } else {
    const article = await service.createArticles({
      slug: SLUG,
      published_at: new Date(),
      ...fields,
    })
    logger.info(`Created article '${SLUG}' (${article.id})`)
  }
  logger.info(`View: /de/magazin/${SLUG}`)
}
