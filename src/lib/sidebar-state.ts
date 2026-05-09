import { SIDEBAR_OPEN_STATE_KEY, SIDEBAR_OPEN_STATE_COOKIE_MAX_AGE_S } from "@/lib/constants"

export interface SidebarOpenState {
  cats: string[]
  levels: string[]
  quizLevels: string[]
}

export const EMPTY_SIDEBAR_OPEN_STATE: SidebarOpenState = {
  cats: [],
  levels: [],
  quizLevels: [],
}

export function parseSidebarOpenState(raw: string | undefined | null): SidebarOpenState {
  if (!raw) return EMPTY_SIDEBAR_OPEN_STATE
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === "object" &&
      "cats" in parsed &&
      "levels" in parsed &&
      "quizLevels" in parsed &&
      Array.isArray(parsed.cats) &&
      Array.isArray(parsed.levels) &&
      Array.isArray(parsed.quizLevels) &&
      parsed.cats.every((item) => typeof item === "string") &&
      parsed.levels.every((item) => typeof item === "string") &&
      parsed.quizLevels.every((item) => typeof item === "string")
    ) {
      return { cats: parsed.cats, levels: parsed.levels, quizLevels: parsed.quizLevels }
    }
  } catch {
    /* ignore */
  }
  return EMPTY_SIDEBAR_OPEN_STATE
}

export function writeSidebarOpenStateCookie(state: SidebarOpenState) {
  if (typeof document === "undefined") return
  try {
    const value = encodeURIComponent(JSON.stringify(state))
    document.cookie = `${SIDEBAR_OPEN_STATE_KEY}=${value}; path=/; max-age=${SIDEBAR_OPEN_STATE_COOKIE_MAX_AGE_S}; samesite=lax`
  } catch {
    /* ignore */
  }
}
