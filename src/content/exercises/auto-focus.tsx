import type { Exercise } from "./types"

export const autoFocus: Exercise = {
  id: "auto-focus",
  label: "auto-focus",
  title: "Foco y contador silencioso",
  lede: "El input debe enfocarse al montar y al pulsar 'Enfocar'. Además, cuenta cuántas veces se re-renderizó el componente sin provocar re-renders adicionales.",
  difficulty: "basic",
  objectives: [
    "Crea una 'ref' para el input y enfócalo al montar",
    "Botón 'Enfocar' que aplica 'focus' programático",
    "Mantén un contador de renders en otra 'ref' — NO debe causar re-renders",
    "El texto del input es estado controlado",
    "Botón 'Limpiar' resetea el texto y el input",
  ],
  hint: "useRef.current persiste entre renders sin dispararlos. useState sí dispara. Usa cada uno donde corresponda.",
  relatedConcepts: ["useRef", "useState", "useEffect"],
  starter: {
    "/App.js": `import { useState, useRef, useEffect } from "react";

export default function App() {
  // TODO: ref para el input
  // TODO: ref para contar renders
  const [text, setText] = useState("");

  // TODO: useEffect que enfoca el input al montar
  // TODO: incrementa el contador de renders en cada render (sin setState)

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="escribe algo..."
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button>Enfocar</button>
        <button>Limpiar</button>
      </div>
      <p style={{ marginTop: 12, color: "var(--fg-muted)", fontFamily: "monospace" }}>
        renders: 0 · texto: "{text}"
      </p>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useRef, useEffect } from "react";

export default function App() {
  const inputRef = useRef(null);
  const renders = useRef(0);
  const [text, setText] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Se incrementa en cada render. Al estar en una ref, no dispara re-render.
  renders.current += 1;

  const clear = () => {
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="escribe algo..."
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => inputRef.current?.focus()}>Enfocar</button>
        <button onClick={clear}>Limpiar</button>
      </div>
      <p style={{ marginTop: 12, color: "var(--fg-muted)", fontFamily: "monospace" }}>
        renders: {renders.current} · texto: "{text}"
      </p>
    </div>
  );
}
`,
  },
}
