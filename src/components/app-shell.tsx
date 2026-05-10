"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { SearchModal } from "@/components/search-modal"
import { ShortcutsModal } from "@/components/shortcuts-modal"
import { BreadcrumbBar } from "@/components/breadcrumb-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import type { SidebarOpenState } from "@/lib/sidebar-state"
import { PLAYGROUND_MAXIMIZED_PORTAL_ELEMENT_ID } from "@/lib/constants"

interface AppShellProps {
  children: React.ReactNode
  initialSidebarState: SidebarOpenState
}

export function AppShell({ children, initialSidebarState }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((v) => !v)
        return
      }
      if (e.key === "?" && !isEditable) {
        setShortcutsOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "auto" })
  }, [pathname])

  return (
    <SidebarProvider defaultOpen className="h-svh! flex-col! overflow-hidden">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header
        onSearchOpen={() => setSearchOpen(true)}
        onShortcutsOpen={() => setShortcutsOpen(true)}
      />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar initialState={initialSidebarState} />
        <SidebarInset className="flex min-w-0 flex-col overflow-hidden">
          <BreadcrumbBar />
          <main
            id="main-content"
            className="min-h-0 flex-1 overflow-y-auto outline-none"
            tabIndex={-1}
          >
            <div key={pathname} className="page-enter">
              {children}
            </div>
          </main>
          <Footer />
        </SidebarInset>
      </div>
      <div id={PLAYGROUND_MAXIMIZED_PORTAL_ELEMENT_ID} />
    </SidebarProvider>
  )
}
