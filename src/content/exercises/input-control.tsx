import type { Exercise } from "./types"

export const inputControl: Exercise = {
  id: "input-control",
  label: "input control",
  title: "Input controlado",
  lede: "Un input que muestra en tiempo real lo que el usuario escribe. El valor del input viene del estado y se actualiza con onChange. Este patrón se llama 'controlled component'.",
  difficulty: "basic",
  objectives: [
    "Declara estado text con string vacío",
    "El input tiene value={text}",
    "onChange actualiza con setText(e.target.value)",
    "Muestra el texto debajo en un elemento <p>",
  ],
  hint: "Un controlled component tiene su value ligado al estado",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

const appStyle = {
  padding: 24,
  fontFamily: "system-ui",
  background: "#09090b",
  minHeight: "100vh",
};

const labelStyle = {
  marginBottom: 24,
  color: "#71717a",
};

export default function App() {
  // declara estado text aquí

  return (
    <div style={appStyle}>
      <p style={labelStyle}>Input controlado</p>
      <input
        value=""
        onChange={() => {}}
        placeholder="escribe algo..."
        style={{ padding: 8, fontSize: 16, width: "100%", borderRadius: 8 }}
      />
      <p style={{ marginTop: 16, fontSize: 18 }}>
        {/* muestra text aquí */}
      </p>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

const appStyle = {
  padding: 24,
  fontFamily: "system-ui",
  background: "#09090b",
  minHeight: "100vh",
};

const labelStyle = {
  marginBottom: 24,
  color: "#71717a",
};

export default function App() {
  const [text, setText] = useState("");

  return (
    <div style={appStyle}>
      <p style={labelStyle}>Input controlado</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="escribe algo..."
        style={{ padding: 8, fontSize: 16, width: "100%", borderRadius: 8 }}
      />
      <p style={{ marginTop: 16, fontSize: 18 }}>{text}</p>
    </div>
  );
}
`,
  },
}
