"use client"

import { FeedbackWidget } from "@/components/feedback-widget"
import { getSandpackTheme } from "@/components/playground"
import type { TypeScriptRecipe, RecipeCategory } from "@/content/typescript-recipes/types"
import { useEditorTheme } from "@/hooks/use-editor-theme"
import { useKeyboardNav } from "@/hooks/use-keyboard-nav"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useTheme } from "@/hooks/use-theme"
import { SandpackCodeEditor, SandpackLayout, SandpackProvider } from "@codesandbox/sandpack-react"
import { ArrowLeft, Check, Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"

const categoryColors: Record<RecipeCategory, string> = {
  props: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  events: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  hooks: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  patterns: "bg-amber-400/10 text-amber-400 border-amber-400/20",
}

interface Props {
  recipe: TypeScriptRecipe
  prev?: TypeScriptRecipe
  next?: TypeScriptRecipe
}

function CodeViewer({ code, recipeId }: { code: string; recipeId: string }) {
  const { theme: appTheme } = useTheme()
  const { editorTheme } = useEditorTheme()
  const sandpackTheme = useMemo(
    () => getSandpackTheme(editorTheme, appTheme),
    [editorTheme, appTheme]
  )

  const files = useMemo(
    () => ({ [`/${recipeId}.tsx`]: { code, active: true, readOnly: true } }),
    [recipeId, code]
  )

  return (
    <SandpackProvider
      template="react-ts"
      theme={sandpackTheme}
      files={files}
      options={{ initMode: "lazy" }}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          readOnly
          showReadOnly={false}
          showLineNumbers
          style={{ height: 520, flex: "1 1 0%" }}
        />
      </SandpackLayout>
    </SandpackProvider>
  )
}

export function TypeScriptDetailPage({ recipe, prev, next }: Props) {
  const t = useTranslations("TypeScript")
  const { push, href } = useLocaleRouter()
  const [copied, setCopied] = useState(false)

  useKeyboardNav({
    prev: prev && `/typescript/${prev.id}`,
    next: next && `/typescript/${next.id}`,
  })

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(recipe.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [recipe.code])

  return (
    <article className="mx-auto max-w-[1000px] px-5 py-10 md:px-12 md:py-20">
      {/* Back nav */}
      <button
        onClick={() => push("/typescript")}
        className="text-fg-dim hover:text-fg mb-8 flex cursor-pointer items-center gap-2 text-[12px] transition-colors"
      >
        <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.8} />
        {t("backToRecipes")}
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3">
          <span
            className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${categoryColors[recipe.category]}`}
          >
            {recipe.category}
          </span>
        </div>
        <h1 className="text-fg font-mono text-[32px] leading-none font-medium">{recipe.label}</h1>
        <p className="text-fg-muted mt-4 text-[17px] leading-[1.65]">{recipe.description}</p>
      </div>

      <hr className="border-line mb-6 border-t" />

      {/* Code */}
      <div>
        <div className="text-fg-dim mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-mono">{recipe.id}.tsx</span>
          <button
            onClick={handleCopy}
            className="text-fg-dim hover:text-fg flex cursor-pointer items-center gap-1.5 text-[11px] transition-colors"
          >
            {copied ? (
              <Check className="h-[12px] w-[12px] text-emerald-400" strokeWidth={2} />
            ) : (
              <Copy className="h-[12px] w-[12px]" strokeWidth={1.8} />
            )}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <CodeViewer code={recipe.code} recipeId={recipe.id} />
      </div>

      {/* Do / Don't */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.02]">
          <div className="flex items-center gap-2 border-b border-red-500/15 px-4 py-2.5">
            <span className="font-mono text-[10px] font-bold tracking-widest text-red-400/70 uppercase">
              ✗ {t("dont")}
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-white/65">
            {recipe.dont}
          </pre>
        </div>
        <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="flex items-center gap-2 border-b border-emerald-500/15 px-4 py-2.5">
            <span className="font-mono text-[10px] font-bold tracking-widest text-emerald-400/70 uppercase">
              ✓ {t("do")}
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-white/65">
            {recipe.do}
          </pre>
        </div>
      </div>

      <FeedbackWidget contentType="hook" contentId={recipe.id} />

      {/* Prev / Next */}
      <nav className="border-line mt-12 flex items-start justify-between gap-8 border-t pt-8 text-[14px]">
        {prev ? (
          <a
            href={href(`/typescript/${prev.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/typescript/${prev.id}`)
            }}
            className="text-fg-muted hover:text-fg flex flex-col gap-1 transition-colors"
          >
            <span className="text-fg-dim text-[12px]">{t("prev")}</span>
            <span className="text-fg font-mono">{prev.label}</span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a
            href={href(`/typescript/${next.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/typescript/${next.id}`)
            }}
            className="text-fg-muted hover:text-fg flex flex-col items-end gap-1 text-right transition-colors"
          >
            <span className="text-fg-dim text-[12px]">{t("next")}</span>
            <span className="text-fg font-mono">{next.label}</span>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
