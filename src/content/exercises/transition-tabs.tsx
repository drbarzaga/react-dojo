import type { Exercise } from "./types"

export const transitionTabs: Exercise = {
  id: "transition-tabs",
  label: "transition tabs",
  title: "Tabs sin bloqueo",
  lede: "Tres tabs, una renderiza 4000 items y bloquea el hilo. Al hacer click la UI se congela y la tab activa no responde hasta que termina. Usa useTransition para mantener los clicks responsivos y mostrar un indicador de carga.",
  difficulty: "intermediate",
  objectives: [
    "Envuelve 'setActiveTab' en 'startTransition'",
    "Usa 'isPending' para atenuar visualmente la tab que está cargando",
    "Comprueba que las tabs responden al instante aunque la lista tarde en renderizar",
  ],
  hint: "startTransition marca el setState como no urgente — React puede interrumpirlo si llega una interacción más urgente. isPending es true mientras la transición está en curso.",
  relatedConcepts: ["useTransition", "useDeferredValue"],
  starter: {
    "/App.js": `import { useState, useTransition } from "react";

function SlowTab() {
  // renderiza 4000 items intencionalmente lento
  const items = [];
  for (let i = 0; i < 4000; i++) {
    items.push(
      <li key={i} style={{ padding: "1px 0", fontSize: 12 }}>item {i}</li>
    );
  }
  return <ul style={{ height: 200, overflow: "auto", padding: "0 0 0 16px", margin: 0 }}>{items}</ul>;
}

const TABS = ["inicio", "lista lenta", "ajustes"];

export default function App() {
  const [activeTab, setActiveTab] = useState("inicio");
  // TODO: usa useTransition para envolver setActiveTab
  // TODO: usa isPending para mostrar feedback visual

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)} // TODO: envolver en startTransition
            style={{
              fontWeight: activeTab === tab ? "bold" : "normal",
              // TODO: atenúa con opacity cuando isPending y tab !== activeTab
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>
        {activeTab === "inicio" && <p>Bienvenido a inicio.</p>}
        {activeTab === "lista lenta" && <SlowTab />}
        {activeTab === "ajustes" && <p>Ajustes de la app.</p>}
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useTransition } from "react";

function SlowTab() {
  const items = [];
  for (let i = 0; i < 4000; i++) {
    items.push(
      <li key={i} style={{ padding: "1px 0", fontSize: 12 }}>item {i}</li>
    );
  }
  return <ul style={{ height: 200, overflow: "auto", padding: "0 0 0 16px", margin: 0 }}>{items}</ul>;
}

const TABS = ["inicio", "lista lenta", "ajustes"];

export default function App() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [isPending, startTransition] = useTransition();

  function switchTab(tab) {
    startTransition(() => setActiveTab(tab));
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            style={{
              fontWeight: activeTab === tab ? "bold" : "normal",
              opacity: isPending && tab !== activeTab ? 0.5 : 1,
              transition: "opacity 150ms",
            }}
          >
            {tab}
            {isPending && tab === "lista lenta" && activeTab !== tab ? " ⏳" : ""}
          </button>
        ))}
      </div>
      <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 200ms" }}>
        {activeTab === "inicio" && <p>Bienvenido a inicio.</p>}
        {activeTab === "lista lenta" && <SlowTab />}
        {activeTab === "ajustes" && <p>Ajustes de la app.</p>}
      </div>
    </div>
  );
}
`,
  },
}
