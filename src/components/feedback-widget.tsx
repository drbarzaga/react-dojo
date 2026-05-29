"use client"

import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { authClient, useSession } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

import { REACTION_SLUGS } from "@/db/schema"

const REACTION_EMOJIS = ["😭", "😕", "🙂", "🤩"] as const

interface Participant {
  name: string
  image: string | null
  username: string | null
}

interface FeedbackWidgetProps {
  contentType: "concept" | "exercise" | "quiz" | "hook"
  contentId: string
}

export function FeedbackWidget({ contentType, contentId }: FeedbackWidgetProps) {
  const t = useTranslations("FeedbackWidget")
  const { data: session } = useSession()
  const [reaction, setReaction] = useState<(typeof REACTION_SLUGS)[number] | null>(null)
  const [comment, setComment] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [total, setTotal] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadParticipants = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/feedback?type=${encodeURIComponent(contentType)}&id=${encodeURIComponent(contentId)}`
      )
      if (!res.ok) return
      const data = await res.json()
      setParticipants(data.participants ?? [])
      setTotal(data.total ?? 0)
    } catch {}
  }, [contentType, contentId])

  useEffect(() => {
    // Fetch on mount; setState runs after the awaited fetch, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadParticipants()
  }, [loadParticipants])

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

  const handleReactionClick = (slug: (typeof REACTION_SLUGS)[number]) => {
    if (confirming) return
    // Feedback requires a signed-in user — send them to sign in first.
    if (!session) {
      authClient.signIn.social({ provider: "github" })
      return
    }
    setReaction(slug)
  }

  const handleSubmit = async () => {
    if (reaction === null || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          id: contentId,
          reaction,
          comment: comment.trim() || undefined,
        }),
      })
      if (res.ok) {
        setConfirming(true)
        loadParticipants()
        setTimeout(() => {
          setConfirming(false)
          setReaction(null)
          setComment("")
        }, 2500)
      }
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="mt-12 flex justify-center">
      <div className="border-line bg-bg w-full max-w-sm overflow-hidden rounded-xl border">
        <div className="flex items-center justify-center gap-1 px-5 py-3">
          <span className="text-fg-muted mr-2 shrink-0 text-[13px]">{t("label")}</span>
          <TooltipProvider delay={300}>
            {REACTION_EMOJIS.map((emoji, i) => {
              const slug = REACTION_SLUGS[i]
              const isSelected = reaction === slug
              const label = t(
                `reaction${i + 1}` as "reaction1" | "reaction2" | "reaction3" | "reaction4"
              )
              return (
                <Tooltip key={slug}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => handleReactionClick(slug)}
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150",
                          confirming ? "cursor-default" : "cursor-pointer",
                          isSelected
                            ? "bg-bg-hover scale-110"
                            : confirming
                              ? ""
                              : "hover:bg-bg-hover hover:scale-110",
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

        {/* Who gave feedback — stacked avatars */}
        {total > 0 && (
          <div className="border-line flex items-center justify-center gap-2 border-t px-4 py-2.5">
            <div className="flex -space-x-2">
              {participants.map((p, i) => (
                <ParticipantAvatar key={`${p.username ?? p.name}-${i}`} participant={p} />
              ))}
            </div>
            <span className="text-fg-dim text-[11px]">
              {total > participants.length && `+${total - participants.length} · `}
              {t("gaveFeedback", { count: total })}
            </span>
          </div>
        )}

        {!session && total === 0 && (
          <div className="border-line border-t px-4 py-2.5 text-center">
            <span className="text-fg-dim text-[11px]">{t("signInToVote")}</span>
          </div>
        )}

        {confirming && (
          <div className="border-line flex flex-col items-center gap-2 border-t px-4 py-6 text-center">
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
            <p className="text-fg text-[13px] font-medium">{t("confirmed")}</p>
            <p className="text-fg-muted text-[12px]">{t("confirmedSub")}</p>
          </div>
        )}

        {reaction !== null && !confirming && (
          <>
            <div className="border-line border-t p-3">
              <Textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("placeholder")}
                rows={3}
                className="focus-visible:border-line-strong resize-none text-[14px] focus-visible:ring-0"
              />
            </div>
            <div className="border-line flex justify-end border-t px-4 py-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-fg text-bg rounded-md px-4 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
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

function ParticipantAvatar({ participant }: { participant: Participant }) {
  const ring = "ring-2 ring-bg"
  return participant.image ? (
    <Image
      src={participant.image}
      alt={participant.name}
      title={participant.name}
      width={24}
      height={24}
      className={`h-6 w-6 rounded-full ${ring}`}
    />
  ) : (
    <div
      title={participant.name}
      className={`bg-bg-raise text-fg-muted flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold ${ring}`}
    >
      {participant.name[0]?.toUpperCase()}
    </div>
  )
}
