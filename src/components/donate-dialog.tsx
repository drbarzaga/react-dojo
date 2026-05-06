"use client"

import { Heart, Server, Database, Globe } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const PAYPAL_URL = "https://paypal.me/reactdojolearn"

const costs = [
  { icon: Database, key: "costDatabase" as const },
  { icon: Server, key: "costServer" as const },
  { icon: Globe, key: "costDomain" as const },
]

export function DonateDialog() {
  const t = useTranslations("DonateDialog")

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <button
                  type="button"
                  aria-label={t("tooltip")}
                  className="grid h-7 w-7 place-items-center rounded-md text-pink-500 transition-colors hover:bg-[var(--color-bg-hover)]"
                />
              }
            >
              <Heart className="h-[15px] w-[15px] fill-pink-500" strokeWidth={1.8} />
            </DialogTrigger>
          }
        />
        <TooltipContent>{t("tooltip")}</TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/10">
              <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
            </span>
            <DialogTitle className="text-[16px]">{t("title")}</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
          {t("description")}
        </p>

        <div className="mt-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-raise)] p-4">
          <p className="mb-3 text-[12px] font-medium tracking-wider text-[var(--color-fg-dim)] uppercase">
            {t("costsTitle")}
          </p>
          <div className="flex flex-col gap-2.5">
            {costs.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-bg-hover)]">
                  <Icon
                    className="h-[14px] w-[14px] text-[var(--color-fg-muted)]"
                    strokeWidth={1.5}
                  />
                </span>
                <div>
                  <p className="text-[13px] text-[var(--color-fg)]">{t(`${key}Label`)}</p>
                  <p className="text-[12px] text-[var(--color-fg-muted)]">{t(`${key}Desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href={PAYPAL_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0070BA] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <PayPalIcon />
          {t("cta")}
        </a>

        <p className="text-center text-[11px] text-[var(--color-fg-dim)]">{t("note")}</p>
      </DialogContent>
    </Dialog>
  )
}

function PayPalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.828l-1.182 7.487h3.176l.786-4.985h2.19c4.963 0 7.718-2.396 8.56-7.104a5.64 5.64 0 0 0-.136-1.193z" />
    </svg>
  )
}
