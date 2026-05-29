import { describe, it, expect } from "vitest"
import { buildHeatmap, intensity } from "@/lib/heatmap"
import type { ActivityDay } from "@/lib/streak"

const day = (date: string, count = 1): ActivityDay => ({ date, count })

describe("buildHeatmap", () => {
  it("produces the requested number of week columns of 7 days", () => {
    const hm = buildHeatmap([], { weeks: 10, today: "2026-05-28" })
    expect(hm.weeks).toHaveLength(10)
    expect(hm.weeks.every((w) => w.length === 7)).toBe(true)
  })

  it("sums total contributions only within the range", () => {
    const hm = buildHeatmap([day("2026-05-27", 3), day("2026-05-28", 2)], {
      weeks: 4,
      today: "2026-05-28",
    })
    expect(hm.total).toBe(5)
  })

  it("ignores activity dated in the future", () => {
    const hm = buildHeatmap([day("2026-05-28", 4), day("2026-06-10", 9)], {
      weeks: 4,
      today: "2026-05-28",
    })
    expect(hm.total).toBe(4)
  })

  it("marks days after today (within today's week) as null", () => {
    // 2026-05-28 is a Thursday; Fri/Sat of that week are in the future.
    const hm = buildHeatmap([], { weeks: 2, today: "2026-05-28" })
    const lastWeek = hm.weeks[hm.weeks.length - 1]
    expect(lastWeek[5]).toBeNull() // Friday
    expect(lastWeek[6]).toBeNull() // Saturday
    expect(lastWeek[4]).not.toBeNull() // Thursday (today)
  })

  it("includes today's cell with its count", () => {
    const hm = buildHeatmap([day("2026-05-28", 7)], { weeks: 2, today: "2026-05-28" })
    const flat = hm.weeks.flat().filter(Boolean)
    expect(flat.find((c) => c!.date === "2026-05-28")?.count).toBe(7)
  })

  it("emits month labels at month boundaries", () => {
    const hm = buildHeatmap([], { weeks: 53, today: "2026-05-28" })
    expect(hm.monthLabels.length).toBeGreaterThan(0)
    // Labels advance left → right and no two consecutive columns repeat a month
    // (the same month may reappear across a full-year span, which is expected).
    for (let i = 1; i < hm.monthLabels.length; i++) {
      expect(hm.monthLabels[i].weekIndex).toBeGreaterThan(hm.monthLabels[i - 1].weekIndex)
      expect(hm.monthLabels[i].month).not.toBe(hm.monthLabels[i - 1].month)
    }
  })
})

describe("intensity", () => {
  it("buckets counts into 0–4", () => {
    expect(intensity(0)).toBe(0)
    expect(intensity(1)).toBe(1)
    expect(intensity(3)).toBe(2)
    expect(intensity(6)).toBe(3)
    expect(intensity(20)).toBe(4)
  })
})
