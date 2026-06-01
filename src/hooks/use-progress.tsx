"use client"

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react"

import { PROGRESS_STORAGE_KEY } from "@/lib/constants"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSession } from "@/lib/auth-client"

interface ProgressData {
  visitedConcepts: string[]
  completedExercises: string[]
  quizScores: Record<string, number>
  dailyStreak: number
  bestStreak: number
  lastDailyDate: string | null
}

const empty: ProgressData = {
  visitedConcepts: [],
  completedExercises: [],
  quizScores: {},
  dailyStreak: 0,
  bestStreak: 0,
  lastDailyDate: null,
}

interface ProgressCtx {
  visitedConcepts: Set<string>
  completedExercises: Set<string>
  quizScores: Record<string, number>
  dailyStreak: number
  bestStreak: number
  lastDailyDate: string | null
  markConceptVisited: (id: string) => void
  toggleExerciseCompleted: (id: string) => void
  saveQuizScore: (id: string, pct: number) => void
  completeDailyChallenge: (date: string) => void
  resetProgress: () => void
}

const Ctx = createContext<ProgressCtx | null>(null)

function syncToServer(patch: Partial<ProgressData>) {
  fetch("/api/progress/sync", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).catch(() => {})
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useLocalStorage<ProgressData>(PROGRESS_STORAGE_KEY, empty)
  const { data: session } = useSession()
  const syncedRef = useRef(false)

  // On login: merge localStorage → server and replace local state with merged result
  useEffect(() => {
    if (!session || syncedRef.current) return
    syncedRef.current = true
    fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((merged: ProgressData) => {
        setData(merged)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const markConceptVisited = useCallback(
    (id: string) => {
      setData((prev) => {
        if (prev.visitedConcepts.includes(id)) return prev
        const nextData = { ...prev, visitedConcepts: [...prev.visitedConcepts, id] }
        if (session) syncToServer({ visitedConcepts: nextData.visitedConcepts })
        return nextData
      })
    },
    [session, setData]
  )

  const toggleExerciseCompleted = useCallback(
    (id: string) => {
      setData((prev) => {
        const already = prev.completedExercises.includes(id)
        const next = {
          ...prev,
          completedExercises: already
            ? prev.completedExercises.filter((x) => x !== id)
            : [...prev.completedExercises, id],
        }
        if (session) syncToServer({ completedExercises: next.completedExercises })
        return next
      })
    },
    [session, setData]
  )

  const saveQuizScore = useCallback(
    (id: string, pct: number) => {
      setData((prev) => {
        if ((prev.quizScores[id] ?? -1) >= pct) return prev
        const nextData = { ...prev, quizScores: { ...prev.quizScores, [id]: pct } }
        if (session) syncToServer({ quizScores: nextData.quizScores })
        return nextData
      })
    },
    [session, setData]
  )

  const completeDailyChallenge = useCallback(
    (date: string) => {
      setData((prev) => {
        // No-op if already completed today
        if (prev.lastDailyDate === date) return prev

        const yesterday = new Date(date)
        yesterday.setUTCDate(yesterday.getUTCDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)

        const newStreak = prev.lastDailyDate === yesterdayStr ? prev.dailyStreak + 1 : 1
        const newBest = Math.max(prev.bestStreak, newStreak)

        const next: ProgressData = {
          ...prev,
          dailyStreak: newStreak,
          bestStreak: newBest,
          lastDailyDate: date,
        }
        if (session)
          syncToServer({
            dailyStreak: next.dailyStreak,
            bestStreak: next.bestStreak,
            lastDailyDate: next.lastDailyDate,
          })
        return next
      })
    },
    [session, setData]
  )

  const resetProgress = useCallback(() => {
    setData(empty)
    // Push the cleared state so the server doesn't re-hydrate it on next login.
    // The merge-on-login is additive only, so without this the reset is undone.
    if (session) syncToServer({ ...empty })
  }, [session, setData])

  const value = useMemo<ProgressCtx>(
    () => ({
      visitedConcepts: new Set(data.visitedConcepts),
      completedExercises: new Set(data.completedExercises),
      quizScores: data.quizScores,
      dailyStreak: data.dailyStreak ?? 0,
      bestStreak: data.bestStreak ?? 0,
      lastDailyDate: data.lastDailyDate ?? null,
      markConceptVisited,
      toggleExerciseCompleted,
      saveQuizScore,
      completeDailyChallenge,
      resetProgress,
    }),
    [
      data,
      markConceptVisited,
      toggleExerciseCompleted,
      saveQuizScore,
      completeDailyChallenge,
      resetProgress,
    ]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProgress(): ProgressCtx {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error("useProgress must be used inside ProgressProvider")
  }

  return ctx
}
