import type { ReactNode } from "react"

export function renderObjective(text: string): ReactNode {
  // Match single-quoted ('value') and backtick-quoted (`value`) segments
  const parts = text.split(/('(?:[^']+)'|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (
      (part.startsWith("'") && part.endsWith("'") && part.length > 2) ||
      (part.startsWith("`") && part.endsWith("`") && part.length > 2)
    ) {
      const inner = part.slice(1, -1)
      return (
        <code key={i} className="bg-bg-hover text-fg rounded px-1 py-px font-mono text-[12px]">
          {inner}
        </code>
      )
    }
    return part
  })
}
