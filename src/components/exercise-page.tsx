"use client"

import { useState } from "react"
import { Lightbulb, BookOpen, CheckCircle2, Circle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Playground } from "@/components/playground"
import { cn } from "@/lib/utils"
import type { Exercise, Difficulty } from "@/content/exercises"
import { useProgress } from "@/hooks/use-progress"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useKeyboardNav } from "@/hooks/use-keyboard-nav"
import { useContent } from "@/providers/content-provider"
import { FeedbackWidget } from "@/components/feedback-widget"

interface ExercisePageProps {
  exercise: Exercise
  prev?: Exercise
  next?: Exercise
}

const difficultyColor: Record<Difficulty, string> = {
  basic: "text-[var(--color-fg-dim)]",
  intermediate: "text-[var(--color-fg-muted)]",
  advanced: "text-[var(--color-fg)]",
}

const difficultyKey: Record<
  Difficulty,
  "difficultyBasic" | "difficultyIntermediate" | "difficultyAdvanced"
> = {
  basic: "difficultyBasic",
  intermediate: "difficultyIntermediate",
  advanced: "difficultyAdvanced",
}

export function ExercisePage({ exercise, prev, next }: ExercisePageProps) {
  const t = useTranslations("ExercisePage")
  const { push, href } = useLocaleRouter()
  const [showSolution, setShowSolution] = useState(false)
  const { completedExercises, toggleExerciseCompleted } = useProgress()
  const { allConcepts } = useContent()
  useKeyboardNav({
    prev: prev && `/learn/${prev.id}`,
    next: next && `/learn/${next.id}`,
    prevFallback: `/${allConcepts[allConcepts.length - 1]?.id}`,
  })
  const isCompleted = completedExercises.has(exercise.id)

  return (
    <article className="mx-auto max-w-[1000px] px-5 py-10 md:px-12 md:py-20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] tracking-[0.14em] text-[var(--color-fg-dim)] uppercase">
          <span>{t("practice")}</span>
          <span className="h-px w-4 bg-[var(--color-fg-faint)]" />
          <span className={difficultyColor[exercise.difficulty] ?? "text-[var(--color-fg-dim)]"}>
            {t(difficultyKey[exercise.difficulty])}
          </span>
        </div>
        <button
          onClick={() => toggleExerciseCompleted(exercise.id)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] transition-colors",
            isCompleted
              ? "border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400"
              : "border-[var(--color-line)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-[13px] w-[13px]" strokeWidth={1.8} />
          ) : (
            <Circle className="h-[13px] w-[13px]" strokeWidth={1.8} />
          )}
          {isCompleted ? t("completed") : t("markCompleted")}
        </button>
      </div>

      <h1 className="font-mono text-[32px] leading-none font-medium text-[var(--color-fg)]">
        {exercise.title}
      </h1>

      <p className="mt-6 text-[17px] leading-[1.65] text-[var(--color-fg-muted)]">
        {exercise.lede}
      </p>

      <hr className="mt-12 border-t border-none border-[var(--color-line)]" />

      <section className="mt-10">
        <h2 className="mb-4 text-[11px] tracking-[0.14em] text-[var(--color-fg-dim)] uppercase">
          {t("objectives")}
        </h2>
        <ol className="space-y-2">
          {exercise.objectives.map((o, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[14px] leading-[1.65] text-[var(--color-fg-muted)]"
            >
              <span className="mt-[1px] w-4 shrink-0 text-right font-mono text-[12px] text-[var(--color-fg-faint)]">
                {i + 1}.
              </span>
              <span>{o}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--color-fg-dim)]">
          <span>{showSolution ? t("solution") : t("yourCode")}</span>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowSolution((v) => !v)}
              className={cn(
                "text-[11px] transition-colors",
                showSolution
                  ? "text-[var(--color-fg)]"
                  : "text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
              )}
            >
              {showSolution ? t("backToStarter") : t("viewSolution")}
            </button>
          </div>
        </div>
        <div>
          {showSolution ? (
            <Playground
              key={`${exercise.id}-sol`}
              files={exercise.solution}
              dependencies={exercise.dependencies}
            />
          ) : (
            <Playground
              key={`${exercise.id}-start`}
              files={exercise.starter}
              dependencies={exercise.dependencies}
            />
          )}
        </div>
      </section>

      {exercise.hint ? (
        <section className="mt-8">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] tracking-[0.14em] text-[var(--color-fg-dim)] uppercase transition-colors select-none hover:text-[var(--color-fg)]">
              <Lightbulb className="h-[13px] w-[13px]" strokeWidth={1.8} />
              <span>{t("hint")}</span>
            </summary>
            <p className="mt-3 rounded-md border border-[var(--color-line)] px-4 py-3 text-[14px] leading-[1.65] text-[var(--color-fg-muted)]">
              {exercise.hint}
            </p>
          </details>
        </section>
      ) : null}

      {exercise.relatedConcepts && exercise.relatedConcepts.length > 0 ? (
        <section className="mt-10">
          <h3 className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.14em] text-[var(--color-fg-dim)] uppercase">
            <BookOpen className="h-[13px] w-[13px]" strokeWidth={1.8} />
            {t("relatedConcepts")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {exercise.relatedConcepts.map((id) => (
              <a
                key={id}
                href={href(`/${id}`)}
                onClick={(e) => {
                  e.preventDefault()
                  push(`/${id}`)
                }}
                className="inline-block rounded border border-[var(--color-line)] px-3 py-1 font-mono text-[13px] text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-fg)]"
              >
                {id}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <FeedbackWidget contentType="exercise" contentId={exercise.id} />

      <nav className="mt-12 flex items-start justify-between gap-8 border-t border-[var(--color-line)] pt-8 text-[14px]">
        {prev ? (
          <a
            href={href(`/learn/${prev.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/learn/${prev.id}`)
            }}
            className="group flex flex-col gap-1 text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            <span className="text-[12px] text-[var(--color-fg-dim)]">{t("prev")}</span>
            <span className="text-[var(--color-fg)]">{prev.label}</span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a
            href={href(`/learn/${next.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/learn/${next.id}`)
            }}
            className="group flex flex-col items-end gap-1 text-right text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            <span className="text-[12px] text-[var(--color-fg-dim)]">{t("next")}</span>
            <span className="text-[var(--color-fg)]">{next.label}</span>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
