import type { Exercise } from "./types"

export const themeContext: Exercise = {
  id: "theme-context",
  label: "theme context",
  title: "Context sin re-renders espurios",
  lede: "Crea un ThemeProvider que expone theme y setTheme. El reto: si pasas { theme, setTheme } como value inline, cada render crea un objeto nuevo y TODOS los consumidores se re-renderizan — incluso los que no leen theme. Memoiza el value.",
  objectives: [
    "Define 'ThemeContext' con 'createContext'",
    "'ThemeProvider' guarda 'theme' en 'useState'",
    "El 'value' pasado al Provider se memoiza con 'useMemo'",
    "Un hook 'useTheme()' que lee el contexto y lanza error si no hay Provider",
    "Un componente '<Toolbar/>' que lee 'setTheme' — NO debe re-renderizarse al cambiar tick del padre",
    "Un componente '<Card/>' memoizado que lee 'theme'",
  ],
  difficulty: "intermediate",
  hint: "memo + useMemo trabajan juntos aquí: Toolbar envuelto en memo solo evita renders si sus props (el value del ctx vía useTheme) son estables. Si el value cambia por referencia, memo no sirve.",
  relatedConcepts: ["useContext", "useMemo", "memo"],
  starter: {
    "/App.js": `import { createContext, useContext, useMemo, useState, memo } from "react";

const ThemeCtx = createContext(null);

function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme requiere ThemeProvider");
  return ctx;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  // TODO: memoiza { theme, setTheme } con useMemo
  const value = { theme, setTheme };
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

const Toolbar = memo(function Toolbar() {
  console.log("render Toolbar");
  const { setTheme } = useTheme();
  return (
    <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
      cambiar tema
    </button>
  );
});

const Card = memo(function Card() {
  console.log("render Card");
  const { theme } = useTheme();
  return (
    <div style={{ padding: 12, border: "1px solid var(--line)", marginTop: 12 }}>
      tema: <strong>{theme}</strong>
    </div>
  );
});

export default function App() {
  const [tick, setTick] = useState(0);
  return (
    <ThemeProvider>
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <button onClick={() => setTick((t) => t + 1)}>tick: {tick}</button>
        <Toolbar />
        <Card />
        <p style={{ color: "var(--fg-muted)", fontSize: 12, marginTop: 12 }}>
          Abre la consola: al pulsar tick, ¿se renderiza Toolbar? Memoiza el value.
        </p>
      </div>
    </ThemeProvider>
  );
}
`,
  },
  solution: {
    "/App.js": `import { createContext, useContext, useMemo, useState, memo } from "react";

const ThemeCtx = createContext(null);

function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme requiere ThemeProvider");
  return ctx;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

const Toolbar = memo(function Toolbar() {
  console.log("render Toolbar");
  const { setTheme } = useTheme();
  return (
    <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
      cambiar tema
    </button>
  );
});

const Card = memo(function Card() {
  console.log("render Card");
  const { theme } = useTheme();
  return (
    <div style={{ padding: 12, border: "1px solid var(--line)", marginTop: 12 }}>
      tema: <strong>{theme}</strong>
    </div>
  );
});

export default function App() {
  const [tick, setTick] = useState(0);
  return (
    <ThemeProvider>
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <button onClick={() => setTick((t) => t + 1)}>tick: {tick}</button>
        <Toolbar />
        <Card />
        <p style={{ color: "var(--fg-muted)", fontSize: 12, marginTop: 12 }}>
          El value memoizado mantiene referencia estable: Toolbar NO re-renderiza al cambiar tick.
        </p>
      </div>
    </ThemeProvider>
  );
}
`,
  },
}
