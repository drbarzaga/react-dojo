import type { Exercise } from "./types"

export const toggleButton: Exercise = {
  id: "toggle-button",
  label: "toggle button",
  title: "Botón toggle",
  lede: "Un botón que alterna entre dos estados: 'off' y 'on'. Cambia el color y el texto según el estado. Usa el operador ternario para condicional.",
  difficulty: "basic",
  objectives: [
    "Declara estado isOn con valor inicial false",
    "Muestra 'ON' u 'OFF' según el estado",
    "Cambia el color de fondo: verde cuando on, gris cuando off",
    "Al hacer clic, alterna el estado con setIsOn(!isOn)",
  ],
  hint: "El operador ternario: condicion ? valorSiTrue : valorSiFalse",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

const appStyle = {
  padding: 24,
  textAlign: "center",
  fontFamily: "system-ui",
  background: "var(--bg)",
  minHeight: "100vh",
};

export default function App() {
  // declara estado isOn aquí

  return (
    <div style={appStyle}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Toggle Button</p>
      <button
        onClick={() => {}}
        style={{
          backgroundColor: "#6b7280",
          color: "white",
          padding: "12px 24px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: 18
        }}
      >
        {/* muestra ON u OFF según isOn */}
        OFF
      </button>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

const appStyle = {
  padding: 24,
  textAlign: "center",
  fontFamily: "system-ui",
  background: "var(--bg)",
  minHeight: "100vh",
};

export default function App() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div style={appStyle}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Toggle Button</p>
      <button
        onClick={() => setIsOn(!isOn)}
        style={{
          backgroundColor: isOn ? "#22c55e" : "#6b7280",
          color: "white",
          padding: "12px 24px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: 18
        }}
      >
        {isOn ? "ON" : "OFF"}
      </button>
    </div>
  );
}
`,
  },
}
