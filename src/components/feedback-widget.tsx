"use client"

import { useState, useEffect, useCallback, startTransition } from "react"
import { useTranslations } from "next-intl"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const REACTION_EMOJIS = ["😭", "😕", "🙂", "🤩"] as const

function storageKey(type: string, id: string) {
  return `rdojo-fb-${type}-${id}`
}

interface FeedbackWidgetProps {
  contentType: "concept" | "exercise" | "quiz" | "hook"
  contentId: string
}

export function FeedbackWidget({ contentType, contentId }: FeedbackWidgetProps) {
  const t = useTranslations("FeedbackWidget")
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [voted, setVoted] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [justVoted, setJustVoted] = useState(false)

  useEffect(() => {
    const key = storageKey(contentType, contentId)
    const stored = localStorage.getItem(key)

    startTransition(() => {
      if (!stored) {
        setVoted(null)
        return
      }
      const reaction = Number(stored)
      setVoted(Number.isFinite(reaction) ? reaction : null)
    })

    fetch(`/api/feedback?type=${contentType}&id=${encodeURIComponent(contentId)}`)
      .then((r) => r.json())
      .then(({ counts: incoming }) => {
        const resolved = incoming ?? {}
        setCounts(resolved)
        const total = Object.values(resolved as Record<number, number>).reduce(
          (s: number, n: number) => s + n,
          0
        )
        if (total === 0 && stored) {
          setVoted(null)
          localStorage.removeItem(storageKey(contentType, contentId))
        }
      })
      .catch(() => {})
  }, [contentType, contentId])

  const handleVote = useCallback(
    async (reaction: number) => {
      if (voted !== null || loading) return
      setLoading(true)
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: contentType, id: contentId, reaction }),
        })
        const { counts } = await res.json()
        setCounts(counts ?? {})
        setVoted(reaction)
        setJustVoted(true)
        localStorage.setItem(storageKey(contentType, contentId), String(reaction))
        setTimeout(() => setJustVoted(false), 2000)
      } catch {}
      setLoading(false)
    },
    [contentType, contentId, voted, loading]
  )

  return (
    <div className="mt-12 flex flex-col items-center gap-3">
      <div
        className={[
          "flex items-center gap-1 rounded-full border px-5 py-2.5 transition-all duration-300",
          voted !== null
            ? "gap-3 border-[var(--color-line-strong)] bg-[var(--color-bg-raise)]"
            : "border-[var(--color-line)] bg-[var(--color-bg)]",
        ].join(" ")}
      >
        <span className="mr-2 shrink-0 text-[13px] text-[var(--color-fg-muted)]">
          {justVoted ? t("thanks") : t("label")}
        </span>

        <TooltipProvider delay={300}>
          {REACTION_EMOJIS.map((emoji, i) => {
            const value = i + 1
            const isSelected = voted === value
            const reactionCount = counts[value] ?? 0
            const label = t(
              `reaction${value}` as "reaction1" | "reaction2" | "reaction3" | "reaction4"
            )

            return (
              <Tooltip key={value}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => handleVote(value)}
                      disabled={voted !== null || loading}
                      className={[
                        "flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-all duration-150",
                        voted === null ? "cursor-pointer hover:scale-125" : "cursor-default",
                        isSelected
                          ? "scale-110 bg-[var(--color-bg-hover)]"
                          : voted !== null
                            ? "opacity-40"
                            : "",
                      ].join(" ")}
                    >
                      <span className="text-[20px] leading-none select-none">{emoji}</span>
                      {voted !== null && (
                        <span
                          className={[
                            "font-mono text-[11px] tabular-nums transition-all",
                            isSelected ? "text-[var(--color-fg)]" : "text-[var(--color-fg-dim)]",
                          ].join(" ")}
                        >
                          {reactionCount}
                        </span>
                      )}
                    </button>
                  }
                />
                {voted === null && (
                  <TooltipContent side="top" className="text-[11px]">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>
    </div>
  )
}
