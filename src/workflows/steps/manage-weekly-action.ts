import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { deletePriceListsWorkflow } from "@medusajs/medusa/core-flows"
import { WEEKLY_ACTION_MODULE } from "../../modules/weeklyAction"

export type WeeklyActionItemInput = {
  product_id: string
  discount_type: "percentage" | "fixed"
  discount_value: number
}

export type CreateWeeklyActionInput = {
  title: string
  year: number
  iso_week: number
  starts_at: string | Date
  ends_at: string | Date
  default_discount_type?: "percentage" | "fixed"
  default_discount_value?: number | null
  items?: WeeklyActionItemInput[]
}

export type UpdateWeeklyActionInput = {
  id: string
  title?: string
  starts_at?: string | Date
  ends_at?: string | Date
  default_discount_type?: "percentage" | "fixed"
  default_discount_value?: number | null
  // When provided, the item set is fully replaced.
  items?: WeeklyActionItemInput[]
}

/** Create a weekly action plus its items. */
export const createWeeklyActionStep = createStep(
  "create-weekly-action",
  async (input: CreateWeeklyActionInput, { container }) => {
    const waService = container.resolve(WEEKLY_ACTION_MODULE)

    // One campaign per calendar week.
    const clash = await waService.listWeeklyActions({
      year: input.year,
      iso_week: input.iso_week,
    })
    if (clash.length) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        `A weekly action already exists for week ${input.iso_week} of ${input.year}`
      )
    }

    const [action] = await waService.createWeeklyActions([
      {
        title: input.title,
        year: input.year,
        iso_week: input.iso_week,
        starts_at: new Date(input.starts_at),
        ends_at: new Date(input.ends_at),
        default_discount_type: input.default_discount_type ?? "percentage",
        default_discount_value: input.default_discount_value ?? null,
        status: "draft",
      },
    ] as any[])

    if (input.items?.length) {
      await waService.createWeeklyActionItems(
        input.items.map((it) => ({
          product_id: it.product_id,
          discount_type: it.discount_type,
          discount_value: it.discount_value,
          weekly_action_id: action.id,
        })) as any[]
      )
    }

    return new StepResponse(action, action.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const waService = container.resolve(WEEKLY_ACTION_MODULE)
    await waService.deleteWeeklyActionItems({ weekly_action_id: id })
    await waService.deleteWeeklyActions(id)
  }
)

/** Update a weekly action; if `items` is provided, replace the whole set. */
export const updateWeeklyActionStep = createStep(
  "update-weekly-action",
  async (input: UpdateWeeklyActionInput, { container }) => {
    const waService = container.resolve(WEEKLY_ACTION_MODULE)

    const data: any = { id: input.id }
    if (input.title !== undefined) data.title = input.title
    if (input.starts_at !== undefined) data.starts_at = new Date(input.starts_at)
    if (input.ends_at !== undefined) data.ends_at = new Date(input.ends_at)
    if (input.default_discount_type !== undefined)
      data.default_discount_type = input.default_discount_type
    if (input.default_discount_value !== undefined)
      data.default_discount_value = input.default_discount_value

    await waService.updateWeeklyActions(data)

    if (input.items !== undefined) {
      await waService.deleteWeeklyActionItems({ weekly_action_id: input.id })
      if (input.items.length) {
        await waService.createWeeklyActionItems(
          input.items.map((it) => ({
            product_id: it.product_id,
            discount_type: it.discount_type,
            discount_value: it.discount_value,
            weekly_action_id: input.id,
          })) as any[]
        )
      }
    }

    const action = await waService.retrieveWeeklyAction(input.id)
    return new StepResponse(action)
  }
)

/** Delete a weekly action, its items, and its owned price list. */
export const deleteWeeklyActionStep = createStep(
  "delete-weekly-action",
  async ({ id }: { id: string }, { container }) => {
    const waService = container.resolve(WEEKLY_ACTION_MODULE)

    const action: any = await waService.retrieveWeeklyAction(id)

    if (action.price_list_id) {
      await deletePriceListsWorkflow(container).run({
        input: { ids: [action.price_list_id] },
      })
    }

    await waService.deleteWeeklyActionItems({ weekly_action_id: id })
    await waService.deleteWeeklyActions(id)

    return new StepResponse({ id })
  }
)
