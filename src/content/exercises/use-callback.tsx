import type { Exercise } from "./types"

export const useCallbackExercise: Exercise = {
  id: "use-callback",
  label: "use callback",
  title: "Memorizar callbacks",
  lede: "Un padre con un contador pasa onDelete a una lista memoizada. Cada render recrea onDelete, invalidando memo en todos los items. Usa useCallback para que los items dejen de re-renderizar cuando solo cambia el contador.",
  difficulty: "intermediate",
  objectives: [
    "Envuelve 'onDelete' en 'useCallback' con las dependencias correctas",
    "Verifica en la consola que los items ya no se re-renderizan al incrementar el contador",
    "Comprende por qué 'memo(Item)' sin 'useCallback' no es suficiente",
  ],
  hint: "useCallback(fn, [deps]) devuelve la misma referencia de función entre renders siempre que las deps no cambien. memo() compara props por referencia — si la función cambia, el hijo siempre re-renderiza.",
  relatedConcepts: ["useCallback", "useMemo"],
  starter: {
    "/App.js": `import { useState, useCallback, memo } from "react";

// Item ya está memoizado — pero algo impide que funcione
const Item = memo(function Item({ name, onDelete }) {
  console.log("render:", name); // observa cuántos renders hay
  return (
    <li style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
      <span>{name}</span>
      <button onClick={() => onDelete(name)}>×</button>
    </li>
  );
});

const ITEMS = ["manzana", "banana", "cereza", "durazno", "higo"];

export default function App() {
  const [items, setItems] = useState(ITEMS);
  const [count, setCount] = useState(0);

  // TODO: envuelve en useCallback para que memo(Item) funcione
  const onDelete = (name) => setItems(prev => prev.filter(i => i !== name));

  return (
    <div style={{ padding: 24 }}>
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
        Abre la consola y presiona el contador — observa los re-renders
      </p>
      <button onClick={() => setCount(c => c + 1)} style={{ marginBottom: 16 }}>
        contador: {count}
      </button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map(name => (
          <Item key={name} name={name} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useCallback, memo } from "react";

const Item = memo(function Item({ name, onDelete }) {
  console.log("render:", name);
  return (
    <li style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
      <span>{name}</span>
      <button onClick={() => onDelete(name)}>×</button>
    </li>
  );
});

const ITEMS = ["manzana", "banana", "cereza", "durazno", "higo"];

export default function App() {
  const [items, setItems] = useState(ITEMS);
  const [count, setCount] = useState(0);

  // setItems es estable — no necesita deps
  const onDelete = useCallback(
    (name) => setItems(prev => prev.filter(i => i !== name)),
    []
  );

  return (
    <div style={{ padding: 24 }}>
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
        Abre la consola y presiona el contador — ya no hay re-renders innecesarios
      </p>
      <button onClick={() => setCount(c => c + 1)} style={{ marginBottom: 16 }}>
        contador: {count}
      </button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map(name => (
          <Item key={name} name={name} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}
`,
  },
}
