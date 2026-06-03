"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Flame } from "lucide-react"
import { ExercisePage } from "@/components/exercise-page"
import { DailyChallengeQuestion } from "@/components/daily-challenge-question"
import { useProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"
import type { DailyChallenge } from "@/lib/daily-challenge"

interface DailyChallengePageProps {
  challenge: DailyChallenge
  today: string
}

export function DailyChallengePage({ challenge, today }: DailyChallengePageProps) {
  const t = useTranslations("DailyChallenge")
  const { dailyStreak, bestStreak, lastDailyDate, completeDailyChallenge } = useProgress()

  // Defer localStorage-derived values to after hydration to avoid SSR mismatch
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: mount flag pattern
  useEffect(() => setMounted(true), [])

  const displayStreak = mounted ? dailyStreak : 0
  const displayBest = mounted ? bestStreak : 0
  const completedToday = mounted ? lastDailyDate === today : false

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="border-line bg-surface-1 rounded-xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="flame-animate h-5 w-5 text-orange-500" />
              <h1 className="text-fg text-[17px] font-semibold">{t("title")}</h1>
            </div>
            <p className="text-fg-muted text-[13px]">
              {challenge.type === "exercise" ? t("exercise") : t("question")}
              {" · "}
              <span className="font-medium">
                {challenge.type === "exercise" ? challenge.item.label : challenge.quiz.label}
              </span>
            </p>
          </div>

          <div className="flex items-end gap-4 text-[13px]">
            <div className="text-center">
              <div className="text-fg flex h-7 items-center justify-center gap-1 text-[20px] font-bold">
                {displayStreak}
                <Flame
                  className={cn("h-4 w-4 text-orange-400", displayStreak > 0 && "flame-animate")}
                />
              </div>
              <div className="text-fg-muted text-[11px]">{t("streak", { n: displayStreak })}</div>
            </div>
            <div className="text-center">
              <div className="text-fg-muted flex h-7 items-center justify-center text-[20px] font-bold">
                {displayBest}
              </div>
              <div className="text-fg-faint text-[11px]">{t("bestStreak", { n: displayBest })}</div>
            </div>
          </div>
        </div>

        {completedToday && (
          <div className="border-line mt-4 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-2.5 text-[13px] text-green-700 dark:text-green-300">
            {t("completed")} {t("comeBack")}
          </div>
        )}
      </div>

      {/* Challenge content */}
      {challenge.type === "exercise" ? (
        <div className="space-y-3">
          <ExercisePage exercise={challenge.item} prev={undefined} next={undefined} />
          {!completedToday && (
            <div className="flex justify-end px-1">
              <button
                onClick={() => completeDailyChallenge(today)}
                className="bg-fg text-bg hover:bg-fg/90 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors"
              >
                {t("markDone")}
              </button>
            </div>
          )}
          {completedToday && (
            <div className="flex justify-end px-1">
              <span className="text-fg-muted text-[12px]">{t("completed")}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="border-line bg-surface rounded-xl border p-6">
          <DailyChallengeQuestion
            question={challenge.item}
            onComplete={() => completeDailyChallenge(today)}
            completedToday={completedToday}
          />
        </div>
      )}
    </div>
  )
}
