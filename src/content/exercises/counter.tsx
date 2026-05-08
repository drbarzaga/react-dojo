import type { Exercise } from "./types"

export const counter: Exercise = {
  id: "counter",
  label: "counter",
  title: "Contador clásico",
  lede: "Un contador con controles para incrementar, decrementar y resetear. El botón '+3' debe sumar tres unidades incluso si se presiona varias veces seguido — usa actualización funcional.",
  difficulty: "basic",
  objectives: [
    "Declara un estado 'count' que empiece en '0'",
    "Botón '+' suma 1, botón '−' resta 1",
    "Botón 'reset' vuelve a '0'",
    "Botón '+3' suma 3 usando 'setCount(c => c + 1)' tres veces",
    "El display debe mostrar el valor actual centrado",
  ],
  hint: "Pasar una función a setCount te da el valor más reciente; pasarle un número usa el valor capturado en el render.",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

export default function App() {
  // TODO: declara el estado count con valor inicial 0

  // TODO: implementa handlers para +, −, reset y +3

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p style={{ fontSize: 48, margin: 0, textAlign: "center" }}>
        {/* muestra el valor */}
        0
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
        <button>+</button>
        <button>−</button>
        <button>reset</button>
        <button>+3</button>
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const plusThree = () => {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p style={{ fontSize: 48, margin: 0, textAlign: "center" }}>{count}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        <button onClick={() => setCount((c) => c > 0 ? c - 1 : 0)}>−</button>
        <button onClick={() => setCount(0)}>reset</button>
        <button onClick={plusThree}>+3</button>
      </div>
    </div>
  );
}
`,
  },
}
