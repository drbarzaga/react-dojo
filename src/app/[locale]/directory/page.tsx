import Image from "next/image"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { Crown } from "lucide-react"
import {
  getRank,
  calculateScore,
  TOTAL_CONCEPTS,
  TOTAL_EXERCISES,
  TOTAL_QUIZZES,
} from "@/lib/ranking"
import { GitHubSignInButton } from "@/components/github-sign-in-button"

interface Developer {
  id: string
  name: string
  image: string | null
  createdAt: string
  concepts: number
  exercises: number
  quizzes: number
}

async function getUsers(): Promise<Developer[]> {
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/users`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

export default async function DirectoryPage() {
  const [session, t] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getTranslations("Directory"),
  ])

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-amber-600/5 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
          <Crown className="h-7 w-7 text-amber-400" strokeWidth={1.5} />
        </div>

        <div>
          <h2 className="font-mono text-lg font-bold text-[var(--color-fg)]">{t("membersOnly")}</h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-fg-muted)]">
            {t("membersOnlyDesc")}
          </p>
        </div>

        <div className="flex gap-6 text-[11px] text-[var(--color-fg-dim)]">
          <span>✓ {t("featureProgress")}</span>
          <span>✓ {t("featureCompare")}</span>
          <span>✓ {t("featureRanks")}</span>
        </div>

        <GitHubSignInButton label={t("signIn")} />
      </div>
    )
  }

  const developers = await getUsers()

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold text-[var(--color-fg)]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          {t("subtitle", { count: developers.length })}
        </p>
      </div>

      {developers.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-line)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--color-fg-dim)]">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {developers.map((dev, index) => {
            const rank = getRank(dev.concepts, dev.exercises, dev.quizzes)
            const score = calculateScore(dev.concepts, dev.exercises, dev.quizzes)

            return (
              <div
                key={dev.id}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-line-strong)]"
              >
                {/* Top row */}
                <div className="flex items-center gap-3">
                  {/* Rank number */}
                  <span className="w-5 shrink-0 text-right font-mono text-[11px] text-[var(--color-fg-dim)]">
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
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-raise)] font-mono text-sm font-bold text-[var(--color-fg-muted)]">
                      {dev.name[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name + joined */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-medium text-[var(--color-fg)]">
                      {dev.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-fg-dim)]">
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
                    <span className="font-mono text-[10px] text-[var(--color-fg-dim)]">
                      {t("overallProgress")}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-fg-muted)]">
                      {score}%
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-bg-hover)]">
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
                    total={TOTAL_CONCEPTS}
                    colorClass="bg-blue-400/60"
                  />
                  <StatBar
                    label="Exercises"
                    value={dev.exercises}
                    total={TOTAL_EXERCISES}
                    colorClass="bg-emerald-400/60"
                  />
                  <StatBar
                    label="Quizzes"
                    value={dev.quizzes}
                    total={TOTAL_QUIZZES}
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
        <span className="text-[10px] text-[var(--color-fg-dim)]">{label}</span>
        <span className="font-mono text-[10px] text-[var(--color-fg-muted)]">
          {value}/{total}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-bg-hover)]">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
