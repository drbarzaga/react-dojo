"use client"

import { cn } from "@/lib/utils"
import type { RankInfo } from "@/lib/ranking"
import type { Exercise } from "@/content/exercises"
import type { StreakInfo } from "@/lib/streak"
import type { Heatmap } from "@/lib/heatmap"
import { intensity } from "@/lib/heatmap"
import type { EvaluatedAchievement, AchievementFamily } from "@/lib/achievements"
import { TOTAL_ACHIEVEMENTS } from "@/lib/achievements"
import { ShareProfileButton } from "@/components/share-profile-button"
import { useCountUp } from "@/hooks/use-count-up"
import { useFormatter, useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Award,
  BookOpen,
  CalendarCheck,
  Crown,
  Dumbbell,
  Flame,
  FolderCheck,
  Footprints,
  GraduationCap,
  Library,
  ListChecks,
  Lock,
  Medal,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react"

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
  streak: StreakInfo
  heatmap: Heatmap
  achievements: EvaluatedAchievement[]
  /** When set, shows a "share" button linking to this user's public profile (own profile only). */
  shareSlug?: string
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
  const r = 46
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - (animated ? score : 0) / 100)

  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-fg-faint"
      />
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
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
        className="text-fg-faint"
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
    <div className="border-line/50 bg-bg-raise hover:bg-bg-hover flex flex-col gap-1.5 rounded-2xl border p-5 transition-colors">
      <span className="text-fg-muted text-[10px] font-semibold tracking-[0.18em] uppercase">
        {label}
      </span>
      <div className="flex items-end gap-1.5">
        <span className="text-fg font-mono text-4xl leading-none font-bold">{animated}</span>
        <span className="text-fg-dim mb-0.5 font-mono text-[13px]">{t("ofTotal", { total })}</span>
      </div>
      <span className="text-fg-dim text-[11px]">{sublabel}</span>
      <div className="bg-bg-hover mt-2.5 h-[3px] w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 8px ${accent}80` }}
        />
      </div>
    </div>
  )
}

// ── Activity heatmap + streak ───────────────────────────────────────────────────

// Emerald intensity scale (index = bucket from `intensity()`)
const HEAT_COLORS = [
  "bg-bg-hover",
  "bg-emerald-500/25",
  "bg-emerald-500/45",
  "bg-emerald-500/70",
  "bg-emerald-400",
] as const

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function ActivitySection({ streak, heatmap }: { streak: StreakInfo; heatmap: Heatmap }) {
  const t = useTranslations("Profile")

  return (
    <section className="border-line/60 bg-bg-raise mb-6 rounded-3xl border p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-fg-dim text-[10px] font-semibold tracking-[0.18em] uppercase">
          {t("activity")}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame
              className={cn("h-4 w-4", streak.current > 0 ? "text-orange-400" : "text-fg-dim")}
              strokeWidth={2}
            />
            <span className="text-fg font-mono text-sm font-bold">{streak.current}</span>
            <span className="text-fg-muted text-[11px]">{t("dayStreak")}</span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="text-fg-muted font-mono text-[11px]">{t("longestStreak")}</span>
            <span className="text-fg-muted font-mono text-sm font-bold">{streak.longest}</span>
          </div>
        </div>
      </div>

      {/* Heatmap (scrolls horizontally on narrow screens) */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full flex-col gap-1">
          {/* Month axis */}
          <div className="relative ml-0 h-3" style={{ width: heatmap.weeks.length * 14 }}>
            {heatmap.monthLabels.map((m) => (
              <span
                key={`${m.weekIndex}-${m.month}`}
                className="text-fg-dim absolute text-[9px]"
                style={{ left: m.weekIndex * 14 }}
              >
                {MONTHS[m.month]}
              </span>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[3px]">
            {heatmap.weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) =>
                  cell ? (
                    <div
                      key={cell.date}
                      title={`${cell.count} · ${cell.date}`}
                      className={cn(
                        "h-[11px] w-[11px] rounded-[2px]",
                        HEAT_COLORS[intensity(cell.count)]
                      )}
                    />
                  ) : (
                    <div key={`${wi}-${di}`} className="h-[11px] w-[11px] rounded-[2px]" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-fg-dim text-[10px]">{t("less")}</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} className={cn("h-[10px] w-[10px] rounded-[2px]", c)} />
        ))}
        <span className="text-fg-dim text-[10px]">{t("more")}</span>
      </div>
    </section>
  )
}

// ── Achievements ────────────────────────────────────────────────────────────────

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  Footprints,
  BookOpen,
  Library,
  Dumbbell,
  Award,
  ListChecks,
  Target,
  FolderCheck,
  Flame,
  GraduationCap,
  CalendarCheck,
  Medal,
  Trophy,
  Crown,
}

const FAMILY_ACCENT: Record<AchievementFamily, { icon: string; bg: string; ring: string }> = {
  milestone: { icon: "text-blue-400", bg: "bg-blue-500/15", ring: "ring-blue-500/30" },
  mastery: { icon: "text-purple-400", bg: "bg-purple-500/15", ring: "ring-purple-500/30" },
  streak: { icon: "text-orange-400", bg: "bg-orange-500/15", ring: "ring-orange-500/30" },
  rank: { icon: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/30" },
}

const FAMILY_ORDER: AchievementFamily[] = ["milestone", "mastery", "streak", "rank"]

function AchievementBadge({ a }: { a: EvaluatedAchievement }) {
  const t = useTranslations("Achievements")
  const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Award
  const accent = FAMILY_ACCENT[a.family]
  const showProgress = !a.unlocked && a.target > 1

  return (
    <div
      title={t(`items.${a.id}.desc`)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-colors",
        a.unlocked
          ? cn("border-transparent ring-1", accent.bg, accent.ring)
          : "border-line/40 bg-bg-raise"
      )}
    >
      <div
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl",
          a.unlocked ? accent.bg : "bg-bg-raise"
        )}
      >
        <Icon
          className={cn("h-5 w-5", a.unlocked ? accent.icon : "text-fg-dim")}
          strokeWidth={1.75}
        />
        {!a.unlocked && (
          <span className="bg-bg absolute -right-1 -bottom-1 rounded-full p-0.5">
            <Lock className="text-fg-muted h-2.5 w-2.5" strokeWidth={2.5} />
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-[11px] leading-tight font-medium",
          a.unlocked ? "text-fg-muted" : "text-fg-muted"
        )}
      >
        {t(`items.${a.id}.title`)}
      </span>
      {showProgress && (
        <span className="text-fg-dim font-mono text-[9px]">
          {a.current}/{a.target}
        </span>
      )}
    </div>
  )
}

function AchievementsSection({ achievements }: { achievements: EvaluatedAchievement[] }) {
  const t = useTranslations("Achievements")
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-fg-dim text-[10px] font-semibold tracking-[0.18em] uppercase">
          {t("sectionTitle")}
        </h2>
        <span className="text-fg-muted font-mono text-[11px]">
          {t("unlockedOf", { unlocked, total: TOTAL_ACHIEVEMENTS })}
        </span>
      </div>
      <div className="space-y-4">
        {FAMILY_ORDER.map((family) => {
          const items = achievements.filter((a) => a.family === family)
          if (items.length === 0) return null
          return (
            <div key={family}>
              <h3 className="text-fg-dim mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
                {t(`family.${family}`)}
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {items.map((a) => (
                  <AchievementBadge key={a.id} a={a} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
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
  streak,
  heatmap,
  achievements,
  shareSlug,
}: ProfilePageProps) {
  const t = useTranslations("Profile")
  const format = useFormatter()
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
    "text-yellow-400": "from-yellow-500/10 via-yellow-500/3 to-transparent",
    "text-orange-400": "from-orange-500/10 via-orange-500/3 to-transparent",
    "text-purple-400": "from-purple-500/10 via-purple-500/3 to-transparent",
    "text-blue-400": "from-blue-500/10 via-blue-500/3 to-transparent",
    "text-cyan-400": "from-cyan-500/10 via-cyan-500/3 to-transparent",
    "text-green-400": "from-green-500/10 via-green-500/3 to-transparent",
    "text-emerald-400": "from-emerald-500/10 via-emerald-500/3 to-transparent",
    "text-emerald-500": "from-emerald-500/10 via-emerald-500/3 to-transparent",
    "text-zinc-400": "from-zinc-500/7 via-zinc-500/2 to-transparent",
    "text-zinc-500": "from-zinc-500/5 via-zinc-500/1 to-transparent",
  }
  const gradient = heroGradient[rank.textColor] ?? "from-zinc-500/6 to-transparent"

  const avatarRingMap: Record<string, string> = {
    "text-yellow-400": "ring-yellow-400/50",
    "text-orange-400": "ring-orange-400/50",
    "text-purple-400": "ring-purple-400/50",
    "text-blue-400": "ring-blue-400/50",
    "text-cyan-400": "ring-cyan-400/50",
    "text-green-400": "ring-green-400/50",
    "text-emerald-400": "ring-emerald-400/50",
    "text-emerald-500": "ring-emerald-500/50",
    "text-zinc-400": "ring-line-strong",
    "text-zinc-500": "ring-line-strong",
  }
  const avatarRing = avatarRingMap[rank.textColor] ?? "ring-line-strong"

  // Exact join date, formatted in the active locale (e.g. "28 de mayo de 2026").
  const formatDate = (d: Date | string) =>
    format.dateTime(new Date(d), { day: "numeric", month: "long", year: "numeric" })

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
          "border-line/60 relative mb-6 overflow-hidden rounded-3xl border bg-linear-to-r",
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

        {shareSlug && (
          <div className="absolute top-4 right-4 z-10">
            <ShareProfileButton slug={shareSlug} />
          </div>
        )}

        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          {/* Avatar */}
          <div className="relative shrink-0 self-start sm:self-center">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={112}
                height={112}
                className={cn("h-28 w-28 rounded-full object-cover ring-2", avatarRing)}
              />
            ) : (
              <div
                className={cn(
                  "bg-bg-hover text-fg-muted flex h-28 w-28 items-center justify-center rounded-full font-mono text-4xl font-bold ring-2",
                  avatarRing
                )}
              >
                {user.name[0].toUpperCase()}
              </div>
            )}
            {/* Rank badge — overlaps the avatar's bottom edge with a solid backdrop
                so it reads as attached and stays legible over any photo */}
            <span
              className={cn(
                "border-bg bg-bg-raise absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wide whitespace-nowrap shadow-md ring-1",
                rank.textColor,
                avatarRing
              )}
            >
              {rank.label}
            </span>
          </div>

          {/* Name + meta + next rank */}
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h1 className="text-fg font-mono text-2xl leading-tight font-bold">{user.name}</h1>
              <p className="text-fg-muted mt-0.5 font-mono text-[12px]">
                {t("memberSince")} {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Next rank progress */}
            {nextRank ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-fg-muted text-[11px]">
                    {t("nextRank")}:
                    <span className={cn("ml-1.5 font-semibold", nextRank.color)}>
                      {nextRank.label}
                    </span>
                  </span>
                  <span className="text-fg-muted font-mono text-[11px]">
                    {score} / {nextMin}
                  </span>
                </div>
                <div className="bg-bg-hover h-1.5 w-full overflow-hidden rounded-full">
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
              <div
                className={cn(
                  "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1",
                  rank.color,
                  rank.textColor,
                  "border-current/20"
                )}
              >
                <span className="text-[9px]">✦</span>
                <span className="font-mono text-[11px] font-semibold">{t("maxRank")}</span>
              </div>
            )}
          </div>

          {/* Score ring */}
          <div
            className="relative shrink-0 self-center"
            style={{ filter: `drop-shadow(0 0 20px ${strokeColor}55)` }}
          >
            <ScoreRing score={score} color={strokeColor} animated={mounted} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-fg font-mono text-3xl leading-none font-bold">
                {animatedScore}
              </span>
              <span className="text-fg-dim mt-0.5 font-mono text-[10px]">{t("scoreLabel")}</span>
            </div>
          </div>
        </div>

        {/* Rank ladder strip */}
        <div className="border-line border-t px-6 py-5 sm:px-8">
          <div className="relative flex justify-between">
            {/* Track line */}
            <div className="bg-bg-hover absolute inset-x-0 top-[8px] h-px" />
            {[...RANK_LADDER].reverse().map((r) => {
              const isActive = r.label === rank.label
              const isPast = RANK_LADDER.findIndex((x) => x.label === r.label) > currentIdx
              return (
                <div key={r.label} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300",
                      isActive
                        ? cn(r.bg, r.border, "scale-[1.25] shadow-sm")
                        : isPast
                          ? "border-line-strong bg-bg-hover"
                          : "border-line bg-transparent"
                    )}
                  >
                    {isActive && (
                      <div
                        className={cn("h-1.5 w-1.5 rounded-full", r.color.replace("text-", "bg-"))}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[7.5px] font-bold whitespace-nowrap",
                      isActive ? r.color : isPast ? "text-fg-dim" : "text-fg-dim"
                    )}
                  >
                    {r.label}
                  </span>
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

      {/* ── Activity (streak + heatmap) ───────────────────────────── */}
      <ActivitySection streak={streak} heatmap={heatmap} />

      {/* ── Achievements ──────────────────────────────────────────── */}
      <AchievementsSection achievements={achievements} />

      {/* ── Category + Quizzes ────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Category progress */}
        <section>
          <h2 className="text-fg-dim mb-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            {t("byCategory")}
          </h2>
          <div className="border-line/60 divide-line/40 bg-bg-raise divide-y rounded-2xl border">
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
            <div className="border-line/60 bg-bg-raise flex h-32 items-center justify-center rounded-2xl border">
              <p className="text-fg-dim text-[12px]">{t("noQuizzes")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attemptedQuizzes.map((q) => (
                <div
                  key={q.id}
                  className="border-line/60 hover:border-line bg-bg-raise flex items-center justify-between rounded-xl border px-4 py-2.5 transition-colors"
                >
                  <span className="text-fg-muted min-w-0 truncate text-[12px]">{q.label}</span>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <div className="bg-bg-hover h-[3px] w-16 overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          q.score >= 80
                            ? "bg-emerald-400/80"
                            : q.score >= 50
                              ? "bg-amber-400/80"
                              : "bg-rose-400/80"
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
          <div className="border-line/60 bg-bg-raise flex h-24 items-center justify-center rounded-2xl border">
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
                        className="border-line/50 bg-bg-raise flex items-center gap-2 rounded-xl border px-3 py-2"
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
