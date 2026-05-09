import { GitHubSignInButton } from "@/components/github-sign-in-button"
import { KyuInfoButton } from "@/components/kyu-info-button"
import { getContentForLocale } from "@/content/loader"
import type { Locale } from "@/i18n/routing"
import { auth } from "@/lib/auth"
import { getDevelopers } from "@/lib/get-developers"
import { calculateScore, getRank } from "@/lib/ranking"
import { Crown } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import Image from "next/image"

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DirectoryPage({ params }: Props) {
  const { locale } = await params
  const [session, t, { allConcepts, allExercises, allQuizzes }] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getTranslations("Directory"),
    getContentForLocale(locale as Locale),
  ])

  const totals = {
    concepts: allConcepts.length,
    exercises: allExercises.length,
    quizzes: allQuizzes.length,
  }

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-linear-to-b from-amber-500/10 to-amber-600/5 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
          <Crown className="h-7 w-7 text-amber-400" strokeWidth={1.5} />
        </div>

        <div>
          <h2 className="text-fg font-mono text-lg font-bold">{t("membersOnly")}</h2>
          <p className="text-fg-muted mt-2 max-w-sm text-sm">{t("membersOnlyDesc")}</p>
        </div>

        <div className="text-fg-dim flex gap-6 text-[11px]">
          <span>✓ {t("featureProgress")}</span>
          <span>✓ {t("featureCompare")}</span>
          <span>✓ {t("featureRanks")}</span>
        </div>

        <GitHubSignInButton label={t("signIn")} />
      </div>
    )
  }

  const developers = await getDevelopers()

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-fg font-mono text-2xl font-bold">{t("title")}</h1>
          <p className="text-fg-muted mt-1 text-sm">
            {t("subtitle", { count: developers.length })}
          </p>
        </div>
        <KyuInfoButton />
      </div>

      {developers.length === 0 ? (
        <div className="border-line rounded-lg border px-6 py-12 text-center">
          <p className="text-fg-dim text-sm">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {developers.map((dev, index) => {
            const rank = getRank(dev.concepts, dev.exercises, dev.quizzes, totals)
            const score = calculateScore(dev.concepts, dev.exercises, dev.quizzes, totals)

            return (
              <div
                key={dev.id}
                className="border-line bg-bg hover:border-line-strong rounded-lg border p-4 transition-colors"
              >
                {/* Top row */}
                <div className="flex items-center gap-3">
                  {/* Rank number */}
                  <span className="text-fg-dim w-5 shrink-0 text-right font-mono text-[11px]">
                    {index + 1}
                  </span>

                  {/* Avatar */}
                  {dev.image ? (
                    <Image
                      src={dev.image}
                      alt={dev.name}
                      width={38}
                      height={38}
                      className="shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="bg-bg-raise text-fg-muted flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold">
                      {dev.name[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name + joined */}
                  <div className="min-w-0 flex-1">
                    <p className="text-fg truncate font-mono text-[13px] font-medium">{dev.name}</p>
                    <p className="text-fg-dim text-[11px]">
                      {t("memberSince")} {formatDate(dev.createdAt)}
                    </p>
                  </div>

                  {/* KYU Badge */}
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${rank.color} ${rank.textColor}`}
                  >
                    {rank.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pl-8">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-fg-dim font-mono text-[10px]">
                      {t("overallProgress")}
                    </span>
                    <span className="text-fg-muted font-mono text-[10px]">{score}%</span>
                  </div>
                  <div className="bg-bg-hover h-1 w-full overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${rank.color.replace("bg-", "bg-").replace("/20", "/70")}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-3 grid grid-cols-3 gap-2 pl-8">
                  <StatBar
                    label="Concepts"
                    value={dev.concepts}
                    total={totals.concepts}
                    colorClass="bg-blue-400/60"
                  />
                  <StatBar
                    label="Exercises"
                    value={dev.exercises}
                    total={totals.exercises}
                    colorClass="bg-emerald-400/60"
                  />
                  <StatBar
                    label="Quizzes"
                    value={dev.quizzes}
                    total={totals.quizzes}
                    colorClass="bg-amber-400/60"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
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
  const pct = Math.min((value / total) * 100, 100)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-fg-dim text-[10px]">{label}</span>
        <span className="text-fg-muted font-mono text-[10px]">
          {value}/{total}
        </span>
      </div>
      <div className="bg-bg-hover h-1 w-full overflow-hidden rounded-full">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
