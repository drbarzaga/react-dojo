import type { Exercise } from "./types"

export const filteredList: Exercise = {
  id: "filtered-list",
  label: "filtered list",
  title: "Lista con búsqueda en tiempo real",
  lede: "Un campo de búsqueda filtra una lista de frutas mientras el usuario escribe. El resultado filtrado se deriva directamente del estado — sin useState extra ni useMemo necesario a esta escala.",
  difficulty: "basic",
  objectives: [
    "Declara un estado 'query' que empiece en cadena vacía",
    "Vincula el input al estado con 'value' y 'onChange'",
    "Deriva 'filtered' como 'FRUTAS.filter(...)' directamente en el render, sin 'useState' adicional",
    "Muestra el número de resultados: '{n} resultado(s)'",
    "Muestra el mensaje 'Sin resultados' cuando 'filtered' está vacío",
    "Botón 'limpiar' resetea 'query' a cadena vacía",
  ],
  hint: "No necesitas useState para filtered — es un valor derivado del estado query. Calcúlalo directamente en el render con .filter(). El estado derivado no se guarda, se recalcula.",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

const FRUTAS = [
  "Manzana", "Banana", "Cereza", "Durazno", "Uva",
  "Kiwi", "Limón", "Mango", "Naranja", "Pera",
  "Piña", "Sandía", "Fresa", "Melón", "Ciruela",
];

export default function App() {
  // TODO: declara el estado query con valor inicial ""

  // TODO: deriva filtered de FRUTAS usando query (sin useState)

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 320 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          // TODO: vincula value y onChange al estado query
          placeholder="Buscar fruta..."
          style={{ flex: 1 }}
        />
        <button /* TODO: onClick que resetea query a "" */>
          limpiar
        </button>
      </div>

      {/* TODO: muestra '{n} resultado(s)' */}

      {/* TODO: muestra "Sin resultados" cuando filtered está vacío */}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
        {/* TODO: renderiza filtered con key y texto */}
      </ul>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

const FRUTAS = [
  "Manzana", "Banana", "Cereza", "Durazno", "Uva",
  "Kiwi", "Limón", "Mango", "Naranja", "Pera",
  "Piña", "Sandía", "Fresa", "Melón", "Ciruela",
];

export default function App() {
  const [query, setQuery] = useState("");

  const filtered = FRUTAS.filter((f) =>
    f.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 320 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar fruta..."
          style={{ flex: 1 }}
        />
        <button onClick={() => setQuery("")}>limpiar</button>
      </div>

      <p style={{ margin: "0 0 8px", color: "var(--fg-muted)", fontSize: 13 }}>
        {filtered.length} resultado(s)
      </p>

      {filtered.length === 0 && (
        <p style={{ color: "var(--fg-muted)" }}>Sin resultados</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
        {filtered.map((fruta) => (
          <li
            key={fruta}
            style={{ padding: "4px 0", borderBottom: "1px solid var(--line)" }}
          >
            {fruta}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
  },
}
