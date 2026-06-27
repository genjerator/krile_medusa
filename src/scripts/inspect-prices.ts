export default async function inspectPrices({ container }: any) {
  const query = container.resolve("query")

  // The 3.0l container (was=54).
  const productId = "prod_01KTFJFQ7KXKZ8ZSSKG2DW6ERH"

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "variants.id",
      "variants.title",
      "variants.prices.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.prices.min_quantity",
      "variants.prices.max_quantity",
      "variants.prices.price_rules.attribute",
      "variants.prices.price_rules.value",
    ],
    filters: { id: productId },
  })

  for (const p of products) {
    console.log(`\nProduct: ${p.title}`)
    for (const v of p.variants ?? []) {
      console.log(`  Variant ${v.title} (${v.id}):`)
      for (const price of v.prices ?? []) {
        console.log(
          `    amount=${price.amount} ${price.currency_code} ` +
            `min=${price.min_quantity} max=${price.max_quantity} ` +
            `rules=${JSON.stringify(price.price_rules ?? [])}`
        )
      }
    }
  }
}
