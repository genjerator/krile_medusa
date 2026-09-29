import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * "Traditionelle deutsche Gerichte, die Sie vakuumieren können" — a consumer SEO
 * article for planeta.de covering classic German dishes (Sauerbraten, Rouladen,
 * Gulasch, Bratwurst, Kartoffelsalat …) and how to portion/preserve them by
 * vacuum sealing. German base + English *_en (IT falls back to DE). Scoped to
 * the planeta.de sales channel; links to the Planeta Home chamber sealer, which
 * also handles the sauces/liquids these dishes involve.
 *
 * Run: npx medusa exec ./src/scripts/seed-article-german-foods-vacuum.ts
 */

const SLUG = "deutsche-gerichte-vakuumieren"
const SALES_CHANNEL_NAME = "PlanetaWebshop"
const COVER_IMAGE: string | null =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/traditional-german-food.jpg"

const HOME_DE = "/de/product/vakuumierer-planeta-home"
const HOME_EN = "/en/product/vakuumierer-planeta-home"

const BODY_DE = `
<p>Die deutsche Küche ist bekannt für herzhafte Gerichte, großzügige Portionen und Speisen, die oft in größeren Mengen zubereitet werden. Von Sauerbraten und Rouladen über Gulasch bis zu Bratwurst und Kartoffelsalat lassen sich viele traditionelle deutsche Gerichte vakuumieren und für eine weitere Mahlzeit aufbewahren.</p>
<p>Wenn Sie mehr gekocht haben, als Ihre Familie essen kann, ist Vakuumverpackung eine praktische Möglichkeit, die Reste zu portionieren und Lebensmittelverschwendung zu reduzieren.</p>

<h2>1. Sauerbraten</h2>
<p>Sauerbraten ist ein klassischer deutscher Schmorbraten, der oft als große Mahlzeit für die ganze Familie zubereitet wird.</p>
<p>Bleiben Reste übrig, schneiden oder portionieren Sie das Fleisch und vakuumieren Sie es, sobald es richtig abgekühlt ist. Die Portion, die Sie bald essen möchten, kommt in den Kühlschrank; weitere Portionen können Sie für später einfrieren.</p>
<p>Dasselbe gilt für die Soße. Da Soße flüssig ist, ist ein <a href="${HOME_DE}">Kammer-Vakuumierer</a> hier besonders nützlich.</p>
<p><strong>Tipp:</strong> Vakuumieren Sie Sauerbraten und Soße getrennt, damit Sie genau die benötigte Menge aufwärmen können.</p>

<h2>2. Rinderrouladen</h2>
<p>Rinderrouladen sind ein weiterer deutscher Favorit, der häufig in größeren Mengen zubereitet wird.</p>
<p>Die gefüllten Rindsrouladen lassen sich einzeln oder portionsweise vakuumieren. So nehmen Sie später genau die Anzahl Rouladen heraus, die Sie für eine Mahlzeit brauchen.</p>
<p>Auch die Soße lässt sich mit einem geeigneten Kammer-Vakuumierer vakuumverpacken.</p>
<p>Kochen &rarr; abkühlen &rarr; portionieren &rarr; vakuumieren &rarr; kühlen oder einfrieren.</p>

<h2>3. Gulasch</h2>
<p>Gulasch nach deutscher Art eignet sich besonders gut zum Vakuumieren.</p>
<p>Ob Rind, Schwein oder gemischtes Gulasch – das Gericht enthält meist reichlich Soße. Statt einen großen Topf Reste in den Kühlschrank zu stellen, teilen Sie ihn in mahlzeitengroße Portionen.</p>
<p>Ein Kammer-Vakuumierer ist besonders praktisch, weil er auch Lebensmittel mit Soßen und Flüssigkeiten vakuumverpacken kann.</p>
<p>Bereiten Sie am Wochenende eine große Menge Gulasch zu und haben Sie unter der Woche mehrere fertige Mahlzeiten.</p>

<h2>4. Bratwurst</h2>
<p>Bratwurst ist eines der Lebensmittel, die viele sofort mit der deutschen Küche verbinden.</p>
<p>Ob übrig gebliebene gegrillte Bratwurst oder mehr Würste als benötigt – Vakuumverpackung hilft, Portionen im Kühlschrank oder Gefrierfach übersichtlich zu halten.</p>
<p>Statt eine große Packung am Stück einzufrieren, trennen Sie die Würste vor dem Vakuumieren in praktische Portionen.</p>
<p>Das ist auch beim Kauf größerer Mengen Bratwurst hilfreich.</p>

<h2>5. Schnitzel</h2>
<p>Auch Schnitzel lässt sich vakuumieren, besonders wenn nach einem Familienessen Reste übrig bleiben.</p>
<p>Lassen Sie gebratenes Schnitzel vor dem Verpacken gut abkühlen. Wenn Sie es einfrieren möchten, schützt Vakuumverpackung vor Gefrierbrand.</p>
<p>Beachten Sie, dass die knusprige Panade nach dem Kühlen oder Einfrieren weicher werden kann. Beim Aufwärmen im Backofen oder in der Heißluftfritteuse wird sie wieder etwas knuspriger.</p>

<h2>6. Kartoffelsalat</h2>
<p>Deutscher Kartoffelsalat gibt es in vielen regionalen Varianten. Manche werden mit Essig und Öl zubereitet, andere enthalten Mayonnaise.</p>
<p>Übrig gebliebenen Kartoffelsalat können Sie – je nach Rezept und Konsistenz – portionieren und in einem geeigneten Vakuumbehälter oder Beutel aufbewahren.</p>
<p>Bei Salaten mit Mayonnaise oder anderen empfindlichen Zutaten ist ein Vakuumbehälter oft praktischer, als die Speise fest in einen Beutel zu pressen.</p>
<p>Kartoffelsalat immer gekühlt aufbewahren.</p>

<h2>7. Sauerkraut</h2>
<p>Sauerkraut ist eine weitere klassische deutsche Beilage, die oft in größeren Mengen zubereitet wird, als für eine Mahlzeit nötig ist.</p>
<p>Übrig gebliebenes gekochtes Sauerkraut lässt sich in kleinere Portionen teilen und für später vakuumieren.</p>
<p>Das ist besonders praktisch, wenn Sie es zu Bratwurst, Kassler oder anderen traditionellen Gerichten servieren.</p>

<h2>8. Spätzle</h2>
<p>Frische Spätzle werden häufig zu Gerichten wie Rouladen, Gulasch und verschiedenen Fleischsoßen serviert.</p>
<p>Haben Sie zu viel gekocht, teilen Sie die Spätzle in Portionen und vakuumieren Sie sie, sobald sie gut abgekühlt sind.</p>
<p>So lagern Sie einzelne Portionen für eine weitere Mahlzeit, statt einen großen Behälter mit Resten im Kühlschrank aufzubewahren.</p>

<h2>9. Kartoffeln und andere gekochte Beilagen</h2>
<p>Zu deutschen Mahlzeiten gehören oft Kartoffeln in irgendeiner Form – Salzkartoffeln, Bratkartoffeln, Kartoffelknödel oder andere Zubereitungen.</p>
<p>Gekochte Kartoffeln und andere geeignete Beilagen lassen sich portionieren und für später vakuumverpacken.</p>
<p>Das ist besonders nützlich, wenn Sie für mehrere Tage im Voraus kochen.</p>

<h2>10. Eintopf und deutsche Schmorgerichte</h2>
<p>Der traditionelle deutsche Eintopf ist praktisch für die Vorratsküche gemacht.</p>
<p>Ein großer Topf ergibt mehrere Mahlzeiten – aber Sie müssen nicht mehrere Tage hintereinander denselben Eintopf essen.</p>
<p>Teilen Sie ihn in Portionen, lassen Sie ihn richtig abkühlen und vakuumieren Sie die Portionen. Kurzfristig in den Kühlschrank, für später ins Gefrierfach.</p>
<p>Bei flüssigkeitsreichen Speisen wie Eintopf erleichtert ein Kammer-Vakuumierer den Vorgang erheblich.</p>

<h2>Was ist mit deutschem Weihnachts- und Festtagsessen?</h2>
<p>Vakuumverpackung ist auch nach Feiertagen und Familienfeiern nützlich. Reste von zum Beispiel:</p>
<ul>
  <li>Rinderrouladen</li>
  <li>Sauerbraten</li>
  <li>Braten</li>
  <li>Gulasch</li>
  <li>Bratwurst</li>
  <li>Sauerkraut</li>
  <li>Knödeln</li>
  <li>Spätzle</li>
  <li>Gemüse</li>
  <li>Soßen</li>
</ul>
<p>lassen sich portionieren, statt sie in großen Behältern im Kühlschrank stehen zu lassen.</p>
<p>Das ist besonders praktisch nach Weihnachten, Ostern oder einer großen Familienfeier, wenn oft viel mehr Essen übrig ist, als in ein oder zwei Mahlzeiten passt.</p>

<h2>Vakuumieren Sie die Mahlzeit, nicht nur die Zutat</h2>
<p>Einer der größten Vorteile der Vakuumverpackung: Sie müssen nicht jede Zutat einzeln aufbewahren. Sie können komplette Mahlzeitenportionen zusammenstellen.</p>
<p>Zum Beispiel:</p>
<p>Roulade + Spätzle + Sauerkraut &rarr; eine Portion &rarr; vakuumieren &rarr; einfrieren.</p>
<p>Oder:</p>
<p>Gulasch + Kartoffeln &rarr; eine Portion &rarr; vakuumieren &rarr; einfrieren.</p>
<p>Wenn es schnell gehen muss, nehmen Sie einfach eine Portion aus dem Gefrierfach, statt alles neu zuzubereiten.</p>

<h2>So einfach machen Sie Reste haltbar</h2>
<p>Der Ablauf ist unkompliziert:</p>
<ol>
  <li>Mahlzeit kochen.</li>
  <li>Speise sicher abkühlen lassen.</li>
  <li>In Portionen teilen.</li>
  <li>Portionen vakuumieren.</li>
  <li>Mit Inhalt und Datum beschriften.</li>
  <li>Kühlen oder einfrieren.</li>
  <li>Portionen bei Bedarf verwenden.</li>
</ol>
<p>Vakuumverpackung ersetzt bei verderblichen Lebensmitteln nicht das Kühlen oder Einfrieren. Ziel ist es, die Speisen vor Luft, Feuchtigkeitsverlust und Gefrierbrand zu schützen und Lagerung sowie Portionierung zu erleichtern.</p>

<h2>Warum sich Vakuumverpackung für die deutsche Hausmannskost lohnt</h2>
<p>Viele traditionelle deutsche Gerichte eignen sich von Natur aus für die Vorratsküche. Ein großer Topf Gulasch, ein Blech Schnitzel, mehrere Rouladen oder eine große Portion Sauerkraut ergeben leicht mehr Essen, als eine Familie auf einmal essen kann.</p>
<p>Statt tagelang Reste zu essen – oder sie wegzuwerfen – machen Sie mit Vakuumverpackung aus einer großen Mahlzeit mehrere praktische Portionen.</p>
<p><strong>Einmal kochen. Portionieren. Vakuumieren. Später genießen.</strong></p>
<p>Für Haushalte, die regelmäßig traditionell deutsch kochen, ist ein <a href="${HOME_DE}">Vakuumierer wie der Planeta Home</a> eine einfache Möglichkeit, Lebensmittelverschwendung zu reduzieren und das Kochen zu Hause bequemer zu machen.</p>
`.trim()

const BODY_EN = `
<p>German cuisine is known for hearty meals, generous portions and dishes that are often prepared in larger quantities. From Sauerbraten and Rouladen to Gulasch, Bratwurst and Kartoffelsalat, many traditional German foods can be vacuum sealed and stored for another meal.</p>
<p>If you have cooked more than your family can eat, vacuum packaging can be a practical way to portion the leftovers and reduce food waste.</p>

<h2>1. Sauerbraten</h2>
<p>Sauerbraten is a classic German pot roast that is often prepared as a large meal for the whole family.</p>
<p>If you have leftovers, cut or portion the meat and vacuum seal it after it has cooled properly. You can then refrigerate the portion you plan to eat soon or freeze portions for later.</p>
<p>The same applies to the gravy. Because gravy is a liquid, a <a href="${HOME_EN}">chamber vacuum machine</a> is particularly useful.</p>
<p><strong>Tip:</strong> Vacuum seal the Sauerbraten and gravy separately so you can reheat the exact amount you need.</p>

<h2>2. Rinderrouladen</h2>
<p>Rinderrouladen are another German favorite that are often prepared in larger quantities.</p>
<p>The filled beef rolls can be vacuum packed individually or in portions. This makes it easy to take out exactly the number of Rouladen needed for a future meal.</p>
<p>The sauce can also be vacuum packaged using a suitable chamber vacuum machine.</p>
<p>Cook &rarr; cool &rarr; portion &rarr; vacuum seal &rarr; refrigerate or freeze.</p>

<h2>3. Gulasch</h2>
<p>German-style Gulasch is particularly convenient for vacuum packaging.</p>
<p>Whether it is beef, pork or a mixed Gulasch, the dish usually contains plenty of sauce. Instead of putting a large pot of leftovers into the refrigerator, divide it into meal-sized portions.</p>
<p>A chamber vacuum machine is especially useful because it can vacuum-pack foods containing sauces and liquids.</p>
<p>You can prepare a large batch of Gulasch on the weekend and have several ready-to-use meals during the week.</p>

<h2>4. Bratwurst</h2>
<p>Bratwurst is one of the foods many people immediately associate with German cuisine.</p>
<p>Whether you have leftover grilled Bratwurst or bought more sausages than you need, vacuum packaging can help keep portions organized in the refrigerator or freezer.</p>
<p>Instead of freezing a large package together, separate the sausages into convenient portions before vacuum sealing.</p>
<p>This is also useful when buying Bratwurst in larger quantities.</p>

<h2>5. Schnitzel</h2>
<p>Schnitzel can also be vacuum packed, particularly when you have leftovers after a family meal.</p>
<p>For best results, allow cooked Schnitzel to cool properly before packaging. If you plan to freeze it, vacuum packaging can help protect it from freezer burn.</p>
<p>Keep in mind that the crispy breading may become softer after refrigeration or freezing. Reheating it in an oven or air fryer can help restore some of the crispiness.</p>

<h2>6. Kartoffelsalat</h2>
<p>German Kartoffelsalat comes in many regional variations. Some versions are made with vinegar and oil, while others contain mayonnaise.</p>
<p>Leftover potato salad can be portioned and stored in an appropriate vacuum container or bag, depending on the recipe and consistency.</p>
<p>For salads containing mayonnaise or other delicate ingredients, a vacuum container can be more practical than tightly compressing the food in a bag.</p>
<p>Always keep potato salad refrigerated.</p>

<h2>7. Sauerkraut</h2>
<p>Sauerkraut is another classic German side dish that is often prepared in larger quantities than necessary for a single meal.</p>
<p>Leftover cooked Sauerkraut can be divided into smaller portions and vacuum sealed for later use.</p>
<p>This is particularly convenient when serving it with Bratwurst, Kassler or other traditional dishes.</p>

<h2>8. Spätzle</h2>
<p>Fresh Spätzle are commonly served with dishes such as Rouladen, Gulasch and various meat sauces.</p>
<p>If you have cooked too much, divide the Spätzle into portions and vacuum seal them once properly cooled.</p>
<p>You can then store individual portions for another meal instead of keeping one large container of leftovers in the refrigerator.</p>

<h2>9. Kartoffeln and Other Cooked Side Dishes</h2>
<p>German meals often include potatoes in one form or another—boiled potatoes, roasted potatoes, potato dumplings or other preparations.</p>
<p>Cooked potatoes and other suitable side dishes can be portioned and vacuum packed for later use.</p>
<p>This is particularly useful when preparing food for several days at once.</p>

<h2>10. Eintopf and German Stews</h2>
<p>Traditional German Eintopf is practically made for batch cooking.</p>
<p>A large pot can provide several meals, but you don't necessarily have to eat the same Eintopf for several days in a row.</p>
<p>Divide it into portions, cool it properly, and vacuum package the portions. Store them in the refrigerator for short-term use or freeze them for later.</p>
<p>With liquid-rich foods such as Eintopf, chamber vacuum packaging can make the process considerably easier.</p>

<h2>What About German Christmas and Holiday Food?</h2>
<p>Vacuum packaging can also be useful after holidays and family celebrations. For example, leftover:</p>
<ul>
  <li>Rinderrouladen</li>
  <li>Sauerbraten</li>
  <li>Braten</li>
  <li>Gulasch</li>
  <li>Bratwurst</li>
  <li>Sauerkraut</li>
  <li>Knödel</li>
  <li>Spätzle</li>
  <li>vegetables</li>
  <li>gravy and sauces</li>
</ul>
<p>can be divided into portions instead of being left in large containers in the refrigerator.</p>
<p>This is especially useful after Christmas, Easter or a large family gathering, when there is often much more food than can be eaten in one or two meals.</p>

<h2>Vacuum Seal the Meal, Not Just the Ingredient</h2>
<p>One of the biggest advantages of vacuum packaging is that you don't have to preserve individual ingredients separately. You can create complete meal portions.</p>
<p>For example:</p>
<p>Roulade + Spätzle + Sauerkraut &rarr; one portion &rarr; vacuum seal &rarr; freeze.</p>
<p>Or:</p>
<p>Gulasch + potatoes &rarr; one portion &rarr; vacuum seal &rarr; freeze.</p>
<p>When you need a quick meal, you simply take one portion from the freezer instead of preparing everything from scratch.</p>

<h2>A Simple Way to Preserve Leftovers</h2>
<p>The process is straightforward:</p>
<ol>
  <li>Cook your meal.</li>
  <li>Let the food cool safely.</li>
  <li>Divide it into portions.</li>
  <li>Vacuum seal the portions.</li>
  <li>Label them with the food and date.</li>
  <li>Refrigerate or freeze.</li>
  <li>Use the portions when needed.</li>
</ol>
<p>Vacuum packaging does not replace refrigeration or freezing for perishable foods. The goal is to protect the food from air, moisture loss and freezer burn while making storage and portioning easier.</p>

<h2>Why Vacuum Packaging Makes Sense for German Home Cooking</h2>
<p>Many traditional German dishes are naturally suited to batch cooking. A large pot of Gulasch, a tray of Schnitzel, several Rouladen or a big serving of Sauerkraut can easily produce more food than one family can eat at once.</p>
<p>Instead of eating leftovers for several days—or throwing them away—vacuum packaging lets you turn one large meal into several convenient portions.</p>
<p><strong>Cook once. Portion it. Vacuum seal it. Enjoy it later.</strong></p>
<p>For households that regularly cook traditional German meals, a <a href="${HOME_EN}">vacuum machine such as the Planeta Home</a> can be a simple way to reduce food waste and make home cooking more convenient.</p>
`.trim()

export default async function seedArticleGermanFoodsVacuum({ container }: ExecArgs) {
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
    title: "Traditionelle deutsche Gerichte, die Sie vakuumieren und haltbar machen können",
    title_en: "Traditional German Foods You Can Vacuum Seal and Preserve",
    excerpt:
      "Sauerbraten, Rouladen, Gulasch, Bratwurst, Kartoffelsalat & Co.: Welche klassischen deutschen Gerichte sich vakuumieren lassen – portionieren, haltbar machen und Reste vermeiden.",
    excerpt_en:
      "Sauerbraten, Rouladen, Gulasch, Bratwurst, Kartoffelsalat and more: which classic German dishes you can vacuum seal — to portion, preserve and cut food waste.",
    meta_title: "Deutsche Gerichte vakuumieren: Sauerbraten, Gulasch & Co. | Planeta",
    meta_title_en: "Traditional German Foods You Can Vacuum Seal | Planeta",
    meta_description:
      "Welche traditionellen deutschen Gerichte lassen sich vakuumieren? Von Sauerbraten über Gulasch bis Kartoffelsalat – portionieren, einfrieren und Lebensmittel sparen.",
    meta_description_en:
      "Which traditional German foods can you vacuum seal? From Sauerbraten and Gulasch to Kartoffelsalat — portion, freeze and reduce food waste. Practical tips for home cooks.",
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

  console.log(`GERMAN FOODS ARTICLE SEED DONE: slug=${SLUG} channel=${shop?.name ?? "GLOBAL"}`)
}
