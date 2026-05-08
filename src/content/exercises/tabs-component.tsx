import type { Exercise } from "./types"

export const tabsComponent: Exercise = {
  id: "tabs-component",
  label: "tabs component",
  title: "Componente de tabs",
  lede: "Un componente con múltiples tabs que muestra contenido diferente según el tab activo. Usa un estado para trackear cuál tab está seleccionado.",
  difficulty: "basic",
  objectives: [
    "Declara estado activeTab con valor inicial 'home'",
    "3 tabs: Home, About, Contact",
    "Cada tab muestra contenido diferente",
    "El tab activo tiene estilo visual distinto (fondo oscuro)",
    "Solo muestra el contenido del tab activo",
  ],
  hint: "Usa un switch o condicional para renderizar contenido diferente",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

const tabs = [
  { id: "home", label: "Home", content: "Bienvenido a mi app!" },
  { id: "about", label: "About", content: "Soy desarrollador en React." },
  { id: "contact", label: "Contact", content: "contáctame@email.com" },
];

const appStyle = {
  padding: 24,
  fontFamily: "system-ui",
  background: "var(--bg)",
  minHeight: "100vh",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const activeContent = "";

  return (
    <div style={appStyle}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Tabs Component</p>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #3f3f46" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {}}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTab === tab.id ? "#3b82f6" : "transparent",
              color: activeTab === tab.id ? "white" : "#a1a1aa",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 18 }}>
        {activeContent || "TODO: renderiza el contenido del tab activo"}
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

const tabs = [
  { id: "home", label: "Home", content: "Bienvenido a mi app!" },
  { id: "about", label: "About", content: "Soy desarrollador en React." },
  { id: "contact", label: "Contact", content: "contáctame@email.com" },
];

const appStyle = {
  padding: 24,
  fontFamily: "system-ui",
  background: "var(--bg)",
  minHeight: "100vh",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div style={appStyle}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Tabs Component</p>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #3f3f46" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTab === tab.id ? "#3b82f6" : "transparent",
              color: activeTab === tab.id ? "white" : "#a1a1aa",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 18 }}>{activeContent}</div>
    </div>
  );
}
`,
  },
}
