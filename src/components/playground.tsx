"use client"

import { useCodePersistence } from "@/hooks/use-code-persistence"
import { useEditorTheme } from "@/hooks/use-editor-theme"
import { useTheme, type Theme } from "@/hooks/use-theme"
import { THEME_FILE_NAME } from "@/lib/constants"
import { type EditorThemeId } from "@/types"
import type { ExerciseFiles } from "@/types/code-persistence"
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
  type SandpackFiles,
  type SandpackPredefinedTemplate,
  type SandpackThemeProp,
} from "@codesandbox/sandpack-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"

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

function TerminalIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

// Auto-saves user code to localStorage when files change
function CodeSync({ exerciseId }: { exerciseId: string }) {
  const { sandpack } = useSandpack()
  const { saveCode } = useCodePersistence()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const codeRef = useRef<ExerciseFiles | null>(null)

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

    // Content changed: update ref and reset debounce
    codeRef.current = next
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveCode(exerciseId, codeRef.current!)
      timerRef.current = null
    }, 750)
    // No cleanup return — timer must survive reference-only re-renders of sandpack.files
  }, [sandpack.files, exerciseId, saveCode])

  // Flush any pending save on unmount so navigating away doesn't lose code
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        if (codeRef.current) saveCode(exerciseId, codeRef.current)
      }
    }
  }, [exerciseId, saveCode])

  return null
}

// ─── Playground ───────────────────────────────────────────────────────────────

interface PlaygroundProps {
  files: SandpackFiles
  template?: SandpackPredefinedTemplate
  showConsole?: boolean
  height?: number
  dependencies?: Record<string, string>
  exerciseId?: string
  enablePersistence?: boolean
}

export function Playground({
  files,
  template = "react",
  showConsole = false,
  height = 650,
  dependencies,
  exerciseId,
  enablePersistence = false,
}: PlaygroundProps) {
  const t = useTranslations("Playground")
  const { theme: appTheme } = useTheme()
  const { editorTheme } = useEditorTheme()
  const { getSavedCode } = useCodePersistence()

  const [maximized, setMaximized] = useState(false)
  const [consoleOpen, setConsoleOpen] = useState(showConsole)
  const [windowHeight, setWindowHeight] = useState(0)
  const editorHeight = maximized && windowHeight > 0 ? windowHeight - 48 - 40 - 64 : height

  useEffect(() => {
    if (!maximized) return

    const updateHeight = () => setWindowHeight(window.innerHeight)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMaximized(false)
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("resize", updateHeight)
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
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

  return (
    <div
      className={
        maximized
          ? "bg-bg fixed top-12 right-0 bottom-10 left-0 z-50 flex flex-col p-4 md:left-[240px]"
          : "relative my-2"
      }
    >
      <div className="mb-1.5 flex items-center justify-end">
        <button
          onClick={() => setMaximized((v) => !v)}
          className="text-fg-dim hover:text-fg flex cursor-pointer items-center gap-1.5 text-[11px] transition-colors"
          aria-label={maximized ? t("minimizeLabel") : t("maximizeLabel")}
        >
          <span className="capitalize">{maximized ? t("minimize") : t("maximize")}</span>
          <span aria-hidden className="text-[13px] leading-none">
            {maximized ? "⤡" : "⤢"}
          </span>
        </button>
      </div>

      <div className={maximized ? "min-h-0 flex-1" : ""}>
        <SandpackProvider
          template={template}
          theme={getSandpackTheme(editorTheme, appTheme)}
          files={initialFiles}
          customSetup={dependencies ? { dependencies } : undefined}
        >
          <ThemeSync appTheme={appTheme} />
          {enablePersistence && exerciseId && <CodeSync exerciseId={exerciseId} />}
          <SandpackLayout>
            <SandpackCodeEditor
              showLineNumbers
              showInlineErrors
              showTabs={Object.keys(files).length > 1}
              style={{ height: editorHeight, flex: "65 65 0%" }}
            />
            <SandpackPreview
              showOpenInCodeSandbox={false}
              style={{ height: editorHeight, flex: "35 35 0%" }}
              actionsChildren={
                <button
                  onClick={() => setConsoleOpen((v) => !v)}
                  title={consoleOpen ? t("closeTerminal") : t("openTerminal")}
                  type="button"
                  style={{
                    appearance: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    padding: 0,
                    cursor: "pointer",
                    border: "1px solid var(--sp-colors-surface3)",
                    borderRadius: 9999,
                    backgroundColor: "var(--sp-colors-surface2)",
                    color: consoleOpen ? "var(--sp-colors-accent)" : "var(--sp-colors-clickable)",
                    transition: "color 0.15s",
                  }}
                >
                  <TerminalIcon />
                </button>
              }
            />
          </SandpackLayout>
          {consoleOpen && <SandpackConsole style={{ height: 200 }} />}
        </SandpackProvider>
      </div>
    </div>
  )
}
