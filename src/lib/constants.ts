import { EditorThemeId, EditorThemeMeta } from "@/types"

export const EDITOR_THEMES_META: Record<EditorThemeId, EditorThemeMeta> = {
  auto: {
    label: "Auto",
    family: "auto",
    bg: "#0f0f11",
    colors: ["#c4956a", "#87a89d", "#8babcc"],
  },
  oneDark: {
    label: "One Dark Pro",
    family: "dark",
    bg: "#282c34",
    colors: ["#c678dd", "#98c379", "#61afef"],
  },
  tokyoNight: {
    label: "Tokyo Night",
    family: "dark",
    bg: "#1a1b26",
    colors: ["#bb9af7", "#9ece6a", "#7aa2f7"],
  },
  catppuccin: {
    label: "Catppuccin Mocha",
    family: "dark",
    bg: "#1e1e2e",
    colors: ["#cba6f7", "#a6e3a1", "#89b4fa"],
  },
  rosePine: {
    label: "Rosé Pine",
    family: "dark",
    bg: "#191724",
    colors: ["#c4a7e7", "#f6c177", "#9ccfd8"],
  },
  dracula: {
    label: "Dracula",
    family: "dark",
    bg: "#282A36",
    colors: ["#ff79c6", "#f1fa8c", "#50fa7b"],
  },
  nightOwl: {
    label: "Night Owl",
    family: "dark",
    bg: "#011627",
    colors: ["#c792ea", "#ecc48d", "#82aaff"],
  },
  monokai: {
    label: "Monokai",
    family: "dark",
    bg: "#272822",
    colors: ["#f92672", "#e6db74", "#a6e22e"],
  },
  githubLight: {
    label: "GitHub Light",
    family: "light",
    bg: "#ffffff",
    colors: ["#cf222e", "#0a3069", "#8250df"],
  },
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

export const PLAYGROUND_FONT_SIZE_MIN_PX = 11
export const PLAYGROUND_FONT_SIZE_MAX_PX = 18
export const PLAYGROUND_FONT_SIZE_STEP_PX = 0.5
export const PLAYGROUND_FONT_SIZE_DEFAULT_PX = 13.5
export const PLAYGROUND_FONT_SIZE_STORAGE_KEY = "react-dojo-playground-font-size"
export const PLAYGROUND_LAYOUT_STORAGE_KEY = "react-dojo-playground-layout"
export const PLAYGROUND_SAVED_INDICATOR_DURATION_MS = 1400
export const PLAYGROUND_RESET_CONFIRM_DURATION_MS = 2000
export const PLAYGROUND_FLUSH_SAVE_EVENT = "playground:flush-save"
export const PLAYGROUND_ROOT_ATTR = "data-playground-root"
export const PLAYGROUND_MAXIMIZED_Z_INDEX = 40
export const PLAYGROUND_MAXIMIZED_PORTAL_ELEMENT_ID = "playground-maximized-portal"
export const PLAYGROUND_PREVIEW_ACTION_BUTTON_PX = 36
export const PLAYGROUND_PREVIEW_ACTION_ICON_PX = 17

export const MOBILE_BREAKPOINT = 768

export const PROGRESS_STORAGE_KEY = "react-dojo-progress"
export const SIDEBAR_OPEN_STATE_KEY = "react-dojo-sidebar-open"

// Donation URLs
export const PAYPAL_URL = "https://paypal.me/reactdojolearn"
export const KOFI_URL = "https://ko-fi.com/reactdojo"

export const PROTECTED_API_ROUTES = ["/api/users", "/api/progress/sync"]

export const SIDEBAR_OPEN_STATE_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365

export const SKELETON_ROW_COUNT_DIRECTORY = 6
