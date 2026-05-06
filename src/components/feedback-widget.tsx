"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"

const REACTION_EMOJIS = ["😭", "😕", "🙂", "🤩"] as const

interface FeedbackWidgetProps {
  contentType: "concept" | "exercise" | "quiz" | "hook"
  contentId: string
}

export function FeedbackWidget({ contentType, contentId }: FeedbackWidgetProps) {
  const t = useTranslations("FeedbackWidget")
  const [reaction, setReaction] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (reaction !== null) textareaRef.current?.focus()
  }, [reaction])

  useEffect(() => {
    if (reaction === null || confirming) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReaction(null)
        setComment("")
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [reaction, confirming])

  const handleSubmit = async () => {
    if (reaction === null || submitting) return
    setSubmitting(true)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          id: contentId,
          reaction,
          comment: comment.trim() || undefined,
        }),
      })
      setConfirming(true)
      setTimeout(() => {
        setConfirming(false)
        setReaction(null)
        setComment("")
      }, 2500)
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="mt-12 flex justify-center">
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="flex items-center justify-center gap-1 px-5 py-3">
          <span className="mr-2 shrink-0 text-[13px] text-[var(--color-fg-muted)]">
            {t("label")}
          </span>
          <TooltipProvider delay={300}>
            {REACTION_EMOJIS.map((emoji, i) => {
              const value = i + 1
              const isSelected = reaction === value
              const label = t(
                `reaction${value}` as "reaction1" | "reaction2" | "reaction3" | "reaction4"
              )
              return (
                <Tooltip key={value}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => !confirming && setReaction(value)}
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150",
                          confirming ? "cursor-default" : "cursor-pointer",
                          isSelected
                            ? "scale-110 bg-[var(--color-bg-hover)]"
                            : confirming
                              ? ""
                              : "hover:scale-110 hover:bg-[var(--color-bg-hover)]",
                        ].join(" ")}
                      >
                        <span className="text-[20px] leading-none select-none">{emoji}</span>
                      </button>
                    }
                  />
                  <TooltipContent side="top" className="text-[11px]">
                    {label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>

        {confirming && (
          <div className="flex flex-col items-center gap-2 border-t border-[var(--color-line)] px-4 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-[var(--color-fg)]">{t("confirmed")}</p>
            <p className="text-[12px] text-[var(--color-fg-muted)]">{t("confirmedSub")}</p>
          </div>
        )}

        {reaction !== null && !confirming && (
          <>
            <div className="border-t border-[var(--color-line)] p-3">
              <Textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("placeholder")}
                rows={3}
                className="resize-none text-[14px] focus-visible:border-[var(--color-line-strong)] focus-visible:ring-0"
              />
            </div>
            <div className="flex justify-end border-t border-[var(--color-line)] px-4 py-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-[var(--color-fg)] px-4 py-1.5 text-[13px] font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("send")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
