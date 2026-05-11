"use client"

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react"

import type { ExerciseFiles } from "@/types/code-persistence"
import { CODE_STORAGE_KEY } from "@/lib/constants"

type CodePersistenceData = Record<string, Record<string, string>>

function load(): CodePersistenceData {
  try {
    const raw = localStorage.getItem(CODE_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
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
  const getSavedCode = useCallback((exerciseId: string) => {
    return load()[exerciseId] ?? null
  }, [])

  const saveCode = useCallback((exerciseId: string, files: ExerciseFiles) => {
    const next = { ...load(), [exerciseId]: files }
    persist(next)
  }, [])

  const clearCode = useCallback((exerciseId: string) => {
    const next: CodePersistenceData = { ...load() }
    delete next[exerciseId]
    persist(next)
  }, [])

  const value = useMemo<CodePersistenceCtx>(
    () => ({ getSavedCode, saveCode, clearCode }),
    [getSavedCode, saveCode, clearCode]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCodePersistence(): CodePersistenceCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCodePersistence must be used inside CodePersistenceProvider")
  return ctx
}
