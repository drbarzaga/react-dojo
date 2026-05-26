import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("NotFound")

  return (
    <div className="flex min-h-[calc(100vh-84px)] flex-col items-center justify-center px-8 py-16">
      <div className="flex max-w-[400px] flex-col items-center text-center">
        <h1 className="text-fg-faint font-mono text-[96px] leading-none font-bold tracking-tight">
          404
        </h1>

        <div className="bg-line-strong mt-8 h-px w-8" />

        <p className="text-fg mt-8 text-[18px] font-medium">{t("title")}</p>
        <p className="text-fg-muted mt-3 text-[14px] leading-relaxed">{t("body")}</p>

        <Link
          href="/"
          className="border-line-strong text-fg-muted hover:border-fg hover:text-fg mt-8 inline-flex items-center gap-2 rounded-md border bg-transparent px-4 py-2 font-mono text-[13px] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          {t("back")}
        </Link>
      </div>
    </div>
  )
}
