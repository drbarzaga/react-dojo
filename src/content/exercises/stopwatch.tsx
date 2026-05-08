import type { Exercise } from "./types"

export const stopwatch: Exercise = {
  id: "stopwatch",
  label: "stopwatch",
  title: "Cronómetro con intervalos",
  lede: "Construye un cronómetro que puedes iniciar, pausar y resetear. Usa una ref para guardar el id del intervalo — no estado — y limpia siempre en el cleanup para que el timer no quede vivo al desmontar.",
  difficulty: "basic",
  objectives: [
    "Estado 'elapsed' (ms) que empieza en 0",
    "Estado 'running' (boolean) que controla el botón start/pause",
    "Al correr, usa 'setInterval' cada 10ms: 'setElapsed(e => e + 10)'",
    "Guarda el id del intervalo en un 'useRef' — no en estado",
    "El cleanup del 'useEffect' llama 'clearInterval' con el id guardado",
    "Botón 'reset' pone 'elapsed' en 0 y pausa",
    "Formato de salida: 'mm:ss.cc' (centésimas)",
  ],
  hint: "Devuelve una función de cleanup desde el useEffect que haga clearInterval. El useEffect debe depender de [running] para que se reinicie al pausar/reanudar.",
  relatedConcepts: ["useState", "useEffect", "useRef"],
  starter: {
    "/App.js": `import { useState, useRef, useEffect } from "react";

function format(ms) {
  const total = Math.floor(ms / 10);
  const cs = String(total % 100).padStart(2, "0");
  const s = String(Math.floor(total / 100) % 60).padStart(2, "0");
  const m = String(Math.floor(total / 6000)).padStart(2, "0");
  return \`\${m}:\${s}.\${cs}\`;
}

export default function App() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  // TODO: ref para guardar el id del intervalo

  // TODO: useEffect que arranque / limpie el intervalo según 'running'
  //       usa setElapsed(e => e + 10) dentro del setInterval

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
      <p style={{ fontSize: 48, margin: 0, fontFamily: "ui-monospace, monospace" }}>
        {format(elapsed)}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
        <button onClick={() => setRunning((r) => !r)}>
          {running ? "pause" : "start"}
        </button>
        <button onClick={() => { setElapsed(0); setRunning(false); }}>
          reset
        </button>
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useRef, useEffect } from "react";

function format(ms) {
  const total = Math.floor(ms / 10);
  const cs = String(total % 100).padStart(2, "0");
  const s = String(Math.floor(total / 100) % 60).padStart(2, "0");
  const m = String(Math.floor(total / 6000)).padStart(2, "0");
  return \`\${m}:\${s}.\${cs}\`;
}

export default function App() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    // Actualización funcional: siempre suma sobre el valor más reciente,
    // sin capturar 'elapsed' en el closure.
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 10);
    }, 10);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
      <p style={{ fontSize: 48, margin: 0, fontFamily: "ui-monospace, monospace" }}>
        {format(elapsed)}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
        <button onClick={() => setRunning((r) => !r)}>
          {running ? "pause" : "start"}
        </button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}
`,
  },
}
