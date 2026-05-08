import type { Exercise } from "./types"

export const lazyModal: Exercise = {
  id: "lazy-modal",
  label: "lazy modal",
  title: "Modal cargado on-demand",
  lede: "Un modal con un editor pesado. No queremos descargar su código hasta que el usuario lo abra. Usa lazy() para diferir el import y Suspense para mostrar feedback mientras llega.",
  difficulty: "advanced",
  objectives: [
    "Implementa 'EditorModal' en archivo aparte ('export default')",
    "En App usa 'lazy(() => import('./EditorModal.js'))'",
    "Simula latencia envolviendo el import en un 'setTimeout' de 700ms",
    "Monta el componente solo cuando 'open === true'",
    "Envuélvelo en '<Suspense fallback=...>'",
    "Al abrir por primera vez se ve 'cargando...', luego aparece",
    "Al cerrar y reabrir, el módulo ya está cacheado — no hay spinner",
  ],
  hint: "lazy() solo ejecuta la función cuando el componente se renderiza. Una vez resuelta la promesa, React cachea el módulo — las siguientes aperturas son instantáneas.",
  relatedConcepts: ["lazy", "Suspense"],
  starter: {
    "/App.js": `import { useState, Suspense } from "react";
// TODO: importa EditorModal con lazy() + setTimeout para simular latencia

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p style={{ color: "var(--fg-muted)" }}>
        El editor pesa. Solo descárgalo al abrir.
      </p>
      <button onClick={() => setOpen(true)}>abrir editor</button>

      {/* TODO: monta el modal solo si open, envuelto en Suspense */}
      {open && (
        <div style={{ marginTop: 16 }}>
          {/* <EditorModal onClose={() => setOpen(false)} /> */}
        </div>
      )}
    </div>
  );
}
`,
    "/EditorModal.js": `import { useState } from "react";

export default function EditorModal({ onClose }) {
  const [text, setText] = useState("escribe algo pesado...");
  return (
    <div style={{
      padding: 16, border: "1px solid var(--line-strong)", borderRadius: 4,
      background: "var(--surface-1)"
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ width: "100%", fontFamily: "ui-monospace, monospace" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <small style={{ color: "var(--fg-muted)" }}>
          {text.length} caracteres
        </small>
        <button onClick={onClose}>cerrar</button>
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, Suspense, lazy } from "react";

// Envolvemos el import en una promesa que espera 700ms para
// hacer visible el momento en que se descarga el código.
const EditorModal = lazy(() =>
  new Promise((resolve) => {
    setTimeout(() => resolve(import("./EditorModal.js")), 700);
  })
);

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p style={{ color: "var(--fg-muted)" }}>
        El editor pesa. Solo descárgalo al abrir.
      </p>
      <button onClick={() => setOpen(true)}>abrir editor</button>

      {open && (
        <div style={{ marginTop: 16 }}>
          <Suspense fallback={<em style={{ color: "var(--fg-muted)" }}>cargando editor...</em>}>
            <EditorModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
`,
    "/EditorModal.js": `import { useState } from "react";

export default function EditorModal({ onClose }) {
  const [text, setText] = useState("escribe algo pesado...");
  return (
    <div style={{
      padding: 16, border: "1px solid var(--line-strong)", borderRadius: 4,
      background: "var(--surface-1)"
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ width: "100%", fontFamily: "ui-monospace, monospace" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <small style={{ color: "var(--fg-muted)" }}>
          {text.length} caracteres
        </small>
        <button onClick={onClose}>cerrar</button>
      </div>
    </div>
  );
}
`,
  },
}
