import { EditorThemeId, EditorThemeMeta } from "@/types"

export const EDITOR_THEMES_META: Record<EditorThemeId, EditorThemeMeta> = {
  auto: { label: "Auto", bg: "#0f0f11", colors: ["#c4956a", "#87a89d", "#8babcc"] },
  dracula: { label: "Dracula", bg: "#282A36", colors: ["#ff79c6", "#f1fa8c", "#50fa7b"] },
  nightOwl: { label: "Night Owl", bg: "#011627", colors: ["#c792ea", "#ecc48d", "#82aaff"] },
  githubLight: { label: "GitHub Light", bg: "#ffffff", colors: ["#cf222e", "#0a3069", "#8250df"] },
  monokai: { label: "Monokai", bg: "#272822", colors: ["#f92672", "#e6db74", "#a6e22e"] },
}

export const REPOSITORY = "drbarzaga/react-dojo"
export const DISCORD_URL = "https://discord.gg/ymGswJ9sp3"

export const STARS_KILO_THRESHOLD = 1000

export const TIMER_TICK_MS = 1000

export const SIDEBAR_COOKIE_NAME = "sidebar_state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

export const CODE_SAVE_DEBOUNCE_MS = 750
export const CODE_STORAGE_KEY = "react-dojo-code"
export const THEME_FILE_NAME = "styles.css"

export const MOBILE_BREAKPOINT = 768

export const PROGRESS_STORAGE_KEY = "react-dojo-progress"

// Donation URLs
export const PAYPAL_URL = "https://paypal.me/reactdojolearn"
export const KOFI_URL = "https://ko-fi.com/reactdojo"

export const PROTECTED_API_ROUTES = ["/api/users", "/api/progress/sync"]
