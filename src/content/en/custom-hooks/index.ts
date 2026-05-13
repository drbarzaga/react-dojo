export type { CustomHook, HookCategory } from "@/content/custom-hooks/types"

import { useLocalStorage } from "./use-local-storage"
import { useDebounce } from "./use-debounce"
import { usePrevious } from "./use-previous"
import { useMediaQuery } from "./use-media-query"
import { useToggle } from "./use-toggle"
import { useClickOutside } from "./use-click-outside"
import { useClipboard } from "./use-clipboard"
import { useWindowSize } from "./use-window-size"
import { useInterval } from "./use-interval"
import { useFetch } from "./use-fetch"
import { useHover } from "./use-hover"
import { useEventListener } from "./use-event-listener"
import { useIntersectionObserver } from "./use-intersection-observer"
import { useCounter } from "./use-counter"
import { useOnlineStatus } from "./use-online-status"
import { useKeyPress } from "./use-key-press"
import { useLongPress } from "./use-long-press"
import { useScrollPosition } from "./use-scroll-position"

import type { CustomHook } from "@/content/custom-hooks/types"

export const allCustomHooks: CustomHook[] = [
  useLocalStorage,
  useDebounce,
  usePrevious,
  useMediaQuery,
  useToggle,
  useClickOutside,
  useClipboard,
  useWindowSize,
  useInterval,
  useFetch,
  useHover,
  useEventListener,
  useIntersectionObserver,
  useCounter,
  useOnlineStatus,
  useKeyPress,
  useLongPress,
  useScrollPosition,
]

export const customHookIndex: Record<string, CustomHook> = Object.fromEntries(
  allCustomHooks.map((hook) => [hook.id, hook])
)
