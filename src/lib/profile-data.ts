import { db } from "@/db"
import { userProgress } from "@/db/schema"
import { getContentForLocale } from "@/content/loader"
import type { Locale } from "@/i18n/routing"
import { calculateScore, getRank } from "@/lib/ranking"
import { getActivity } from "@/lib/get-activity"
import { computeStreak } from "@/lib/streak"
import { buildHeatmap } from "@/lib/heatmap"
import { buildAchievementContext, evaluateAchievements } from "@/lib/achievements"
import { eq } from "drizzle-orm"

export interface ProfileUser {
  id: string
  name: string
  image: string | null
  createdAt: Date | string
}

/**
 * Computes everything the ProfilePage component needs for a given user: rank,
 * per-category progress, completed exercises, quiz scores, activity streak,
 * contribution heatmap and achievements. Shared by the private `/profile` route
 * and the public `/u/[username]` route so both render identical data.
 */
export async function buildProfileData(user: ProfileUser, locale: Locale) {
  const [progress, { allConcepts, allExercises, allQuizzes, categories }, activity] =
    await Promise.all([
      db.query.userProgress.findFirst({ where: eq(userProgress.userId, user.id) }),
      getContentForLocale(locale),
      getActivity(user.id),
    ])

  const visitedConcepts = new Set(progress?.visitedConcepts ?? [])
  const completedExercises = new Set(progress?.completedExercises ?? [])
  const quizScores = progress?.quizScores ?? {}

  const totals = {
    concepts: allConcepts.length,
    exercises: allExercises.length,
    quizzes: allQuizzes.length,
  }

  const rank = getRank(
    visitedConcepts.size,
    completedExercises.size,
    Object.keys(quizScores).length,
    totals
  )
  const score = calculateScore(
    visitedConcepts.size,
    completedExercises.size,
    Object.keys(quizScores).length,
    totals
  )

  const categoryProgress = categories.map((cat) => ({
    id: cat.id,
    kicker: cat.kicker,
    title: cat.title,
    visited: cat.conceptIds.filter((id) => visitedConcepts.has(id)).length,
    total: cat.conceptIds.length,
  }))

  const completedByDifficulty = {
    basic: allExercises.filter((e) => e.difficulty === "basic" && completedExercises.has(e.id)),
    intermediate: allExercises.filter(
      (e) => e.difficulty === "intermediate" && completedExercises.has(e.id)
    ),
    advanced: allExercises.filter(
      (e) => e.difficulty === "advanced" && completedExercises.has(e.id)
    ),
  }

  const attemptedQuizzes = allQuizzes
    .filter((q) => quizScores[q.id] !== undefined)
    .map((q) => ({ id: q.id, label: q.label, score: quizScores[q.id] }))
    .sort((a, b) => b.score - a.score)

  const streak = computeStreak(activity)
  const heatmap = buildHeatmap(activity)

  const achievements = evaluateAchievements(
    buildAchievementContext(
      {
        visitedConcepts,
        completedExercises,
        quizScores,
        conceptsTotal: totals.concepts,
        score,
        currentStreak: streak.current,
        longestStreak: streak.longest,
      },
      { exercises: allExercises, quizzesCount: allQuizzes.length, categories }
    )
  )

  return {
    user: { name: user.name, image: user.image, createdAt: user.createdAt },
    rank,
    score,
    totals,
    visited: visitedConcepts.size,
    exercisesCompleted: completedExercises.size,
    quizzesAttempted: Object.keys(quizScores).length,
    categoryProgress,
    completedByDifficulty,
    attemptedQuizzes,
    streak,
    heatmap,
    achievements,
  }
}
