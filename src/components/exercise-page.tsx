"use client"

import { FeedbackWidget } from "@/components/feedback-widget"
import { Playground } from "@/components/playground"
import type { Difficulty, Exercise } from "@/content/exercises"
import { useKeyboardNav } from "@/hooks/use-keyboard-nav"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useCodePersistence } from "@/hooks/use-code-persistence"
import { useProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"
import { useContent } from "@/providers/content-provider"
import { renderObjective } from "@/lib/render-objective"
import { BookOpen, CheckCircle2, Circle, Lightbulb } from "lucide-react"
import { useTranslations } from "next-intl"
import { startTransition, useState } from "react"

interface ExercisePageProps {
  exercise: Exercise
  prev?: Exercise
  next?: Exercise
}

const difficultyColor: Record<Difficulty, string> = {
  basic: "text-fg-dim",
  intermediate: "text-fg-muted",
  advanced: "text-fg",
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
  const { push, href, locale } = useLocaleRouter()
  const [showSolution, setShowSolution] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const [maximized, setMaximized] = useState(false)
  const { completedExercises, toggleExerciseCompleted } = useProgress()
  const { clearCode } = useCodePersistence()
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
        <div className="text-fg-dim flex items-center gap-3 text-[11px] tracking-[0.14em] uppercase">
          <span>{t("practice")}</span>
          <span className="bg-fg-faint h-px w-4" />
          <span className={difficultyColor[exercise.difficulty] ?? "text-fg-dim"}>
            {t(difficultyKey[exercise.difficulty])}
          </span>
        </div>
        <button
          onClick={() => toggleExerciseCompleted(exercise.id)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] transition-colors",
            isCompleted
              ? "border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400"
              : "border-line text-fg-muted hover:border-fg-muted hover:text-fg"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-[13px]" strokeWidth={1.8} />
          ) : (
            <Circle className="size-[13px]" strokeWidth={1.8} />
          )}
          {isCompleted ? t("completed") : t("markCompleted")}
        </button>
      </div>

      <h1 className="text-fg font-mono text-[32px] leading-none font-medium">{exercise.title}</h1>

      <p className="text-fg-muted mt-6 text-[17px] leading-[1.65]">{exercise.lede}</p>

      <hr className="border-line mt-12 border-t border-none" />

      <section className="mt-10">
        <h2 className="text-fg-dim mb-4 text-[11px] tracking-[0.14em] uppercase">
          {t("objectives")}
        </h2>
        <ol className="space-y-2">
          {exercise.objectives.map((o, i) => (
            <li key={i} className="text-fg-muted flex items-start gap-3 text-[14px] leading-[1.65]">
              <span className="text-fg-faint mt-px w-4 shrink-0 text-right font-mono text-[12px]">
                {i + 1}.
              </span>
              <span>{renderObjective(o)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <div className="text-fg-dim mb-2 flex items-center justify-between text-[11px]">
          <span>{showSolution ? t("solution") : t("yourCode")}</span>
          <div className="flex items-center gap-4">
            {!showSolution && (
              <button
                onClick={() => {
                  clearCode(exercise.id)
                  setResetCount((c) => c + 1)
                }}
                className="text-fg-dim hover:text-fg text-[11px] transition-colors"
              >
                {t("reset")}
              </button>
            )}
            <button
              onClick={() => setShowSolution((v) => !v)}
              className={cn(
                "text-[11px] transition-colors",
                showSolution ? "text-fg" : "text-fg-dim hover:text-fg"
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
              maximized={maximized}
              onMaximizeChange={setMaximized}
              showSolution={showSolution}
              onSolutionToggle={() => startTransition(() => setShowSolution(false))}
            />
          ) : (
            <Playground
              key={`${locale}-${exercise.id}-start-${resetCount}`}
              files={exercise.starter}
              dependencies={exercise.dependencies}
              exerciseId={exercise.id}
              enablePersistence
              objectives={exercise.objectives}
              maximized={maximized}
              onMaximizeChange={setMaximized}
              showSolution={showSolution}
              onSolutionToggle={() => startTransition(() => setShowSolution(true))}
            />
          )}
        </div>
      </section>

      {exercise.hint ? (
        <section className="mt-8">
          <details className="group">
            <summary className="text-fg-dim hover:text-fg flex cursor-pointer list-none items-center gap-2 text-[11px] tracking-[0.14em] uppercase transition-colors select-none">
              <Lightbulb className="h-[13px] w-[13px]" strokeWidth={1.8} />
              <span>{t("hint")}</span>
            </summary>
            <p className="border-line text-fg-muted mt-3 rounded-md border px-4 py-3 text-[14px] leading-[1.65]">
              {exercise.hint}
            </p>
          </details>
        </section>
      ) : null}

      {exercise.relatedConcepts && exercise.relatedConcepts.length > 0 ? (
        <section className="mt-10">
          <h3 className="text-fg-dim mb-3 flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase">
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
                className="border-line text-fg-muted hover:border-line-strong hover:text-fg inline-block rounded border px-3 py-1 font-mono text-[13px] transition-colors"
              >
                {id}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <FeedbackWidget contentType="exercise" contentId={exercise.id} />

      <nav className="border-line mt-12 flex items-start justify-between gap-8 border-t pt-8 text-[14px]">
        {prev ? (
          <a
            href={href(`/learn/${prev.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/learn/${prev.id}`)
            }}
            className="group text-fg-muted hover:text-fg flex flex-col gap-1 transition-colors"
          >
            <span className="text-fg-dim text-[12px]">{t("prev")}</span>
            <span className="text-fg">{prev.label}</span>
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
            className="group text-fg-muted hover:text-fg flex flex-col items-end gap-1 text-right transition-colors"
          >
            <span className="text-fg-dim text-[12px]">{t("next")}</span>
            <span className="text-fg">{next.label}</span>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
