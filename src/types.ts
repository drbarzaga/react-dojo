export type EditorThemeId =
  | "auto"
  | "oneDark"
  | "tokyoNight"
  | "catppuccin"
  | "rosePine"
  | "dracula"
  | "nightOwl"
  | "monokai"
  | "githubLight"

export type EditorThemeFamily = "auto" | "dark" | "light"

export interface EditorThemeMeta {
  label: string
  family: EditorThemeFamily
  bg: string
  colors: [string, string, string] // keyword, string, function/definition
}

export type ExerciseFiles = Record<string, string>

export type PlaygroundLayout = "horizontal" | "vertical"

export type PlaygroundSaveState = "idle" | "saving" | "saved"
