import type { ActivityDay } from "@/lib/streak"

export interface HeatCell {
  /** UTC "YYYY-MM-DD". */
  date: string
  count: number
}

/** A column of 7 cells, Sunday → Saturday. `null` = outside the range / in the future. */
export type HeatWeek = (HeatCell | null)[]

export interface Heatmap {
  weeks: HeatWeek[]
  total: number
  /** Month abbreviations positioned over the week column where the month starts. */
  monthLabels: { weekIndex: number; month: number }[]
}

const DAY_MS = 86_400_000
const parseUTC = (d: string) => Date.parse(`${d}T00:00:00Z`)
const fmtUTC = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/**
 * Builds a GitHub-style contribution grid for the last `weeks` weeks ending today
 * (UTC). Columns are weeks (Sun→Sat); future days within the last column are null.
 * Pure: pass `today` (UTC "YYYY-MM-DD") for deterministic output.
 */
export function buildHeatmap(
  activity: ActivityDay[],
  {
    weeks = 53,
    today = new Date().toISOString().slice(0, 10),
  }: { weeks?: number; today?: string } = {}
): Heatmap {
  const counts = new Map(activity.map((a) => [a.date, a.count]))
  const todayMs = parseUTC(today)

  // End at the Saturday of today's week so the grid always has full columns.
  const todayDow = new Date(todayMs).getUTCDay() // 0 = Sun
  const endMs = todayMs + (6 - todayDow) * DAY_MS
  const startMs = endMs - (weeks * 7 - 1) * DAY_MS

  const result: HeatWeek[] = []
  const monthLabels: { weekIndex: number; month: number }[] = []
  let total = 0
  let lastMonth = -1

  for (let w = 0; w < weeks; w++) {
    const week: HeatWeek = []
    for (let d = 0; d < 7; d++) {
      const ms = startMs + (w * 7 + d) * DAY_MS
      if (ms > todayMs) {
        week.push(null)
        continue
      }
      const date = fmtUTC(ms)
      const count = counts.get(date) ?? 0
      total += count
      week.push({ date, count })

      // Record a month label at the first week a new month appears (on its top row).
      if (d === 0) {
        const month = new Date(ms).getUTCMonth()
        if (month !== lastMonth) {
          monthLabels.push({ weekIndex: w, month })
          lastMonth = month
        }
      }
    }
    result.push(week)
  }

  return { weeks: result, total, monthLabels }
}

/** Maps a day's count to an intensity bucket 0–4 for coloring. */
export function intensity(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}
