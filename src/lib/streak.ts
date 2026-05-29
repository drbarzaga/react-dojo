/** A single day of activity. `date` is a UTC "YYYY-MM-DD" string. */
export interface ActivityDay {
  date: string
  count: number
}

export interface StreakInfo {
  /** Consecutive active days ending today or yesterday (UTC). */
  current: number
  /** Longest run of consecutive active days ever. */
  longest: number
}

const DAY_MS = 86_400_000

/** Days between two UTC "YYYY-MM-DD" strings (b - a). */
function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS)
}

/**
 * Computes current and longest streaks from activity days. Pure: pass `today`
 * (UTC "YYYY-MM-DD") for deterministic results. The current streak survives if the
 * last active day is today or yesterday (so it isn't broken until a full day is missed).
 */
export function computeStreak(
  days: ActivityDay[],
  today = new Date().toISOString().slice(0, 10)
): StreakInfo {
  const dates = [...new Set(days.filter((d) => d.count > 0).map((d) => d.date))].sort()
  if (dates.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < dates.length; i++) {
    run = daysBetween(dates[i - 1], dates[i]) === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  // Current streak: walk backwards from the most recent active day, but only if
  // that day is today or yesterday (otherwise the streak is already broken).
  const last = dates[dates.length - 1]
  const gapFromToday = daysBetween(last, today)
  let current = 0
  if (gapFromToday <= 1) {
    current = 1
    for (let i = dates.length - 1; i > 0; i--) {
      if (daysBetween(dates[i - 1], dates[i]) === 1) current++
      else break
    }
  }

  return { current, longest }
}
