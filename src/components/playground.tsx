"use client"

import { PlaygroundToolbar } from "@/components/playground-toolbar"
import { useCodePersistence } from "@/hooks/use-code-persistence"
import { useEditorTheme } from "@/hooks/use-editor-theme"
import { useTheme, type Theme } from "@/hooks/use-theme"
import {
  PLAYGROUND_FLUSH_SAVE_EVENT,
  PLAYGROUND_FONT_SIZE_DEFAULT_PX,
  PLAYGROUND_FONT_SIZE_MAX_PX,
  PLAYGROUND_FONT_SIZE_MIN_PX,
  PLAYGROUND_FONT_SIZE_STORAGE_KEY,
  PLAYGROUND_LAYOUT_STORAGE_KEY,
  PLAYGROUND_MAXIMIZED_PORTAL_ELEMENT_ID,
  PLAYGROUND_MAXIMIZED_Z_INDEX,
  PLAYGROUND_PREVIEW_ACTION_BUTTON_PX,
  PLAYGROUND_PREVIEW_ACTION_ICON_PX,
  PLAYGROUND_SAVED_INDICATOR_DURATION_MS,
  THEME_FILE_NAME,
} from "@/lib/constants"
import { renderObjective } from "@/lib/render-objective"
import { type EditorThemeId, type PlaygroundLayout, type PlaygroundSaveState } from "@/types"
import type { ExerciseFiles } from "@/types/code-persistence"
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackStack,
  useSandpack,
  type SandpackFiles,
  type SandpackPredefinedTemplate,
  type SandpackThemeProp,
} from "@codesandbox/sandpack-react"
import { ListChecks, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { createPortal } from "react-dom"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ─── Editor theme definitions ────────────────────────────────────────────────

const font = {
  body: "var(--font-sans)",
  mono: "var(--font-mono)",
  size: "13.5px",
  lineHeight: "22px",
}

const editorThemes: Record<EditorThemeId, { dark: SandpackThemeProp; light?: SandpackThemeProp }> =
  {
    auto: {
      dark: {
        colors: {
          surface1: "#0f0f11",
          surface2: "#131316",
          surface3: "#1c1c20",
          clickable: "#64636e",
          base: "#ddd8d0",
          disabled: "#46454f",
          hover: "#f0ece6",
          accent: "#c4956a",
          error: "#c98b82",
          errorSurface: "rgba(201,139,130,0.07)",
        },
        syntax: {
          plain: "#d4cfc8",
          comment: { color: "#4e4d59", fontStyle: "italic" },
          keyword: "#c4956a",
          tag: "#c48878",
          punctuation: "#5e5c68",
          definition: "#e0dbd4",
          property: "#8babcc",
          static: "#b49aca",
          string: "#87a89d",
        },
        font,
      },
      light: {
        colors: {
          surface1: "#f5f3ee",
          surface2: "#ede9e0",
          surface3: "#e4e0d6",
          clickable: "#72706a",
          base: "#2e2b26",
          disabled: "#b0ada6",
          hover: "#1a1915",
          accent: "#7a5a3d",
          error: "#9e4530",
          errorSurface: "rgba(158,69,48,0.08)",
        },
        syntax: {
          plain: "#3a342d",
          comment: { color: "#9e9b94", fontStyle: "italic" },
          keyword: "#7a5a3d",
          tag: "#8d5840",
          punctuation: "#9c9890",
          definition: "#1e1b16",
          property: "#4a6880",
          static: "#6b4a82",
          string: "#3d6b60",
        },
        font,
      },
    },
    oneDark: {
      dark: {
        colors: {
          surface1: "#282c34",
          surface2: "#21252b",
          surface3: "#3e4451",
          clickable: "#5c6370",
          base: "#abb2bf",
          disabled: "#4b5263",
          hover: "#ffffff",
          accent: "#61afef",
          error: "#e06c75",
          errorSurface: "rgba(224,108,117,0.1)",
        },
        syntax: {
          plain: "#abb2bf",
          comment: { color: "#5c6370", fontStyle: "italic" },
          keyword: "#c678dd",
          tag: "#e06c75",
          punctuation: "#abb2bf",
          definition: "#61afef",
          property: "#e06c75",
          static: "#d19a66",
          string: "#98c379",
        },
        font,
      },
    },
    tokyoNight: {
      dark: {
        colors: {
          surface1: "#1a1b26",
          surface2: "#16161e",
          surface3: "#2a2b3d",
          clickable: "#565f89",
          base: "#a9b1d6",
          disabled: "#414868",
          hover: "#c0caf5",
          accent: "#7aa2f7",
          error: "#f7768e",
          errorSurface: "rgba(247,118,142,0.1)",
        },
        syntax: {
          plain: "#a9b1d6",
          comment: { color: "#565f89", fontStyle: "italic" },
          keyword: "#bb9af7",
          tag: "#f7768e",
          punctuation: "#a9b1d6",
          definition: "#7aa2f7",
          property: "#73daca",
          static: "#ff9e64",
          string: "#9ece6a",
        },
        font,
      },
    },
    catppuccin: {
      dark: {
        colors: {
          surface1: "#1e1e2e",
          surface2: "#181825",
          surface3: "#313244",
          clickable: "#6c7086",
          base: "#cdd6f4",
          disabled: "#45475a",
          hover: "#f5f5f5",
          accent: "#89b4fa",
          error: "#f38ba8",
          errorSurface: "rgba(243,139,168,0.1)",
        },
        syntax: {
          plain: "#cdd6f4",
          comment: { color: "#6c7086", fontStyle: "italic" },
          keyword: "#cba6f7",
          tag: "#f38ba8",
          punctuation: "#cdd6f4",
          definition: "#89b4fa",
          property: "#94e2d5",
          static: "#fab387",
          string: "#a6e3a1",
        },
        font,
      },
    },
    rosePine: {
      dark: {
        colors: {
          surface1: "#191724",
          surface2: "#1f1d2e",
          surface3: "#26233a",
          clickable: "#6e6a86",
          base: "#e0def4",
          disabled: "#403d52",
          hover: "#ffffff",
          accent: "#9ccfd8",
          error: "#eb6f92",
          errorSurface: "rgba(235,111,146,0.1)",
        },
        syntax: {
          plain: "#e0def4",
          comment: { color: "#6e6a86", fontStyle: "italic" },
          keyword: "#c4a7e7",
          tag: "#eb6f92",
          punctuation: "#e0def4",
          definition: "#9ccfd8",
          property: "#ebbcba",
          static: "#f6c177",
          string: "#f6c177",
        },
        font,
      },
    },
    dracula: {
      dark: {
        colors: {
          surface1: "#282A36",
          surface2: "#1e2029",
          surface3: "#2d2f3f",
          clickable: "#6272a4",
          base: "#f8f8f2",
          disabled: "#6272a4",
          hover: "#ffffff",
          accent: "#bd93f9",
          error: "#ff5555",
          errorSurface: "rgba(255,85,85,0.1)",
        },
        syntax: {
          plain: "#f8f8f2",
          comment: { color: "#6272a4", fontStyle: "italic" },
          keyword: "#ff79c6",
          tag: "#ff79c6",
          punctuation: "#f8f8f2",
          definition: "#50fa7b",
          property: "#8be9fd",
          static: "#bd93f9",
          string: "#f1fa8c",
        },
        font,
      },
    },
    nightOwl: {
      dark: {
        colors: {
          surface1: "#011627",
          surface2: "#010e1a",
          surface3: "#0d2137",
          clickable: "#607b96",
          base: "#d6deeb",
          disabled: "#496582",
          hover: "#ffffff",
          accent: "#7e57c2",
          error: "#ef5350",
          errorSurface: "rgba(239,83,80,0.1)",
        },
        syntax: {
          plain: "#d6deeb",
          comment: { color: "#637777", fontStyle: "italic" },
          keyword: "#c792ea",
          tag: "#7fdbca",
          punctuation: "#d6deeb",
          definition: "#82aaff",
          property: "#addb67",
          static: "#ffcb8b",
          string: "#ecc48d",
        },
        font,
      },
    },
    githubLight: {
      dark: {
        colors: {
          surface1: "#ffffff",
          surface2: "#f6f8fa",
          surface3: "#eaeef2",
          clickable: "#57606a",
          base: "#24292f",
          disabled: "#8c959f",
          hover: "#0969da",
          accent: "#0969da",
          error: "#cf222e",
          errorSurface: "rgba(207,34,46,0.08)",
        },
        syntax: {
          plain: "#24292f",
          comment: { color: "#6e7781", fontStyle: "italic" },
          keyword: "#cf222e",
          tag: "#116329",
          punctuation: "#24292f",
          definition: "#8250df",
          property: "#0550ae",
          static: "#953800",
          string: "#0a3069",
        },
        font,
      },
    },
    monokai: {
      dark: {
        colors: {
          surface1: "#272822",
          surface2: "#1e1f1c",
          surface3: "#2d2e28",
          clickable: "#75715e",
          base: "#f8f8f2",
          disabled: "#75715e",
          hover: "#ffffff",
          accent: "#a6e22e",
          error: "#f92672",
          errorSurface: "rgba(249,38,114,0.1)",
        },
        syntax: {
          plain: "#f8f8f2",
          comment: { color: "#75715e", fontStyle: "italic" },
          keyword: "#f92672",
          tag: "#f92672",
          punctuation: "#f8f8f2",
          definition: "#a6e22e",
          property: "#66d9e8",
          static: "#ae81ff",
          string: "#e6db74",
        },
        font,
      },
    },
  }

export function getSandpackTheme(editorTheme: EditorThemeId, appTheme: Theme): SandpackThemeProp {
  const t = editorThemes[editorTheme]
  if (editorTheme === "auto") return appTheme === "light" ? t.light! : t.dark
  return t.dark
}

// ─── Preview CSS ──────────────────────────────────────────────────────────────

function buildStyles(theme: Theme): string {
  const t =
    theme === "dark"
      ? {
          colorScheme: "dark",
          bg: "#0f0f11",
          surface1: "#141417",
          surface2: "#1c1c20",
          fg: "#e8e3dc",
          fgMuted: "#8a8a8f",
          fgDim: "#5c5c61",
          line: "rgba(255,255,255,0.06)",
          lineStrong: "rgba(255,255,255,0.14)",
          lineHover: "rgba(255,255,255,0.24)",
          codeBg: "#141417",
          accent: "#c4956a",
        }
      : {
          colorScheme: "light",
          bg: "#f5f3ee",
          surface1: "#ede9e0",
          surface2: "#e4e0d6",
          fg: "#1a1915",
          fgMuted: "#6b6966",
          fgDim: "#a29f97",
          line: "rgba(0,0,0,0.07)",
          lineStrong: "rgba(0,0,0,0.14)",
          lineHover: "rgba(0,0,0,0.26)",
          codeBg: "#ede9e0",
          accent: "#7a5a3d",
        }

  return `:root {
  color-scheme: ${t.colorScheme};
  --bg: ${t.bg}; --surface-1: ${t.surface1}; --surface-2: ${t.surface2};
  --fg: ${t.fg}; --fg-muted: ${t.fgMuted}; --fg-dim: ${t.fgDim};
  --line: ${t.line}; --line-strong: ${t.lineStrong}; --accent: ${t.accent};
}
* { box-sizing: border-box; }
body { margin:0; padding:0; background:${t.bg}; color:${t.fg};
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  font-size:13px; line-height:1.6; -webkit-font-smoothing:antialiased; }
button { background:transparent; color:${t.fg}; border:1px solid ${t.lineStrong};
  padding:5px 12px; border-radius:5px; cursor:pointer; font-family:inherit;
  font-size:12.5px; transition:background 120ms,border-color 120ms; }
button:hover { background:${t.line}; border-color:${t.lineHover}; }
button:focus-visible { outline:1px solid ${t.accent}; outline-offset:2px; }
input,select,textarea { background:transparent; color:${t.fg};
  border:1px solid ${t.lineStrong}; padding:7px 10px; border-radius:5px;
  font-family:inherit; font-size:13px; }
input:focus,select:focus,textarea:focus { outline:1px solid ${t.accent};
  outline-offset:1px; border-color:transparent; }
input[type="range"] { padding:0; border:none; }
code,pre { font-family:ui-monospace,"Geist Mono","SF Mono",Menlo,monospace; }
code { color:${t.fg}; padding:0 2px; font-size:0.9em; }
pre { background:${t.codeBg}; border:1px solid ${t.line}; border-radius:5px;
  padding:12px; overflow:auto; font-size:12px; color:${t.fg}; }
a { color:${t.fg}; }
hr { border:0; border-top:1px solid ${t.line}; margin:14px 0; }
::selection { background:${t.fg}; color:${t.bg}; }
`
}

function TerminalIcon({ size = 13, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

// Updates only /styles.css when app theme changes — without resetting user code
function ThemeSync({ appTheme }: { appTheme: Theme }) {
  const { sandpack } = useSandpack()
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    sandpack.updateFile("/styles.css", buildStyles(appTheme))
  }, [appTheme]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// Auto-saves user code to localStorage when files change and reports save state.
function CodeSync({
  exerciseId,
  onStateChange,
}: {
  exerciseId: string
  onStateChange: (state: PlaygroundSaveState) => void
}) {
  const { sandpack } = useSandpack()
  const { saveCode } = useCodePersistence()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const codeRef = useRef<ExerciseFiles | null>(null)

  const flushAsSaved = useCallback(() => {
    if (codeRef.current) saveCode(exerciseId, codeRef.current)
    onStateChange("saved")
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(
      () => onStateChange("idle"),
      PLAYGROUND_SAVED_INDICATOR_DURATION_MS
    )
  }, [exerciseId, saveCode, onStateChange])

  useEffect(() => {
    const next = Object.entries(sandpack.files).reduce<ExerciseFiles>((acc, [path, file]) => {
      if (path.includes(THEME_FILE_NAME)) return acc
      return { ...acc, [path]: file.code }
    }, {})

    const prev = codeRef.current

    // First run — record baseline without saving
    if (prev === null) {
      codeRef.current = next
      return
    }

    // Compare by content, not reference, to ignore Sandpack re-renders with same code
    const changed =
      Object.keys(next).some((p) => next[p] !== prev[p]) ||
      Object.keys(prev).some((p) => !(p in next))

    if (!changed) return

    // Content changed: mark as saving, update ref and reset debounce
    codeRef.current = next
    onStateChange("saving")
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      flushAsSaved()
      timerRef.current = null
    }, 750)
    // No cleanup return — timer must survive reference-only re-renders of sandpack.files
  }, [sandpack.files, exerciseId, saveCode, onStateChange, flushAsSaved])

  // Flush any pending save on unmount so navigating away doesn't lose code
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        if (codeRef.current) saveCode(exerciseId, codeRef.current)
      }
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [exerciseId, saveCode])

  // Manual save triggered by Cmd+S — bypass debounce, flush immediately, flash indicator
  useEffect(() => {
    const handler = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      flushAsSaved()
    }
    window.addEventListener(PLAYGROUND_FLUSH_SAVE_EVENT, handler)
    return () => window.removeEventListener(PLAYGROUND_FLUSH_SAVE_EVENT, handler)
  }, [flushAsSaved])

  return null
}

function readPersistedFontSize(): number {
  if (typeof window === "undefined") return PLAYGROUND_FONT_SIZE_DEFAULT_PX
  try {
    const raw = window.localStorage.getItem(PLAYGROUND_FONT_SIZE_STORAGE_KEY)
    if (!raw) return PLAYGROUND_FONT_SIZE_DEFAULT_PX
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return PLAYGROUND_FONT_SIZE_DEFAULT_PX
    return Math.max(PLAYGROUND_FONT_SIZE_MIN_PX, Math.min(PLAYGROUND_FONT_SIZE_MAX_PX, parsed))
  } catch {
    return PLAYGROUND_FONT_SIZE_DEFAULT_PX
  }
}

function readPersistedLayout(): PlaygroundLayout {
  if (typeof window === "undefined") return "horizontal"
  try {
    const raw = window.localStorage.getItem(PLAYGROUND_LAYOUT_STORAGE_KEY)
    return raw === "vertical" ? "vertical" : "horizontal"
  } catch {
    return "horizontal"
  }
}

const CONSOLE_PANEL_PX = 200

const FLEX_PANE_STRETCH_STYLE = {
  flex: "1 1 0%",
  minHeight: 0,
  minWidth: 0,
  width: "100%",
  height: "100%",
  alignSelf: "stretch",
} as const

const PREVIEW_NESTED_STYLE = {
  flex: "1 1 0%",
  minHeight: 0,
  minWidth: 0,
  width: "100%",
} as const

// ─── Playground ───────────────────────────────────────────────────────────────

interface PlaygroundProps {
  files: SandpackFiles
  template?: SandpackPredefinedTemplate
  showConsole?: boolean
  height?: number
  dependencies?: Record<string, string>
  exerciseId?: string
  enablePersistence?: boolean
  objectives?: string[]
  maximized?: boolean
  onMaximizeChange?: (v: boolean) => void
  showSolution?: boolean
  onSolutionToggle?: () => void
}

export function Playground({
  files,
  template = "react",
  showConsole = false,
  height = 650,
  dependencies,
  exerciseId,
  enablePersistence = false,
  objectives,
  maximized: controlledMaximized,
  onMaximizeChange,
  showSolution,
  onSolutionToggle,
}: PlaygroundProps) {
  const t = useTranslations("Playground")
  const { theme: appTheme } = useTheme()
  const { editorTheme } = useEditorTheme()
  const { getSavedCode } = useCodePersistence()

  const [internalMaximized, setInternalMaximized] = useState(false)
  const maximized = controlledMaximized !== undefined ? controlledMaximized : internalMaximized
  const onMaximizeChangeRef = useRef(onMaximizeChange)
  useEffect(() => {
    onMaximizeChangeRef.current = onMaximizeChange
  }, [onMaximizeChange])
  const [consoleOpen, setConsoleOpen] = useState(showConsole)
  const [objectivesOpen, setObjectivesOpen] = useState(false)
  const [layout, setLayout] = useState<PlaygroundLayout>("horizontal")
  const [fontSize, setFontSize] = useState<number>(PLAYGROUND_FONT_SIZE_DEFAULT_PX)
  const [saveState, setSaveState] = useState<PlaygroundSaveState>("idle")
  const [isPlaygroundClient, setIsPlaygroundClient] = useState(false)

  // Hydrate persisted preferences after mount (avoids SSR mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFontSize(readPersistedFontSize())
    setLayout(readPersistedLayout())
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsPlaygroundClient(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleLayoutChange = useCallback((next: PlaygroundLayout) => {
    setLayout(next)
    try {
      window.localStorage.setItem(PLAYGROUND_LAYOUT_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const handleFontSizeChange = useCallback((next: number) => {
    setFontSize(next)
    try {
      window.localStorage.setItem(PLAYGROUND_FONT_SIZE_STORAGE_KEY, String(next))
    } catch {
      /* ignore */
    }
  }, [])

  // Editor only uses an explicit pixel height when not maximized; when maximized, CSS flex chain handles it.
  const paneHeight = layout === "vertical" ? Math.max(180, height / 2) : height

  const handleMaximizeToggle = useCallback(() => {
    const next = !maximized
    if (next) setConsoleOpen(false)
    if (onMaximizeChangeRef.current) {
      onMaximizeChangeRef.current(next)
    } else {
      setInternalMaximized(next)
    }
  }, [maximized])

  useEffect(() => {
    if (!maximized) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onMaximizeChangeRef.current) {
          onMaximizeChangeRef.current(false)
        } else {
          setInternalMaximized(false)
        }
      }
    }

    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
      setObjectivesOpen(false)
    }
  }, [maximized])

  // appTheme intentionally excluded — ThemeSync handles CSS updates imperatively
  // getSavedCode intentionally excluded — initial snapshot only, updates via CodeSync
  const initialFiles = useMemo(() => {
    const baseFiles: SandpackFiles = {
      [THEME_FILE_NAME]: { code: buildStyles(appTheme), hidden: true },
      ...files,
    }

    if (enablePersistence && exerciseId) {
      const savedCode = getSavedCode(exerciseId)
      if (savedCode) {
        Object.entries(savedCode).forEach(([path, code]) => {
          if (baseFiles[path]) {
            baseFiles[path] = { code }
          }
        })
      }
    }

    return baseFiles
  }, [files, exerciseId, enablePersistence]) // eslint-disable-line react-hooks/exhaustive-deps

  const themeWithFont = useMemo(() => {
    const base = getSandpackTheme(editorTheme, appTheme)
    if (typeof base === "string") return base
    return {
      ...base,
      font: { ...base.font, size: `${fontSize}px` },
    }
  }, [editorTheme, appTheme, fontSize])

  const editorPaneStyle = useMemo(() => {
    if (maximized) {
      return layout === "vertical"
        ? FLEX_PANE_STRETCH_STYLE
        : {
            flex: "65 65 0%",
            minHeight: 0,
            minWidth: 0,
            height: "100%",
            alignSelf: "stretch",
          }
    }
    return layout === "vertical"
      ? { height: paneHeight, width: "100%", flex: "none" as const }
      : { height: paneHeight, flex: "65 65 0%" }
  }, [maximized, layout, paneHeight])

  const previewPaneStyle = useMemo(() => {
    if (maximized) {
      return layout === "vertical"
        ? FLEX_PANE_STRETCH_STYLE
        : {
            flex: "35 35 0%",
            minHeight: 0,
            minWidth: 0,
            height: "100%",
            alignSelf: "stretch",
          }
    }
    return layout === "vertical"
      ? { height: paneHeight, width: "100%", flex: "none" as const }
      : { height: paneHeight, flex: "35 35 0%" }
  }, [maximized, layout, paneHeight])

  const sandpackLayoutStyle = useMemo(
    () => ({
      flexDirection: layout === "vertical" ? ("column" as const) : ("row" as const),
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      ...(maximized
        ? {
            flex: "1 1 0%",
            minHeight: 0,
            minWidth: 0,
            height: "100%",
            width: "100%",
            overflow: "hidden" as const,
          }
        : {}),
    }),
    [layout, maximized]
  )

  if (!isPlaygroundClient) {
    return (
      <div className="relative my-2" style={{ minHeight: height }}>
        <div
          aria-busy="true"
          className="border-line bg-bg-raise animate-pulse rounded-lg border"
          style={{ height }}
        />
      </div>
    )
  }

  // data-playground-root: scopes keyboard shortcuts (Cmd+S, Cmd+Shift+F, Cmd+Enter)
  // to fire only when focus is inside this playground.
  const playgroundTree = (
    <div
      data-playground-root=""
      {...(maximized ? { "data-maximized": "", "data-playground-layout": layout } : {})}
      className={
        maximized
          ? "bg-bg fixed top-12 right-0 bottom-0 left-0 flex min-h-0 max-w-none flex-col overflow-hidden p-0"
          : "border-line-strong relative my-2 overflow-hidden rounded-lg border shadow-[0_2px_16px_rgba(0,0,0,0.18)]"
      }
      style={maximized ? { zIndex: PLAYGROUND_MAXIMIZED_Z_INDEX } : undefined}
    >
      <div
        className={
          maximized
            ? "playground-shell flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden"
            : ""
        }
      >
        <SandpackProvider
          template={template}
          theme={themeWithFont}
          files={initialFiles}
          customSetup={dependencies ? { dependencies } : undefined}
        >
          <ThemeSync appTheme={appTheme} />
          {enablePersistence && exerciseId && (
            <CodeSync exerciseId={exerciseId} onStateChange={setSaveState} />
          )}
          <PlaygroundToolbar
            layout={layout}
            onLayoutChange={handleLayoutChange}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            maximized={maximized}
            onMaximizeToggle={handleMaximizeToggle}
            saveState={saveState}
            starterFiles={files}
            enableReset={enablePersistence === true && Boolean(exerciseId)}
            showSolution={showSolution}
            onSolutionToggle={onSolutionToggle}
          />
          <div className={maximized ? "flex min-h-0 min-w-0 flex-1 basis-0 flex-col" : ""}>
            <SandpackLayout style={sandpackLayoutStyle}>
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                showTabs={Object.keys(files).length > 1}
                style={editorPaneStyle}
              />
              <SandpackStack className="min-h-0 min-w-0" style={previewPaneStyle}>
                {objectives && objectives.length > 0 && objectivesOpen && (
                  <div
                    className="absolute inset-x-2 z-30 max-h-[60%] overflow-y-auto overscroll-contain rounded-xl shadow-2xl"
                    style={{
                      bottom:
                        PLAYGROUND_PREVIEW_ACTION_BUTTON_PX +
                        16 +
                        (consoleOpen ? CONSOLE_PANEL_PX : 0),
                    }}
                  >
                    <div className="bg-bg-raise overflow-hidden rounded-xl">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ListChecks size={12} className="text-fg-dim" strokeWidth={2} />
                          <span className="text-fg-dim text-[10px] font-semibold tracking-[0.16em] uppercase">
                            {t("objectives")}
                          </span>
                        </div>
                        <button
                          onClick={() => setObjectivesOpen(false)}
                          type="button"
                          className="text-fg-faint hover:text-fg-muted -mr-1 rounded p-1 transition-colors"
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>
                      <div className="bg-line h-px" />
                      <ol className="space-y-3 px-4 py-3">
                        {objectives.map((o, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="bg-bg-hover text-fg-dim mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px]">
                              {i + 1}
                            </span>
                            <span className="text-fg-muted text-[13px] leading-[1.55]">
                              {renderObjective(o)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
                <SandpackPreview
                  showNavigator={false}
                  showRefreshButton
                  showOpenInCodeSandbox={false}
                  style={PREVIEW_NESTED_STYLE}
                  actionsChildren={
                    <>
                      {objectives && objectives.length > 0 && (
                        <button
                          onClick={() => setObjectivesOpen((v) => !v)}
                          title={t("objectives")}
                          type="button"
                          style={{
                            appearance: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: PLAYGROUND_PREVIEW_ACTION_BUTTON_PX,
                            height: PLAYGROUND_PREVIEW_ACTION_BUTTON_PX,
                            padding: 0,
                            cursor: "pointer",
                            border: "1px solid var(--sp-colors-surface3)",
                            borderRadius: 9999,
                            backgroundColor: "var(--sp-colors-surface2)",
                            color: objectivesOpen
                              ? "var(--sp-colors-accent)"
                              : "var(--sp-colors-clickable)",
                            transition: "color 0.15s",
                          }}
                        >
                          <ListChecks size={PLAYGROUND_PREVIEW_ACTION_ICON_PX} strokeWidth={1.85} />
                        </button>
                      )}
                      <button
                        onClick={() => setConsoleOpen((v) => !v)}
                        title={consoleOpen ? t("closeTerminal") : t("openTerminal")}
                        type="button"
                        style={{
                          appearance: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: PLAYGROUND_PREVIEW_ACTION_BUTTON_PX,
                          height: PLAYGROUND_PREVIEW_ACTION_BUTTON_PX,
                          padding: 0,
                          cursor: "pointer",
                          border: "1px solid var(--sp-colors-surface3)",
                          borderRadius: 9999,
                          backgroundColor: "var(--sp-colors-surface2)",
                          color: consoleOpen
                            ? "var(--sp-colors-accent)"
                            : "var(--sp-colors-clickable)",
                          transition: "color 0.15s",
                        }}
                      >
                        <TerminalIcon size={PLAYGROUND_PREVIEW_ACTION_ICON_PX} strokeWidth={1.85} />
                      </button>
                    </>
                  }
                />
                {consoleOpen ? (
                  <SandpackConsole style={{ flexShrink: 0, height: CONSOLE_PANEL_PX }} />
                ) : null}
              </SandpackStack>
            </SandpackLayout>
          </div>
        </SandpackProvider>
      </div>
    </div>
  )

  if (maximized) {
    const portalHost =
      typeof document !== "undefined"
        ? document.getElementById(PLAYGROUND_MAXIMIZED_PORTAL_ELEMENT_ID)
        : null
    return createPortal(playgroundTree, portalHost ?? document.body)
  }

  return playgroundTree
}
