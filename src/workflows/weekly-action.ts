import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  createWeeklyActionStep,
  updateWeeklyActionStep,
  deleteWeeklyActionStep,
  CreateWeeklyActionInput,
  UpdateWeeklyActionInput,
} from "./steps/manage-weekly-action"
import { syncWeeklyActionPricesStep } from "./steps/sync-weekly-action-prices"
import { generateWeeklySlotsStep } from "./steps/generate-weekly-slots"
import { toggleWeeklyActionStep } from "./steps/toggle-weekly-action"

/** Create a weekly action and build its sale price list. */
export const createWeeklyActionWorkflow = createWorkflow(
  "create-weekly-action",
  function (input: CreateWeeklyActionInput) {
    const action = createWeeklyActionStep(input)

    const syncInput = transform({ action }, ({ action }) => ({
      weekly_action_id: action.id,
    }))
    syncWeeklyActionPricesStep(syncInput)

    return new WorkflowResponse(action)
  }
)

/** Update a weekly action (optionally replacing items) and resync prices. */
export const updateWeeklyActionWorkflow = createWorkflow(
  "update-weekly-action",
  function (input: UpdateWeeklyActionInput) {
    const action = updateWeeklyActionStep(input)

    const syncInput = transform({ input }, ({ input }) => ({
      weekly_action_id: input.id,
    }))
    syncWeeklyActionPricesStep(syncInput)

    return new WorkflowResponse(action)
  }
)

/** Delete a weekly action, its items, and its price list. */
export const deleteWeeklyActionWorkflow = createWorkflow(
  "delete-weekly-action",
  function (input: { id: string }) {
    const result = deleteWeeklyActionStep(input)
    return new WorkflowResponse(result)
  }
)

/** Recompute the sale price list for a weekly action from its stored rules. */
export const resyncWeeklyActionPricesWorkflow = createWorkflow(
  "resync-weekly-action-prices",
  function (input: { weekly_action_id: string }) {
    const result = syncWeeklyActionPricesStep(input)
    return new WorkflowResponse(result)
  }
)

/** Manually turn a weekly action on/off (single active; live prices now). */
export const toggleWeeklyActionWorkflow = createWorkflow(
  "toggle-weekly-action",
  function (input: { id: string; active: boolean }) {
    const result = toggleWeeklyActionStep(input)
    return new WorkflowResponse(result)
  }
)

/** Scaffold the 52 draft weekly slots for a year. */
export const generateWeeklyActionYearWorkflow = createWorkflow(
  "generate-weekly-action-year",
  function (input: { year: number }) {
    const result = generateWeeklySlotsStep(input)
    return new WorkflowResponse(result)
  }
)
