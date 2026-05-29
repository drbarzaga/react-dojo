import { describe, it, expect } from "vitest"
import { computeStreak, type ActivityDay } from "@/lib/streak"

const day = (date: string, count = 1): ActivityDay => ({ date, count })

describe("computeStreak", () => {
  it("returns zeros for no activity", () => {
    expect(computeStreak([], "2026-05-28")).toEqual({ current: 0, longest: 0 })
  })

  it("ignores days with zero count", () => {
    expect(computeStreak([day("2026-05-28", 0)], "2026-05-28")).toEqual({ current: 0, longest: 0 })
  })

  it("counts a single active day today", () => {
    expect(computeStreak([day("2026-05-28")], "2026-05-28")).toEqual({ current: 1, longest: 1 })
  })

  it("counts consecutive days ending today", () => {
    const days = [day("2026-05-26"), day("2026-05-27"), day("2026-05-28")]
    expect(computeStreak(days, "2026-05-28")).toEqual({ current: 3, longest: 3 })
  })

  it("keeps the current streak alive when the last active day was yesterday", () => {
    const days = [day("2026-05-26"), day("2026-05-27")]
    expect(computeStreak(days, "2026-05-28").current).toBe(2)
  })

  it("breaks the current streak after a full missed day", () => {
    const days = [day("2026-05-25"), day("2026-05-26")]
    expect(computeStreak(days, "2026-05-28").current).toBe(0)
  })

  it("reports the longest historical streak even if the current one is shorter", () => {
    const days = [
      day("2026-05-01"),
      day("2026-05-02"),
      day("2026-05-03"),
      day("2026-05-04"),
      // gap
      day("2026-05-27"),
      day("2026-05-28"),
    ]
    expect(computeStreak(days, "2026-05-28")).toEqual({ current: 2, longest: 4 })
  })

  it("deduplicates multiple entries for the same day", () => {
    const days = [day("2026-05-27"), day("2026-05-27"), day("2026-05-28")]
    expect(computeStreak(days, "2026-05-28")).toEqual({ current: 2, longest: 2 })
  })

  it("handles unsorted input", () => {
    const days = [day("2026-05-28"), day("2026-05-26"), day("2026-05-27")]
    expect(computeStreak(days, "2026-05-28")).toEqual({ current: 3, longest: 3 })
  })
})
