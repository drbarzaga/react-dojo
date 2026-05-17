"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCode } from "@/lib/format-code"
import {
  PLAYGROUND_FLUSH_SAVE_EVENT,
  PLAYGROUND_FONT_SIZE_MAX_PX,
  PLAYGROUND_FONT_SIZE_MIN_PX,
  PLAYGROUND_FONT_SIZE_STEP_PX,
  PLAYGROUND_RESET_CONFIRM_DURATION_MS,
  PLAYGROUND_ROOT_ATTR,
  THEME_FILE_NAME,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { type PlaygroundLayout, type PlaygroundSaveState } from "@/types"
import { useSandpack, type SandpackFiles } from "@codesandbox/sandpack-react"
import {
  Check,
  Columns2,
  Copy,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Rows2,
  Sparkles,
  Undo2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useRef, useState } from "react"

interface PlaygroundToolbarProps {
  layout: PlaygroundLayout
  onLayoutChange: (layout: PlaygroundLayout) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  maximized: boolean
  onMaximizeToggle: () => void
  saveState: PlaygroundSaveState
  starterFiles: SandpackFiles
  enableReset: boolean
  showSolution?: boolean
  onSolutionToggle?: () => void
}

export function PlaygroundToolbar({
  layout,
  onLayoutChange,
  fontSize,
  onFontSizeChange,
  maximized,
  onMaximizeToggle,
  saveState,
  starterFiles,
  enableReset,
  showSolution,
  onSolutionToggle,
}: PlaygroundToolbarProps) {
  const t = useTranslations("Playground")
  const tEx = useTranslations("ExercisePage")
  const { sandpack } = useSandpack()
  const [copied, setCopied] = useState(false)
  const [formatted, setFormatted] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!confirmReset) return
    confirmTimerRef.current = setTimeout(
      () => setConfirmReset(false),
      PLAYGROUND_RESET_CONFIRM_DURATION_MS
    )
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    }
  }, [confirmReset])

  const handleCopy = useCallback(async () => {
    const code = sandpack.files[sandpack.activeFile]?.code ?? ""
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.warn("[playground] copy failed:", error)
    }
  }, [sandpack])

  const handleFormat = useCallback(async () => {
    const path = sandpack.activeFile
    const code = sandpack.files[path]?.code ?? ""
    const next = await formatCode(code, path)
    if (next && next !== code) {
      sandpack.updateFile(path, next)
      setFormatted(true)
      setTimeout(() => setFormatted(false), 1500)
    }
  }, [sandpack])

  const handleReset = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    Object.entries(starterFiles).forEach(([path, file]) => {
      if (path === THEME_FILE_NAME) return
      const code = typeof file === "string" ? file : file.code
      if (typeof code === "string") sandpack.updateFile(path, code)
    })
    setConfirmReset(false)
  }, [confirmReset, sandpack, starterFiles])

  const decreaseFont = useCallback(() => {
    const next = Math.max(PLAYGROUND_FONT_SIZE_MIN_PX, fontSize - PLAYGROUND_FONT_SIZE_STEP_PX)
    onFontSizeChange(Number(next.toFixed(1)))
  }, [fontSize, onFontSizeChange])

  const increaseFont = useCallback(() => {
    const next = Math.min(PLAYGROUND_FONT_SIZE_MAX_PX, fontSize + PLAYGROUND_FONT_SIZE_STEP_PX)
    onFontSizeChange(Number(next.toFixed(1)))
  }, [fontSize, onFontSizeChange])

  // Keyboard shortcuts — only fire when focus is inside this playground
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      const target = event.target as HTMLElement | null
      if (!target?.closest(`[${PLAYGROUND_ROOT_ATTR}]`)) return

      // Cmd+S — flush save and flash indicator
      if (event.key === "s" && !event.shiftKey) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(PLAYGROUND_FLUSH_SAVE_EVENT))
        return
      }

      // Cmd+Shift+F — format
      if ((event.key === "f" || event.key === "F") && event.shiftKey) {
        event.preventDefault()
        handleFormat()
        return
      }

      // Cmd+Enter — refresh preview
      if (event.key === "Enter") {
        event.preventDefault()
        sandpack.runSandpack()
        return
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleFormat, sandpack])

  return (
    <TooltipProvider delay={300}>
      <div
        className={cn(
          "border-line bg-bg-raise flex h-9 shrink-0 items-center justify-between gap-2 border-b px-2"
        )}
      >
        <div className="flex items-center gap-1">
          <SaveIndicator state={saveState} t={t} />
          {onSolutionToggle && maximized && (
            <>
              <Separator />
              <ToolbarButton
                label={showSolution ? tEx("backToStarter") : tEx("viewSolution")}
                tooltip={showSolution ? tEx("backToStarter") : tEx("viewSolution")}
                icon={showSolution ? EyeOff : Eye}
                onClick={onSolutionToggle}
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            label={copied ? t("copied") : t("copy")}
            tooltip={t("copyTooltip")}
            icon={copied ? Check : Copy}
            iconActive={copied}
            onClick={handleCopy}
          />
          <ToolbarButton
            label={formatted ? t("formatted") : t("format")}
            tooltip={t("formatTooltip")}
            icon={Sparkles}
            iconActive={formatted}
            onClick={handleFormat}
          />
          {enableReset && (
            <ToolbarButton
              label={confirmReset ? t("resetConfirm") : t("reset")}
              tooltip={t("resetTooltip")}
              icon={Undo2}
              iconActive={confirmReset}
              destructive={confirmReset}
              onClick={handleReset}
            />
          )}

          <Separator />

          <FontSizeControl
            fontSize={fontSize}
            onDecrease={decreaseFont}
            onIncrease={increaseFont}
            decreaseLabel={t("fontDecrease")}
            increaseLabel={t("fontIncrease")}
          />

          <Separator />

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() =>
                    onLayoutChange(layout === "horizontal" ? "vertical" : "horizontal")
                  }
                  aria-label={t("layoutToggle")}
                  className="text-fg-muted hover:text-fg hover:bg-bg-hover grid h-7 w-7 cursor-pointer place-items-center rounded transition-colors"
                >
                  {layout === "horizontal" ? (
                    <Columns2 className="h-[14px] w-[14px]" strokeWidth={1.7} />
                  ) : (
                    <Rows2 className="h-[14px] w-[14px]" strokeWidth={1.7} />
                  )}
                </button>
              }
            />
            <TooltipContent>
              {layout === "horizontal" ? t("layoutVertical") : t("layoutHorizontal")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onMaximizeToggle}
                  aria-label={maximized ? t("minimizeLabel") : t("maximizeLabel")}
                  className="text-fg-muted hover:text-fg hover:bg-bg-hover grid h-7 w-7 cursor-pointer place-items-center rounded transition-colors"
                >
                  {maximized ? (
                    <Minimize2 className="h-[14px] w-[14px]" strokeWidth={1.7} />
                  ) : (
                    <Maximize2 className="h-[14px] w-[14px]" strokeWidth={1.7} />
                  )}
                </button>
              }
            />
            <TooltipContent>{maximized ? t("minimize") : t("maximize")}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface ToolbarButtonProps {
  label: string
  tooltip: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  iconActive?: boolean
  destructive?: boolean
  onClick: () => void
}

function ToolbarButton({
  label,
  tooltip,
  icon: Icon,
  iconActive,
  destructive,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "flex h-7 cursor-pointer items-center gap-1.5 rounded px-2 font-mono text-[11px] transition-colors",
              "hover:bg-bg-hover",
              iconActive && !destructive && "text-emerald-400",
              destructive && "text-rose-400",
              !iconActive && !destructive && "text-fg-muted hover:text-fg"
            )}
          >
            <Icon className="h-[13px] w-[13px]" strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        }
      />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

interface FontSizeControlProps {
  fontSize: number
  onDecrease: () => void
  onIncrease: () => void
  decreaseLabel: string
  increaseLabel: string
}

function FontSizeControl({
  fontSize,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
}: FontSizeControlProps) {
  const atMin = fontSize <= PLAYGROUND_FONT_SIZE_MIN_PX
  const atMax = fontSize >= PLAYGROUND_FONT_SIZE_MAX_PX
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onDecrease}
              disabled={atMin}
              aria-label={decreaseLabel}
              className="text-fg-muted hover:text-fg hover:bg-bg-hover grid h-7 w-6 cursor-pointer place-items-center rounded font-mono text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              A−
            </button>
          }
        />
        <TooltipContent>{decreaseLabel}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onIncrease}
              disabled={atMax}
              aria-label={increaseLabel}
              className="text-fg-muted hover:text-fg hover:bg-bg-hover grid h-7 w-6 cursor-pointer place-items-center rounded font-mono text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              A+
            </button>
          }
        />
        <TooltipContent>{increaseLabel}</TooltipContent>
      </Tooltip>
    </div>
  )
}

function Separator() {
  return <span className="bg-line mx-1 h-4 w-px shrink-0" />
}

function SaveIndicator({
  state,
  t,
}: {
  state: PlaygroundSaveState
  t: ReturnType<typeof useTranslations>
}) {
  if (state === "idle") return <span className="h-4" aria-hidden />
  return (
    <span
      key={state}
      className={cn(
        "text-fg-dim animate-fade-in flex items-center gap-1.5 px-1 font-mono text-[10px] tracking-wider uppercase",
        state === "saved" && "text-emerald-400/80"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          state === "saving" ? "animate-pulse bg-amber-400/80" : "bg-emerald-400/80"
        )}
      />
      {state === "saving" ? t("saving") : t("saved")}
    </span>
  )
}
