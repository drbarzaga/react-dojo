import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const typingGenerics: TypeScriptRecipe = {
  id: "typing-generics",
  label: "Generic Components",
  description:
    "Components that work with any data type. Useful for lists, selects, tables, and reusable wrappers.",
  category: "patterns",
  code: `// ── Generic list ────────────────────────────────────────
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

// ✓ TypeScript infers T = { id: number; name: string }
<List
  items={[{ id: 1, name: "Ana" }]}
  keyExtractor={(u) => String(u.id)}
  renderItem={(u) => <span>{u.name}</span>}
/>

// ── Generic select ───────────────────────────────────────
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
  do: `// ✓ Generic — type is inferred and preserved
function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) { ... }

// T is inferred as { id: number; name: string }
<List items={users} keyExtractor={(u) => String(u.id)} renderItem={(u) => u.name} />`,
  dont: `// ✗ any[] loses all type information
function List({ items, renderItem }: { items: any[]; renderItem: (item: any) => ReactNode }) { ... }

// u is any — no autocomplete, no type errors
<List items={users} renderItem={(u) => u.naem} /> // typo with no error`,
  playground: { files: {} },
}
