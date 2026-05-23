import { GitHubSignInButton } from "@/components/github-sign-in-button"
import { ProfilePage } from "@/components/profile-page"
import { getContentForLocale } from "@/content/loader"
import { db } from "@/db"
import { userProgress } from "@/db/schema"
import type { Locale } from "@/i18n/routing"
import { auth } from "@/lib/auth"
import { buildPageMetadata } from "@/lib/metadata"
import { calculateScore, getRank } from "@/lib/ranking"
import { eq } from "drizzle-orm"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Profile" })
  return buildPageMetadata({
    title: t("title"),
    description: t("signInDesc"),
    path: "/profile",
    locale,
    type: "website",
  })
}

export default async function ProfileRoute({ params }: Props) {
  const { locale } = await params
  const [session, t, { allConcepts, allExercises, allQuizzes, categories }] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getTranslations("Profile"),
    getContentForLocale(locale as Locale),
  ])

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-linear-to-b from-blue-500/10 to-blue-600/5 shadow-[0_0_24px_rgba(59,130,246,0.12)]">
          <svg
            className="h-7 w-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-fg font-mono text-lg font-bold">{t("signIn")}</h2>
          <p className="text-fg-muted mt-2 max-w-sm text-sm">{t("signInDesc")}</p>
        </div>
        <GitHubSignInButton label="Sign in with GitHub" />
      </div>
    )
  }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, session.user.id),
  })

  const visitedConcepts = new Set(progress?.visitedConcepts ?? [])
  const completedExercises = new Set(progress?.completedExercises ?? [])
  const quizScores = progress?.quizScores ?? {}

  const totals = {
    concepts: allConcepts.length,
    exercises: allExercises.length,
    quizzes: allQuizzes.length,
  }

  const rank = getRank(
    visitedConcepts.size,
    completedExercises.size,
    Object.keys(quizScores).length,
    totals
  )
  const score = calculateScore(
    visitedConcepts.size,
    completedExercises.size,
    Object.keys(quizScores).length,
    totals
  )

  const categoryProgress = categories.map((cat) => {
    const visited = cat.conceptIds.filter((id) => visitedConcepts.has(id)).length
    return {
      id: cat.id,
      kicker: cat.kicker,
      title: cat.title,
      visited,
      total: cat.conceptIds.length,
    }
  })

  const completedByDifficulty = {
    basic: allExercises.filter((e) => e.difficulty === "basic" && completedExercises.has(e.id)),
    intermediate: allExercises.filter(
      (e) => e.difficulty === "intermediate" && completedExercises.has(e.id)
    ),
    advanced: allExercises.filter(
      (e) => e.difficulty === "advanced" && completedExercises.has(e.id)
    ),
  }

  const attemptedQuizzes = allQuizzes
    .filter((q) => quizScores[q.id] !== undefined)
    .map((q) => ({ id: q.id, label: q.label, score: quizScores[q.id] }))
    .sort((a, b) => b.score - a.score)

  return (
    <ProfilePage
      user={{
        name: session.user.name,
        image: session.user.image ?? null,
        createdAt: session.user.createdAt,
      }}
      rank={rank}
      score={score}
      totals={totals}
      visited={visitedConcepts.size}
      exercisesCompleted={completedExercises.size}
      quizzesAttempted={Object.keys(quizScores).length}
      categoryProgress={categoryProgress}
      completedByDifficulty={completedByDifficulty}
      attemptedQuizzes={attemptedQuizzes}
    />
  )
}
