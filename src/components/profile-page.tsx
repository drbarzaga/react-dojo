"use client"

import { cn } from "@/lib/utils"
import type { RankInfo } from "@/lib/ranking"
import type { Exercise } from "@/content/exercises"
import { useTranslations } from "next-intl"
import Image from "next/image"

interface CategoryProgress {
  id: string
  kicker: string
  title: string
  visited: number
  total: number
}

interface AttemptedQuiz {
  id: string
  label: string
  score: number
}

interface ProfilePageProps {
  user: { name: string; image: string | null; createdAt: Date | string }
  rank: RankInfo
  score: number
  totals: { concepts: number; exercises: number; quizzes: number }
  visited: number
  exercisesCompleted: number
  quizzesAttempted: number
  categoryProgress: CategoryProgress[]
  completedByDifficulty: { basic: Exercise[]; intermediate: Exercise[]; advanced: Exercise[] }
  attemptedQuizzes: AttemptedQuiz[]
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
}

function StatCard({
  label,
  value,
  total,
  sublabel,
  colorClass,
}: {
  label: string
  value: number
  total: number
  sublabel: string
  colorClass: string
}) {
  const pct = Math.min((value / total) * 100, 100)
  return (
    <div className="border-line bg-bg-raise rounded-xl border p-5">
      <p className="text-fg-dim mb-1 text-[11px] tracking-[0.14em] uppercase">{label}</p>
      <p className="text-fg font-mono text-3xl font-bold">{value}</p>
      <p className="text-fg-dim mb-3 text-[12px]">
        de {total} {sublabel}
      </p>
      <div className="bg-bg-hover h-1.5 w-full overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function ProfilePage({
  user,
  rank,
  score,
  totals,
  visited,
  exercisesCompleted,
  quizzesAttempted,
  categoryProgress,
  completedByDifficulty,
  attemptedQuizzes,
}: ProfilePageProps) {
  const t = useTranslations("Profile")

  const difficultyDot: Record<string, string> = {
    basic: "bg-emerald-400/80",
    intermediate: "bg-amber-400/80",
    advanced: "bg-rose-400/80",
  }

  const quizColor = (s: number) =>
    s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-rose-400"

  const quizBg = (s: number) =>
    s >= 80
      ? "border-emerald-500/30 bg-emerald-500/8"
      : s >= 50
        ? "border-amber-500/30 bg-amber-500/8"
        : "border-rose-500/30 bg-rose-500/8"

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="border-line bg-bg-raise mb-8 rounded-2xl border p-6">
        <div className="flex items-center gap-5">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={72}
              height={72}
              className="ring-line shrink-0 rounded-full ring-2"
            />
          ) : (
            <div className="bg-bg-hover text-fg-muted ring-line flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full font-mono text-2xl font-bold ring-2">
              {user.name[0].toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-fg font-mono text-xl font-bold">{user.name}</h1>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold",
                  rank.color,
                  rank.textColor
                )}
              >
                {rank.label}
              </span>
            </div>
            <p className="text-fg-dim mt-0.5 text-[12px]">
              {t("memberSince")} {formatDate(user.createdAt)}
            </p>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-fg-dim text-[10px] tracking-[0.12em] uppercase">
                  {t("overallProgress")}
                </span>
                <span className={cn("font-mono text-[12px] font-semibold", rank.textColor)}>
                  {score}%
                </span>
              </div>
              <div className="bg-bg-hover h-2 w-full overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    rank.color.replace("/20", "/60")
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard
          label={t("concepts")}
          value={visited}
          total={totals.concepts}
          sublabel={t("visited")}
          colorClass="bg-blue-400/60"
        />
        <StatCard
          label={t("exercises")}
          value={exercisesCompleted}
          total={totals.exercises}
          sublabel={t("completed")}
          colorClass="bg-emerald-400/60"
        />
        <StatCard
          label={t("quizzes")}
          value={quizzesAttempted}
          total={totals.quizzes}
          sublabel={t("attempted")}
          colorClass="bg-amber-400/60"
        />
      </div>

      {/* ── Progress by category ───────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-fg-dim mb-4 text-[11px] tracking-[0.14em] uppercase">
          {t("byCategory")}
        </h2>
        <div className="border-line bg-bg-raise divide-line divide-y rounded-xl border">
          {categoryProgress.map((cat) => {
            const pct = cat.total === 0 ? 0 : Math.round((cat.visited / cat.total) * 100)
            const allDone = cat.visited === cat.total && cat.total > 0
            return (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-fg-dim w-6 shrink-0 font-mono text-[10px]">{cat.kicker}</span>
                <span className="text-fg-muted min-w-0 flex-1 truncate text-[13px]">
                  {cat.title}
                </span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[11px]",
                    allDone ? "text-emerald-400" : "text-fg-dim"
                  )}
                >
                  {cat.visited}/{cat.total}
                </span>
                <div className="bg-bg-hover h-1.5 w-24 shrink-0 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      allDone ? "bg-emerald-400/70" : "bg-blue-400/50"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Quiz scores ────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-fg-dim mb-4 text-[11px] tracking-[0.14em] uppercase">
          {t("quizScores")}
        </h2>
        {attemptedQuizzes.length === 0 ? (
          <p className="text-fg-dim text-[13px]">{t("noQuizzes")}</p>
        ) : (
          <div className="space-y-2">
            {attemptedQuizzes.map((q) => (
              <div
                key={q.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-2.5",
                  quizBg(q.score)
                )}
              >
                <span className="text-fg-muted text-[13px]">{q.label}</span>
                <span className={cn("font-mono text-[13px] font-semibold", quizColor(q.score))}>
                  {q.score}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Completed exercises ────────────────────────────────────── */}
      <section>
        <h2 className="text-fg-dim mb-4 text-[11px] tracking-[0.14em] uppercase">
          {t("completedExercises")}
        </h2>
        {exercisesCompleted === 0 ? (
          <p className="text-fg-dim text-[13px]">{t("noExercises")}</p>
        ) : (
          <div className="space-y-4">
            {(["basic", "intermediate", "advanced"] as const).map((level) => {
              const exs = completedByDifficulty[level]
              if (!exs.length) return null
              return (
                <div key={level}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", difficultyDot[level])} />
                    <span className="text-fg-dim text-[11px] tracking-[0.12em] uppercase">
                      {t(level)}
                    </span>
                  </div>
                  <div className="border-line bg-bg-raise divide-line divide-y rounded-xl border">
                    {exs.map((ex) => (
                      <div key={ex.id} className="px-5 py-2.5">
                        <span className="text-fg-muted text-[13px]">{ex.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
