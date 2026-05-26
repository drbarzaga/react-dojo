"use client"

import { routing } from "@/i18n/routing"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (next: string) => {
    router.push(pathname, { locale: next })
  }

  return (
    <div className="border-line flex items-center gap-0.5 rounded-md border p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          className={[
            "rounded px-2 py-0.5 font-mono text-[11px] uppercase transition-colors",
            l === locale ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
          ].join(" ")}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
