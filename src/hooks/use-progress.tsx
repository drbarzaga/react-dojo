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
}

const empty: ProgressData = {
  visitedConcepts: [],
  completedExercises: [],
  quizScores: {},
}

interface ProgressCtx {
  visitedConcepts: Set<string>
  completedExercises: Set<string>
  quizScores: Record<string, number>
  markConceptVisited: (id: string) => void
  toggleExerciseCompleted: (id: string) => void
  saveQuizScore: (id: string, pct: number) => void
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

  const resetProgress = useCallback(() => {
    setData(empty)
  }, [setData])

  const value = useMemo<ProgressCtx>(
    () => ({
      visitedConcepts: new Set(data.visitedConcepts),
      completedExercises: new Set(data.completedExercises),
      quizScores: data.quizScores,
      markConceptVisited,
      toggleExerciseCompleted,
      saveQuizScore,
      resetProgress,
    }),
    [data, markConceptVisited, toggleExerciseCompleted, saveQuizScore, resetProgress]
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
