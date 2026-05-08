import type { Exercise } from "./types"

export const debouncedSearch: Exercise = {
  id: "debounced-search",
  label: "debounced search",
  title: "Búsqueda sin bloqueo",
  lede: "Un input filtra una lista de 6.000 ítems. Tal cual está, el input se siente lento porque el filtrado pesa. Usa useDeferredValue para que el input responda al instante y la lista se actualice con prioridad baja.",
  difficulty: "advanced",
  objectives: [
    "Mantén el input controlado ('setState' urgente)",
    "Crea un valor diferido a partir de 'query'",
    "Pasa el 'deferred' — no 'query' — al componente pesado",
    "Muestra un indicador 'actualizando...' mientras 'query !== deferred'",
    "Atenúa visualmente la lista mientras está desfasada ('opacity')",
  ],
  hint: "useDeferredValue devuelve una copia 'lenta' del valor. Cuando query y deferred difieren, la lista está desfasada — ahí aprovecha para dar feedback visual.",
  relatedConcepts: ["useDeferredValue", "useMemo"],
  starter: {
    "/App.js": `import { useState, useMemo } from "react";

function HeavyList({ query }) {
  const items = useMemo(() => {
    const result = [];
    for (let i = 0; i < 6000; i++) {
      const s = "row " + i;
      if (s.includes(query)) result.push(s);
    }
    // trabajo extra para hacerlo notoriamente lento
    let x = 0;
    for (let i = 0; i < 80_000; i++) x += i;
    return result;
  }, [query]);

  return (
    <ul style={{ height: 200, overflow: "auto", margin: 0, padding: "0 0 0 16px" }}>
      {items.slice(0, 200).map((it) => <li key={it}>{it}</li>)}
    </ul>
  );
}

export default function App() {
  const [query, setQuery] = useState("");

  // TODO: crea 'deferred' a partir de query con useDeferredValue
  // TODO: 'stale' = query !== deferred

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="escribe..."
        style={{ width: "100%" }}
      />
      <p style={{ color: "var(--fg-muted)", fontSize: 12, fontFamily: "monospace" }}>
        {/* muestra 'actualizando...' cuando stale, o 'al día' */}
        al día
      </p>
      <div>
        {/* TODO: atenúa con opacity cuando stale; pasa 'deferred' a HeavyList */}
        <HeavyList query={query} />
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useMemo, useDeferredValue } from "react";

function HeavyList({ query }) {
  const items = useMemo(() => {
    const result = [];
    for (let i = 0; i < 6000; i++) {
      const s = "row " + i;
      if (s.includes(query)) result.push(s);
    }
    let x = 0;
    for (let i = 0; i < 80_000; i++) x += i;
    return result;
  }, [query]);

  return (
    <ul style={{ height: 200, overflow: "auto", margin: 0, padding: "0 0 0 16px" }}>
      {items.slice(0, 200).map((it) => <li key={it}>{it}</li>)}
    </ul>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const stale = query !== deferred;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="escribe..."
        style={{ width: "100%" }}
      />
      <p style={{ color: "var(--fg-muted)", fontSize: 12, fontFamily: "monospace" }}>
        {stale ? "actualizando..." : "al día"}
      </p>
      <div style={{ opacity: stale ? 0.5 : 1, transition: "opacity 200ms" }}>
        <HeavyList query={deferred} />
      </div>
    </div>
  );
}
`,
  },
}
