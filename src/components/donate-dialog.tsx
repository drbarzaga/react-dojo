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
import { PAYPAL_URL, KOFI_URL } from "@/lib/constants"
import { PayPalIcon } from "./svg-icons"
import Link from "next/link"
import Image from "next/image"

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
                  className="hover:bg-bg-hover grid h-7 w-7 place-items-center rounded-md text-pink-500 transition-colors"
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
          <div className="mb-1 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-500/10">
              <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
            </span>
            <DialogTitle className="font-sans text-[16px] font-semibold">{t("title")}</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-fg-muted font-sans text-[13px] leading-relaxed">{t("description")}</p>

        <div className="border-line bg-bg-raise rounded-lg border p-4">
          <p className="text-fg-dim mb-3 font-sans text-[10px] font-semibold tracking-[0.12em] uppercase">
            {t("costsTitle")}
          </p>
          <div className="flex flex-col gap-3">
            {costs.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="bg-bg-hover flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                  <Icon className="text-fg-muted h-[13px] w-[13px]" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-fg font-sans text-[13px] font-medium">{t(`${key}Label`)}</p>
                  <p className="text-fg-muted font-sans text-[12px]">{t(`${key}Desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={PAYPAL_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0070BA] px-4 py-2.5 font-sans text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            <PayPalIcon />
            {t("cta")}
          </Link>

          <Link
            href={KOFI_URL}
            target="_blank"
            rel="noreferrer"
            className="group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-sans text-[13px] font-medium text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#0070ba" }}
          >
            <Image
              src="https://storage.ko-fi.com/cdn/cup-border.png"
              alt="Ko-fi"
              width={20}
              height={20}
              aria-hidden
              style={{ height: 20, width: "auto", border: 0 }}
              className="group-hover:animate-[kofi-wiggle_0.6s_ease-in-out]"
            />
            Donate via Ko-fi
          </Link>
        </div>

        <p className="text-fg-dim text-center font-sans text-[11px]">{t("note")}</p>
      </DialogContent>
    </Dialog>
  )
}
