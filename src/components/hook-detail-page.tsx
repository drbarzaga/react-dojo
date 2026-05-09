"use client"

import { FeedbackWidget } from "@/components/feedback-widget"
import { Playground, getSandpackTheme } from "@/components/playground"
import type { CustomHook, HookCategory } from "@/content/custom-hooks"
import { useEditorTheme } from "@/hooks/use-editor-theme"
import { useKeyboardNav } from "@/hooks/use-keyboard-nav"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useTheme } from "@/hooks/use-theme"
import { SandpackCodeEditor, SandpackLayout, SandpackProvider } from "@codesandbox/sandpack-react"
import { ArrowLeft, Check, Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"

type Tab = "code" | "playground"

const categoryColors: Record<HookCategory, string> = {
  state: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  dom: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  utility: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  async: "bg-purple-400/10 text-purple-400 border-purple-400/20",
}

interface HookDetailPageProps {
  hook: CustomHook
  prev?: CustomHook
  next?: CustomHook
}

function CodeViewer({ code, hookId }: { code: string; hookId: string }) {
  const { theme: appTheme } = useTheme()
  const { editorTheme } = useEditorTheme()
  const sandpackTheme = useMemo(
    () => getSandpackTheme(editorTheme, appTheme),
    [editorTheme, appTheme]
  )

  const files = useMemo(
    () => ({ [`/${hookId}.ts`]: { code, active: true, readOnly: true } }),
    [hookId, code]
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

export function HookDetailPage({ hook, prev, next }: HookDetailPageProps) {
  const t = useTranslations("CustomHooks")
  const { push, href } = useLocaleRouter()
  const [tab, setTab] = useState<Tab>("code")
  const [copied, setCopied] = useState(false)

  useKeyboardNav({
    prev: prev && `/hooks/${prev.id}`,
    next: next && `/hooks/${next.id}`,
  })

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(hook.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [hook.code])

  return (
    <article className="mx-auto max-w-[1000px] px-5 py-10 md:px-12 md:py-20">
      {/* Back nav */}
      <button
        onClick={() => push("/hooks")}
        className="text-fg-dim hover:text-fg mb-8 flex cursor-pointer items-center gap-2 text-[12px] transition-colors"
      >
        <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.8} />
        {t("backToHooks")}
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3">
          <span
            className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${categoryColors[hook.category]}`}
          >
            {hook.category}
          </span>
        </div>
        <h1 className="text-fg font-mono text-[32px] leading-none font-medium">{hook.label}</h1>
        <p className="text-fg-muted mt-4 text-[17px] leading-[1.65]">{hook.description}</p>
      </div>

      <hr className="border-line border-t" />

      {/* Tabs */}
      <div className="border-line flex gap-0 border-b">
        <TabButton active={tab === "code"} onClick={() => setTab("code")}>
          {t("tabCode")}
        </TabButton>
        <TabButton active={tab === "playground"} onClick={() => setTab("playground")}>
          {t("tabPlayground")}
        </TabButton>
      </div>

      <div className="mt-6">
        {/* Code tab */}
        {tab === "code" && (
          <div>
            <div className="text-fg-dim mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-mono">{hook.label}.ts</span>
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
            <CodeViewer code={hook.code} hookId={hook.id} />
          </div>
        )}

        {/* Playground tab */}
        {tab === "playground" && (
          <Playground files={hook.playground.files} dependencies={hook.playground.dependencies} />
        )}
      </div>

      <FeedbackWidget contentType="hook" contentId={hook.id} />

      {/* Prev / Next navigation */}
      <nav className="border-line mt-12 flex items-start justify-between gap-8 border-t pt-8 text-[14px]">
        {prev ? (
          <a
            href={href(`/hooks/${prev.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/hooks/${prev.id}`)
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
            href={href(`/hooks/${next.id}`)}
            onClick={(e) => {
              e.preventDefault()
              push(`/hooks/${next.id}`)
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "cursor-pointer border-b-2 px-4 py-2.5 font-mono text-[12px] transition-colors",
        active ? "border-fg text-fg" : "text-fg-dim hover:text-fg-muted border-transparent",
      ].join(" ")}
    >
      {children}
    </button>
  )
}
