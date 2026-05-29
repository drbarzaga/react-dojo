import { db } from "@/db"
import { activityLog } from "@/db/schema"
import { sql } from "drizzle-orm"

/** Today's date as a UTC "YYYY-MM-DD" string. */
export function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Records that a user had activity today (UTC). Increments the day's count,
 * creating the row on first activity. Powers streaks and the contribution heatmap.
 * Failures are swallowed so progress sync is never blocked by activity logging.
 */
export async function logActivity(userId: string): Promise<void> {
  try {
    await db
      .insert(activityLog)
      .values({ id: crypto.randomUUID(), userId, date: utcToday(), count: 1 })
      .onConflictDoUpdate({
        target: [activityLog.userId, activityLog.date],
        set: { count: sql`${activityLog.count} + 1` },
      })
  } catch {
    // non-critical: never block progress sync on activity logging
  }
}
