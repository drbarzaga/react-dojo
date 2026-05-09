import { db } from "@/db"
import { user, userProgress } from "@/db/schema"
import { eq } from "drizzle-orm"

export interface Developer {
  id: string
  name: string
  image: string | null
  createdAt: Date
  concepts: number
  exercises: number
  quizzes: number
}

export async function getDevelopers(): Promise<Developer[]> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      visitedConcepts: userProgress.visitedConcepts,
      completedExercises: userProgress.completedExercises,
      quizScores: userProgress.quizScores,
    })
    .from(user)
    .leftJoin(userProgress, eq(user.id, userProgress.userId))

  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      image: row.image,
      createdAt: row.createdAt,
      concepts: row.visitedConcepts?.length ?? 0,
      exercises: row.completedExercises?.length ?? 0,
      quizzes: Object.keys(row.quizScores ?? {}).length,
    }))
    .sort((a, b) => b.concepts + b.exercises + b.quizzes - (a.concepts + a.exercises + a.quizzes))
}
