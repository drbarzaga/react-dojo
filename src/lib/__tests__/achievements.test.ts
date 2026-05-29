import { describe, it, expect } from "vitest"
import {
  evaluateAchievements,
  countUnlocked,
  TOTAL_ACHIEVEMENTS,
  type AchievementContext,
} from "@/lib/achievements"

const base: AchievementContext = {
  conceptsVisited: 0,
  conceptsTotal: 30,
  exercisesCompleted: 0,
  exercisesTotal: 20,
  advancedCompleted: 0,
  advancedTotal: 5,
  quizzesAttempted: 0,
  perfectQuizzes: 0,
  completedCategories: 0,
  score: 0,
  currentStreak: 0,
  longestStreak: 0,
}

const ctx = (over: Partial<AchievementContext>): AchievementContext => ({ ...base, ...over })

const unlockedIds = (c: AchievementContext) =>
  evaluateAchievements(c)
    .filter((a) => a.unlocked)
    .map((a) => a.id)

describe("evaluateAchievements", () => {
  it("unlocks nothing for an empty profile", () => {
    expect(unlockedIds(base)).toEqual([])
    expect(countUnlocked(base)).toBe(0)
  })

  it("returns an entry for every defined achievement", () => {
    expect(evaluateAchievements(base)).toHaveLength(TOTAL_ACHIEVEMENTS)
  })

  it("unlocks concept milestones cumulatively", () => {
    const ids = unlockedIds(ctx({ conceptsVisited: 10 }))
    expect(ids).toContain("first-concept")
    expect(ids).toContain("concepts-10")
    expect(ids).not.toContain("concepts-25")
  })

  it("unlocks all-concepts only when every concept is visited", () => {
    expect(unlockedIds(ctx({ conceptsVisited: 29 }))).not.toContain("all-concepts")
    expect(unlockedIds(ctx({ conceptsVisited: 30 }))).toContain("all-concepts")
  })

  it("unlocks perfect-quiz and category-complete from mastery counters", () => {
    const ids = unlockedIds(ctx({ perfectQuizzes: 1, completedCategories: 2 }))
    expect(ids).toContain("perfect-quiz")
    expect(ids).toContain("category-complete")
  })

  it("does not unlock all-advanced when there are zero advanced exercises", () => {
    const ids = unlockedIds(ctx({ advancedTotal: 0, advancedCompleted: 0 }))
    expect(ids).not.toContain("all-advanced")
  })

  it("uses the longest streak (not current) for consistency badges", () => {
    const ids = unlockedIds(ctx({ currentStreak: 0, longestStreak: 7 }))
    expect(ids).toContain("streak-3")
    expect(ids).toContain("streak-7")
    expect(ids).not.toContain("streak-14")
  })

  it("unlocks rank badges at KYU score thresholds", () => {
    expect(unlockedIds(ctx({ score: 26 }))).toEqual(expect.arrayContaining(["rank-5kyu"]))
    expect(unlockedIds(ctx({ score: 56 }))).toEqual(
      expect.arrayContaining(["rank-5kyu", "rank-3kyu"])
    )
    expect(unlockedIds(ctx({ score: 100 }))).toEqual(
      expect.arrayContaining(["rank-5kyu", "rank-3kyu", "rank-1kyu", "rank-dan"])
    )
  })

  it("reports locked progress hints", () => {
    const conceptsTen = evaluateAchievements(ctx({ conceptsVisited: 7 })).find(
      (a) => a.id === "concepts-10"
    )
    expect(conceptsTen).toMatchObject({ unlocked: false, current: 7, target: 10 })
  })
})
