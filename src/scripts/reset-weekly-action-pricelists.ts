import { updatePriceListsWorkflow } from "@medusajs/medusa/core-flows"
import { WEEKLY_ACTION_MODULE } from "../modules/weeklyAction"

/**
 * One-time baseline cleanup for the manual on/off toggle: pauses the sale Price
 * List of every weekly action that is NOT currently toggled active, so no old
 * campaign keeps applying by its former date window. Safe to re-run.
 *
 *   npx medusa exec ./src/scripts/reset-weekly-action-pricelists.ts
 */
export default async function resetWeeklyActionPriceLists({ container }: any) {
  const waService = container.resolve(WEEKLY_ACTION_MODULE)

  const actions: any[] = await waService.listWeeklyActions(
    {},
    { select: ["id", "title", "is_active", "price_list_id"] }
  )

  const toPause = actions.filter((a) => !a.is_active && a.price_list_id)

  if (toPause.length === 0) {
    console.log("Nothing to pause — no inactive weekly actions have a price list.")
    return
  }

  for (const a of toPause) {
    await updatePriceListsWorkflow(container).run({
      input: { price_lists_data: [{ id: a.price_list_id, status: "draft" }] },
    })
    console.log(`Paused price list for "${a.title}" (${a.price_list_id})`)
  }

  console.log(`Done — paused ${toPause.length} price list(s).`)
}
