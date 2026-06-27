import { deletePriceListsWorkflow } from "@medusajs/medusa/core-flows"

export default async function deleteTestPriceList({ container }: any) {
  const query = container.resolve("query")

  const { data: lists } = await query.graph({
    entity: "price_list",
    fields: ["id", "title"],
    filters: { title: "test" } as any,
  })

  if (!lists.length) {
    console.log("No price list titled 'test' found — nothing to delete.")
    return
  }

  const ids = lists.map((l: any) => l.id)
  console.log(`Deleting ${ids.length} price list(s): ${ids.join(", ")}`)

  await deletePriceListsWorkflow(container).run({ input: { ids } })

  console.log("Done.")
}
