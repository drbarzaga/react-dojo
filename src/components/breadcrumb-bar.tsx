"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useContent } from "@/providers/content-provider"
import { usePathname } from "@/i18n/navigation"

export function BreadcrumbBar() {
  const pathname = usePathname()
  const { push, href } = useLocaleRouter()
  const { allConcepts, allExercises, allQuizzes, categories } = useContent()

  const path = pathname

  let items: { label: string; href?: string }[]

  if (path.startsWith("/learn/")) {
    const id = path.replace("/learn/", "")
    const exercise = allExercises.find((e) => e.id === id)
    if (!exercise) return null
    items = [
      { label: "Practice", href: `/learn/${allExercises[0]?.id}` },
      { label: exercise.label },
    ]
  } else if (path.startsWith("/quiz/")) {
    const id = path.replace("/quiz/", "")
    const quiz = allQuizzes.find((q) => q.id === id)
    if (!quiz) return null
    items = [{ label: "Quiz" }, { label: quiz.label }]
  } else if (path !== "/" && path !== "") {
    const id = path.replace("/", "")
    const concept = allConcepts.find((c) => c.id === id)
    if (!concept) return null
    const category = categories.find((c) => c.conceptIds.includes(concept.id))
    items = [...(category ? [{ label: category.title }] : []), { label: concept.label }]
  } else {
    return null
  }

  return (
    <div className="border-line bg-bg shrink-0 border-b px-4 py-2 md:px-6">
      <Breadcrumb>
        <BreadcrumbList className="gap-1 text-[11px] sm:gap-1">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <BreadcrumbSeparator className="text-fg-faint" />}
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink
                    render={
                      <a
                        href={href(item.href)}
                        onClick={(e) => {
                          e.preventDefault()
                          push(item.href!)
                        }}
                      >
                        {item.label}
                      </a>
                    }
                    className="text-fg-faint hover:text-fg-muted transition-colors"
                  />
                ) : (
                  <BreadcrumbPage className="text-fg-muted font-mono">{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
