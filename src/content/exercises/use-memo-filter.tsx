import type { Exercise } from "./types"

export const useMemoFilter: Exercise = {
  id: "use-memo-filter",
  label: "use memo filter",
  title: "Derivar listas con useMemo",
  lede: "Una lista de tareas se filtra y ordena con cada render — incluso cuando solo cambia un contador no relacionado. Usa useMemo para que el cálculo pesado solo se repita cuando cambien query u order.",
  difficulty: "basic",
  objectives: [
    "Envuelve el filtrado + ordenamiento en 'useMemo'",
    "Declara '[query, order]' como dependencias",
    "Verifica que el contador ya no recalcula la lista (observa el log en consola)",
  ],
  hint: "useMemo(fn, [deps]) memoriza el valor retornado por fn. Solo recalcula cuando alguna dependencia cambia. Si el cálculo es costoso o produce un array nuevo en cada render, useMemo evita re-renders en cadena.",
  relatedConcepts: ["useMemo", "useCallback"],
  starter: {
    "/App.js": `import { useState, useMemo } from "react";

const ALL_TASKS = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  text: ["fix bug", "write test", "review PR", "update docs", "deploy"][i % 5] + " #" + i,
  priority: ["alta", "media", "baja"][i % 3],
}));

export default function App() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("asc");
  const [count, setCount] = useState(0);

  // TODO: envuelve en useMemo con [query, order] como deps
  console.log("recalculando lista...");
  const filtered = ALL_TASKS
    .filter(t => t.text.includes(query))
    .sort((a, b) => order === "asc"
      ? a.text.localeCompare(b.text)
      : b.text.localeCompare(a.text)
    );

  return (
    <div style={{ padding: 24 }}>
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
        Abre la consola — el contador no debería recalcular la lista
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="filtrar..."
          style={{ flex: 1 }}
        />
        <select value={order} onChange={e => setOrder(e.target.value)}>
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>
      <button onClick={() => setCount(c => c + 1)} style={{ marginBottom: 12 }}>
        contador: {count}
      </button>
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>
        {filtered.length} tareas
      </p>
      <ul style={{ listStyle: "none", padding: 0, maxHeight: 200, overflow: "auto" }}>
        {filtered.slice(0, 50).map(t => (
          <li key={t.id} style={{ padding: "3px 0", fontSize: 13, display: "flex", gap: 8 }}>
            <span style={{ color: "var(--fg-muted)", fontSize: 11, minWidth: 32 }}>{t.priority}</span>
            <span>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useMemo } from "react";

const ALL_TASKS = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  text: ["fix bug", "write test", "review PR", "update docs", "deploy"][i % 5] + " #" + i,
  priority: ["alta", "media", "baja"][i % 3],
}));

export default function App() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("asc");
  const [count, setCount] = useState(0);

  const filtered = useMemo(() => {
    console.log("recalculando lista...");
    return ALL_TASKS
      .filter(t => t.text.includes(query))
      .sort((a, b) => order === "asc"
        ? a.text.localeCompare(b.text)
        : b.text.localeCompare(a.text)
      );
  }, [query, order]);

  return (
    <div style={{ padding: 24 }}>
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
        Abre la consola — el contador ya no recalcula la lista
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="filtrar..."
          style={{ flex: 1 }}
        />
        <select value={order} onChange={e => setOrder(e.target.value)}>
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>
      <button onClick={() => setCount(c => c + 1)} style={{ marginBottom: 12 }}>
        contador: {count}
      </button>
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>
        {filtered.length} tareas
      </p>
      <ul style={{ listStyle: "none", padding: 0, maxHeight: 200, overflow: "auto" }}>
        {filtered.slice(0, 50).map(t => (
          <li key={t.id} style={{ padding: "3px 0", fontSize: 13, display: "flex", gap: 8 }}>
            <span style={{ color: "var(--fg-muted)", fontSize: 11, minWidth: 32 }}>{t.priority}</span>
            <span>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
  },
}
