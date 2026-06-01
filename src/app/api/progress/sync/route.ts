import { auth } from "@/lib/auth"
import { db } from "@/db"
import { userProgress } from "@/db/schema"
import { logActivity } from "@/lib/activity"
import { eq } from "drizzle-orm"

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, session.user.id),
  })
  return Response.json(data ?? { visitedConcepts: [], completedExercises: [], quizScores: {} })
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const {
    visitedConcepts,
    completedExercises,
    quizScores,
    dailyStreak,
    bestStreak,
    lastDailyDate,
  } = await req.json()
  const userId = session.user.id

  const existing = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (existing) {
    const merged = {
      visitedConcepts: [...new Set([...existing.visitedConcepts, ...visitedConcepts])],
      completedExercises: [...new Set([...existing.completedExercises, ...completedExercises])],
      quizScores: { ...existing.quizScores } as Record<string, number>,
      // Streak: keep the highest values; lastDailyDate from client takes precedence (more recent)
      dailyStreak: Math.max(existing.dailyStreak ?? 0, dailyStreak ?? 0),
      bestStreak: Math.max(existing.bestStreak ?? 0, bestStreak ?? 0),
      lastDailyDate: lastDailyDate ?? existing.lastDailyDate ?? null,
    }
    for (const [id, score] of Object.entries(quizScores as Record<string, number>)) {
      merged.quizScores[id] = Math.max(merged.quizScores[id] ?? 0, score)
    }
    await db
      .update(userProgress)
      .set({ ...merged, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
    return Response.json(merged)
  } else {
    const values = {
      userId,
      visitedConcepts,
      completedExercises,
      quizScores,
      dailyStreak: dailyStreak ?? 0,
      bestStreak: bestStreak ?? 0,
      lastDailyDate: lastDailyDate ?? null,
    }
    await db.insert(userProgress).values(values)
    return Response.json(values)
  }
}

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const patch = await req.json()
  const userId = session.user.id

  const existing = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (existing) {
    await db
      .update(userProgress)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
  } else {
    await db.insert(userProgress).values({
      userId,
      visitedConcepts: patch.visitedConcepts ?? [],
      completedExercises: patch.completedExercises ?? [],
      quizScores: patch.quizScores ?? {},
    })
  }

  // PATCH is the per-action sync (concept visited / exercise / quiz), so it's the
  // signal that the user studied today — record it for streaks and the heatmap.
  await logActivity(userId)

  return Response.json({ ok: true })
}
