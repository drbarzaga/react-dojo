"use client"

import { cn } from "@/lib/utils"
import type { RankInfo } from "@/lib/ranking"
import type { Exercise } from "@/content/exercises"
import { useCountUp } from "@/hooks/use-count-up"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useState } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Rank ladder data ──────────────────────────────────────────────────────────

const RANK_LADDER = [
  {
    label: "DAN",
    min: 100,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
  },
  {
    label: "1 KYU",
    min: 86,
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/40",
  },
  {
    label: "2 KYU",
    min: 71,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/40",
  },
  {
    label: "3 KYU",
    min: 56,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
  },
  {
    label: "4 KYU",
    min: 41,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/40",
  },
  {
    label: "5 KYU",
    min: 26,
    color: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/40",
  },
  {
    label: "6 KYU",
    min: 13,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
  },
  {
    label: "7 KYU",
    min: 1,
    color: "text-zinc-400",
    bg: "bg-zinc-500/20",
    border: "border-zinc-500/30",
  },
  {
    label: "8 KYU",
    min: 0,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
  },
] as const

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({
  score,
  color,
  animated,
}: {
  score: number
  color: string
  animated: boolean
}) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - (animated ? score : 0) / 100)

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        className="text-white/8"
      />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  )
}

function MiniRing({ pct, done }: { pct: number; done: boolean }) {
  const r = 7
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0 -rotate-90">
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-white/10"
      />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke={done ? "#34d399" : "#60a5fa"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

function AnimatedStat({
  value,
  total,
  label,
  sublabel,
  accent,
}: {
  value: number
  total: number
  label: string
  sublabel: string
  accent: string
}) {
  const t = useTranslations("Profile")
  const animated = useCountUp(value, true, 900)
  const pct = Math.min((value / total) * 100, 100)

  return (
    <div className="border-line/60 flex flex-col gap-1 rounded-2xl border bg-white/3 p-5">
      <span className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
        {label}
      </span>
      <div className="flex items-end gap-1.5">
        <span className="font-mono text-4xl leading-none font-bold text-white">{animated}</span>
        <span className="mb-0.5 font-mono text-[13px] text-white/30">
          {t("ofTotal", { total })}
        </span>
      </div>
      <span className="text-[11px] text-white/35">{sublabel}</span>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const [mounted, setMounted] = useState(false)
  const animatedScore = useCountUp(score, mounted, 1200)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Rank color as a raw CSS color for SVG strokes
  const rankStrokeColor: Record<string, string> = {
    "text-yellow-400": "#facc15",
    "text-orange-400": "#fb923c",
    "text-purple-400": "#c084fc",
    "text-blue-400": "#60a5fa",
    "text-cyan-400": "#22d3ee",
    "text-green-400": "#4ade80",
    "text-emerald-400": "#34d399",
    "text-emerald-500": "#10b981",
    "text-zinc-400": "#a1a1aa",
    "text-zinc-500": "#71717a",
  }
  const strokeColor = rankStrokeColor[rank.textColor] ?? "#a1a1aa"

  // Next rank calculation
  const currentIdx = RANK_LADDER.findIndex((r) => r.label === rank.label)
  const nextRank = currentIdx > 0 ? RANK_LADDER[currentIdx - 1] : null
  const nextMin = nextRank?.min ?? 100
  const prevMin = RANK_LADDER[currentIdx]?.min ?? 0
  const toNextRange = nextMin - prevMin
  const toNextProgress =
    toNextRange > 0 ? Math.min(((score - prevMin) / toNextRange) * 100, 100) : 100

  // Hero gradient from rank color
  const heroGradient: Record<string, string> = {
    "text-yellow-400": "from-yellow-500/15 via-yellow-500/5 to-transparent",
    "text-orange-400": "from-orange-500/15 via-orange-500/5 to-transparent",
    "text-purple-400": "from-purple-500/15 via-purple-500/5 to-transparent",
    "text-blue-400": "from-blue-500/15 via-blue-500/5 to-transparent",
    "text-cyan-400": "from-cyan-500/15 via-cyan-500/5 to-transparent",
    "text-green-400": "from-green-500/15 via-green-500/5 to-transparent",
    "text-emerald-400": "from-emerald-500/15 via-emerald-500/5 to-transparent",
    "text-emerald-500": "from-emerald-500/15 via-emerald-500/5 to-transparent",
    "text-zinc-400": "from-zinc-500/10 via-zinc-500/5 to-transparent",
    "text-zinc-500": "from-zinc-500/8 via-zinc-500/3 to-transparent",
  }
  const gradient = heroGradient[rank.textColor] ?? "from-zinc-500/8 to-transparent"

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" })

  const quizScoreColor = (s: number) =>
    s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-rose-400"

  const difficultyDot: Record<string, string> = {
    basic: "bg-emerald-400/80",
    intermediate: "bg-amber-400/80",
    advanced: "bg-rose-400/80",
  }

  return (
    <div className="mx-auto max-w-[820px] px-5 py-10 md:px-10 md:py-14">
      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "border-line/60 relative mb-6 overflow-hidden rounded-3xl border bg-linear-to-br",
          gradient
        )}
      >
        {/* subtle mesh background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          {/* Avatar */}
          <div className="relative shrink-0 self-start">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-2xl ring-2 ring-white/15"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/8 font-mono text-3xl font-bold text-white/60 ring-2 ring-white/10">
                {user.name[0].toUpperCase()}
              </div>
            )}
            {/* Rank dot */}
            <span
              className={cn(
                "absolute -right-1.5 -bottom-1.5 rounded-full border-2 border-black px-1.5 py-0.5 font-mono text-[9px] font-bold",
                rank.color,
                rank.textColor
              )}
            >
              {rank.label}
            </span>
          </div>

          {/* Name + meta + next rank */}
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h1 className="font-mono text-2xl leading-tight font-bold text-white">{user.name}</h1>
              <p className="mt-0.5 font-mono text-[12px] text-white/35">
                {t("memberSince")} {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Next rank progress */}
            {nextRank ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-white/40">
                    {t("nextRank")}:
                    <span className={cn("ml-1.5 font-semibold", nextRank.color)}>
                      {nextRank.label}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-white/35">
                    {score} / {nextMin}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      rank.color
                        .replace("text-", "bg-")
                        .replace("-400", "-400/70")
                        .replace("-500", "-500/70")
                    )}
                    style={{ width: mounted ? `${toNextProgress}%` : "0%" }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-yellow-400">✦</span>
                <span className="font-mono text-[12px] text-yellow-400/80">{t("maxRank")}</span>
              </div>
            )}
          </div>

          {/* Score ring */}
          <div className="relative shrink-0 self-center">
            <ScoreRing score={score} color={strokeColor} animated={mounted} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl leading-none font-bold text-white">
                {animatedScore}
              </span>
              <span className="font-mono text-[10px] text-white/30">{t("scoreLabel")}</span>
            </div>
          </div>
        </div>

        {/* Rank ladder strip */}
        <div className="border-t border-white/6 px-6 py-3 sm:px-8">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {[...RANK_LADDER].reverse().map((r) => {
              const isActive = r.label === rank.label
              const isPast = RANK_LADDER.findIndex((x) => x.label === r.label) > currentIdx
              return (
                <div
                  key={r.label}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 transition-all",
                    isActive
                      ? cn("border", r.border, r.bg, "scale-105 shadow-sm")
                      : isPast
                        ? "border-transparent opacity-30"
                        : "border-transparent opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[9px] font-bold",
                      isActive ? r.color : "text-white/50"
                    )}
                  >
                    {r.label}
                  </span>
                  <div
                    className={cn(
                      "h-1 w-4 rounded-full",
                      isActive ? r.color.replace("text-", "bg-") : "bg-white/15"
                    )}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <AnimatedStat
          label={t("concepts")}
          value={visited}
          total={totals.concepts}
          sublabel={t("visited")}
          accent="#60a5fa"
        />
        <AnimatedStat
          label={t("exercises")}
          value={exercisesCompleted}
          total={totals.exercises}
          sublabel={t("completed")}
          accent="#34d399"
        />
        <AnimatedStat
          label={t("quizzes")}
          value={quizzesAttempted}
          total={totals.quizzes}
          sublabel={t("attempted")}
          accent="#fbbf24"
        />
      </div>

      {/* ── Category + Quizzes ────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Category progress */}
        <section>
          <h2 className="text-fg-dim mb-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            {t("byCategory")}
          </h2>
          <div className="border-line/60 divide-line/40 divide-y rounded-2xl border bg-white/2">
            {categoryProgress.map((cat) => {
              const pct = cat.total === 0 ? 0 : Math.round((cat.visited / cat.total) * 100)
              const done = cat.visited === cat.total && cat.total > 0
              return (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5">
                  <MiniRing pct={pct} done={done} />
                  <span className="text-fg-dim w-4 shrink-0 font-mono text-[10px]">
                    {cat.kicker}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12px]",
                      done ? "text-fg-muted" : "text-fg-dim"
                    )}
                  >
                    {cat.title}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[10px]",
                      done ? "text-emerald-400" : "text-fg-dim"
                    )}
                  >
                    {cat.visited}/{cat.total}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Quiz scores */}
        <section>
          <h2 className="text-fg-dim mb-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            {t("quizScores")}
          </h2>
          {attemptedQuizzes.length === 0 ? (
            <div className="border-line/60 flex h-32 items-center justify-center rounded-2xl border bg-white/2">
              <p className="text-fg-dim text-[12px]">{t("noQuizzes")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attemptedQuizzes.map((q) => (
                <div
                  key={q.id}
                  className="border-line/60 hover:border-line flex items-center justify-between rounded-xl border bg-white/2 px-4 py-2.5 transition-colors"
                >
                  <span className="text-fg-muted min-w-0 truncate text-[12px]">{q.label}</span>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-white/8">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          q.score >= 80
                            ? "bg-emerald-400/70"
                            : q.score >= 50
                              ? "bg-amber-400/70"
                              : "bg-rose-400/70"
                        )}
                        style={{ width: `${q.score}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "w-9 text-right font-mono text-[12px] font-semibold",
                        quizScoreColor(q.score)
                      )}
                    >
                      {q.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Completed exercises ───────────────────────────────────── */}
      <section>
        <h2 className="text-fg-dim mb-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
          {t("completedExercises")}
        </h2>
        {exercisesCompleted === 0 ? (
          <div className="border-line/60 flex h-24 items-center justify-center rounded-2xl border bg-white/2">
            <p className="text-fg-dim text-[12px]">{t("noExercises")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(["basic", "intermediate", "advanced"] as const).map((level) => {
              const exs = completedByDifficulty[level]
              if (!exs.length) return null
              return (
                <div key={level}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", difficultyDot[level])} />
                    <span className="text-fg-dim text-[10px] font-semibold tracking-[0.14em] uppercase">
                      {t(level)}
                    </span>
                    <span className="text-fg-dim font-mono text-[10px]">({exs.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {exs.map((ex) => (
                      <div
                        key={ex.id}
                        className="border-line/50 flex items-center gap-2 rounded-xl border bg-white/2 px-3 py-2"
                      >
                        <span
                          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", difficultyDot[level])}
                        />
                        <span className="text-fg-muted truncate text-[12px]">{ex.label}</span>
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
