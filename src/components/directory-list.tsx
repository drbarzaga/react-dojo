"use client"

import { Link } from "@/i18n/navigation"
import type { Developer } from "@/lib/get-developers"
import { getRank } from "@/lib/ranking"
import { cn } from "@/lib/utils"
import { Award, Flame } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Image from "next/image"
import { useMemo, useState } from "react"

type SortKey = "score" | "streak" | "recent"

interface Props {
  developers: Developer[]
  currentUserId: string
  totals: { concepts: number; exercises: number; quizzes: number }
}

const SORTS: SortKey[] = ["score", "streak", "recent"]

function sortDevelopers(devs: Developer[], key: SortKey): Developer[] {
  const copy = [...devs]
  switch (key) {
    case "streak":
      return copy.sort((a, b) => b.streak - a.streak || b.score - a.score)
    case "recent":
      return copy.sort(
        (a, b) => (b.lastActive ?? "").localeCompare(a.lastActive ?? "") || b.score - a.score
      )
    default:
      return copy.sort((a, b) => b.score - a.score)
  }
}

export function DirectoryList({ developers, currentUserId, totals }: Props) {
  const t = useTranslations("Directory")
  const [sort, setSort] = useState<SortKey>("score")

  const sorted = useMemo(() => sortDevelopers(developers, sort), [developers, sort])

  return (
    <>
      {/* Sort controls */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-fg-dim font-mono text-[11px]">{t("sortLabel")}</span>
        <div className="border-line flex gap-1 rounded-lg border p-0.5">
          {SORTS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
                sort === key ? "bg-bg-hover text-fg" : "text-fg-dim hover:text-fg-muted"
              )}
            >
              {t(`sort_${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((dev, index) => (
          <DeveloperRow
            key={dev.id}
            dev={dev}
            index={index}
            totals={totals}
            isCurrentUser={dev.id === currentUserId}
          />
        ))}
      </div>
    </>
  )
}

function DeveloperRow({
  dev,
  index,
  totals,
  isCurrentUser,
}: {
  dev: Developer
  index: number
  totals: Props["totals"]
  isCurrentUser: boolean
}) {
  const t = useTranslations("Directory")
  const format = useFormatter()
  const rank = getRank(dev.concepts, dev.exercises, dev.quizzes, totals)
  const slug = dev.username ?? dev.id

  return (
    <Link
      href={`/u/${slug}`}
      className={cn(
        "block rounded-lg border p-4 transition-colors",
        isCurrentUser
          ? "border-amber-500/40 bg-amber-500/[0.04] hover:border-amber-500/60"
          : "border-line bg-bg hover:border-line-strong"
      )}
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        <span className="text-fg-dim w-5 shrink-0 text-right font-mono text-[11px]">
          {index + 1}
        </span>

        {/* Avatar + active-today dot */}
        <div className="relative shrink-0">
          {dev.image ? (
            <Image src={dev.image} alt={dev.name} width={38} height={38} className="rounded-full" />
          ) : (
            <div className="bg-bg-raise text-fg-muted flex h-[38px] w-[38px] items-center justify-center rounded-full font-mono text-sm font-bold">
              {dev.name[0].toUpperCase()}
            </div>
          )}
          {dev.activeToday && (
            <span
              title={t("activeToday")}
              className="border-bg absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-emerald-400"
            />
          )}
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-fg truncate font-mono text-[13px] font-medium">{dev.name}</p>
            {isCurrentUser && (
              <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-400">
                {t("you")}
              </span>
            )}
          </div>
          <div className="text-fg-dim flex items-center gap-3 text-[11px]">
            <span>
              {t("memberSince")}{" "}
              {format.dateTime(dev.createdAt, { month: "short", year: "numeric" })}
            </span>
            {dev.streak > 0 && (
              <span className="flex items-center gap-1" title={t("streakLabel")}>
                <Flame className="h-3 w-3 text-orange-400" strokeWidth={2} />
                {dev.streak}
              </span>
            )}
            {dev.achievements > 0 && (
              <span className="flex items-center gap-1" title={t("achievementsLabel")}>
                <Award className="h-3 w-3 text-purple-400" strokeWidth={2} />
                {dev.achievements}
              </span>
            )}
          </div>
        </div>

        {/* KYU badge */}
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold",
            rank.color,
            rank.textColor
          )}
        >
          {rank.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 pl-8">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-fg-dim font-mono text-[10px]">{t("overallProgress")}</span>
          <span className="text-fg-muted font-mono text-[10px]">{dev.score}%</span>
        </div>
        <div className="bg-bg-hover h-1 w-full overflow-hidden rounded-full">
          <div
            className={cn("h-full rounded-full transition-all", rank.color.replace("/20", "/70"))}
            style={{ width: `${dev.score}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2 pl-8">
        <StatBar
          label={t("concepts")}
          value={dev.concepts}
          total={totals.concepts}
          colorClass="bg-blue-400/60"
        />
        <StatBar
          label={t("exercises")}
          value={dev.exercises}
          total={totals.exercises}
          colorClass="bg-emerald-400/60"
        />
        <StatBar
          label={t("quizzes")}
          value={dev.quizzes}
          total={totals.quizzes}
          colorClass="bg-amber-400/60"
        />
      </div>
    </Link>
  )
}

function StatBar({
  label,
  value,
  total,
  colorClass,
}: {
  label: string
  value: number
  total: number
  colorClass: string
}) {
  const pct = total === 0 ? 0 : Math.min((value / total) * 100, 100)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-fg-dim text-[10px]">{label}</span>
        <span className="text-fg-muted font-mono text-[10px]">
          {value}/{total}
        </span>
      </div>
      <div className="bg-bg-hover h-1 w-full overflow-hidden rounded-full">
        <div className={cn("h-full rounded-full", colorClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
