import type { Exercise } from "./types"

export const compoundAccordion: Exercise = {
  id: "compound-accordion",
  label: "compound accordion",
  title: "Accordion con Compound Components",
  lede: "Tienes un Accordion que recibe toda su configuración como props (items, activeId, onToggle). Refactorízalo al patrón Compound Components: el estado vive dentro de Accordion y los subcomponentes Accordion.Item, Accordion.Trigger y Accordion.Panel se comunican a través de Context sin recibir props explícitas entre sí.",
  difficulty: "advanced",
  objectives: [
    "Crea un contexto privado 'AccordionCtx' con '{ active, toggle }'",
    "'Accordion' gestiona el estado con 'useState' y provee el contexto",
    "'Accordion.Item' provee su propio 'id' al contexto hijo con un segundo Provider ('ItemCtx')",
    "'Accordion.Trigger' lee el 'id' del item desde 'ItemCtx' y llama a 'toggle' al hacer click",
    "'Accordion.Panel' se renderiza solo cuando su 'id' coincide con 'active'",
    "La App usa la API compuesta sin pasar props entre subcomponentes",
  ],
  hint: "Necesitas dos niveles de contexto: uno global (qué item está abierto) y uno por item (cuál es el id de este item). Así Trigger y Panel saben a qué item pertenecen sin recibirlo como prop.",
  relatedConcepts: ["compound-components", "useContext"],
  starter: {
    "/App.js": `import { useState } from "react";

// Accordion con props — refactoriza al patrón Compound Components
function Accordion({ items }) {
  const [active, setActive] = useState(null);

  function toggle(id) {
    setActive((prev) => (prev === id ? null : id));
  }

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 480 }}>
      {items.map((item) => (
        <div key={item.id} style={{ borderBottom: "1px solid var(--line-strong)" }}>
          <button
            onClick={() => toggle(item.id)}
            style={{
              width: "100%", textAlign: "left", padding: "12px 8px",
              background: "transparent", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 15, color: "var(--fg)",
              display: "flex", justifyContent: "space-between",
            }}
          >
            {item.title}
            <span>{active === item.id ? "▲" : "▼"}</span>
          </button>
          {active === item.id && (
            <p style={{ margin: 0, padding: "0 8px 12px", color: "var(--fg-muted)", fontSize: 14 }}>
              {item.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

const items = [
  { id: "1", title: "¿Qué es React?", content: "Una librería de JavaScript para construir interfaces de usuario basadas en componentes." },
  { id: "2", title: "¿Qué es un hook?", content: "Una función que empieza por 'use' y permite usar características de React desde componentes funcionales." },
  { id: "3", title: "¿Qué es el Virtual DOM?", content: "Una representación en memoria del DOM real que React usa para calcular el mínimo de cambios necesarios." },
];

export default function App() {
  return <Accordion items={items} />;
}
`,
  },
  solution: {
    "/App.js": `import { createContext, useContext, useState } from "react";

// Contexto global: qué item está abierto
const AccordionCtx = createContext(null);
// Contexto por item: cuál es el id de este item
const ItemCtx = createContext(null);

function useAccordion() {
  const ctx = useContext(AccordionCtx);
  if (!ctx) throw new Error("Debe usarse dentro de <Accordion>");
  return ctx;
}

function useItem() {
  const id = useContext(ItemCtx);
  if (id === null) throw new Error("Debe usarse dentro de <Accordion.Item>");
  return id;
}

function Accordion({ children }) {
  const [active, setActive] = useState(null);
  function toggle(id) {
    setActive((prev) => (prev === id ? null : id));
  }
  return (
    <AccordionCtx.Provider value={{ active, toggle }}>
      <div style={{ fontFamily: "system-ui", maxWidth: 480 }}>{children}</div>
    </AccordionCtx.Provider>
  );
}

function AccordionItem({ id, children }) {
  return (
    <ItemCtx.Provider value={id}>
      <div style={{ borderBottom: "1px solid var(--line-strong)" }}>{children}</div>
    </ItemCtx.Provider>
  );
}

function AccordionTrigger({ children }) {
  const { active, toggle } = useAccordion();
  const id = useItem();
  const isOpen = active === id;
  return (
    <button
      onClick={() => toggle(id)}
      style={{
        width: "100%", textAlign: "left", padding: "12px 8px",
        background: "transparent", border: "none", cursor: "pointer",
        fontWeight: 600, fontSize: 15, color: "var(--fg)",
        display: "flex", justifyContent: "space-between",
      }}
    >
      {children}
      <span>{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

function AccordionPanel({ children }) {
  const { active } = useAccordion();
  const id = useItem();
  if (active !== id) return null;
  return (
    <p style={{ margin: 0, padding: "0 8px 12px", color: "var(--fg-muted)", fontSize: 14 }}>
      {children}
    </p>
  );
}

// Subcomponentes adjuntos como propiedades estáticas
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel = AccordionPanel;

export default function App() {
  return (
    <Accordion>
      <Accordion.Item id="1">
        <Accordion.Trigger>¿Qué es React?</Accordion.Trigger>
        <Accordion.Panel>
          Una librería de JavaScript para construir interfaces de usuario basadas en componentes.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="2">
        <Accordion.Trigger>¿Qué es un hook?</Accordion.Trigger>
        <Accordion.Panel>
          Una función que empieza por 'use' y permite usar características de React desde componentes funcionales.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="3">
        <Accordion.Trigger>¿Qué es el Virtual DOM?</Accordion.Trigger>
        <Accordion.Panel>
          Una representación en memoria del DOM real que React usa para calcular el mínimo de cambios necesarios.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
`,
  },
}
