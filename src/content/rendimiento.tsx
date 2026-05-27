import { Playground } from "@/components/playground"
import type { Concept } from "./types"

export const rendimiento: Concept[] = [
  {
    id: "useMemo",
    label: "useMemo",
    kicker: "Hook · Memoización",
    title: "Cachear el cálculo",
    lede: "useMemo guarda el resultado de un cálculo y lo reutiliza mientras sus dependencias no cambien. Es una herramienta de rendimiento, no de corrección — úsala cuando midas que vale la pena.",
    sections: [
      {
        heading: "Cuándo importa",
        body: (
          <p>
            Para cálculos genuinamente caros (transformar listas grandes, parsear, ordenar) o para
            mantener <em>identidad referencial</em> de objetos/arrays que se pasan a hijos
            memoizados o a dependencias de otros hooks.
          </p>
        ),
      },
      {
        heading: "Cuándo es ruido",
        body: (
          <p>
            Para funciones simples, valores primitivos, o cálculos que React resuelve más rápido que
            la propia comparación de dependencias. La memoización tiene coste: comparar deps,
            retener referencias en memoria.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useMemo, useState } from "react";

function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export default function App() {
  const [n, setN] = useState(30);
  const [otro, setOtro] = useState(0);

  const t0 = performance.now();
  const value = useMemo(() => fibonacci(n), [n]);
  const elapsed = (performance.now() - t0).toFixed(2);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <label>
        n = {n}
        <input
          type="range" min="20" max="38" value={n}
          onChange={(e) => setN(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </label>
      <p style={{ fontFamily: "monospace", marginTop: 12 }}>
        fib({n}) = {value}
        <br />
        última medición: {elapsed} ms
      </p>
      <button onClick={() => setOtro((x) => x + 1)}>
        re-render sin tocar n ({otro})
      </button>
      <p style={{ color: "var(--fg-muted)", fontSize: 13 }}>
        Sube otro contador: el cálculo NO se repite (ms ≈ 0).
        Mueve el slider: vuelve a calcularse.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "No es una garantía: React puede descartar el caché. No la uses para corrección, solo para velocidad.",
      "Memoizar todo añade overhead: comparar deps tiene coste. Mide antes de optimizar.",
      "Si tu dep es un objeto creado en cada render, useMemo nunca acierta — primero estabiliza esa dep.",
    ],
  },
  {
    id: "useCallback",
    label: "useCallback",
    kicker: "Hook · Memoización de funciones",
    title: "Una función estable",
    lede: "useCallback es useMemo para funciones. Devuelve la misma referencia mientras sus dependencias no cambien — útil cuando la función viaja a un hijo memoizado o entra en las deps de otro hook.",
    sections: [
      {
        heading: "Cuándo aporta",
        body: (
          <p>
            Cuando pasas un callback a un componente envuelto en <code>memo()</code>, o cuando la
            función es dependencia de un <code>useEffect</code> y no quieres que el efecto se
            reinicie en cada render.
          </p>
        ),
      },
      {
        heading: "Sin un consumidor, es ceremonia",
        body: (
          <p>
            Envolver toda función en useCallback no acelera nada por sí solo. Solo importa cuando
            alguien río abajo se beneficia de que la referencia sea estable.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/useRenderFlash.js": {
            code: `import { useRef, useEffect } from "react";

export function useRenderFlash(name) {
  const ref = useRef(null);
  const count = useRef(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    count.current += 1;
    const el = ref.current;
    if (!el) return;
    el.style.position = "relative";
    el.style.transition = "none";
    el.style.outline = "1.5px solid #fb923c";
    el.style.backgroundColor = "rgba(251,146,60,0.1)";
    let chip = el.querySelector("[data-rf]");
    if (!chip) {
      chip = document.createElement("div");
      chip.setAttribute("data-rf", "");
      chip.style.cssText =
        "position:absolute;top:0;left:0;background:#fb923c;color:#fff;" +
        "font:bold 9px/1 monospace;padding:2px 5px;border-radius:0 0 3px 0;" +
        "pointer-events:none;z-index:9999;white-space:nowrap;";
      el.appendChild(chip);
    }
    chip.textContent = name + " ×" + count.current;
    chip.style.opacity = "1";
    chip.style.transition = "none";
    const t = setTimeout(() => {
      el.style.transition = "outline 0.6s, background-color 0.6s";
      el.style.outline = "1.5px solid transparent";
      el.style.backgroundColor = "transparent";
      chip.style.transition = "opacity 0.6s";
      chip.style.opacity = "0";
    }, 500);
    return () => clearTimeout(t);
  });
  return ref;
}
`,
            hidden: true,
          },
          "/App.js": `import { memo, useCallback, useState } from "react";
import { useRenderFlash } from "./useRenderFlash";

// ❌ memo pero recibe función nueva en cada render → se re-renderiza igual
const ItemMal = memo(function ItemMal({ onAction }) {
  const ref = useRenderFlash("ItemMal");
  return (
    <div ref={ref} style={{ padding: "12px 16px", border: "1px solid #333", borderRadius: 6 }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap" }}>❌ sin useCallback</p>
      <p style={{ margin: 0, fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>función nueva en cada render</p>
    </div>
  );
});

// ✅ memo + callback estable → se salta el re-render
const ItemBien = memo(function ItemBien({ onAction }) {
  const ref = useRenderFlash("ItemBien");
  return (
    <div ref={ref} style={{ padding: "12px 16px", border: "1px solid #333", borderRadius: 6 }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap" }}>✅ con useCallback</p>
      <p style={{ margin: 0, fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>referencia estable</p>
    </div>
  );
});

export default function App() {
  const [tick, setTick] = useState(0);

  const handleMal = () => {};
  const handleBien = useCallback(() => {}, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <button onClick={() => setTick((t) => t + 1)} style={{ marginBottom: 20 }}>
        Re-renderizar App (tick: {tick})
      </button>
      <div style={{ display: "flex", gap: 16 }}>
        <ItemMal onAction={handleMal} />
        <ItemBien onAction={handleBien} />
      </div>
      <p style={{ color: "#888", fontSize: 12, marginTop: 16 }}>
        Haz clic en el botón — solo ItemMal flashea porque recibe una función nueva en cada render.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "useCallback sin memo() en el hijo no ahorra renders — el hijo se renderiza igual.",
      "Las dependencias importan: si olvidas una, capturas valores viejos en el closure.",
      "Para un callback que solo se usa en un onClick local, useCallback es overhead inútil.",
    ],
  },
  {
    id: "memo",
    label: "memo",
    kicker: "API · Componentes",
    title: "Saltarse el render",
    lede: "memo() envuelve un componente para que React compare sus props con las anteriores. Si nada cambió por referencia, se salta el render. Es la pieza que hace que useCallback y useMemo valgan la pena.",
    sections: [
      {
        heading: "La comparación",
        body: (
          <p>
            Por defecto, comparación shallow: <code>===</code> sobre cada prop. Por eso pasar un
            objeto literal nuevo en cada render rompe la memoización. Pasa primitivos, o estabiliza
            referencias con useMemo/useCallback.
          </p>
        ),
      },
      {
        heading: "Cuándo no la quieres",
        body: (
          <p>
            Si el componente es trivial o sus props cambian en casi todos los renders, comparar es
            más caro que renderizar. Reserva memo para subárboles caros o listas largas.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/useRenderFlash.js": {
            code: `import { useRef, useEffect } from "react";

export function useRenderFlash(name) {
  const ref = useRef(null);
  const count = useRef(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    count.current += 1;
    const el = ref.current;
    if (!el) return;
    el.style.position = "relative";
    el.style.transition = "none";
    el.style.outline = "1.5px solid #fb923c";
    el.style.backgroundColor = "rgba(251,146,60,0.1)";
    let chip = el.querySelector("[data-rf]");
    if (!chip) {
      chip = document.createElement("div");
      chip.setAttribute("data-rf", "");
      chip.style.cssText =
        "position:absolute;top:0;left:0;background:#fb923c;color:#fff;" +
        "font:bold 9px/1 monospace;padding:2px 5px;border-radius:0 0 3px 0;" +
        "pointer-events:none;z-index:9999;white-space:nowrap;";
      el.appendChild(chip);
    }
    chip.textContent = name + " ×" + count.current;
    chip.style.opacity = "1";
    chip.style.transition = "none";
    const t = setTimeout(() => {
      el.style.transition = "outline 0.6s, background-color 0.6s";
      el.style.outline = "1.5px solid transparent";
      el.style.backgroundColor = "transparent";
      chip.style.transition = "opacity 0.6s";
      chip.style.opacity = "0";
    }, 500);
    return () => clearTimeout(t);
  });
  return ref;
}
`,
            hidden: true,
          },
          "/App.js": `import { memo, useMemo, useState } from "react";
import { useRenderFlash } from "./useRenderFlash";

const Card = memo(function Card({ user }) {
  const ref = useRenderFlash("Card");
  return (
    <div ref={ref} style={{ padding: 12, background: "var(--surface-1)", borderRadius: 4, marginTop: 6, border: "1px solid var(--line)"}}>
      <strong>{user.name}</strong> · {user.role}
    </div>
  );
});

export default function App() {
  const [tick, setTick] = useState(0);

  // CASO A: objeto nuevo en cada render → memo no acierta
  const userUnstable = { name: "Ada", role: "engineer" };

  // CASO B: useMemo estabiliza la referencia → memo acierta
  const userStable = useMemo(() => ({ name: "Lin", role: "designer" }), []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p>tick: {tick}</p>
      <button onClick={() => setTick((t) => t + 1)}>+1 tick</button>

      <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13, color: "var(--fg-muted)" }}>
        Sin estabilizar — re-renderiza en cada tick:
      </p>
      <Card user={userUnstable} />

      <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13 }}>
        Con useMemo — NO re-renderiza:
      </p>
      <Card user={userStable} />

      <p style={{ color: "#888", fontSize: 12, marginTop: 12 }}>
        Haz clic en +1 tick — solo la Card de Ada flashea.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "memo compara por referencia, no por contenido. {a:1} !== {a:1}.",
      "Pasar children siempre rompe la memoización: cada JSX literal crea un objeto nuevo.",
      "memo no es magia: en muchos componentes, no medirás diferencia. Perfila antes de aplicar.",
    ],
  },
]
