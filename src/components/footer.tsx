"use client"

import { Separator } from "@/components/ui/separator"
import { useProgress } from "@/hooks/use-progress"
import { useContent } from "@/providers/content-provider"
import { Bug, Heart } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { GitHubIcon, ReactIcon } from "./svg-icons"

export function Footer() {
  const t = useTranslations("Footer")
  const { allConcepts, allExercises, allQuizzes } = useContent()
  const { visitedConcepts, completedExercises, quizScores } = useProgress()

  const hasProgress = visitedConcepts.size > 0
  const quizzesAttempted = Object.keys(quizScores).length

  const links = [
    { label: "react.dev", href: "https://react.dev", Icon: ReactIcon },
    {
      label: t("reportBug"),
      href: "https://github.com/drbarzaga/react-dojo/issues/new",
      Icon: Bug,
    },
  ]

  return (
    <footer className="border-line shrink-0 border-t px-4 py-3 md:px-6">
      {/* Mobile + tablet */}
      <div className="text-fg-faint flex flex-col gap-2 text-[11px] lg:hidden">
        <span className="flex items-center justify-center gap-1 select-none">
          {t("madeWith")} <Heart className="h-[11px] w-[11px] fill-red-500 text-red-500" />{" "}
          {t("by")}{" "}
          <Link
            href="https://github.com/drbarzaga"
            target="_blank"
            rel="noreferrer"
            className="text-fg-dim decoration-fg-faint underline underline-offset-2"
          >
            @drbarzaga
          </Link>
        </span>
        <div className="flex items-center justify-center gap-4">
          {links.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="border-line text-fg-muted flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
            >
              <Icon className="h-[12px] w-[12px]" strokeWidth={1.6} />
              {label}
            </Link>
          ))}
          <Link
            href="https://github.com/drbarzaga/react-dojo"
            target="_blank"
            rel="noreferrer"
            className="border-line text-fg-muted flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
          >
            <GitHubIcon className="h-[12px] w-[12px]" />
            {t("contribute")}
          </Link>
        </div>
      </div>

      {/* Desktop */}
      <div className="text-fg-faint relative hidden items-center justify-between text-[11px] lg:flex">
        <div className="flex items-center gap-3">
          <span className="tabular whitespace-nowrap">
            {hasProgress && `${visitedConcepts.size}/`}
            {t("concepts", { count: allConcepts.length })}
          </span>
          <Separator orientation="vertical" className="bg-fg-faint h-3" />
          <span className="tabular whitespace-nowrap">
            {hasProgress && `${completedExercises.size}/`}
            {t("exercises", { count: allExercises.length })}
          </span>
          <Separator orientation="vertical" className="bg-fg-faint h-3" />
          <span className="tabular whitespace-nowrap">
            {hasProgress && `${quizzesAttempted}/`}
            {t("quizzes", { count: allQuizzes.length })}
          </span>
        </div>

        <span className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 select-none xl:flex">
          {t("madeWith")} <Heart className="h-[11px] w-[11px] fill-red-500 text-red-500" />{" "}
          {t("by")}{" "}
          <Link
            href="https://github.com/drbarzaga"
            target="_blank"
            rel="noreferrer"
            className="text-fg-dim decoration-fg-faint hover:text-fg-muted underline underline-offset-2 transition-colors"
          >
            @drbarzaga
          </Link>
        </span>

        <div className="flex items-center gap-2">
          {links.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="border-line text-fg-muted hover:border-fg-muted hover:text-fg flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase transition-colors"
            >
              <Icon className="h-[12px] w-[12px]" strokeWidth={1.6} />
              {label}
            </Link>
          ))}
          <Link
            href="https://github.com/drbarzaga/react-dojo"
            target="_blank"
            rel="noreferrer"
            className="border-line text-fg-muted hover:border-fg-muted hover:text-fg flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase transition-colors"
          >
            <GitHubIcon className="h-[12px] w-[12px]" />
            {t("contribute")}
          </Link>
        </div>
      </div>
    </footer>
  )
}
