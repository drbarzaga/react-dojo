import { estado } from "./estado"
import { efectos } from "./efectos"
import { rendimiento } from "./rendimiento"
import { concurrencia } from "./concurrencia"
import { composicion } from "./composicion"
import { entrevistas } from "./entrevistas"
import type { Category, Concept } from "./types"

export type { Concept, Category, Section } from "./types"

export const allConcepts: Concept[] = [
  ...estado,
  ...efectos,
  ...rendimiento,
  ...concurrencia,
  ...composicion,
  ...entrevistas,
]

export const conceptIndex: Record<string, Concept> = Object.fromEntries(
  allConcepts.map((c) => [c.id, c])
)

export const categories: Category[] = [
  {
    id: "state",
    kicker: "I",
    title: "Estado y memoria",
    conceptIds: ["useState", "useReducer", "useRef", "useOptimistic", "useActionState"],
  },
  {
    id: "sync",
    kicker: "II",
    title: "Sincronización",
    conceptIds: ["useEffect", "useLayoutEffect", "useEffectEvent"],
  },
  {
    id: "performance",
    kicker: "III",
    title: "Rendimiento",
    conceptIds: ["useMemo", "useCallback", "memo"],
  },
  {
    id: "concurrency",
    kicker: "IV",
    title: "Concurrencia",
    conceptIds: ["useTransition", "useDeferredValue", "Suspense", "use"],
  },
  {
    id: "composition",
    kicker: "V",
    title: "Composición",
    conceptIds: [
      "useContext",
      "createPortal",
      "lazy",
      "useId",
      "useFormStatus",
      "compound-components",
      "error-boundary",
    ],
  },
  {
    id: "interviews",
    kicker: "VI",
    title: "Entrevistas",
    conceptIds: [
      "virtual-dom",
      "controlado-vs-no-controlado",
      "prop-drilling",
      "hoc",
      "render-props",
      "componentes-puros",
      "jsx",
      "key-prop",
      "hydration",
      "forward-ref",
      "strict-mode",
    ],
  },
]
