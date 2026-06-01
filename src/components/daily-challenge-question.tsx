"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizQuestion } from "@/content/quiz"

interface DailyChallengeQuestionProps {
  question: QuizQuestion
  onComplete: () => void
  completedToday: boolean
}

export function DailyChallengeQuestion({
  question,
  onComplete,
  completedToday,
}: DailyChallengeQuestionProps) {
  const t = useTranslations("DailyChallenge")
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null

  const handleSelect = (idx: number) => {
    if (answered) return
    setSelected(idx)
  }

  const isCorrect = selected === question.correctIndex

  return (
    <div className="space-y-6">
      {/* Question */}
      <p className="text-fg text-[15px] leading-relaxed">{question.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx
          const isRight = idx === question.correctIndex

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={cn(
                "border-line w-full rounded-lg border px-4 py-3 text-left text-[13px] transition-colors",
                !answered && "hover:border-fg/20 hover:bg-surface-1 cursor-pointer",
                answered && "cursor-default",
                answered && isRight && "border-green-500/50 bg-green-500/8 dark:bg-green-500/10",
                answered &&
                  isSelected &&
                  !isRight &&
                  "border-red-500/50 bg-red-500/8 dark:bg-red-500/10",
                !answered && "bg-surface"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "border-line flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                    answered && isRight && "border-green-500 text-green-600 dark:text-green-400",
                    answered &&
                      isSelected &&
                      !isRight &&
                      "border-red-500 text-red-600 dark:text-red-400"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span
                  className={cn(
                    answered && isRight && "text-green-800 dark:text-green-200",
                    answered && isSelected && !isRight && "text-red-700 dark:text-red-300"
                  )}
                >
                  {option}
                </span>
                {answered && isRight && (
                  <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-green-500" />
                )}
                {answered && isSelected && !isRight && (
                  <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-500" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-[13px] leading-relaxed",
            isCorrect
              ? "border-green-500/30 bg-green-500/5 text-green-800 dark:text-green-200"
              : "border-red-500/30 bg-red-500/5 text-red-800 dark:text-red-200"
          )}
        >
          <span className="font-medium">{isCorrect ? "✓ " : "✗ "}</span>
          {question.explanation}
        </div>
      )}

      {/* Complete button */}
      {answered && (
        <div className="flex justify-end">
          {completedToday ? (
            <span className="text-fg-muted text-[12px]">{t("completed")}</span>
          ) : (
            <button
              onClick={onComplete}
              className="bg-fg text-bg hover:bg-fg/90 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors"
            >
              {t("markDone")}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
