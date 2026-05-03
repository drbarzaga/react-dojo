"use client"

import { useState, useRef, useEffect } from "react"
import { Info, X } from "lucide-react"
import { useTranslations } from "next-intl"

const RANKS = [
  { label: "DAN", range: "100", color: "text-yellow-400" },
  { label: "1 KYU", range: "86–99", color: "text-orange-400" },
  { label: "2 KYU", range: "71–85", color: "text-purple-400" },
  { label: "3 KYU", range: "56–70", color: "text-blue-400" },
  { label: "4 KYU", range: "41–55", color: "text-cyan-400" },
  { label: "5 KYU", range: "26–40", color: "text-green-400" },
  { label: "6 KYU", range: "13–25", color: "text-emerald-500" },
  { label: "7 KYU", range: "1–12", color: "text-zinc-400" },
  { label: "8 KYU", range: "0", color: "text-zinc-500" },
]

export function KyuInfoButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const t = useTranslations("Directory")

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[var(--color-fg-dim)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg-muted)]"
        aria-label={t("kyuInfoTitle")}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="font-mono text-[11px] tracking-wider">KYU</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-72 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-raise)] p-4 shadow-xl">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-[13px] font-semibold text-[var(--color-fg)]">
                {t("kyuInfoTitle")}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--color-fg-dim)]">{t("kyuInfoDesc")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 text-[var(--color-fg-dim)] hover:text-[var(--color-fg-muted)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2.5">
            <p className="mb-1.5 font-mono text-[10px] font-semibold tracking-widest text-[var(--color-fg-dim)] uppercase">
              {t("kyuInfoFormula")}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-fg-muted)]">
                  {t("kyuInfoConcepts")}
                </span>
                <span className="font-mono text-[11px] font-semibold text-blue-400">50%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-fg-muted)]">
                  {t("kyuInfoExercises")}
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-400">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-fg-muted)]">
                  {t("kyuInfoQuizzes")}
                </span>
                <span className="font-mono text-[11px] font-semibold text-amber-400">20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {RANKS.map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className={`font-mono text-[11px] font-semibold ${r.color}`}>{r.label}</span>
                <span className="font-mono text-[10px] text-[var(--color-fg-dim)]">{r.range}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
