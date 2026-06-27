import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createPriceListsWorkflow,
  deletePriceListsWorkflow,
} from "@medusajs/medusa/core-flows"
import { WEEKLY_ACTION_MODULE } from "../../modules/weeklyAction"

type Input = { weekly_action_id: string }

// Prices are stored as-is in Medusa (49.99 is 49.99, NOT cents). Round to 2dp.
function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Rebuilds the sale Price List for a weekly action from its stored per-item
 * rules. Reads each product's base prices (per currency), computes the sale
 * amount (percentage off the base, or a fixed new price), and recreates the
 * campaign's native Price List of type "sale" with the week's date window.
 *
 * Idempotent: deletes any existing price list and creates a fresh one, so it can
 * be re-run any time (e.g. after a base price changes) to recompute correctly.
 */
export const syncWeeklyActionPricesStep = createStep(
  "sync-weekly-action-prices",
  async ({ weekly_action_id }: Input, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const waService = container.resolve(WEEKLY_ACTION_MODULE)

    const action: any = await waService.retrieveWeeklyAction(weekly_action_id, {
      relations: ["items"],
    })

    const oldPriceListId: string | null = action.price_list_id ?? null
    const items: any[] = action.items ?? []

    // No products yet → drop any lingering price list and mark the week draft.
    if (items.length === 0) {
      if (oldPriceListId) {
        await deletePriceListsWorkflow(container).run({
          input: { ids: [oldPriceListId] },
        })
      }
      await waService.updateWeeklyActions({
        id: weekly_action_id,
        price_list_id: null,
        status: "draft",
      })
      return new StepResponse(
        { price_list_id: null, price_count: 0 },
        { createdPriceListId: null }
      )
    }

    const productIds = items.map((i) => i.product_id)

    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "variants.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
        "variants.prices.price_rules.value",
      ],
      filters: { id: productIds },
    })

    const ruleByProduct = new Map<string, any>(
      items.map((i) => [i.product_id, i])
    )

    const prices: {
      variant_id: string
      currency_code: string
      amount: number
    }[] = []

    for (const product of products as any[]) {
      const rule = ruleByProduct.get(product.id)
      if (!rule) {
        continue
      }
      for (const variant of product.variants ?? []) {
        for (const price of variant.prices ?? []) {
          // Only base (currency-only) prices — skip region/customer-group prices.
          const hasRules = (price.price_rules?.length ?? 0) > 0
          if (hasRules) {
            continue
          }
          let amount: number
          if (rule.discount_type === "percentage") {
            amount = roundMoney(price.amount * (1 - rule.discount_value / 100))
          } else {
            amount = roundMoney(rule.discount_value)
          }
          if (amount < 0) {
            amount = 0
          }
          prices.push({
            variant_id: variant.id,
            currency_code: price.currency_code,
            amount,
          })
        }
      }
    }

    // Simplest idempotent path: drop the old list, recreate fresh.
    if (oldPriceListId) {
      await deletePriceListsWorkflow(container).run({
        input: { ids: [oldPriceListId] },
      })
    }

    let createdPriceListId: string | null = null
    if (prices.length > 0) {
      const { result } = await createPriceListsWorkflow(container).run({
        input: {
          price_lists_data: [
            {
              title: `Weekly Action: ${action.title}`,
              description: `Auto-managed sale prices for weekly action "${action.title}"`,
              type: "sale",
              // Activation is manual, not date-driven: the list is live (active,
              // no window) only while the action is toggled on; otherwise paused.
              status: action.is_active ? "active" : "draft",
              starts_at: null,
              ends_at: null,
              prices,
            } as any,
          ],
        },
      })
      createdPriceListId = result[0].id
    }

    await waService.updateWeeklyActions({
      id: weekly_action_id,
      price_list_id: createdPriceListId,
      status: createdPriceListId ? "planned" : "draft",
    })

    return new StepResponse(
      { price_list_id: createdPriceListId, price_count: prices.length },
      { createdPriceListId }
    )
  },
  // Best-effort compensation: remove a freshly created price list on failure.
  async (compensation, { container }) => {
    if (!compensation?.createdPriceListId) {
      return
    }
    await deletePriceListsWorkflow(container).run({
      input: { ids: [compensation.createdPriceListId] },
    })
  }
)
