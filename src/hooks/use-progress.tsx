"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react"

import { PROGRESS_STORAGE_KEY } from "@/lib/constants"
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

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return empty
    return { ...empty, ...JSON.parse(raw) }
  } catch {
    return empty
  }
}

function persist(data: ProgressData) {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data))
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
  const [data, setData] = useState<ProgressData>(empty)
  const { data: session } = useSession()
  const syncedRef = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(load())
  }, [])

  // On login: merge localStorage → server and replace local state with merged result
  useEffect(() => {
    if (!session || syncedRef.current) return
    syncedRef.current = true
    const local = load()
    fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(local),
    })
      .then((r) => r.json())
      .then((merged: ProgressData) => {
        persist(merged)
        setData(merged)
      })
      .catch(() => {})
  }, [session])

  const markConceptVisited = useCallback(
    (id: string) => {
      setData((prev) => {
        if (prev.visitedConcepts.includes(id)) return prev
        const nextData = { ...prev, visitedConcepts: [...prev.visitedConcepts, id] }
        persist(nextData)
        if (session) syncToServer({ visitedConcepts: nextData.visitedConcepts })
        return nextData
      })
    },
    [session]
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
        persist(next)
        if (session) syncToServer({ completedExercises: next.completedExercises })
        return next
      })
    },
    [session]
  )

  const saveQuizScore = useCallback(
    (id: string, pct: number) => {
      setData((prev) => {
        if ((prev.quizScores[id] ?? -1) >= pct) return prev
        const nextData = { ...prev, quizScores: { ...prev.quizScores, [id]: pct } }
        persist(nextData)
        if (session) syncToServer({ quizScores: nextData.quizScores })
        return nextData
      })
    },
    [session]
  )

  const resetProgress = useCallback(() => {
    persist(empty)
    setData(empty)
  }, [])

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
