"use client"

import { FeedbackWidget } from "@/components/feedback-widget"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Concept } from "@/content/concepts"
import { useKeyboardNav } from "@/hooks/use-keyboard-nav"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useProgress } from "@/hooks/use-progress"
import { useContent } from "@/providers/content-provider"
import { TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"

interface ConceptPageProps {
  concept: Concept
  prev?: Concept
  next?: Concept
}

export function ConceptPage({ concept, prev, next }: ConceptPageProps) {
  const t = useTranslations("ConceptPage")
  const { push, href } = useLocaleRouter()
  const { markConceptVisited } = useProgress()
  const { allExercises } = useContent()
  const bottomRef = useRef<HTMLElement>(null)
  useKeyboardNav({
    prev: prev && `/${prev.id}`,
    next: next && `/${next.id}`,
    nextFallback: `/learn/${allExercises[0]?.id}`,
  })

  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markConceptVisited(concept.id)
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [concept.id, markConceptVisited])

  return (
    <article className="mx-auto max-w-[1000px] px-5 py-10 md:px-12 md:py-20">
      <div className="mb-4">
        <Badge
          variant="outline"
          className="border-line bg-bg text-fg-dim font-mono text-[11px] tracking-widest"
        >
          {concept.kicker}
        </Badge>
      </div>

      <h1 className="text-fg font-mono text-[32px] leading-none font-medium">{concept.label}</h1>

      <p className="text-fg-muted mt-3 text-[15px] font-medium">{concept.title}</p>

      <p className="text-fg-muted mt-6 text-[17px] leading-[1.65]">{concept.lede}</p>

      <Separator className="border-line mt-12" />

      <div className="mt-10 space-y-10">
        {concept.sections.map((s, i) =>
          s.heading ? (
            <section key={i}>
              <h2 className="text-fg mb-3 text-[13px] font-semibold tracking-widest uppercase">
                {s.heading}
              </h2>
              <div className="prose">{s.body}</div>
            </section>
          ) : (
            <section key={i} className="-mx-5 overflow-hidden md:-mx-12">
              {s.body}
            </section>
          )
        )}
      </div>

      <div className="-mx-8 mt-12 md:-mx-12 lg:-mx-24">{concept.playground}</div>

      {concept.pitfalls && concept.pitfalls.length > 0 && (
        <section className="mt-14">
          <h2 className="text-fg-dim mb-4 flex items-center gap-1.5 text-[11px] tracking-widest uppercase">
            <TriangleAlert className="size-[13px] text-yellow-400" strokeWidth={2} />
            {t("pitfalls")}
          </h2>
          <ul className="border-line overflow-hidden rounded-lg border">
            {concept.pitfalls.map((p, i) => (
              <li
                key={i}
                className="border-line text-fg-muted flex gap-4 border-b px-5 py-4 text-[14px] leading-[1.65]"
              >
                <span className="text-fg-faint mt-px w-4 shrink-0 text-right font-mono text-[11px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FeedbackWidget contentType="concept" contentId={concept.id} />

      <nav
        ref={bottomRef}
        className="border-line mt-12 flex items-start justify-between gap-8 border-t pt-8 text-[14px]"
      >
        {prev ? (
          <a
            href={href(`/${prev.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/${prev.id}`)
            }}
            className="group text-fg-muted hover:text-fg flex flex-col gap-1 transition-colors"
          >
            <span className="text-fg-dim text-[12px]">{t("prev")}</span>
            <span className="text-fg font-mono">{prev.label}</span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a
            href={href(`/${next.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/${next.id}`)
            }}
            className="group text-fg-muted hover:text-fg flex flex-col items-end gap-1 text-right transition-colors"
          >
            <span className="text-fg-dim text-[12px]">{t("next")}</span>
            <span className="text-fg font-mono">{next.label}</span>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
