import { db } from "@/db"
import { user, userProgress } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const users = await db
    .select({ id: user.id, name: user.name, image: user.image, createdAt: user.createdAt })
    .from(user)

  const withProgress = await Promise.all(
    users.map(async (u) => {
      const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, u.id),
      })
      return {
        ...u,
        concepts: progress?.visitedConcepts.length ?? 0,
        exercises: progress?.completedExercises.length ?? 0,
        quizzes: Object.keys(progress?.quizScores ?? {}).length,
      }
    })
  )

  const sorted = withProgress.sort(
    (a, b) => b.concepts + b.exercises + b.quizzes - (a.concepts + a.exercises + a.quizzes)
  )

  return Response.json(sorted)
}
