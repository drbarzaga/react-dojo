import type { Exercise } from "@/content/exercises"
import type { Quiz, QuizQuestion } from "@/content/quiz"

export type DailyChallenge =
  | { type: "exercise"; item: Exercise }
  | { type: "question"; item: QuizQuestion; quiz: Quiz }

const EPOCH = new Date("2025-01-01T00:00:00Z").getTime()
const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Returns the number of days elapsed since the fixed epoch for a given date */
export function getDayIndex(date: Date = new Date()): number {
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((utcMidnight - EPOCH) / MS_PER_DAY)
}

/**
 * Returns today's challenge deterministically.
 * Same result for everyone on the same calendar day (UTC).
 * Interleaves exercises and quiz questions into a flat pool and picks by day index.
 */
export function getDailyChallenge(
  exercises: Exercise[],
  quizzes: Quiz[],
  date: Date = new Date()
): DailyChallenge {
  // Build flat pool: interleave exercises and questions.
  // Questions drive the length; exercises cycle (repeat) when exhausted.
  // Result: strict 50/50 split — every other day is an exercise, no matter
  // how many exercises vs questions exist.
  const pool: DailyChallenge[] = []

  const allQuestions: { item: QuizQuestion; quiz: Quiz }[] = quizzes.flatMap((quiz) =>
    quiz.questions.map((item) => ({ item, quiz }))
  )

  for (let i = 0; i < allQuestions.length; i++) {
    pool.push({ type: "exercise", item: exercises[i % exercises.length] })
    const { item, quiz } = allQuestions[i]
    pool.push({ type: "question", item, quiz })
  }

  const index = getDayIndex(date) % pool.length
  return pool[index]
}

/** Returns today's date as a YYYY-MM-DD string (UTC) */
export function getTodayString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}
