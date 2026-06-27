import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WEEKLY_ACTION_MODULE } from "../../modules/weeklyAction"

type Input = { year: number }

/** Monday (UTC) that starts the given ISO week of the year. */
function isoWeekStart(year: number, week: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
  const dow = simple.getUTCDay() // 0 (Sun) .. 6 (Sat)
  const start = simple
  if (dow <= 4) {
    start.setUTCDate(simple.getUTCDate() - dow + 1)
  } else {
    start.setUTCDate(simple.getUTCDate() + 8 - dow)
  }
  start.setUTCHours(0, 0, 0, 0)
  return start
}

/**
 * Scaffolds the 52 (draft) weekly-action slots for a year. Weeks that already
 * exist are skipped, so it's safe to re-run. Each slot gets a Mon–Sun window
 * the merchant then fills with products.
 */
export const generateWeeklySlotsStep = createStep(
  "generate-weekly-slots",
  async ({ year }: Input, { container }) => {
    const waService = container.resolve(WEEKLY_ACTION_MODULE)

    const existing = await waService.listWeeklyActions({ year })
    const existingWeeks = new Set(existing.map((a: any) => a.iso_week))

    const toCreate: any[] = []
    for (let w = 1; w <= 52; w++) {
      if (existingWeeks.has(w)) {
        continue
      }
      const start = isoWeekStart(year, w)
      const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000 - 1)
      toCreate.push({
        title: `KW${String(w).padStart(2, "0")}/${year}`,
        year,
        iso_week: w,
        starts_at: start,
        ends_at: end,
        status: "draft",
        default_discount_type: "percentage",
        default_discount_value: null,
      })
    }

    let created: any[] = []
    if (toCreate.length) {
      created = await waService.createWeeklyActions(toCreate as any[])
    }

    return new StepResponse(
      { created_count: created.length, ids: created.map((c) => c.id) },
      created.map((c) => c.id)
    )
  },
  async (ids, { container }) => {
    if (!ids?.length) {
      return
    }
    const waService = container.resolve(WEEKLY_ACTION_MODULE)
    await waService.deleteWeeklyActions(ids)
  }
)
