import type { TypeScriptRecipe } from "./types"

export const typingGenerics: TypeScriptRecipe = {
  id: "typing-generics",
  label: "Componentes Genéricos",
  description:
    "Componentes que funcionan con cualquier tipo de dato. Útiles para listas, selectores, tablas y wrappers reutilizables.",
  category: "patterns",
  code: `// ── Lista genérica ──────────────────────────────────────
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  )
}

// ✓ TypeScript infiere T = { id: number; name: string }
<List
  items={[{ id: 1, name: "Ana" }]}
  keyExtractor={(u) => String(u.id)}
  renderItem={(u) => <span>{u.name}</span>}
/>

// ── Select genérico ──────────────────────────────────────
interface SelectProps<T> {
  options: T[]
  value: T
  onChange: (value: T) => void
  getLabel: (option: T) => string
  getValue: (option: T) => string
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={getValue(value)}
      onChange={(e) => {
        const selected = options.find((o) => getValue(o) === e.target.value)
        if (selected) onChange(selected)
      }}
    >
      {options.map((opt) => (
        <option key={getValue(opt)} value={getValue(opt)}>
          {getLabel(opt)}
        </option>
      ))}
    </select>
  )
}`,
  do: `// ✓ Genérico — el tipo se infiere y se preserva
function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) { ... }

// T se infiere como { id: number; name: string }
<List items={users} keyExtractor={(u) => String(u.id)} renderItem={(u) => u.name} />`,
  dont: `// ✗ any[] pierde toda la información de tipo
function List({ items, renderItem }: { items: any[]; renderItem: (item: any) => ReactNode }) { ... }

// u es any — sin autocompletado, sin errores de tipo
<List items={users} renderItem={(u) => u.naem} /> // typo sin error`,
  playground: {
    files: {
      "/App.js": `import { useState } from "react"

function List({ items, renderItem, keyExtractor }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((item, i) => (
        <li key={keyExtractor(item)} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
          {renderItem(item, i)}
        </li>
      ))}
    </ul>
  )
}

const users = [
  { id: 1, name: "Ana García", role: "Frontend" },
  { id: 2, name: "Luis Pérez", role: "Backend" },
  { id: 3, name: "Sara López", role: "Fullstack" },
]

const repos = [
  { slug: "facebook/react", stars: 230000 },
  { slug: "vercel/next.js", stars: 130000 },
  { slug: "vitejs/vite", stars: 72000 },
]

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>Componentes Genéricos</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 16 }}>
        El mismo componente &lt;List&gt; renderiza tipos distintos.
      </p>

      <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--fg-muted)", marginBottom: 6 }}>Lista de usuarios</p>
      <List
        items={users}
        keyExtractor={(u) => String(u.id)}
        renderItem={(u) => (
          <span>
            <strong style={{ fontFamily: "monospace" }}>{u.name}</strong>
            <span style={{ color: "var(--fg-muted)", marginLeft: 8, fontSize: 11 }}>{u.role}</span>
          </span>
        )}
      />

      <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--fg-muted)", margin: "16px 0 6px" }}>Lista de repos</p>
      <List
        items={repos}
        keyExtractor={(r) => r.slug}
        renderItem={(r) => (
          <span style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "monospace" }}>{r.slug}</span>
            <span style={{ color: "var(--fg-muted)", fontSize: 11 }}>⭐ {(r.stars / 1000).toFixed(0)}k</span>
          </span>
        )}
      />
    </div>
  )
}`,
    },
  },
}
