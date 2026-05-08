import type { Exercise } from "./types"

export const accordionComponent: Exercise = {
  id: "accordion-component",
  label: "accordion component",
  title: "Acordeón",
  lede: "Un componente acordeón donde cada item puede expandirse o contraerse. Solo un item abierto a la vez (accordion estricto) o múltiples (accordion normal).",
  difficulty: "basic",
  objectives: [
    "Array de items con { id, title, content }",
    "Estado openItems: Set<string> para trackear items abiertos",
    "Click togglea el item: si está abierto, lo remueve; si no, lo añade",
    "Icono rotate en el header cuando está abierto",
    "Animación de height con overflow hidden",
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
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>▼</span>
      </div>
      {isOpen && <div style={contentStyle}>{item.content}</div>}
    </div>
  );
}

export default function App() {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (id) => {
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", background: "var(--bg)", minHeight: "100vh" }}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Accordion</p>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={false}
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
