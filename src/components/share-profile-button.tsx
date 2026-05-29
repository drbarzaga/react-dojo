"use client"

import { cn } from "@/lib/utils"
import { Check, Link2, Share2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

/**
 * Copies (or natively shares) the link to the user's public profile.
 * Rendered only on the owner's own /profile page.
 */
export function ShareProfileButton({ slug }: { slug: string }) {
  const t = useTranslations("Profile")
  const locale = useLocale()
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/${locale}/u/${slug}`
    // Prefer the native share sheet on supported devices, fall back to clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ title: t("shareTitle"), url })
        return
      } catch {
        // user dismissed the share sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable; nothing else to do
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors",
        copied
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
          : "border-line text-fg-muted hover:text-fg bg-bg-raise hover:bg-bg-hover"
      )}
      aria-label={t("share")}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
          {t("copied")}
        </>
      ) : (
        <>
          <Share2 className="hidden h-3.5 w-3.5 sm:block" strokeWidth={2} />
          <Link2 className="h-3.5 w-3.5 sm:hidden" strokeWidth={2} />
          {t("share")}
        </>
      )}
    </button>
  )
}
