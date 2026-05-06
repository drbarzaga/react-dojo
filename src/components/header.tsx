"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { Keyboard, Search, Star } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/hooks/use-theme"
import { useEditorTheme } from "@/hooks/use-editor-theme"
import { useGitHubStars } from "@/hooks/use-github-stars"
import { useCountUp } from "@/hooks/use-count-up"
import { Logo } from "@/components/logo"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { type EditorThemeId } from "@/types"
import { DISCORD_URL, EDITOR_THEMES_META, REPOSITORY, STARS_KILO_THRESHOLD } from "@/lib/constants"
import { DiscordIcon, MoonIcon, PaletteIcon, SunIcon } from "./svg-icons"
import { useIsMobile } from "@/hooks/use-mobile"
import { DonateDialog } from "@/components/donate-dialog"

interface HeaderProps {
  onSearchOpen?: () => void
  onShortcutsOpen?: () => void
}

export function Header({ onSearchOpen, onShortcutsOpen }: HeaderProps) {
  const t = useTranslations("Header")
  const { theme, toggle } = useTheme()
  const isMobile = useIsMobile()
  const { editorTheme, setEditorTheme } = useEditorTheme()
  const stars = useGitHubStars(REPOSITORY)
  const animatedStars = useCountUp(stars)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const { href } = useLocaleRouter()

  const handlePickerBlur = (e: React.FocusEvent) => {
    if (!pickerRef.current?.contains(e.relatedTarget as Node)) {
      setPickerOpen(false)
    }
  }

  const selectTheme = (id: EditorThemeId) => {
    setEditorTheme(id)
    setPickerOpen(false)
  }

  return (
    <TooltipProvider delay={400}>
      <header className="relative z-20 flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-bg)] px-3 md:px-6">
        {/* Left — logo */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)] md:hidden" />
          <Link
            href={href("/")}
            className="flex items-center gap-2 text-[14px] text-[var(--color-fg)] transition-colors hover:text-[var(--color-fg-muted)]"
          >
            <Logo className="h-[28px] w-auto" />
            <span className="hidden font-mono sm:inline">React Dojo</span>
          </Link>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label={t("search")}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)] sm:hidden"
          >
            <Search className="h-[15px] w-[15px]" strokeWidth={1.8} />
          </button>

          {/* Desktop search */}
          <button
            type="button"
            onClick={onSearchOpen}
            className="hidden w-52 items-center gap-2 rounded-lg py-1.5 pr-2 pl-3 text-[12px] text-[var(--color-fg-dim)] transition-all hover:text-[var(--color-fg-muted)] sm:flex"
            style={
              theme === "light"
                ? { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)" }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }
            }
          >
            <Search className="h-[12px] w-[12px] shrink-0" strokeWidth={1.8} />
            <span className="flex-1 text-left font-mono">{t("searchPlaceholder")}</span>
            <div className="flex items-center gap-0.5">
              {["⌘", "K"].map((k) => (
                <kbd
                  key={k}
                  className="rounded border border-[var(--color-line-strong)] bg-[var(--color-bg-hover)] px-1.5 py-0.5 font-mono text-[10px] leading-none text-[var(--color-fg-muted)]"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </button>

          {/* GitHub stars */}
          {stars !== null && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={`https://github.com/${REPOSITORY}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)]"
                  >
                    <Star className="star-animate h-[15px] w-[15px] fill-yellow-400 text-yellow-400" />
                    <span className="font-mono">
                      {animatedStars >= STARS_KILO_THRESHOLD
                        ? `${(animatedStars / STARS_KILO_THRESHOLD).toFixed(1)}k`
                        : animatedStars}
                    </span>
                  </a>
                }
              />
              <TooltipContent>{t("supportProject")}</TooltipContent>
            </Tooltip>
          )}

          {/* Editor theme picker */}
          <div ref={pickerRef} className="relative" onBlur={handlePickerBlur}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    aria-label={t("editorTheme")}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)]"
                  >
                    <PaletteIcon className="h-[15px] w-[15px]" />
                  </button>
                }
              />
              <TooltipContent>{t("editorTheme")}</TooltipContent>
            </Tooltip>

            {pickerOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-[186px] rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-raise)] p-1.5 shadow-lg">
                {(
                  Object.entries(EDITOR_THEMES_META) as [
                    EditorThemeId,
                    (typeof EDITOR_THEMES_META)[EditorThemeId],
                  ][]
                ).map(([id, meta]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectTheme(id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-bg-hover)]"
                  >
                    <span
                      className="flex h-5 w-8 shrink-0 items-center gap-[3px] overflow-hidden rounded px-1"
                      style={{ background: meta.bg }}
                    >
                      {meta.colors.map((c, i) => (
                        <span
                          key={i}
                          className="h-2 w-1 shrink-0 rounded-sm"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span
                      className={`text-[13px] ${editorTheme === id ? "text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}`}
                    >
                      {meta.label}
                    </span>
                    {editorTheme === id && (
                      <span className="ml-auto text-[10px] text-[var(--color-fg-dim)]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
                  className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)]"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-[15px] w-[15px]" />
                  ) : (
                    <MoonIcon className="h-[15px] w-[15px]" />
                  )}
                </button>
              }
            />
            <TooltipContent>{theme === "dark" ? t("modeLight") : t("modeDark")}</TooltipContent>
          </Tooltip>

          {/* Keyboard shortcuts */}
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={onShortcutsOpen}
                    aria-label="Keyboard shortcuts"
                    className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)]"
                  >
                    <Keyboard className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  </button>
                }
              />
              <TooltipContent>Keyboard shortcuts</TooltipContent>
            </Tooltip>
          )}

          <LocaleSwitcher />

          {/* Donate */}
          <DonateDialog />

          {/* Discord */}
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("joinDiscord")}
                  className="discord-glow grid h-7 w-7 place-items-center rounded-md text-[#5865F2] transition-colors hover:bg-[var(--color-bg-hover)]"
                >
                  <DiscordIcon className="h-[16px] w-[16px]" />
                </a>
              }
            />
            <TooltipContent>{t("joinDiscord")}</TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  )
}
