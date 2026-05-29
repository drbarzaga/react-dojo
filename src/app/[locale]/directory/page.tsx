import { DirectoryList } from "@/components/directory-list"
import { GitHubSignInButton } from "@/components/github-sign-in-button"
import { KyuInfoButton } from "@/components/kyu-info-button"
import { Link } from "@/i18n/navigation"
import { getContentForLocale } from "@/content/loader"
import type { Locale } from "@/i18n/routing"
import { auth } from "@/lib/auth"
import { getDevelopers } from "@/lib/get-developers"
import { Crown, Flame } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import Image from "next/image"

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DirectoryPage({ params }: Props) {
  const { locale } = await params
  const [session, t, { allConcepts, allExercises, allQuizzes, categories }] = await Promise.all([
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

  const developers = await getDevelopers({ totals, exercises: allExercises, categories })

  // "Most active this week": active within the last 7 days, ranked by streak then score.
  const mostActive = developers
    .filter((d) => d.activeThisWeek)
    .sort((a, b) => b.streak - a.streak || b.score - a.score)
    .slice(0, 5)

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
        <>
          {/* Most active this week */}
          {mostActive.length > 0 && (
            <section className="border-line/60 mb-6 rounded-2xl border bg-white/[0.02] p-4">
              <h2 className="text-fg-dim mb-3 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                <Flame className="h-3.5 w-3.5 text-orange-400" strokeWidth={2} />
                {t("mostActive")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {mostActive.map((dev) => (
                  <Link
                    key={dev.id}
                    href={`/u/${dev.username ?? dev.id}`}
                    className="border-line/60 hover:border-line-strong flex items-center gap-2 rounded-full border bg-white/[0.02] py-1 pr-3 pl-1 transition-colors"
                  >
                    {dev.image ? (
                      <Image
                        src={dev.image}
                        alt={dev.name}
                        width={22}
                        height={22}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="bg-bg-raise text-fg-muted flex h-[22px] w-[22px] items-center justify-center rounded-full font-mono text-[10px] font-bold">
                        {dev.name[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-fg-muted max-w-[120px] truncate font-mono text-[12px]">
                      {dev.name}
                    </span>
                    {dev.streak > 0 && (
                      <span className="flex items-center gap-0.5 font-mono text-[11px] text-orange-400">
                        <Flame className="h-3 w-3" strokeWidth={2} />
                        {dev.streak}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <DirectoryList developers={developers} currentUserId={session.user.id} totals={totals} />
        </>
      )}
    </div>
  )
}
