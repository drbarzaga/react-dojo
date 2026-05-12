import { counter } from "./counter"
import { autoFocus } from "./auto-focus"
import { stopwatch } from "./stopwatch"
import { filteredList } from "./filtered-list"
import { todoList } from "./todo-list"
import { formReducer } from "./form-reducer"
import { fetchUser } from "./fetch-user"
import { themeContext } from "./theme-context"
import { debouncedSearch } from "./debounced-search"
import { lazyModal } from "./lazy-modal"
import { useCallbackExercise } from "./use-callback"
import { useMemoFilter } from "./use-memo-filter"
import { transitionTabs } from "./transition-tabs"
import { optimisticLike } from "./optimistic-like"
import { actionForm } from "./action-form"
import { toggleButton } from "./toggle-button"
import { inputControl } from "./input-control"
import { likeButton } from "./like-button"
import { tabsComponent } from "./tabs-component"
import { formValidation } from "./form-validation"
import { colorPicker } from "./color-picker"
import { accordionComponent } from "./accordion-component"
import { compoundAccordion } from "./compound-accordion"
import { errorBoundary } from "./error-boundary"
import type { Exercise } from "./types"

export type { Exercise, Difficulty } from "./types"

export const allExercises: Exercise[] = [
  counter,
  autoFocus,
  stopwatch,
  filteredList,
  todoList,
  formReducer,
  fetchUser,
  themeContext,
  debouncedSearch,
  lazyModal,
  useCallbackExercise,
  useMemoFilter,
  transitionTabs,
  optimisticLike,
  actionForm,
  toggleButton,
  inputControl,
  likeButton,
  tabsComponent,
  formValidation,
  colorPicker,
  accordionComponent,
  compoundAccordion,
  errorBoundary,
]

export const exerciseIndex: Record<string, Exercise> = Object.fromEntries(
  allExercises.map((e) => [e.id, e])
)
