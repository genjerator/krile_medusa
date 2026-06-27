export default async function inspectPriceList({ container }: any) {
  const query = container.resolve("query")

  const { data: lists } = await query.graph({
    entity: "price_list",
    fields: [
      "id",
      "title",
      "status",
      "type",
      "starts_at",
      "ends_at",
      "prices.id",
      "prices.amount",
      "prices.currency_code",
      "prices.variant.id",
      "prices.variant.title",
      "prices.price_rules.attribute",
      "prices.price_rules.value",
    ],
  })

  for (const l of lists) {
    console.log(
      `\nPRICE LIST ${l.title} [${l.id}] type=${l.type} status=${l.status}`
    )
    console.log(`  window: ${l.starts_at} → ${l.ends_at}`)
    console.log(`  ${l.prices?.length ?? 0} prices:`)
    for (const pr of l.prices ?? []) {
      console.log(
        `    ${pr.variant?.title ?? "?"}: ${pr.amount} ${pr.currency_code} ` +
          `rules=${JSON.stringify(pr.price_rules ?? [])}`
      )
    }
  }
}
