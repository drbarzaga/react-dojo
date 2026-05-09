import type { Exercise } from "./types"

export const accordionComponent: Exercise = {
  id: "accordion-component",
  label: "accordion",
  title: "Acordeón",
  lede: "Un componente acordeón donde cada item puede expandirse o contraerse independientemente. El estado es un Set de IDs abiertos.",
  difficulty: "basic",
  objectives: [
    "Declara estado 'openItems' como 'new Set()' vacío",
    "En 'toggleItem': si 'id' está en el Set, remuévelo; si no, agrégalo — siempre con copia funcional",
    "Pasa 'openItems.has(item.id)' como prop 'isOpen' a cada 'AccordionItem'",
    "El ícono '▼' rota 180° cuando 'isOpen' es true",
    "El contenido solo se renderiza cuando 'isOpen' es true",
  ],
  hint: "Usa Set para almacenar IDs abiertos. toggle: si set.has(id) remueve, si no añade.",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

const items = [
  { id: "1", title: "¿Qué es React?", content: "Una librería para construir UIs." },
  { id: "2", title: "¿Qué es JSX?", content: "Sintaxis que parece HTML pero es JavaScript." },
  { id: "3", title: "¿Qué son hooks?", content: "Funciones que añaden estado a componentes." },
];

const itemStyle = {
  border: "1px solid #3f3f46",
  borderRadius: 8,
  marginBottom: 8,
  overflow: "hidden",
};

const headerStyle = {
  padding: 16,
  background: "#27272a",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const contentStyle = {
  padding: 16,
  background: "#1a1a1e",
  color: "#a1a1aa",
};

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div style={itemStyle}>
      <div onClick={onToggle} style={headerStyle}>
        <span style={{ color: "#fff" }}>{item.title}</span>
        {/* TODO: rota el ícono 180deg cuando isOpen es true */}
        <span>▼</span>
      </div>
      {/* TODO: renderiza el contenido solo cuando isOpen es true */}
    </div>
  );
}

export default function App() {
  // TODO: declara estado openItems con new Set() vacío

  const toggleItem = (id) => {
    // TODO: si id está en openItems, remuévelo; si no, agrégalo
    // Recuerda: usa la forma funcional de setOpenItems y copia el Set antes de modificarlo
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", background: "var(--bg)", minHeight: "100vh" }}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Accordion</p>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={false} // TODO: cambia false por openItems.has(item.id)
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

const items = [
  { id: "1", title: "¿Qué es React?", content: "Una librería para construir UIs." },
  { id: "2", title: "¿Qué es JSX?", content: "Sintaxis que parece HTML pero es JavaScript." },
  { id: "3", title: "¿Qué son hooks?", content: "Funciones que añaden estado a componentes." },
];

const itemStyle = {
  border: "1px solid #3f3f46",
  borderRadius: 8,
  marginBottom: 8,
  overflow: "hidden",
};

const headerStyle = {
  padding: 16,
  background: "#27272a",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const contentStyle = {
  padding: 16,
  background: "#1a1a1e",
  color: "#a1a1aa",
};

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div style={itemStyle}>
      <div onClick={onToggle} style={headerStyle}>
        <span style={{ color: "#fff" }}>{item.title}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>▼</span>
      </div>
      {isOpen && <div style={contentStyle}>{item.content}</div>}
    </div>
  );
}

export default function App() {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (id) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", background: "var(--bg)", minHeight: "100vh" }}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Accordion</p>
      {items.map((item) => (
        <AccordionItem key={item.id} item={item} isOpen={openItems.has(item.id)} onToggle={() => toggleItem(item.id)} />
      ))}
    </div>
  );
}
`,
  },
}
