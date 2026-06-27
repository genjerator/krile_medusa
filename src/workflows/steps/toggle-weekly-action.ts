import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { updatePriceListsWorkflow } from "@medusajs/medusa/core-flows"
import { WEEKLY_ACTION_MODULE } from "../../modules/weeklyAction"

type Input = { id: string; active: boolean }

/**
 * Manually turns a weekly action on or off.
 *
 * Activation is fully manual (not date-driven): exactly one action is active at
 * a time. Turning one ON pauses every other active action (and its Price List),
 * activates this one, and makes its sale Price List live *now* by setting it to
 * `active` with no date window. Turning it OFF deactivates the action and pauses
 * its Price List so base prices return.
 */
export const toggleWeeklyActionStep = createStep(
  "toggle-weekly-action",
  async ({ id, active }: Input, { container }) => {
    const waService = container.resolve(WEEKLY_ACTION_MODULE)

    const target: any = await waService.retrieveWeeklyAction(id)

    const pausePriceList = (priceListId: string) =>
      updatePriceListsWorkflow(container).run({
        input: { price_lists_data: [{ id: priceListId, status: "draft" }] },
      })

    if (active) {
      // Single active: pause any other currently-active action + its price list.
      const others: any[] = await waService.listWeeklyActions({ is_active: true })
      const toDisable = others.filter((a) => a.id !== id)

      for (const a of toDisable) {
        if (a.price_list_id) {
          await pausePriceList(a.price_list_id)
        }
      }
      if (toDisable.length) {
        await waService.updateWeeklyActions(
          toDisable.map((a) => ({ id: a.id, is_active: false }))
        )
      }

      // Activate target and make its sale prices live now (windowless + active).
      await waService.updateWeeklyActions({ id, is_active: true })
      if (target.price_list_id) {
        await updatePriceListsWorkflow(container).run({
          input: {
            price_lists_data: [
              {
                id: target.price_list_id,
                status: "active",
                starts_at: null,
                ends_at: null,
              },
            ],
          },
        })
      }
    } else {
      await waService.updateWeeklyActions({ id, is_active: false })
      if (target.price_list_id) {
        await pausePriceList(target.price_list_id)
      }
    }

    return new StepResponse({ id, is_active: active })
  }
)
