import { Playground } from "@/components/playground"
import { ColocacionEstadoAnimation } from "@/components/remotion/ColocacionEstadoAnimation"
import { EstadoDerivadoAnimation } from "@/components/remotion/EstadoDerivadoAnimation"
import { EfectosAnimation } from "@/components/remotion/EfectosAnimation"
import { InmutabilidadAnimation } from "@/components/remotion/InmutabilidadAnimation"
import { KeyStableAnimation } from "@/components/remotion/KeyStableAnimation"
import { PropDrillingAnimation } from "@/components/remotion/PropDrillingAnimation"
import type { Concept } from "./types"

export const practicas: Concept[] = [
  {
    id: "key-estable",
    label: "key estable",
    kicker: "Práctica · Listas",
    title: "El índice no es una identidad",
    lede: 'Usar el índice del array como key le dice a React "el tercer elemento siempre es el mismo elemento". Cuando la lista se reordena, filtra o inserta, esa suposición falla y React reutiliza el DOM equivocado.',
    sections: [
      {
        heading: "Por qué importa",
        body: (
          <p>
            React usa la <code>key</code> para emparejar nodos del render anterior con el nuevo. Con{" "}
            <code>key=&#123;i&#125;</code> el nodo en posición 0 siempre se reutiliza para el item
            en posición 0, sin importar si es otro item. El resultado: estado local (inputs,
            animaciones, foco) queda atado al nodo equivocado.
          </p>
        ),
      },
      {
        body: <KeyStableAnimation />,
      },
      {
        heading: "La regla",
        body: (
          <p>
            Usa un identificador estable y único del dato: <code>item.id</code>,{" "}
            <code>item.slug</code>, o cualquier campo que no cambie cuando el array se transforma.
            El índice solo es seguro cuando la lista es completamente estática y nunca se reordena
            ni filtra.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

const coloresIniciales = [
  { id: "r", nombre: "Rojo" },
  { id: "g", nombre: "Verde" },
  { id: "b", nombre: "Azul" },
];

function Lista({ useKey }) {
  const [items, setItems] = useState(coloresIniciales);
  const shuffle = () => setItems((p) => [...p].sort(() => Math.random() - 0.5));
  const remove = () => setItems((p) => p.slice(1));

  return (
    <div style={{ marginBottom: 32 }}>
      <strong>{useKey ? "✅ key={item.id}" : "❌ key={index}"}</strong>
      <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
        <button onClick={shuffle}>Mezclar</button>
        <button onClick={remove}>Quitar primero</button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item, i) => (
          <li key={useKey ? item.id : i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 60 }}>{item.nombre}</span>
            <input placeholder="escribe algo..." />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p style={{ marginBottom: 16, fontSize: 13, color: "#888" }}>
        Escribe en los inputs, luego mezcla o quita el primero.
      </p>
      <Lista useKey={false} />
      <Lista useKey={true} />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "key={index} en listas dinámicas hace que el estado local (inputs, animaciones) quede en el nodo equivocado al reordenar.",
      "Si no tienes un id en tus datos, genéralo al crearlos — no en el render (cada render produciría una key nueva y React desmontaría el componente).",
      "La key solo es visible para React; no llega al componente hijo como prop.",
    ],
  },
  {
    id: "estado-derivado",
    label: "estado derivado",
    kicker: "Práctica · Estado",
    title: "Si puedes calcularlo, no lo guardes",
    lede: "Cada useState es una fuente de verdad independiente. Cuando un valor puede calcularse a partir de otro estado o prop, guardarlo por separado crea dos verdades que tarde o temprano se desincronizan.",
    sections: [
      {
        heading: "El problema",
        body: (
          <p>
            Guardar en estado algo que ya existe en otro estado (o en las props) significa que
            tienes que mantenerlos sincronizados manualmente — con <code>useEffect</code> o con
            múltiples <code>setState</code> por evento. Cualquier camino donde olvides actualizar
            uno introduce un bug silencioso.
          </p>
        ),
      },
      {
        body: <EstadoDerivadoAnimation />,
      },
      {
        heading: "La solución",
        body: (
          <p>
            Calcula el valor derivado directamente durante el render. Es una variable normal, no un{" "}
            <code>useState</code>. Si el cálculo es costoso y la lista es muy larga, envuélvelo en{" "}
            <code>useMemo</code> — pero solo si hay evidencia real de lentitud, no de forma
            preventiva.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

// ❌ MAL: total guardado en estado separado
function CarritoMal() {
  const [items, setItems] = useState([
    { id: 1, nombre: "Café", precio: 3.5 },
    { id: 2, nombre: "Libro", precio: 12 },
  ]);
  const [total, setTotal] = useState(15.5); // puede desincronizarse

  const agregar = () => {
    const nuevo = { id: Date.now(), nombre: "Extra", precio: 5 };
    setItems((p) => [...p, nuevo]);
    // Si olvidas esta línea, total queda desactualizado:
    setTotal((t) => t + nuevo.precio);
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <strong>❌ Estado duplicado</strong>
      <ul>{items.map((i) => <li key={i.id}>{i.nombre} — \${i.precio}</li>)}</ul>
      <p>Total: <strong>\${total}</strong></p>
      <button onClick={agregar}>Agregar item</button>
    </div>
  );
}

// ✅ BIEN: total derivado en el render
function CarritoBien() {
  const [items, setItems] = useState([
    { id: 1, nombre: "Café", precio: 3.5 },
    { id: 2, nombre: "Libro", precio: 12 },
  ]);

  // Una sola fuente de verdad, siempre sincronizada
  const total = items.reduce((s, i) => s + i.precio, 0);

  const agregar = () => {
    setItems((p) => [...p, { id: Date.now(), nombre: "Extra", precio: 5 }]);
  };

  return (
    <div>
      <strong>✅ Estado derivado</strong>
      <ul>{items.map((i) => <li key={i.id}>{i.nombre} — \${i.precio}</li>)}</ul>
      <p>Total: <strong>\${total.toFixed(2)}</strong></p>
      <button onClick={agregar}>Agregar item</button>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <CarritoMal />
      <CarritoBien />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Derivar con useEffect introduce un render extra: el estado viejo se renderiza primero, luego el efecto actualiza el derivado y hay otro render.",
      "No todo lo que parece derivado lo es: si el usuario puede editarlo independientemente del origen, entonces sí necesita su propio estado.",
      "useMemo solo para cálculos costosos — filtrar un array de 20 items no lo justifica.",
    ],
  },
  {
    id: "efectos-innecesarios",
    label: "efectos innecesarios",
    kicker: "Práctica · Efectos",
    title: "useEffect no es un ciclo de vida",
    lede: "useEffect existe para sincronizar con sistemas externos (APIs, DOM, timers). Usarlo para transformar datos o calcular estado en respuesta a otro estado es el patrón más común que causa renders dobles, bugs de sincronización y código difícil de seguir.",
    sections: [
      {
        heading: "Cuándo NO usar useEffect",
        body: (
          <p>
            Si el código dentro del efecto solo lee props o estado y actualiza otro estado, no
            necesita un efecto. Hazlo durante el render: calcula el valor derivado directamente como
            una variable. El resultado es el mismo pero sin el render extra que produce el efecto al
            ejecutarse después del primer render.
          </p>
        ),
      },
      {
        body: <EfectosAnimation />,
      },
      {
        heading: "Cuándo SÍ usar useEffect",
        body: (
          <p>
            Reserva <code>useEffect</code> para sincronización real con el mundo exterior:{" "}
            <code>fetch</code>, suscripciones a eventos del DOM o APIs externas, manipulación
            directa de un nodo DOM, o integración con librerías de terceros que operan fuera del
            árbol de React.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useEffect, useRef } from "react";

function useRenderFlash() {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.outline = "1.5px solid #fb923c";
    el.style.backgroundColor = "rgba(251,146,60,0.1)";
    const t = setTimeout(() => {
      el.style.transition = "outline 0.6s, background-color 0.6s";
      el.style.outline = "1.5px solid transparent";
      el.style.backgroundColor = "transparent";
    }, 500);
    return () => clearTimeout(t);
  });
  return ref;
}

const productos = [
  { id: 1, nombre: "Monitor", categoria: "tech", precio: 300 },
  { id: 2, nombre: "Teclado", categoria: "tech", precio: 80 },
  { id: 3, nombre: "Silla", categoria: "muebles", precio: 250 },
  { id: 4, nombre: "Lámpara", categoria: "muebles", precio: 45 },
  { id: 5, nombre: "Auriculares", categoria: "tech", precio: 120 },
];

// ❌ MAL: guarda filtrados en estado — useEffect lo sincroniza (render extra)
function FiltroMal({ categoria }) {
  const ref = useRenderFlash();
  const renders = useRef(0);
  renders.current += 1;

  const [filtrados, setFiltrados] = useState(productos);

  useEffect(() => {
    setFiltrados(
      categoria === "todos"
        ? productos
        : productos.filter((p) => p.categoria === categoria)
    );
  }, [categoria]);

  return (
    <div ref={ref} style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "nowrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>❌ useEffect</span>
        <code style={{ fontSize: 11, color: "#fb923c", background: "rgba(251,146,60,0.12)", padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>×{renders.current}</code>
      </div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>{filtrados.map((p) => <li key={p.id}>{p.nombre}</li>)}</ul>
    </div>
  );
}

// ✅ BIEN: deriva filtrados del prop — un solo render
function FiltroBien({ categoria }) {
  const ref = useRenderFlash();
  const renders = useRef(0);
  renders.current += 1;

  const filtrados =
    categoria === "todos"
      ? productos
      : productos.filter((p) => p.categoria === categoria);

  return (
    <div ref={ref} style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "nowrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>✅ render</span>
        <code style={{ fontSize: 11, color: "#fb923c", background: "rgba(251,146,60,0.12)", padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>×{renders.current}</code>
      </div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>{filtrados.map((p) => <li key={p.id}>{p.nombre}</li>)}</ul>
    </div>
  );
}

export default function App() {
  const [categoria, setCategoria] = useState("todos");

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
        Un selector actualiza ambos — el contador de renders diverge con cada cambio.
      </p>
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
        style={{ marginBottom: 16 }}>
        <option value="todos">Todos</option>
        <option value="tech">Tech</option>
        <option value="muebles">Muebles</option>
      </select>
      <div style={{ display: "flex", gap: 32 }}>
        <FiltroMal categoria={categoria} />
        <FiltroBien categoria={categoria} />
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "useEffect con setState siempre produce al menos un render extra: el inicial con el estado vacío y otro cuando el efecto actualiza.",
      "Encadenar efectos (un efecto actualiza estado que dispara otro efecto) es casi siempre una señal de que la lógica debería estar en el render o en un manejador de evento.",
      "fetch en useEffect sin cleanup puede actualizar estado de un componente ya desmontado — siempre retorna una función que cancela la petición o ignora la respuesta.",
    ],
  },
  {
    id: "inmutabilidad-estado",
    label: "inmutabilidad",
    kicker: "Práctica · Estado",
    title: "Nunca mutes el estado directamente",
    lede: "React detecta cambios comparando referencias, no valores internos. Si mutas un array u objeto directamente, la referencia sigue siendo la misma y React no sabe que algo cambió — el componente no se re-renderiza.",
    sections: [
      {
        heading: "El problema",
        body: (
          <p>
            Operaciones como <code>array.push()</code>, <code>array.splice()</code> o{" "}
            <code>obj.propiedad = valor</code> modifican el objeto original en memoria. Como la
            referencia no cambia, React asume que el estado es idéntico al anterior y omite el
            re-render. El bug es silencioso: la lógica se ejecuta, pero la UI no se actualiza.
          </p>
        ),
      },
      {
        body: <InmutabilidadAnimation />,
      },
      {
        heading: "La solución",
        body: (
          <p>
            Siempre crea una nueva referencia al actualizar estado. Para arrays usa el spread{" "}
            <code>[...arr, nuevoItem]</code>, <code>arr.filter()</code> o <code>arr.map()</code> —
            todos retornan un nuevo array. Para objetos usa{" "}
            <code>{"{ ...obj, campo: valor }"}</code>. Para estructuras anidadas, copia en cada
            nivel que cambia.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

// ❌ MAL: mutación directa — React no ve el cambio
function ListaMal() {
  const [items, setItems] = useState(["Manzana", "Banana"]);

  const agregar = () => {
    items.push("Naranja"); // muta el array original
    setItems(items);       // misma referencia → React no re-renderiza
  };

  const eliminar = () => {
    items.splice(0, 1);  // muta el array original
    setItems(items);
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <strong>❌ Mutación directa</strong>
      <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={agregar}>Agregar Naranja</button>
        <button onClick={eliminar}>Eliminar primero</button>
      </div>
      <p style={{ fontSize: 12, color: "#888" }}>Los botones no actualizan la UI</p>
    </div>
  );
}

// ✅ BIEN: nueva referencia en cada actualización
function ListaBien() {
  const [items, setItems] = useState(["Manzana", "Banana"]);

  const agregar = () => {
    setItems((prev) => [...prev, "Naranja"]); // nuevo array
  };

  const eliminar = () => {
    setItems((prev) => prev.slice(1)); // nuevo array
  };

  return (
    <div>
      <strong>✅ Nueva referencia</strong>
      <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={agregar}>Agregar Naranja</button>
        <button onClick={eliminar}>Eliminar primero</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <ListaMal />
      <ListaBien />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "array.push(), array.pop(), array.splice() y array.sort() mutan el array original — nunca los uses directamente sobre estado.",
      "Para objetos anidados debes copiar en cada nivel: { ...obj, nested: { ...obj.nested, campo: valor } }. Considera Immer si la estructura es muy profunda.",
      "structuredClone() hace una copia profunda pero es costoso — úsalo solo cuando necesitas clonar un objeto complejo que no puedes copiar nivel por nivel.",
    ],
  },
  {
    id: "colocacion-estado",
    label: "colocación de estado",
    kicker: "Práctica · Estado",
    title: "El estado más cerca de quien lo usa",
    lede: "Cuando el estado vive más arriba de lo necesario en el árbol, cada cambio re-renderiza componentes que no lo necesitan. La regla: empieza con el estado lo más local posible y súbelo solo cuando dos o más componentes necesiten compartirlo.",
    sections: [
      {
        heading: "El problema",
        body: (
          <p>
            Si <code>useState</code> está en <code>App</code> pero solo lo usa <code>Dropdown</code>
            , cada vez que ese estado cambia React re-renderiza <code>App</code> y todos sus hijos —
            incluyendo <code>Header</code> y <code>Sidebar</code>, que no tienen nada que ver con el
            estado. El resultado son renders innecesarios que crecen con el árbol.
          </p>
        ),
      },
      {
        body: <ColocacionEstadoAnimation />,
      },
      {
        heading: "La solución",
        body: (
          <p>
            Mueve el estado al componente que lo necesita. Si solo <code>Dropdown</code> usa{" "}
            <code>open</code>, el <code>useState</code> va dentro de <code>Dropdown</code>. Cuando
            el estado cambia, solo ese componente re-renderiza. El árbol exterior no se entera. Sube
            el estado al padre únicamente cuando dos componentes hermanos necesiten leerlo o
            escribirlo.
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
          "/App.js": `import { useState } from "react";
import { useRenderFlash } from "./useRenderFlash";

// ❌ MAL: open vive en App aunque solo Dropdown lo usa
function AppMal() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 32 }}>
      <strong>❌ Estado en el padre</strong>
      <p style={{ fontSize: 12, color: "#888" }}>
        Header y Sidebar re-renderizan cada vez que open cambia.
      </p>
      <Header label="Mi App" />
      <Sidebar links={["Inicio", "Perfil"]} />
      <Dropdown open={open} onToggle={() => setOpen((o) => !o)} />
    </div>
  );
}

// ✅ BIEN: open vive dentro de Dropdown, el único que lo necesita
function AppBien() {
  return (
    <div>
      <strong>✅ Estado colocado</strong>
      <p style={{ fontSize: 12, color: "#888" }}>
        Solo Dropdown re-renderiza cuando open cambia.
      </p>
      <Header label="Mi App" />
      <Sidebar links={["Inicio", "Perfil"]} />
      <DropdownColocado />
    </div>
  );
}

function Header({ label }) {
  const ref = useRenderFlash("Header");
  return <div ref={ref} style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}>{label}</div>;
}

function Sidebar({ links }) {
  const ref = useRenderFlash("Sidebar");
  return (
    <ul ref={ref} style={{ fontSize: 13, margin: "6px 0", paddingLeft: 16 }}>
      {links.map((l) => <li key={l}>{l}</li>)}
    </ul>
  );
}

function Dropdown({ open, onToggle }) {
  const ref = useRenderFlash("Dropdown");
  return (
    <div ref={ref}>
      <button onClick={onToggle}>{open ? "▲ Cerrar" : "▼ Abrir"}</button>
      {open && <div style={{ padding: 8, border: "1px solid #ddd", marginTop: 4 }}>Contenido del dropdown</div>}
    </div>
  );
}

function DropdownColocado() {
  const [open, setOpen] = useState(false);
  const ref = useRenderFlash("Dropdown");
  return (
    <div ref={ref}>
      <button onClick={() => setOpen((o) => !o)}>{open ? "▲ Cerrar" : "▼ Abrir"}</button>
      {open && <div style={{ padding: 8, border: "1px solid #ddd", marginTop: 4 }}>Contenido del dropdown</div>}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
        Haz clic en los botones — el borde naranja y la etiqueta muestran cada re-render.
      </p>
      <AppMal />
      <AppBien />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "No levantes el estado 'por si acaso' lo necesitas arriba más tarde — YAGNI. Muévelo hacia arriba solo cuando dos componentes hermanos lo necesiten de verdad.",
      "Si descubres que necesitas el estado en dos ramas distintas del árbol, considera Context o un store global — pero solo cuando el drilling real te lo exija.",
      "Colocar estado local no impide que componentes hijos usen memo para evitar renders por cambios de props no relacionados.",
    ],
  },
  {
    id: "evitar-prop-drilling",
    label: "prop drilling",
    kicker: "Práctica · Composición",
    title: "Cortar el prop drilling",
    lede: "Prop drilling es pasar datos a través de capas de componentes que no los usan — solo los reenvían hacia abajo. Cuando el árbol crece, acopla la API de cada capa a los detalles de sus descendientes y hace el código frágil. Context y la composición con children son las herramientas principales para cortarlo.",
    sections: [
      {
        heading: "Cuándo es un problema",
        body: (
          <p>
            Pasar una prop por 2 niveles es normal. El problema aparece cuando componentes
            intermedios reciben props <em>solo para pasarlas</em> sin usarlas nunca. Cualquier
            cambio en el consumidor final obliga a tocar todos los intermediarios.
          </p>
        ),
      },
      {
        heading: "Dos soluciones",
        body: (
          <p>
            <strong>Context</strong> — ideal para datos globales o semi-globales: usuario activo,
            tema, locale. El consumidor lee directamente del contexto sin que nadie lo pase.{" "}
            <strong>Composición</strong> — pasar <code>children</code> o elementos como props evita
            el tunneling sin necesidad de contexto y suele ser la solución más simple.
          </p>
        ),
      },
      {
        body: <PropDrillingAnimation />,
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
          "/App.js": `import { createContext, memo, useContext, useState } from "react";
import { useRenderFlash } from "./useRenderFlash";

const card = { padding: "6px 10px", border: "1px solid #333", borderRadius: 6, marginTop: 6 };

// ─── ❌ Prop drilling — memo no puede proteger a Layout/Sidebar ───

const UserCardMal = memo(function UserCardMal({ user }) {
  const ref = useRenderFlash("UserCard");
  return (
    <div ref={ref} style={card}>
      <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>UserCard</span>
      <p style={{ margin: "2px 0 0", fontSize: 12 }}>{user.name} · {user.role}</p>
    </div>
  );
});
const SidebarMal = memo(function SidebarMal({ user }) {
  const ref = useRenderFlash("Sidebar");
  return (
    <div ref={ref} style={card}>
      <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>Sidebar</span>
      <UserCardMal user={user} />
    </div>
  );
});
const LayoutMal = memo(function LayoutMal({ user }) {
  const ref = useRenderFlash("Layout");
  return (
    <div ref={ref} style={card}>
      <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>Layout</span>
      <SidebarMal user={user} />
    </div>
  );
});

// ─── ✅ Context — memo sí puede proteger a Layout/Sidebar ────────

const UserCtx = createContext(null);

const UserCardBien = memo(function UserCardBien() {
  const user = useContext(UserCtx);
  const ref = useRenderFlash("UserCard");
  return (
    <div ref={ref} style={card}>
      <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>UserCard</span>
      <p style={{ margin: "2px 0 0", fontSize: 12 }}>{user.name} · {user.role}</p>
    </div>
  );
});
const SidebarBien = memo(function SidebarBien() {
  const ref = useRenderFlash("Sidebar");
  return (
    <div ref={ref} style={card}>
      <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>Sidebar</span>
      <UserCardBien />
    </div>
  );
});
const LayoutBien = memo(function LayoutBien() {
  const ref = useRenderFlash("Layout");
  return (
    <div ref={ref} style={card}>
      <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>Layout</span>
      <SidebarBien />
    </div>
  );
});

// ─── App ─────────────────────────────────────────────────────────

const users = [
  { name: "Ada", role: "Engineer" },
  { name: "Lin", role: "Designer" },
  { name: "Max", role: "PM" },
];

export default function App() {
  const [idx, setIdx] = useState(0);
  const user = users[idx];
  const next = () => setIdx((i) => (i + 1) % users.length);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <button onClick={next} style={{ alignSelf: "flex-start" }}>
        Cambiar usuario → {user.name}
      </button>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#f87171", fontWeight: "bold" }}>
          ❌ Prop drilling — memo no ayuda: user llega como prop
        </p>
        <LayoutMal user={user} />
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#4ade80", fontWeight: "bold" }}>
          ✅ Context — solo UserCard re-renderiza
        </p>
        <UserCtx.Provider value={user}>
          <LayoutBien />
        </UserCtx.Provider>
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Context no es gratis: cualquier cambio en el valor re-renderiza todos los consumidores. No lo uses para estado que cambia frecuentemente.",
      "La composición con children suele ser la solución más simple y se olvida con frecuencia — antes de crear un contexto, evalúa si puedes pasar elementos como props.",
      "No eleves datos a Context solo 'por si acaso' los necesitas en otro lado. Muévelos solo cuando el drilling real sea un problema.",
    ],
  },
]
