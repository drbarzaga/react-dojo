"use client"

import { diffLines } from "diff"
import type { SandpackFiles } from "@codesandbox/sandpack-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface DiffViewerProps {
  before: SandpackFiles
  after: SandpackFiles
}

function getCode(files: SandpackFiles, path: string): string {
  const entry = files[path]
  if (!entry) return ""
  return typeof entry === "string" ? entry : entry.code
}

export function DiffViewer({ before, after }: DiffViewerProps) {
  const filePaths = Object.keys(after)
  const [activeFile, setActiveFile] = useState(filePaths[0] ?? "")

  if (filePaths.length === 0) return null

  const beforeCode = getCode(before, activeFile)
  const afterCode = getCode(after, activeFile)
  const hunks = diffLines(beforeCode, afterCode)

  let lineNumber = 1

  return (
    <div className="border-line overflow-hidden rounded-lg border text-[13px]">
      {/* File tabs */}
      {filePaths.length > 1 && (
        <div className="border-line bg-surface-1 flex gap-1 overflow-x-auto border-b px-2 pt-2">
          {filePaths.map((path) => (
            <button
              key={path}
              onClick={() => setActiveFile(path)}
              className={cn(
                "rounded-t px-3 py-1.5 font-mono text-[11px] transition-colors",
                activeFile === path ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
              )}
            >
              {path.replace(/^\//, "")}
            </button>
          ))}
        </div>
      )}

      {/* Diff header */}
      <div className="border-line bg-surface-1 flex items-center justify-between border-b px-4 py-2">
        <span className="text-fg-dim font-mono text-[11px] tracking-[0.1em] uppercase">
          {filePaths.length === 1 ? activeFile.replace(/^\//, "") : "diff"}
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <span className="inline-block h-2 w-2 rounded-sm bg-green-500/40" />
            added
          </span>
          <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-500/40" />
            removed
          </span>
        </div>
      </div>

      {/* Diff lines */}
      <div className="bg-surface overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {hunks.map((hunk, hunkIndex) => {
              const lines = hunk.value.split("\n")
              // Remove trailing empty string from split
              if (lines[lines.length - 1] === "") lines.pop()

              return lines.map((line, lineIndex) => {
                const isAdded = hunk.added === true
                const isRemoved = hunk.removed === true
                const currentLine = lineNumber
                if (!isRemoved) lineNumber++

                return (
                  <tr
                    key={`${hunkIndex}-${lineIndex}`}
                    className={cn(
                      "group",
                      isAdded && "bg-green-500/8 dark:bg-green-500/10",
                      isRemoved && "bg-red-500/8 dark:bg-red-500/10"
                    )}
                  >
                    {/* Line number */}
                    <td
                      className={cn(
                        "border-line w-10 border-r px-3 py-px text-right font-mono text-[11px] leading-5 select-none",
                        isAdded
                          ? "text-green-600/60 dark:text-green-400/50"
                          : isRemoved
                            ? "text-red-500/60 dark:text-red-400/50"
                            : "text-fg-faint"
                      )}
                    >
                      {isRemoved ? "" : currentLine}
                    </td>
                    {/* Prefix (+/-/ ) */}
                    <td
                      className={cn(
                        "w-5 px-1 py-px text-center font-mono text-[11px] leading-5 select-none",
                        isAdded
                          ? "text-green-600 dark:text-green-400"
                          : isRemoved
                            ? "text-red-500 dark:text-red-400"
                            : "text-fg-faint"
                      )}
                    >
                      {isAdded ? "+" : isRemoved ? "−" : " "}
                    </td>
                    {/* Code */}
                    <td
                      className={cn(
                        "w-full px-3 py-px font-mono text-[12px] leading-5 whitespace-pre",
                        isAdded
                          ? "text-green-800 dark:text-green-200"
                          : isRemoved
                            ? "text-red-700 dark:text-red-300"
                            : "text-fg-muted"
                      )}
                    >
                      {line || " "}
                    </td>
                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
