export const TOTAL_CONCEPTS = 28
export const TOTAL_EXERCISES = 17
export const TOTAL_QUIZZES = 15

export interface RankInfo {
  label: string // "8 KYU", "1 KYU", "DAN"
  color: string // tailwind bg class
  textColor: string
  score: number // 0-100
}

export function calculateScore(concepts: number, exercises: number, quizzes: number): number {
  const conceptPct = Math.min(concepts / TOTAL_CONCEPTS, 1)
  const exercisePct = Math.min(exercises / TOTAL_EXERCISES, 1)
  const quizPct = Math.min(quizzes / TOTAL_QUIZZES, 1)

  // Concepts 50%, exercises 30%, quizzes 20%
  return Math.round(conceptPct * 50 + exercisePct * 30 + quizPct * 20)
}

export function getRank(concepts: number, exercises: number, quizzes: number): RankInfo {
  const score = calculateScore(concepts, exercises, quizzes)

  if (score === 100) {
    return { label: "DAN", color: "bg-yellow-500/20", textColor: "text-yellow-400", score }
  }
  if (score >= 86) {
    return { label: "1 KYU", color: "bg-orange-500/20", textColor: "text-orange-400", score }
  }
  if (score >= 71) {
    return { label: "2 KYU", color: "bg-purple-500/20", textColor: "text-purple-400", score }
  }
  if (score >= 56) {
    return { label: "3 KYU", color: "bg-blue-500/20", textColor: "text-blue-400", score }
  }
  if (score >= 41) {
    return { label: "4 KYU", color: "bg-cyan-500/20", textColor: "text-cyan-400", score }
  }
  if (score >= 26) {
    return { label: "5 KYU", color: "bg-green-500/20", textColor: "text-green-400", score }
  }
  if (score >= 13) {
    return { label: "6 KYU", color: "bg-emerald-500/20", textColor: "text-emerald-500", score }
  }
  if (score >= 1) {
    return { label: "7 KYU", color: "bg-zinc-500/20", textColor: "text-zinc-400", score }
  }
  return { label: "8 KYU", color: "bg-zinc-500/10", textColor: "text-zinc-500", score }
}
