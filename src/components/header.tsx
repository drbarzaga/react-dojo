"use client"

import { DonateDialog } from "@/components/donate-dialog"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { Logo } from "@/components/logo"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCountUp } from "@/hooks/use-count-up"
import { useEditorTheme } from "@/hooks/use-editor-theme"
import { useGitHubStars } from "@/hooks/use-github-stars"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTheme } from "@/hooks/use-theme"
import { DISCORD_URL, EDITOR_THEMES_META, REPOSITORY, STARS_KILO_THRESHOLD } from "@/lib/constants"
import { type EditorThemeFamily, type EditorThemeId, type EditorThemeMeta } from "@/types"
import { Check, Keyboard, Search, Star } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import { DiscordIcon, MoonIcon, PaletteIcon, SunIcon } from "./svg-icons"

interface ThemeEntry {
  id: EditorThemeId
  meta: EditorThemeMeta
}

interface HeaderProps {
  onSearchOpen?: () => void
  onShortcutsOpen?: () => void
}

export function Header({ onSearchOpen, onShortcutsOpen }: HeaderProps) {
  const t = useTranslations("Header")
  const { theme, toggle } = useTheme()
  const isMobile = useIsMobile()
  const { editorTheme, setEditorTheme } = useEditorTheme()
  const { stars, animate } = useGitHubStars(REPOSITORY)
  const animatedStars = useCountUp(stars, animate)
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

  const themeGroups = useMemo(() => {
    const all = (Object.entries(EDITOR_THEMES_META) as [EditorThemeId, EditorThemeMeta][]).map(
      ([id, meta]) => ({ id, meta })
    )
    return {
      auto: all.filter((entry) => entry.meta.family === "auto"),
      dark: all.filter((entry) => entry.meta.family === "dark"),
      light: all.filter((entry) => entry.meta.family === "light"),
    } satisfies Record<EditorThemeFamily, ThemeEntry[]>
  }, [])

  return (
    <TooltipProvider delay={400}>
      <header className="border-line bg-bg relative z-50 flex h-12 shrink-0 items-center justify-between border-b px-3 md:px-6">
        {/* Left — logo */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-fg-muted hover:bg-bg-hover hover:text-fg md:hidden" />
          <Link
            href={href("/")}
            className="text-fg hover:text-fg-muted flex items-center gap-2 text-[14px] transition-colors"
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
            className="text-fg-muted hover:bg-bg-hover hover:text-fg grid h-7 w-7 place-items-center rounded-md transition-colors sm:hidden"
          >
            <Search className="h-[15px] w-[15px]" strokeWidth={1.8} />
          </button>

          {/* Desktop search */}
          <button
            type="button"
            onClick={onSearchOpen}
            className="text-fg-dim hover:text-fg-muted hidden w-52 items-center gap-2 rounded-lg py-1.5 pr-2 pl-3 text-[12px] transition-all sm:flex"
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
                  className="border-line-strong bg-bg-hover text-fg-muted rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none"
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
                    className="text-fg-muted hover:bg-bg-hover hover:text-fg flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] transition-colors"
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
                    className="text-fg-muted hover:bg-bg-hover hover:text-fg grid h-7 w-7 cursor-pointer place-items-center rounded-md transition-colors"
                  >
                    <PaletteIcon className="h-[15px] w-[15px]" />
                  </button>
                }
              />
              <TooltipContent>{t("editorTheme")}</TooltipContent>
            </Tooltip>

            {pickerOpen && (
              <div className="border-line bg-bg-raise absolute top-full right-0 z-50 mt-2 w-[244px] overflow-hidden rounded-lg border p-1.5 shadow-2xl">
                <div className="max-h-[440px] overflow-y-auto">
                  {themeGroups.auto.map(({ id, meta }) => (
                    <ThemeOption
                      key={id}
                      id={id}
                      meta={meta}
                      active={editorTheme === id}
                      onSelect={selectTheme}
                    />
                  ))}

                  {themeGroups.dark.length > 0 && (
                    <ThemeGroupLabel>{t("themeGroupDark")}</ThemeGroupLabel>
                  )}
                  {themeGroups.dark.map(({ id, meta }) => (
                    <ThemeOption
                      key={id}
                      id={id}
                      meta={meta}
                      active={editorTheme === id}
                      onSelect={selectTheme}
                    />
                  ))}

                  {themeGroups.light.length > 0 && (
                    <ThemeGroupLabel>{t("themeGroupLight")}</ThemeGroupLabel>
                  )}
                  {themeGroups.light.map(({ id, meta }) => (
                    <ThemeOption
                      key={id}
                      id={id}
                      meta={meta}
                      active={editorTheme === id}
                      onSelect={selectTheme}
                    />
                  ))}
                </div>
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
                  className="text-fg-muted hover:bg-bg-hover hover:text-fg grid h-7 w-7 cursor-pointer place-items-center rounded-md transition-colors"
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
                    className="text-fg-muted hover:bg-bg-hover hover:text-fg grid h-7 w-7 place-items-center rounded-md transition-colors"
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
                  className="discord-glow hover:bg-bg-hover grid h-7 w-7 place-items-center rounded-md text-[#5865F2] transition-colors"
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

function ThemeGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-fg-dim mt-2 mb-1 px-2 pt-1 text-[9px] font-semibold tracking-[0.18em] uppercase">
      {children}
    </div>
  )
}

interface ThemeOptionProps {
  id: EditorThemeId
  meta: EditorThemeMeta
  active: boolean
  onSelect: (id: EditorThemeId) => void
}

function ThemeOption({ id, meta, active, onSelect }: ThemeOptionProps) {
  const [keyword, string, fn] = meta.colors
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`group/theme flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors ${
        active ? "bg-bg-hover" : "hover:bg-bg-hover/60"
      }`}
    >
      <span
        className="flex h-7 w-11 shrink-0 flex-col justify-center gap-[3px] overflow-hidden rounded-md p-1.5 transition-transform duration-200 group-hover/theme:scale-105"
        style={{ background: meta.bg }}
        aria-hidden
      >
        <span className="block h-[2px] w-3/4 rounded-full" style={{ background: keyword }} />
        <span className="block h-[2px] w-full rounded-full" style={{ background: string }} />
        <span className="block h-[2px] w-1/2 rounded-full" style={{ background: fn }} />
      </span>
      <span
        className={`flex-1 text-[13px] transition-colors ${active ? "text-fg" : "text-fg-muted group-hover/theme:text-fg"}`}
      >
        {meta.label}
      </span>
      {active && <Check className="text-fg-muted h-[12px] w-[12px] shrink-0" strokeWidth={2.4} />}
    </button>
  )
}
