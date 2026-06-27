import { QueryContext } from "@medusajs/framework/utils"

export default async function checkWeeklyAction({ container }: any) {
  const query = container.resolve("query")
  const now = new Date()

  const { data: actions } = await query.graph({
    entity: "weekly_action",
    fields: [
      "id",
      "title",
      "iso_week",
      "year",
      "status",
      "starts_at",
      "ends_at",
      "price_list_id",
      "items.product_id",
      "items.discount_type",
      "items.discount_value",
    ],
  })

  console.log(`\nNOW = ${now.toISOString()}\n`)
  console.log(`Found ${actions.length} weekly action(s):\n`)

  let currentWithItems: any = null

  for (const a of actions) {
    const current =
      now >= new Date(a.starts_at) && now <= new Date(a.ends_at)
    const items = a.items ?? []
    if (items.length) {
      console.log(
        `• ${a.title} (KW${a.iso_week}/${a.year}) status=${a.status} ` +
          `items=${items.length} price_list=${a.price_list_id ?? "none"} ` +
          `CURRENT=${current}`
      )
      console.log(`    window: ${a.starts_at} → ${a.ends_at}`)
      for (const it of items) {
        console.log(
          `    - ${it.product_id}  ${it.discount_value}${
            it.discount_type === "percentage" ? "%" : "€"
          }`
        )
      }
      if (current && items.length) currentWithItems = a
    }
  }

  if (!currentWithItems) {
    console.log(
      `\n⚠️  No CURRENT week has products. The sale only shows while now is inside ` +
        `the week's window. Fill the week that covers ${now.toISOString().slice(0, 10)}.`
    )
    return
  }

  // Pick a region to build a pricing context and confirm the sale resolves.
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })
  const region = regions[0]
  console.log(
    `\nUsing region "${region?.name}" (${region?.currency_code}) to check calculated prices...\n`
  )

  const productIds = currentWithItems.items.map((i: any) => i.product_id)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "variants.id",
      "variants.title",
      "variants.calculated_price.*",
    ],
    filters: { id: productIds },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region?.id,
          currency_code: region?.currency_code,
        }),
      },
    },
  })

  for (const p of products) {
    console.log(`Product: ${p.title}`)
    for (const v of p.variants ?? []) {
      const cp = v.calculated_price
      if (!cp) {
        console.log(`  ${v.title}: (no calculated_price)`)
        continue
      }
      console.log(
        `  ${v.title}: now=${cp.calculated_amount} was=${cp.original_amount} ` +
          `type=${cp.calculated_price?.price_list_type ?? "default"}`
      )
    }
  }

  console.log(
    `\n✅ If type=sale and now<was above, the storefront will show the discount.`
  )
}
