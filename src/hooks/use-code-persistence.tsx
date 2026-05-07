"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"

import type { ExerciseFiles } from "@/types/code-persistence"
import { CODE_STORAGE_KEY } from "@/lib/constants"

interface CodePersistenceData {
  [exerciseId: string]: {
    [filePath: string]: string
  }
}

const empty: CodePersistenceData = {}

function load(): CodePersistenceData {
  try {
    const raw = localStorage.getItem(CODE_STORAGE_KEY)
    if (!raw) return empty
    return JSON.parse(raw)
  } catch {
    return empty
  }
}

function persist(data: CodePersistenceData) {
  try {
    localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("[React Dojo] localStorage quota exceeded. Code persistence disabled.")
    } else {
      console.error("[React Dojo] Failed to persist code:", error)
    }
  }
}

interface CodePersistenceCtx {
  getSavedCode: (exerciseId: string) => ExerciseFiles | null
  saveCode: (exerciseId: string, files: ExerciseFiles) => void
  clearCode: (exerciseId: string) => void
}

const Ctx = createContext<CodePersistenceCtx | null>(null)

export function CodePersistenceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CodePersistenceData>(() =>
    typeof window === "undefined" ? empty : load()
  )

  const getSavedCode = useCallback(
    (exerciseId: string) => {
      return data[exerciseId] ?? null
    },
    [data]
  )

  const saveCode = useCallback((exerciseId: string, files: ExerciseFiles) => {
    setData((prev) => {
      const next = { ...prev, [exerciseId]: files }
      persist(next)
      return next
    })
  }, [])

  const clearCode = useCallback((exerciseId: string) => {
    setData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [exerciseId]: _, ...rest } = prev
      persist(rest)
      return rest
    })
  }, [])

  const value = useMemo<CodePersistenceCtx>(
    () => ({
      getSavedCode,
      saveCode,
      clearCode,
    }),
    [getSavedCode, saveCode, clearCode]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCodePersistence(): CodePersistenceCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCodePersistence must be used inside CodePersistenceProvider")
  return ctx
}
