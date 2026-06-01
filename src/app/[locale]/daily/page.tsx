import { getContentForLocale } from "@/content/loader"
import { getDailyChallenge, getTodayString } from "@/lib/daily-challenge"
import { DailyChallengePage } from "@/components/daily-challenge-page"
import { buildPageMetadata } from "@/lib/metadata"
import { type Locale } from "@/i18n/routing"
import type { Metadata } from "next"

// Recompute on every request so the challenge rotates at midnight UTC
export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildPageMetadata({
    title: "Daily Challenge",
    description: "A new exercise or quiz question every day. Build the habit.",
    path: "/daily",
    locale,
  })
}

export default async function DailyRoute({ params }: Props) {
  const { locale } = await params
  const { allExercises, allQuizzes } = await getContentForLocale(locale as Locale)

  const today = new Date()
  const challenge = getDailyChallenge(allExercises, allQuizzes, today)
  const todayStr = getTodayString(today)

  return <DailyChallengePage challenge={challenge} today={todayStr} />
}
