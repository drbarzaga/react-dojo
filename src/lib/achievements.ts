/**
 * Achievement definitions and a pure evaluator. Definitions hold only logic and
 * metadata (id, family, icon); human-readable titles/descriptions live in the
 * "Achievements" i18n namespace keyed by id, so this module stays content-free.
 */

export type AchievementFamily = "milestone" | "mastery" | "streak" | "rank"

/** Everything needed to evaluate achievements, derived from a user's progress. */
export interface AchievementContext {
  conceptsVisited: number
  conceptsTotal: number
  exercisesCompleted: number
  exercisesTotal: number
  advancedCompleted: number
  advancedTotal: number
  quizzesAttempted: number
  /** Number of quizzes scored at 100%. */
  perfectQuizzes: number
  /** Number of categories where every concept has been visited. */
  completedCategories: number
  /** Overall KYU score, 0–100. */
  score: number
  currentStreak: number
  longestStreak: number
}

export interface AchievementDef {
  id: string
  family: AchievementFamily
  /** lucide-react icon name; mapped to a component in the UI layer. */
  icon: string
  unlocked: (c: AchievementContext) => boolean
  /** Optional progress toward unlocking, for a "7/10" style hint while locked. */
  progress?: (c: AchievementContext) => { current: number; target: number }
}

export interface EvaluatedAchievement {
  id: string
  family: AchievementFamily
  icon: string
  unlocked: boolean
  current: number
  target: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Milestones ────────────────────────────────────────────────────────────
  {
    id: "first-concept",
    family: "milestone",
    icon: "Footprints",
    unlocked: (c) => c.conceptsVisited >= 1,
    progress: (c) => ({ current: Math.min(c.conceptsVisited, 1), target: 1 }),
  },
  {
    id: "concepts-10",
    family: "milestone",
    icon: "BookOpen",
    unlocked: (c) => c.conceptsVisited >= 10,
    progress: (c) => ({ current: Math.min(c.conceptsVisited, 10), target: 10 }),
  },
  {
    id: "concepts-25",
    family: "milestone",
    icon: "Library",
    unlocked: (c) => c.conceptsVisited >= 25,
    progress: (c) => ({ current: Math.min(c.conceptsVisited, 25), target: 25 }),
  },
  {
    id: "first-exercise",
    family: "milestone",
    icon: "Dumbbell",
    unlocked: (c) => c.exercisesCompleted >= 1,
    progress: (c) => ({ current: Math.min(c.exercisesCompleted, 1), target: 1 }),
  },
  {
    id: "exercises-10",
    family: "milestone",
    icon: "Award",
    unlocked: (c) => c.exercisesCompleted >= 10,
    progress: (c) => ({ current: Math.min(c.exercisesCompleted, 10), target: 10 }),
  },
  {
    id: "first-quiz",
    family: "milestone",
    icon: "ListChecks",
    unlocked: (c) => c.quizzesAttempted >= 1,
    progress: (c) => ({ current: Math.min(c.quizzesAttempted, 1), target: 1 }),
  },

  // ── Mastery ───────────────────────────────────────────────────────────────
  {
    id: "perfect-quiz",
    family: "mastery",
    icon: "Target",
    unlocked: (c) => c.perfectQuizzes >= 1,
    progress: (c) => ({ current: Math.min(c.perfectQuizzes, 1), target: 1 }),
  },
  {
    id: "category-complete",
    family: "mastery",
    icon: "FolderCheck",
    unlocked: (c) => c.completedCategories >= 1,
    progress: (c) => ({ current: Math.min(c.completedCategories, 1), target: 1 }),
  },
  {
    id: "all-advanced",
    family: "mastery",
    icon: "Flame",
    unlocked: (c) => c.advancedTotal > 0 && c.advancedCompleted >= c.advancedTotal,
    progress: (c) => ({ current: c.advancedCompleted, target: c.advancedTotal }),
  },
  {
    id: "all-concepts",
    family: "mastery",
    icon: "GraduationCap",
    unlocked: (c) => c.conceptsTotal > 0 && c.conceptsVisited >= c.conceptsTotal,
    progress: (c) => ({ current: c.conceptsVisited, target: c.conceptsTotal }),
  },

  // ── Consistency (streaks) ───────────────────────────────────────────────────
  {
    id: "streak-3",
    family: "streak",
    icon: "Flame",
    unlocked: (c) => c.longestStreak >= 3,
    progress: (c) => ({ current: Math.min(c.longestStreak, 3), target: 3 }),
  },
  {
    id: "streak-7",
    family: "streak",
    icon: "Flame",
    unlocked: (c) => c.longestStreak >= 7,
    progress: (c) => ({ current: Math.min(c.longestStreak, 7), target: 7 }),
  },
  {
    id: "streak-14",
    family: "streak",
    icon: "Flame",
    unlocked: (c) => c.longestStreak >= 14,
    progress: (c) => ({ current: Math.min(c.longestStreak, 14), target: 14 }),
  },
  {
    id: "streak-30",
    family: "streak",
    icon: "CalendarCheck",
    unlocked: (c) => c.longestStreak >= 30,
    progress: (c) => ({ current: Math.min(c.longestStreak, 30), target: 30 }),
  },

  // ── KYU rank ────────────────────────────────────────────────────────────────
  { id: "rank-5kyu", family: "rank", icon: "Medal", unlocked: (c) => c.score >= 26 },
  { id: "rank-3kyu", family: "rank", icon: "Medal", unlocked: (c) => c.score >= 56 },
  { id: "rank-1kyu", family: "rank", icon: "Trophy", unlocked: (c) => c.score >= 86 },
  { id: "rank-dan", family: "rank", icon: "Crown", unlocked: (c) => c.score >= 100 },
]

/** Evaluates every achievement against a context. Order is preserved. */
export function evaluateAchievements(ctx: AchievementContext): EvaluatedAchievement[] {
  return ACHIEVEMENTS.map((a) => {
    const unlocked = a.unlocked(ctx)
    const p = a.progress?.(ctx) ?? { current: unlocked ? 1 : 0, target: 1 }
    return {
      id: a.id,
      family: a.family,
      icon: a.icon,
      unlocked,
      current: p.current,
      target: p.target,
    }
  })
}

/** Count of unlocked achievements — used for the compact directory badge. */
export function countUnlocked(ctx: AchievementContext): number {
  return ACHIEVEMENTS.reduce((n, a) => n + (a.unlocked(ctx) ? 1 : 0), 0)
}

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length

// ── Context builder ───────────────────────────────────────────────────────────

/** Minimal content shapes needed to derive an AchievementContext. */
export interface AchievementContentInput {
  exercises: { id: string; difficulty: string }[]
  quizzesCount: number
  categories: { conceptIds: string[] }[]
}

export interface AchievementProgressInput {
  visitedConcepts: Set<string> | string[]
  completedExercises: Set<string> | string[]
  quizScores: Record<string, number>
  conceptsTotal: number
  score: number
  currentStreak: number
  longestStreak: number
}

const asSet = (v: Set<string> | string[]) => (v instanceof Set ? v : new Set(v))

/**
 * Derives an AchievementContext from a user's progress and the content catalog.
 * Pure and shared by the profile and the directory so the rules stay in one place.
 */
export function buildAchievementContext(
  progress: AchievementProgressInput,
  content: AchievementContentInput
): AchievementContext {
  const visited = asSet(progress.visitedConcepts)
  const completed = asSet(progress.completedExercises)

  const advanced = content.exercises.filter((e) => e.difficulty === "advanced")
  const advancedCompleted = advanced.filter((e) => completed.has(e.id)).length

  const perfectQuizzes = Object.values(progress.quizScores).filter((s) => s >= 100).length

  const completedCategories = content.categories.filter(
    (cat) => cat.conceptIds.length > 0 && cat.conceptIds.every((id) => visited.has(id))
  ).length

  return {
    conceptsVisited: visited.size,
    conceptsTotal: progress.conceptsTotal,
    exercisesCompleted: completed.size,
    exercisesTotal: content.exercises.length,
    advancedCompleted,
    advancedTotal: advanced.length,
    quizzesAttempted: Object.keys(progress.quizScores).length,
    perfectQuizzes,
    completedCategories,
    score: progress.score,
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
  }
}
