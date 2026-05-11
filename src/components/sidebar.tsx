"use client"

import { GitHubIcon } from "@/components/svg-icons"
import { Sidebar as ShadcnSidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Difficulty } from "@/content/exercises"
import { type QuizDifficulty } from "@/content/quiz"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useProgress } from "@/hooks/use-progress"
import { authClient, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { type SidebarOpenState, writeSidebarOpenStateCookie } from "@/lib/sidebar-state"
import { useContent } from "@/providers/content-provider"
import {
  Anchor,
  Boxes,
  Check,
  ChevronDown,
  Component,
  Gauge,
  Hourglass,
  LogOut,
  MessageCircleQuestion,
  RefreshCw,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { ComponentType } from "react"
import { useEffect, useState } from "react"

type IconC = ComponentType<{ className?: string; strokeWidth?: number }>

function SectionRing({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : value / total
  const r = 5
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const color = pct >= 0.8 ? "#34d399" : pct >= 0.5 ? "#fbbf24" : "#f87171"
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0 -rotate-90">
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="text-sidebar-foreground/15"
      />
      {pct > 0 && (
        <circle
          cx="8"
          cy="8"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      )}
    </svg>
  )
}

const categoryIcon: Record<string, IconC> = {
  state: Boxes,
  sync: RefreshCw,
  performance: Gauge,
  concurrency: Hourglass,
  composition: Component,
  interviews: MessageCircleQuestion,
}

const difficultyDot: Record<Difficulty, string> = {
  basic: "bg-emerald-400/80",
  intermediate: "bg-amber-400/80",
  advanced: "bg-rose-400/80",
}

function SectionLabel({ children, ring }: { children: React.ReactNode; ring?: React.ReactNode }) {
  return (
    <div className="flex items-center px-4 pt-5 pb-2 first:pt-3">
      <span className="text-sidebar-foreground/40 flex-1 text-[10px] font-semibold tracking-[0.2em] uppercase">
        {children}
      </span>
      {ring}
    </div>
  )
}

function NavItem({
  label,
  active,
  badge,
  indicator,
  onClick,
}: {
  label: string
  active: boolean
  badge?: React.ReactNode
  indicator?: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/nav relative flex w-full min-w-0 items-center gap-2 rounded-md py-[6px] pr-2.5 pl-3.5 text-left font-mono text-[13px] transition-all duration-150",
        active
          ? "bg-sidebar-accent/70 text-sidebar-foreground"
          : "text-sidebar-foreground/55 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/90"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 left-1 h-3.5 w-[2px] -translate-y-1/2 rounded-full transition-all duration-200",
          active
            ? "scale-y-100 bg-emerald-400/80"
            : "bg-sidebar-foreground/20 scale-y-0 group-hover/nav:scale-y-50"
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {indicator}
      {badge && (
        <span className="text-sidebar-foreground/30 ml-1 shrink-0 font-mono text-[10px] tabular-nums">
          {badge}
        </span>
      )}
    </button>
  )
}

interface SidebarProps {
  initialState: SidebarOpenState
}

export function Sidebar({ initialState }: SidebarProps) {
  const t = useTranslations("Sidebar")
  const pathname = usePathname()
  const { locale, push } = useLocaleRouter()
  const { allConcepts, categories, conceptIndex, allExercises, allQuizzes } = useContent()
  const { visitedConcepts, completedExercises, quizScores } = useProgress()
  const { data: session } = useSession()

  const difficultyLabel: Record<Difficulty, string> = {
    basic: t("basic"),
    intermediate: t("intermediate"),
    advanced: t("advanced"),
  }

  // Strip locale prefix so active-state comparisons work under /en/... and /es/...
  const rawPath = pathname.slice(1)
  const current =
    rawPath === locale
      ? ""
      : rawPath.startsWith(`${locale}/`)
        ? rawPath.slice(locale.length + 1)
        : rawPath

  const isExerciseRoute = current.startsWith("learn/")
  const isQuizRoute = current.startsWith("quiz/")
  const isHooksRoute = current === "hooks" || current.startsWith("hooks/")
  const isDirectoryRoute = current === "directory" || current.startsWith("directory/")
  const activeExId = isExerciseRoute ? current.slice(6) : null

  const totalConcepts = allConcepts.length
  const visitedCount = visitedConcepts.size
  const totalQuizzes = allQuizzes.length
  const attemptedQuizzes = Object.keys(quizScores).length
  const totalExercises = allExercises.length
  const completedCount = completedExercises.size

  const activeCatId = categories.find((c) => c.conceptIds.includes(current))?.id ?? null
  const activeDifficulty = activeExId
    ? (allExercises.find((e) => e.id === activeExId)?.difficulty ?? null)
    : null
  const activeQuizDifficulty = isQuizRoute
    ? (allQuizzes.find((q) => `quiz/${q.id}` === current)?.difficulty ?? null)
    : null

  const [openCats, setOpenCats] = useState<Set<string>>(() => {
    const cats = new Set<string>(initialState.cats)
    if (activeCatId) cats.add(activeCatId)
    return cats
  })
  const [openLevels, setOpenLevels] = useState<Set<string>>(() => {
    const levels = new Set<string>(initialState.levels)
    if (activeDifficulty) levels.add(activeDifficulty)
    return levels
  })
  const [openQuizLevels, setOpenQuizLevels] = useState<Set<string>>(() => {
    const quizLevels = new Set<string>(initialState.quizLevels)
    if (activeQuizDifficulty) quizLevels.add(activeQuizDifficulty)
    return quizLevels
  })

  useEffect(() => {
    writeSidebarOpenStateCookie({
      cats: [...openCats],
      levels: [...openLevels],
      quizLevels: [...openQuizLevels],
    })
  }, [openCats, openLevels, openQuizLevels])

  useEffect(() => {
    if (activeCatId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenCats((prev) => (prev.has(activeCatId) ? prev : new Set([...prev, activeCatId])))
    }
  }, [activeCatId])

  useEffect(() => {
    if (activeDifficulty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenLevels((prev) =>
        prev.has(activeDifficulty) ? prev : new Set([...prev, activeDifficulty])
      )
    }
  }, [activeDifficulty])

  useEffect(() => {
    if (activeQuizDifficulty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenQuizLevels((prev) =>
        prev.has(activeQuizDifficulty) ? prev : new Set([...prev, activeQuizDifficulty])
      )
    }
  }, [activeQuizDifficulty])

  const toggle = (id: string) =>
    setOpenCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleLevel = (level: string) =>
    setOpenLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })

  const toggleQuizLevel = (level: string) =>
    setOpenQuizLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })

  return (
    <ShadcnSidebar
      collapsible="offcanvas"
      className="border-sidebar-border top-12! h-[calc(100svh-3rem)]! border-r"
    >
      <TooltipProvider delay={300}>
        <SidebarContent className="gap-0 py-1">
          {/* ── CONCEPTS ─────────────────────── */}
          <SectionLabel
            ring={
              <Tooltip>
                <TooltipTrigger className="flex cursor-default items-center rounded-sm focus-visible:outline-none">
                  <SectionRing value={visitedCount} total={totalConcepts} />
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t("conceptsVisited", { visited: visitedCount, total: totalConcepts })}
                </TooltipContent>
              </Tooltip>
            }
          >
            {t("concepts")}
          </SectionLabel>

          <div className="px-2">
            {categories.map((cat) => {
              const Icon = categoryIcon[cat.id]
              const isOpen = openCats.has(cat.id)
              const visited = cat.conceptIds.filter((id) => visitedConcepts.has(id)).length
              const total = cat.conceptIds.length

              const allDone = total > 0 && visited === total
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => toggle(cat.id)}
                    className="group/cat hover:bg-sidebar-accent/50 flex w-full items-center gap-2 rounded-md px-3 py-[7px] transition-colors"
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-[12px] w-[12px] shrink-0 transition-colors",
                          allDone
                            ? "text-emerald-400/70"
                            : "text-sidebar-foreground/40 group-hover/cat:text-sidebar-foreground/65"
                        )}
                        strokeWidth={2}
                      />
                    )}
                    <span className="text-sidebar-foreground/55 group-hover/cat:text-sidebar-foreground/80 flex-1 truncate text-left font-mono text-[11px] font-semibold tracking-widest uppercase">
                      {cat.title}
                    </span>
                    {visited > 0 && visited < total && (
                      <span className="text-sidebar-foreground/35 group-hover/cat:text-sidebar-foreground/55 font-mono text-[9px] tabular-nums transition-colors">
                        {visited}/{total}
                      </span>
                    )}
                    {allDone && (
                      <Check
                        className="h-[10px] w-[10px] shrink-0 text-emerald-400/70"
                        strokeWidth={3}
                      />
                    )}
                    <ChevronDown
                      className="text-sidebar-foreground/30 group-hover/cat:text-sidebar-foreground/60 h-[11px] w-[11px] shrink-0"
                      style={{
                        transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 200ms ease, color 150ms ease",
                      }}
                    />
                  </button>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 180ms ease",
                    }}
                  >
                    <div style={{ overflow: "hidden", minHeight: 0 }}>
                      <div className="border-sidebar-border/40 ml-[18px] border-l pb-1 pl-1.5">
                        {cat.conceptIds.map((id) => {
                          const concept = conceptIndex[id]
                          if (!concept) return null
                          const active = !isExerciseRoute && !isQuizRoute && current === id
                          const seen = visitedConcepts.has(id)
                          return (
                            <NavItem
                              key={id}
                              label={concept.label}
                              active={active}
                              onClick={() => push(`/${id}`)}
                              indicator={
                                seen ? (
                                  <Check
                                    className="text-sidebar-foreground/20 h-[9px] w-[9px] shrink-0"
                                    strokeWidth={3}
                                  />
                                ) : null
                              }
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── PRACTICE ──────────────────────── */}
          <div className="via-sidebar-border/80 mx-4 mt-3 h-px bg-linear-to-r from-transparent to-transparent" />
          <SectionLabel
            ring={
              <Tooltip>
                <TooltipTrigger className="flex cursor-default items-center rounded-sm focus-visible:outline-none">
                  <SectionRing value={completedCount} total={totalExercises} />
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t("exercisesCompleted", { completed: completedCount, total: totalExercises })}
                </TooltipContent>
              </Tooltip>
            }
          >
            {t("practice")}
          </SectionLabel>

          <div className="px-2">
            {(["basic", "intermediate", "advanced"] as const).map((level) => {
              const exs = allExercises.filter((e) => e.difficulty === level)
              if (!exs.length) return null
              const isActiveLevel = activeDifficulty === level
              return (
                <div key={level}>
                  <button
                    onClick={() => toggleLevel(level)}
                    className="group/level hover:bg-sidebar-accent/50 flex w-full items-center gap-2 rounded-md px-3 py-[7px] transition-colors"
                  >
                    <span
                      className={cn(
                        "h-[7px] w-[7px] shrink-0 rounded-full transition-shadow",
                        difficultyDot[level],
                        isActiveLevel && "ring-2 ring-current/20"
                      )}
                    />
                    <span
                      className={cn(
                        "flex-1 text-left font-mono text-[11px] font-semibold tracking-widest uppercase transition-colors",
                        isActiveLevel
                          ? "text-sidebar-foreground/80"
                          : "text-sidebar-foreground/55 group-hover/level:text-sidebar-foreground/80"
                      )}
                    >
                      {difficultyLabel[level]}
                    </span>
                    <ChevronDown
                      className="text-sidebar-foreground/30 group-hover/level:text-sidebar-foreground/60 h-[11px] w-[11px] shrink-0"
                      style={{
                        transform: openLevels.has(level) ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 200ms ease, color 150ms ease",
                      }}
                    />
                  </button>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: openLevels.has(level) ? "1fr" : "0fr",
                      transition: "grid-template-rows 180ms ease",
                    }}
                  >
                    <div style={{ overflow: "hidden", minHeight: 0 }}>
                      <div className="border-sidebar-border/40 ml-[15px] border-l pb-1 pl-1.5">
                        {exs.map((ex) => {
                          const active = isExerciseRoute && activeExId === ex.id
                          const completed = completedExercises.has(ex.id)
                          return (
                            <NavItem
                              key={ex.id}
                              label={ex.label}
                              active={active}
                              onClick={() => push(`/learn/${ex.id}`)}
                              indicator={
                                completed ? (
                                  <Check
                                    className="h-[9px] w-[9px] shrink-0 text-emerald-400/70"
                                    strokeWidth={3}
                                  />
                                ) : null
                              }
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── QUIZ ──────────────────────────── */}
          <div className="via-sidebar-border/80 mx-4 mt-3 h-px bg-linear-to-r from-transparent to-transparent" />
          <SectionLabel
            ring={
              <Tooltip>
                <TooltipTrigger className="flex cursor-default items-center rounded-sm focus-visible:outline-none">
                  <SectionRing value={attemptedQuizzes} total={totalQuizzes} />
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t("quizzesCompleted", { attempted: attemptedQuizzes, total: totalQuizzes })}
                </TooltipContent>
              </Tooltip>
            }
          >
            {t("quiz")}
          </SectionLabel>

          <div className="px-2">
            {(["basic", "intermediate", "advanced"] as const).map((level) => {
              const quizzes = allQuizzes.filter((q) => q.difficulty === level)
              if (!quizzes.length) return null
              const isActiveQuizLevel = activeQuizDifficulty === level
              return (
                <div key={level}>
                  <button
                    onClick={() => toggleQuizLevel(level)}
                    className="group/qlevel hover:bg-sidebar-accent/50 flex w-full items-center gap-2 rounded-md px-3 py-[7px] transition-colors"
                  >
                    <span
                      className={cn(
                        "h-[7px] w-[7px] shrink-0 rounded-full transition-shadow",
                        difficultyDot[level as QuizDifficulty],
                        isActiveQuizLevel && "ring-2 ring-current/20"
                      )}
                    />
                    <span
                      className={cn(
                        "flex-1 text-left font-mono text-[11px] font-semibold tracking-widest uppercase transition-colors",
                        isActiveQuizLevel
                          ? "text-sidebar-foreground/80"
                          : "text-sidebar-foreground/55 group-hover/qlevel:text-sidebar-foreground/80"
                      )}
                    >
                      {difficultyLabel[level as QuizDifficulty]}
                    </span>
                    <ChevronDown
                      className="text-sidebar-foreground/30 group-hover/qlevel:text-sidebar-foreground/60 h-[11px] w-[11px] shrink-0"
                      style={{
                        transform: openQuizLevels.has(level) ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 200ms ease, color 150ms ease",
                      }}
                    />
                  </button>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: openQuizLevels.has(level) ? "1fr" : "0fr",
                      transition: "grid-template-rows 180ms ease",
                    }}
                  >
                    <div style={{ overflow: "hidden", minHeight: 0 }}>
                      <div className="border-sidebar-border/40 ml-[15px] border-l pb-1 pl-1.5">
                        {quizzes.map((quiz) => {
                          const active = current === `quiz/${quiz.id}`
                          const score = quizScores[quiz.id]
                          const attempted = score !== undefined
                          const checkColor =
                            score >= 80
                              ? "text-emerald-400/70"
                              : score >= 50
                                ? "text-amber-400/70"
                                : "text-rose-400/70"
                          return (
                            <NavItem
                              key={quiz.id}
                              label={quiz.label}
                              active={active}
                              onClick={() => push(`/quiz/${quiz.id}`)}
                              badge={quiz.questions.length}
                              indicator={
                                attempted ? (
                                  <Check
                                    className={cn("h-[9px] w-[9px] shrink-0", checkColor)}
                                    strokeWidth={3}
                                  />
                                ) : null
                              }
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </SidebarContent>

        <SidebarFooter className="gap-2 p-3 pb-3">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => push("/hooks")}
              className={cn(
                "group/beta relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors",
                isHooksRoute
                  ? "bg-sidebar-accent/70 text-sidebar-foreground/90"
                  : "text-sidebar-foreground/45 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground/85"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-0 h-3.5 w-[2px] -translate-y-1/2 rounded-full transition-all duration-200",
                  isHooksRoute ? "scale-y-100 bg-emerald-400/80" : "scale-y-0"
                )}
              />
              <Anchor
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-colors",
                  isHooksRoute
                    ? "text-sidebar-foreground/80"
                    : "text-sidebar-foreground/40 group-hover/beta:text-sidebar-foreground/70"
                )}
                strokeWidth={1.8}
              />
              <span className="truncate">{t("customHooks")}</span>
              <span className="ml-auto shrink-0 rounded-sm border border-amber-500/30 bg-amber-500/15 px-1.5 py-px font-mono text-[8px] font-bold tracking-widest text-amber-400 uppercase">
                beta
              </span>
            </button>
            <button
              type="button"
              onClick={() => push("/directory")}
              className={cn(
                "group/dir relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors",
                isDirectoryRoute
                  ? "bg-sidebar-accent/70 text-sidebar-foreground/90"
                  : "text-sidebar-foreground/45 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground/85"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-0 h-3.5 w-[2px] -translate-y-1/2 rounded-full transition-all duration-200",
                  isDirectoryRoute ? "scale-y-100 bg-emerald-400/80" : "scale-y-0"
                )}
              />
              <Users
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-colors",
                  isDirectoryRoute
                    ? "text-sidebar-foreground/80"
                    : "text-sidebar-foreground/40 group-hover/dir:text-sidebar-foreground/70"
                )}
                strokeWidth={1.8}
              />
              <span className="truncate">{t("directory")}</span>
              <span className="ml-auto shrink-0 rounded-sm border border-amber-500/30 bg-amber-500/15 px-1.5 py-px font-mono text-[8px] font-bold tracking-widest text-amber-400 uppercase">
                beta
              </span>
            </button>
          </div>
          {session ? (
            <div className="border-sidebar-border/50 bg-sidebar-accent/25 hover:border-sidebar-border hover:bg-sidebar-accent/40 mt-1 flex items-center gap-2.5 rounded-lg border p-2 transition-colors">
              <div className="ring-sidebar-border/40 shrink-0 rounded-full ring-1">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="bg-sidebar-accent text-sidebar-foreground/80 flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold">
                    {session.user.name[0]}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sidebar-foreground truncate text-[12px] leading-tight font-medium">
                  {session.user.name}
                </p>
                <p className="text-sidebar-foreground/45 truncate text-[10px] leading-tight">
                  {session.user.email}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger
                  aria-label="Sign out"
                  className="text-sidebar-foreground/35 hover:bg-sidebar-accent hover:text-sidebar-foreground/85 grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md transition-colors"
                  onClick={async () => {
                    await authClient.signOut()
                    if (current.startsWith("directory")) {
                      push("/")
                    }
                  }}
                >
                  <LogOut className="h-[14px] w-[14px]" strokeWidth={1.8} />
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await authClient.signIn.social({ provider: "github" })
              }}
              className="border-sidebar-border/70 text-sidebar-foreground/60 hover:border-sidebar-border hover:bg-sidebar-accent/60 hover:text-sidebar-foreground mt-1 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors"
            >
              <GitHubIcon className="h-[14px] w-[14px]" />
              {t("signIn")}
            </button>
          )}
        </SidebarFooter>
      </TooltipProvider>
    </ShadcnSidebar>
  )
}
