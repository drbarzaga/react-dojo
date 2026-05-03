import { auth } from "@/lib/auth"
import { db } from "@/db"
import { userProgress } from "@/db/schema"
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

  const { visitedConcepts, completedExercises, quizScores } = await req.json()
  const userId = session.user.id

  const existing = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (existing) {
    const merged = {
      visitedConcepts: [...new Set([...existing.visitedConcepts, ...visitedConcepts])],
      completedExercises: [...new Set([...existing.completedExercises, ...completedExercises])],
      quizScores: { ...existing.quizScores } as Record<string, number>,
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
    await db
      .insert(userProgress)
      .values({ userId, visitedConcepts, completedExercises, quizScores })
    return Response.json({ visitedConcepts, completedExercises, quizScores })
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

  return Response.json({ ok: true })
}
