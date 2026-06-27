import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createWeeklyActionWorkflow } from "../../../../workflows/weekly-action"
import { WEEKLY_ACTION_MODULE } from "../../../../modules/weeklyAction"

/** Monday (UTC) that starts the given ISO week. Mirrors generate-weekly-slots. */
function isoWeekStart(year: number, week: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
  const dow = simple.getUTCDay()
  const start = simple
  if (dow <= 4) {
    start.setUTCDate(simple.getUTCDate() - dow + 1)
  } else {
    start.setUTCDate(simple.getUTCDate() + 8 - dow)
  }
  start.setUTCHours(0, 0, 0, 0)
  return start
}

function weekWindow(year: number, week: number) {
  const start = isoWeekStart(year, week)
  const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000 - 1)
  return { start, end }
}

/**
 * Creates a single draft weekly action for the current week — or the next
 * still-free week if the current one already exists. Lets the merchant add
 * weeks one at a time instead of scaffolding the whole year up front.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const waService = req.scope.resolve(WEEKLY_ACTION_MODULE)
  const now = new Date()
  const thisYear = now.getUTCFullYear()

  // Weeks already taken in this/next year (year+week is unique).
  const existing = await waService.listWeeklyActions({
    year: [thisYear, thisYear + 1],
  })
  const taken = new Set(existing.map((a: any) => `${a.year}-${a.iso_week}`))

  // Start from the current/upcoming week (the first whose window hasn't ended).
  let year = thisYear
  let week = 1
  for (let w = 1; w <= 52; w++) {
    if (weekWindow(thisYear, w).end >= now) {
      week = w
      break
    }
  }

  // Walk forward to the first free week.
  let target: { year: number; week: number } | null = null
  for (let i = 0; i < 104; i++) {
    if (!taken.has(`${year}-${week}`)) {
      target = { year, week }
      break
    }
    week++
    if (week > 52) {
      week = 1
      year++
    }
  }

  if (!target) {
    return res
      .status(409)
      .json({ message: "No free week available to create." })
  }

  const { start, end } = weekWindow(target.year, target.week)
  const { result } = await createWeeklyActionWorkflow(req.scope).run({
    input: {
      title: `KW${String(target.week).padStart(2, "0")}/${target.year}`,
      year: target.year,
      iso_week: target.week,
      starts_at: start,
      ends_at: end,
    },
  })

  return res.status(201).json({ weekly_action: result })
}
