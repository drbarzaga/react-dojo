import { db } from "@/db"
import { activityLog } from "@/db/schema"
import { and, eq, gte } from "drizzle-orm"
import type { ActivityDay } from "@/lib/streak"

/**
 * Returns a user's activity for the last `days` days (UTC), oldest first.
 * Feeds the contribution heatmap and streak calculation.
 */
export async function getActivity(userId: string, days = 365): Promise<ActivityDay[]> {
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10)

  const rows = await db
    .select({ date: activityLog.date, count: activityLog.count })
    .from(activityLog)
    .where(and(eq(activityLog.userId, userId), gte(activityLog.date, since)))

  return rows
    .map((r) => ({ date: r.date, count: r.count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
