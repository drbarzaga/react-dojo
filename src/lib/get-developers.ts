import { db } from "@/db"
import { activityLog, user, userProgress } from "@/db/schema"
import { eq, gte } from "drizzle-orm"
import { calculateScore } from "@/lib/ranking"
import { computeStreak, type ActivityDay } from "@/lib/streak"
import { buildAchievementContext, countUnlocked } from "@/lib/achievements"

export interface Developer {
  id: string
  /** Public profile slug; null for accounts created before usernames were captured. */
  username: string | null
  name: string
  image: string | null
  createdAt: Date
  concepts: number
  exercises: number
  quizzes: number
  score: number
  achievements: number
  /** Current daily streak (consecutive active days, UTC). */
  streak: number
  /** Had activity today (UTC). */
  activeToday: boolean
  /** Had activity within the last 7 days (UTC). */
  activeThisWeek: boolean
  /** Most recent active day, UTC "YYYY-MM-DD", or null if never active. */
  lastActive: string | null
}

/** Content slices needed to score developers and evaluate their achievements. */
export interface DevelopersContent {
  totals: { concepts: number; exercises: number; quizzes: number }
  exercises: { id: string; difficulty: string }[]
  categories: { conceptIds: string[] }[]
}

export async function getDevelopers(content: DevelopersContent): Promise<Developer[]> {
  // Only the last ~13 months of activity is relevant for streaks/heatmaps.
  const since = new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10)

  const [rows, activityRows] = await Promise.all([
    db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        visitedConcepts: userProgress.visitedConcepts,
        completedExercises: userProgress.completedExercises,
        quizScores: userProgress.quizScores,
      })
      .from(user)
      .leftJoin(userProgress, eq(user.id, userProgress.userId)),
    db
      .select({
        userId: activityLog.userId,
        date: activityLog.date,
        count: activityLog.count,
      })
      .from(activityLog)
      .where(gte(activityLog.date, since)),
  ])

  // Group activity rows by user once.
  const activityByUser = new Map<string, ActivityDay[]>()
  for (const a of activityRows) {
    const list = activityByUser.get(a.userId) ?? []
    list.push({ date: a.date, count: a.count })
    activityByUser.set(a.userId, list)
  }

  return rows
    .map((row) => {
      const visited = row.visitedConcepts ?? []
      const completed = row.completedExercises ?? []
      const quizScores = row.quizScores ?? {}

      const concepts = visited.length
      const exercises = completed.length
      const quizzes = Object.keys(quizScores).length
      const score = calculateScore(concepts, exercises, quizzes, content.totals)

      const activity = activityByUser.get(row.id) ?? []
      const { current: streak, longest } = computeStreak(activity, today)
      const dates = activity.filter((d) => d.count > 0).map((d) => d.date)
      const lastActive = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null

      const achievements = countUnlocked(
        buildAchievementContext(
          {
            visitedConcepts: visited,
            completedExercises: completed,
            quizScores,
            conceptsTotal: content.totals.concepts,
            score,
            currentStreak: streak,
            longestStreak: longest,
          },
          {
            exercises: content.exercises,
            quizzesCount: content.totals.quizzes,
            categories: content.categories,
          }
        )
      )

      return {
        id: row.id,
        username: row.username,
        name: row.name,
        image: row.image,
        createdAt: row.createdAt,
        concepts,
        exercises,
        quizzes,
        score,
        achievements,
        streak,
        activeToday: lastActive === today,
        activeThisWeek: lastActive !== null && lastActive >= weekAgo,
        lastActive,
      }
    })
    .sort((a, b) => b.score - a.score)
}
