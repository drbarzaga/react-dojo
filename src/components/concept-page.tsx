"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { TriangleAlert } from "lucide-react"
import { type Concept } from "@/content/concepts"
import { useProgress } from "@/hooks/use-progress"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useKeyboardNav } from "@/hooks/use-keyboard-nav"
import { useContent } from "@/providers/content-provider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FeedbackWidget } from "@/components/feedback-widget"

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
          className="border-[var(--color-line-strong)] font-mono text-[11px] tracking-widest text-[var(--color-fg-dim)]"
        >
          {concept.kicker}
        </Badge>
      </div>

      <h1 className="font-mono text-[32px] leading-none font-medium text-[var(--color-fg)]">
        {concept.label}
      </h1>

      <p className="mt-3 text-[15px] font-medium text-[var(--color-fg-muted)]">{concept.title}</p>

      <p className="mt-6 text-[17px] leading-[1.65] text-[var(--color-fg-muted)]">{concept.lede}</p>

      <Separator className="mt-12 bg-[var(--color-line)]" />

      <div className="mt-10 space-y-10">
        {concept.sections.map((s, i) => (
          <section key={i}>
            {s.heading && (
              <h2 className="mb-3 text-[13px] font-semibold tracking-[0.1em] text-[var(--color-fg)] uppercase">
                {s.heading}
              </h2>
            )}
            <div className="prose">{s.body}</div>
          </section>
        ))}
      </div>

      <div className="-mx-8 mt-12 md:-mx-12 lg:-mx-24">{concept.playground}</div>

      {concept.pitfalls && concept.pitfalls.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-[var(--color-fg-dim)] uppercase">
            <TriangleAlert className="h-[13px] w-[13px] text-yellow-400" strokeWidth={2} />
            {t("pitfalls")}
          </h2>
          <ul className="overflow-hidden rounded-lg border border-[var(--color-line)]">
            {concept.pitfalls.map((p, i) => (
              <li
                key={i}
                className="flex gap-4 px-5 py-4 text-[14px] leading-[1.65] text-[var(--color-fg-muted)] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[var(--color-line)]"
              >
                <span className="mt-[1px] w-4 shrink-0 text-right font-mono text-[11px] text-[var(--color-fg-faint)]">
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
        className="mt-12 flex items-start justify-between gap-8 border-t border-[var(--color-line)] pt-8 text-[14px]"
      >
        {prev ? (
          <a
            href={href(`/${prev.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/${prev.id}`)
            }}
            className="group flex flex-col gap-1 text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            <span className="text-[12px] text-[var(--color-fg-dim)]">{t("prev")}</span>
            <span className="font-mono text-[var(--color-fg)]">{prev.label}</span>
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
            className="group flex flex-col items-end gap-1 text-right text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            <span className="text-[12px] text-[var(--color-fg-dim)]">{t("next")}</span>
            <span className="font-mono text-[var(--color-fg)]">{next.label}</span>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
