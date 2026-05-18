"use client"

import type { ReactNode } from "react"
import { ThemeProvider, type Theme } from "@/hooks/use-theme"
import { EditorThemeProvider } from "@/hooks/use-editor-theme"
import { ProgressProvider } from "@/hooks/use-progress"
import { CodePersistenceProvider } from "@/hooks/use-code-persistence"
import { NavigationProvider } from "@/providers/navigation-provider"

export function AppProviders({
  children,
  initialTheme,
}: {
  children: ReactNode
  initialTheme?: Theme
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <EditorThemeProvider>
        <ProgressProvider>
          <CodePersistenceProvider>
            <NavigationProvider>{children}</NavigationProvider>
          </CodePersistenceProvider>
        </ProgressProvider>
      </EditorThemeProvider>
    </ThemeProvider>
  )
}
