import { Playground } from "@/components/playground"
import type { Concept } from "./types"

export const entrevistas: Concept[] = [
  {
    id: "virtual-dom",
    label: "Virtual DOM",
    kicker: "Entrevista · Fundamentos",
    title: "¿Por qué React no toca el DOM directamente?",
    lede: "El Virtual DOM es una representación en memoria del árbol de UI. React lo compara contra el estado anterior (reconciliación) y solo aplica al DOM real los cambios mínimos necesarios — en lugar de reescribirlo entero.",
    sections: [
      {
        heading: "El ciclo completo",
        body: (
          <p>
            <strong>Render →</strong> React genera un nuevo árbol de objetos JS.{" "}
            <strong>Diffing →</strong> Compara el árbol nuevo contra el anterior (algoritmo O(n)).{" "}
            <strong>Commit →</strong> Solo las diferencias se aplican al DOM real. El DOM es lento;
            los objetos JS son rápidos — ahí está la ganancia.
          </p>
        ),
      },
      {
        heading: "Reconciliación y keys",
        body: (
          <p>
            Cuando React compara listas necesita identificar qué elemento es qué. Sin{" "}
            <code>key</code>, asume posición y puede reutilizar el nodo equivocado. Con{" "}
            <code>key</code> estable, reconcilia correctamente incluso al reordenar.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

// Sin key estable React reutiliza nodos por posición.
// Cambia el orden y observa cómo el input conserva su valor.

const colores = ["Rojo", "Verde", "Azul", "Amarillo"];

function Lista({ useKey }) {
  const [items, setItems] = useState(colores);

  const shuffle = () =>
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));

  return (
    <div style={{ marginBottom: 24 }}>
      <strong>{useKey ? "Con key (correcto)" : "Sin key (bug)"}</strong>
      <button onClick={shuffle} style={{ marginLeft: 8 }}>Mezclar</button>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
        {items.map((item, i) => (
          <li key={useKey ? item : i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 80 }}>{item}</span>
            <input placeholder="escribe algo..." />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
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
      "El Virtual DOM no es siempre más rápido que el DOM directo — frameworks como Svelte prescinden de él y son igual de rápidos para casos simples.",
      "Usar el índice como key es un anti-patrón cuando la lista puede reordenarse o tener inserciones.",
      "React Native también usa reconciliación, pero en lugar de DOM aplica los cambios a vistas nativas.",
    ],
  },

  {
    id: "controlado-vs-no-controlado",
    label: "Controlado vs No controlado",
    kicker: "Entrevista · Formularios",
    title: "¿Quién tiene la verdad del input?",
    lede: "Un componente controlado delega el valor del input a React — el estado es la fuente de verdad. Un componente no controlado deja que el DOM guarde el valor y lo lee con una ref cuando hace falta.",
    sections: [
      {
        heading: "Controlado",
        body: (
          <p>
            <code>value</code> viene del estado y <code>onChange</code> lo actualiza. React controla
            cada pulsación. Ideal cuando necesitas validación en tiempo real, transformar el input
            mientras el usuario escribe, o sincronizar varios campos.
          </p>
        ),
      },
      {
        heading: "No controlado",
        body: (
          <p>
            El DOM guarda el valor. Lo lees con <code>useRef</code> en el momento que necesitas (por
            ejemplo, al hacer submit). Más simple para formularios donde no importa el valor
            intermedio — como un upload de archivo.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useRef } from "react";

// ── Controlado ────────────────────────────────
function ControlledForm() {
  const [value, setValue] = useState("");
  const upper = value.toUpperCase();

  return (
    <section>
      <h3>Controlado</h3>
      <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
        React es la fuente de verdad. Se transforma a mayúsculas en tiempo real.
      </p>
      <input
        value={upper}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe algo..."
      />
      <p>Estado: <code>"{upper}"</code></p>
    </section>
  );
}

// ── No controlado ─────────────────────────────
function UncontrolledForm() {
  const ref = useRef(null);
  const [submitted, setSubmitted] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(ref.current.value);
  };

  return (
    <section>
      <h3>No controlado</h3>
      <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
        El DOM guarda el valor. React solo lo lee al hacer submit.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input ref={ref} placeholder="Escribe algo..." />
        <button type="submit">Enviar</button>
      </form>
      {submitted && <p>Enviado: <code>"{submitted}"</code></p>}
    </section>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", display: "flex", flexDirection: "column", gap: 24 }}>
      <ControlledForm />
      <hr />
      <UncontrolledForm />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Mezclar value sin onChange produce un input 'read-only'. React te lo avisa en consola.",
      "defaultValue no es lo mismo que value — defaultValue es solo el valor inicial (no controlado).",
      "Para inputs de tipo file nunca se usan controlados porque el navegador no permite setear su valor por seguridad.",
    ],
  },

  {
    id: "prop-drilling",
    label: "Prop drilling",
    kicker: "Entrevista · Arquitectura",
    title: "Cuando los props viajan por donde no deben",
    lede: "Prop drilling ocurre cuando un dato pasa por varios componentes intermedios solo para llegar a uno profundo que realmente lo necesita. Los intermediarios no usan el dato — solo lo reenvían.",
    sections: [
      {
        heading: "El problema",
        body: (
          <p>
            Cada componente intermedio recibe un prop que no usa, quedando acoplado a una decisión
            que no le pertenece. Si el dato cambia de forma, hay que actualizar todos los eslabones
            de la cadena.
          </p>
        ),
      },
      {
        heading: "Las soluciones",
        body: (
          <p>
            <strong>Context API</strong> — para estado global que muchos componentes necesitan
            (tema, usuario, idioma). <strong>Composición</strong> — pasar componentes como{" "}
            <code>children</code> en vez de datos, evitando el túnel completamente.{" "}
            <strong>Estado externo</strong> (Zustand, Redux) — cuando la lógica de estado es
            compleja.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { createContext, useContext, useState } from "react";

// ── Sin Context: drilling a través de B y C ───
function WithDrilling() {
  const [user, setUser] = useState("Ana");
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <strong>Con prop drilling</strong>
      <A_drill user={user} setUser={setUser} />
    </div>
  );
}
function A_drill({ user, setUser }) {
  return <B_drill user={user} setUser={setUser} />;   // A no usa user
}
function B_drill({ user, setUser }) {
  return <C_drill user={user} setUser={setUser} />;   // B tampoco
}
function C_drill({ user, setUser }) {
  return (
    <div>
      Hola, <strong>{user}</strong>
      <button onClick={() => setUser("Carlos")} style={{ marginLeft: 8 }}>
        Cambiar
      </button>
    </div>
  );
}

// ── Con Context: solo C accede al contexto ────
const UserCtx = createContext(null);

function WithContext() {
  const [user, setUser] = useState("Ana");
  return (
    <UserCtx.Provider value={{ user, setUser }}>
      <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12, marginTop: 12 }}>
        <strong>Con Context</strong>
        <A_ctx />
      </div>
    </UserCtx.Provider>
  );
}
function A_ctx() { return <B_ctx />; }
function B_ctx() { return <C_ctx />; }
function C_ctx() {
  const { user, setUser } = useContext(UserCtx);
  return (
    <div>
      Hola, <strong>{user}</strong>
      <button onClick={() => setUser("Carlos")} style={{ marginLeft: 8 }}>
        Cambiar
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <WithDrilling />
      <WithContext />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Context no es un reemplazo automático del prop drilling — para props que solo pasan 2 niveles, el drilling es más legible.",
      "Poner todo en Context causa re-renders innecesarios en componentes que no usan el dato que cambió.",
      "La composición con children suele resolver prop drilling sin introducir Context ni estado global.",
    ],
  },

  {
    id: "hoc",
    label: "HOC",
    kicker: "Entrevista · Patrones",
    title: "Componentes que envuelven componentes",
    lede: "Un Higher-Order Component es una función que recibe un componente y devuelve uno nuevo con comportamiento adicional. Es el patrón de reutilización de lógica de la era pre-hooks — hoy los hooks lo reemplazan en la mayoría de casos, pero siguen apareciendo en código legacy y librerías.",
    sections: [
      {
        heading: "La firma",
        body: (
          <p>
            <code>const Mejorado = withAlgo(Componente)</code>. El HOC añade props, envuelve en
            providers, inyecta comportamiento — sin que el componente original sepa que está siendo
            envuelto. Por convención se nombran con prefijo <code>with</code>.
          </p>
        ),
      },
      {
        heading: "HOC vs Hook",
        body: (
          <p>
            Los hooks son más simples y componibles. Usa HOC cuando necesitas envolver el árbol JSX
            del componente (error boundaries, providers) o cuando trabajas con una librería que los
            requiere. Para lógica pura reutilizable, un hook personalizado es la opción moderna.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

// HOC que añade un logger de renders
function withLogger(Component) {
  return function Logged(props) {
    console.log(\`[render] \${Component.displayName || Component.name}\`, props);
    return <Component {...props} />;
  };
}

// HOC que añade un loading state
function withLoading(Component) {
  return function WithLoading({ isLoading, ...rest }) {
    if (isLoading) return <p style={{ color: "var(--fg-muted)" }}>Cargando...</p>;
    return <Component {...rest} />;
  };
}

// Componente base
function UserCard({ name, role }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <strong>{name}</strong>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--fg-muted)" }}>{role}</p>
    </div>
  );
}

// Composición de HOCs
const UserCardEnhanced = withLogger(withLoading(UserCard));

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <button onClick={() => setLoading((v) => !v)} style={{ marginBottom: 16 }}>
        {loading ? "Simular carga completa" : "Simular cargando"}
      </button>
      <UserCardEnhanced
        isLoading={loading}
        name="Ana García"
        role="Frontend Engineer"
      />
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 12 }}>
        Abre la consola para ver el log de renders.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "No definas HOCs dentro de un componente — se recrean en cada render y React desmonta/monta el árbol completo.",
      "Los HOCs ocultan el origen de los props, dificultando el debugging. Con hooks, el origen siempre es explícito.",
      "Al componer múltiples HOCs, el orden importa — se aplican de adentro hacia afuera.",
    ],
  },

  {
    id: "render-props",
    label: "Render Props",
    kicker: "Entrevista · Patrones",
    title: "Delegar el qué renderizar",
    lede: "El patrón Render Props consiste en pasar una función como prop que el componente llama para obtener JSX. El componente controla cuándo y con qué datos renderiza; el padre controla qué se renderiza con esos datos.",
    sections: [
      {
        heading: "La idea central",
        body: (
          <p>
            En lugar de que el componente decida su propio output, recibe una función{" "}
            <code>render</code> (o <code>children</code> como función) y la invoca con sus datos
            internos. El padre recibe esos datos y devuelve JSX — separando lógica de presentación.
          </p>
        ),
      },
      {
        heading: "Render Props vs hooks",
        body: (
          <p>
            Los hooks resuelven el mismo problema (compartir lógica) de forma más directa. Hoy el
            patrón render props aparece principalmente en librerías de UI como Headless UI o Radix,
            donde la lógica de accesibilidad se separa completamente de la presentación visual.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useEffect } from "react";

// Componente que encapsula la lógica del mouse
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return render(pos);  // delega el JSX al padre
}

// Dos usos distintos del mismo MouseTracker
export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3>Coordenadas</h3>
      <MouseTracker
        render={({ x, y }) => (
          <p>x: {x} · y: {y}</p>
        )}
      />

      <h3 style={{ marginTop: 24 }}>Punto seguidor</h3>
      <div style={{ position: "relative", height: 200, border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
        <MouseTracker
          render={({ x, y }) => (
            <div style={{
              position: "absolute",
              left: x - 6,
              top: y - 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "var(--accent)",
              pointerEvents: "none",
              transform: "translate(-50%,-50%)"
            }} />
          )}
        />
        <p style={{ padding: 12, color: "var(--fg-muted)", fontSize: 13 }}>Mueve el cursor aquí</p>
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Si pasas una función flecha inline como render prop, se crea una nueva función en cada render — puede romper React.memo en componentes hijos.",
      "Children como función (children prop) es funcionalmente idéntico a render prop — es solo una convención de nombre.",
      "Para lógica pura sin JSX propio, un custom hook es siempre más limpio que render props.",
    ],
  },

  {
    id: "jsx",
    label: "JSX",
    kicker: "Entrevista · Fundamentos",
    title: "¿Qué es JSX y en qué se convierte?",
    lede: "JSX es azúcar sintáctica sobre React.createElement. El navegador no lo entiende — un compilador (Babel/SWC) lo transforma a llamadas de función JS antes de ejecutarse.",
    sections: [
      {
        heading: "Lo que hace el compilador",
        body: (
          <p>
            <code>{'<Button color="red">Click</Button>'}</code> se convierte en{" "}
            <code>{'React.createElement(Button, { color: "red" }, "Click")'}</code>. JSX no es magia
            — es una forma más legible de crear objetos que describen nodos del árbol de UI.
          </p>
        ),
      },
      {
        heading: "JSX no es HTML",
        body: (
          <p>
            Las diferencias clave: <code>className</code> en vez de <code>class</code>,{" "}
            <code>htmlFor</code> en vez de <code>for</code>, eventos en camelCase (
            <code>onClick</code>), y <code>style</code> acepta objetos JS en lugar de strings.
            Además, todos los elementos deben cerrarse — incluyendo <code>{"<br />"}</code> y{" "}
            <code>{"<img />"}</code>.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import React from "react";

// JSX — lo que escribes
function WithJSX() {
  return (
    <div className="card" style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 6 }}>
      <p style={{ margin: 0, fontWeight: "bold" }}>Hola desde JSX</p>
      <button onClick={() => alert("JSX")} style={{ marginTop: 8 }}>Presionar</button>
    </div>
  );
}

// Equivalente — lo que el compilador produce
function WithoutJSX() {
  return React.createElement(
    "div",
    { style: { padding: 16, border: "1px solid var(--line)", borderRadius: 6 } },
    React.createElement("p", { style: { margin: 0, fontWeight: "bold" } }, "Hola sin JSX"),
    React.createElement("button", { onClick: () => alert("createElement"), style: { marginTop: 8 } }, "Presionar")
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 13, color: "var(--fg-muted)" }}>
        Ambos producen el mismo resultado. JSX es solo syntactic sugar.
      </p>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>Con JSX:</p>
        <WithJSX />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>Sin JSX (React.createElement):</p>
        <WithoutJSX />
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Desde React 17 ya no es necesario importar React para usar JSX — el nuevo transform lo inyecta automáticamente.",
      "Las expresiones dentro de {} deben ser expresiones JS válidas, no statements. No puedes poner un if directamente — usa ternario o &&.",
      "Un componente debe retornar un único elemento raíz. Usa <></> (Fragment) para envolver varios elementos sin agregar nodos extra al DOM.",
    ],
  },

  {
    id: "key-prop",
    label: "Prop key",
    kicker: "Entrevista · Reconciliación",
    title: "key no es solo para listas",
    lede: "La prop key le dice a React qué nodo del DOM corresponde a qué elemento entre renders. Cuando key cambia, React desmonta el componente antiguo y monta uno nuevo — lo que permite resetear estado de forma intencional.",
    sections: [
      {
        heading: "El mecanismo de identidad",
        body: (
          <p>
            React compara el árbol nuevo contra el anterior por tipo y posición. Si un elemento
            tiene la misma <code>key</code> que antes, React lo reutiliza (actualiza). Si la{" "}
            <code>key</code> cambia, React lo desmonta y monta desde cero — incluyendo su estado
            interno y efectos.
          </p>
        ),
      },
      {
        heading: "key como reset intencional",
        body: (
          <p>
            Pasar una <code>key</code> que cambia según un ID externo es la forma idiomática de
            reiniciar un componente sin añadir lógica de reset dentro de él. Cuando el usuario
            cambia de elemento, la <code>key</code> cambia y React monta una instancia limpia
            automáticamente.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

const users = ["Ana", "Carlos", "María"];

// Formulario con su propio estado interno
function UserForm({ name }) {
  const [notes, setNotes] = useState("");
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>Usuario: {name}</p>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas sobre este usuario..."
        style={{ width: "100%", boxSizing: "border-box" }}
      />
      {notes && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--fg-muted)" }}>
          Guardado: "{notes}"
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [userId, setUserId] = useState(0);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--fg-muted)" }}>
        Escribe algo en el input, luego cambia de usuario.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {users.map((u, i) => (
          <button
            key={u}
            onClick={() => setUserId(i)}
            style={{ fontWeight: userId === i ? "bold" : "normal" }}
          >
            {u}
          </button>
        ))}
      </div>

      <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>Sin key — el estado persiste entre usuarios:</p>
      <UserForm name={users[userId]} />

      <p style={{ margin: "16px 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>Con key={"{userId}"} — estado se resetea al cambiar:</p>
      <UserForm key={userId} name={users[userId]} />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Usar el índice del array como key es un anti-patrón cuando la lista puede reordenarse — React reutilizará el nodo equivocado.",
      "key no es una prop accesible desde el componente — no puedes leerla con props.key. Si necesitas el valor, pásalo como prop aparte.",
      "key debe ser único entre hermanos, no globalmente. El mismo valor puede repetirse en listas separadas sin problema.",
    ],
  },

  {
    id: "hydration",
    label: "Hidratación",
    kicker: "Entrevista · SSR",
    title: "¿Qué significa hidratar en React?",
    lede: "La hidratación es el proceso por el que React toma control del HTML generado en el servidor. En lugar de recrear el DOM, adjunta event listeners al HTML existente — el usuario ve contenido de inmediato mientras React lo hace interactivo.",
    sections: [
      {
        heading: "El flujo SSR + hydration",
        body: (
          <p>
            <strong>Servidor →</strong> genera HTML estático que el navegador muestra al instante.{" "}
            <strong>Cliente →</strong> descarga el JS y React llama a <code>hydrateRoot</code> en
            lugar de <code>createRoot</code>. React recorre el HTML existente, lo compara con el
            árbol que generaría, y adjunta los handlers — sin repintar el DOM si todo coincide.
          </p>
        ),
      },
      {
        heading: "Hydration mismatch",
        body: (
          <p>
            Si el HTML del servidor no coincide con lo que React renderizaría en el cliente (por
            ejemplo, una fecha con <code>new Date()</code>, un valor de <code>localStorage</code>, o
            un número aleatorio), React lanza una advertencia y reconstruye ese subárbol desde cero.
            La solución es diferir ese contenido a un <code>useEffect</code> o marcar el nodo con{" "}
            <code>suppressHydrationWarning</code>.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useEffect } from "react";

// Patrón: componente que solo renderiza en el cliente
function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : fallback;
}

// Esto causaría hydration mismatch en una app SSR real:
// el servidor y el cliente generan horas distintas
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time.toLocaleTimeString()}</span>;
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--fg-muted)" }}>
          ⚠️ Renderizado directo — causaría mismatch en SSR:
        </p>
        <LiveClock />
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--fg-muted)" }}>
          ✅ Con ClientOnly — se renderiza solo en el cliente:
        </p>
        <ClientOnly fallback={<span style={{ color: "var(--fg-muted)" }}>--:--:--</span>}>
          <LiveClock />
        </ClientOnly>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "var(--fg-muted)" }}>
        El fallback es lo que el servidor habría renderizado. El cliente lo reemplaza tras montar.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "En Next.js App Router, los Server Components no se hidratan — solo los Client Components ('use client') necesitan hidratación.",
      "suppressHydrationWarning solo suprime el warning en el nodo marcado, no resuelve el mismatch real. Úsalo solo cuando el contenido dinámico sea esperado (timestamps, ads).",
      "Un mismatch de hydration puede provocar un flash visual si React tiene que reconstruir parte del DOM en el cliente.",
    ],
  },

  {
    id: "forward-ref",
    label: "forwardRef",
    kicker: "Entrevista · Refs",
    title: "Pasar una ref hacia adentro de un componente",
    lede: "forwardRef permite que un componente exponga su nodo DOM interno al padre vía ref. Sin él, pasar ref a un componente personalizado no hace nada — ref no es una prop normal y React la intercepta.",
    sections: [
      {
        heading: "Por qué ref no es una prop",
        body: (
          <p>
            React reserva <code>ref</code> (junto con <code>key</code>) y no la pasa al componente
            como prop regular. Si quieres que el padre acceda al DOM interno de un componente hijo,
            el hijo debe opt-in explícitamente con <code>forwardRef</code>.
          </p>
        ),
      },
      {
        heading: "useImperativeHandle",
        body: (
          <p>
            En lugar de exponer el nodo DOM directamente, puedes usar{" "}
            <code>useImperativeHandle</code> junto con <code>forwardRef</code> para exponer solo las
            operaciones que quieres permitir (focus, scroll, play…) — ocultando el DOM real y
            manteniendo la encapsulación del componente.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useRef, forwardRef, useImperativeHandle } from "react";

// forwardRef básico: expone el input directamente
const BasicInput = forwardRef(function BasicInput({ label }, ref) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>{label}</label>
      <input
        ref={ref}
        style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "6px 10px", width: "100%", boxSizing: "border-box" }}
        placeholder="Campo con forwardRef..."
      />
    </div>
  );
});

// useImperativeHandle: expone solo lo que queremos
const SecureInput = forwardRef(function SecureInput({ label }, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => { if (inputRef.current) inputRef.current.value = ""; },
    // El DOM real no se expone — solo estas dos operaciones
  }));

  return (
    <div>
      <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>{label}</label>
      <input
        ref={inputRef}
        style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "6px 10px", width: "100%", boxSizing: "border-box" }}
        placeholder="Campo con useImperativeHandle..."
      />
    </div>
  );
});

export default function App() {
  const basicRef = useRef(null);
  const secureRef = useRef(null);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <BasicInput ref={basicRef} label="forwardRef básico" />
        <button onClick={() => basicRef.current?.focus()} style={{ marginTop: 8 }}>
          Enfocar
        </button>
      </div>
      <div>
        <SecureInput ref={secureRef} label="Con useImperativeHandle" />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => secureRef.current?.focus()}>Enfocar</button>
          <button onClick={() => secureRef.current?.clear()}>Limpiar</button>
        </div>
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "En React 19, forwardRef ya no es necesario — ref puede pasarse como prop normal. Si usas React 18 o anterior, sigue siendo requerido.",
      "Exponer el DOM directamente rompe la encapsulación. Prefiere useImperativeHandle para limitar qué puede hacer el padre.",
      "forwardRef solo reenvía la ref al primer nivel — si tu componente interno también es personalizado, necesitas otro forwardRef.",
    ],
  },

  {
    id: "strict-mode",
    label: "StrictMode",
    kicker: "Entrevista · Herramientas",
    title: "¿Por qué mis efectos corren dos veces?",
    lede: "StrictMode activa comportamientos extra solo en desarrollo para detectar bugs sutiles: monta y desmonta componentes dos veces para verificar que los efectos tienen cleanup, y detecta APIs deprecadas.",
    sections: [
      {
        heading: "El doble montaje",
        body: (
          <p>
            En desarrollo, React monta el componente, lo desmonta, y lo vuelve a montar. Esto simula
            lo que ocurre en React 18+ con fast refresh y en casos de remontaje real. Si tu{" "}
            <code>useEffect</code> se rompe al correr dos veces, significa que le falta la función
            de cleanup.
          </p>
        ),
      },
      {
        heading: "Solo en desarrollo",
        body: (
          <p>
            El doble montaje no ocurre en producción. Su único propósito es hacer visibles los
            efectos sin cleanup antes de que lleguen al usuario. La señal correcta no es "¿por qué
            se ejecuta dos veces?" sino "¿mi efecto funciona correctamente si se ejecuta dos
            veces?".
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useEffect, StrictMode } from "react";

function Timer({ label, withCleanup }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);

    if (withCleanup) {
      // Con cleanup: StrictMode desmonta → limpia el intervalo → remonta
      // Solo corre 1 intervalo al final
      return () => clearInterval(id);
    }
    // Sin cleanup: StrictMode crea 2 intervalos → el contador corre al doble de velocidad
  }, []);

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <p style={{ margin: 0, fontSize: 13 }}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: 24, fontVariantNumeric: "tabular-nums" }}>
        {seconds}s
      </p>
    </div>
  );
}

export default function App() {
  return (
    <StrictMode>
      <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--fg-muted)" }}>
          En StrictMode (dev), los efectos montan → desmontan → montan.
          Sin cleanup, los recursos se duplican.
        </p>
        <Timer label="✅ Con cleanup (return () => clearInterval)" withCleanup={true} />
        <Timer label="⚠️ Sin cleanup — doble velocidad por intervalo duplicado" withCleanup={false} />
      </div>
    </StrictMode>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Si el doble montaje rompe tu efecto, no elimines StrictMode — es una señal de que el efecto necesita un return de cleanup.",
      "StrictMode no afecta a los componentes de producción — solo es una herramienta de desarrollo para detectar bugs temprano.",
      "En React 18+, el doble montaje también verifica que los componentes soporten unmount/remount sin perder datos — útil para future Offscreen API.",
    ],
  },

  {
    id: "componentes-puros",
    label: "Componentes puros",
    kicker: "Entrevista · Rendimiento",
    title: "El mismo input, siempre el mismo output",
    lede: "Un componente puro es aquel que dado las mismas props produce exactamente el mismo JSX — sin efectos secundarios en el render. React puede saltarse su re-render si las props no cambiaron, haciendo la UI predecible y optimizable.",
    sections: [
      {
        heading: "React.memo",
        body: (
          <p>
            <code>memo(Componente)</code> envuelve el componente y memoriza el último output. En el
            siguiente render, si las props son iguales por referencia (shallow equality), React
            reutiliza el resultado anterior sin llamar a la función. Útil en hijos costosos que
            reciben props estables.
          </p>
        ),
      },
      {
        heading: "La trampa de las referencias",
        body: (
          <p>
            <code>memo</code> compara props con <code>Object.is</code>. Si el padre pasa un objeto
            literal o función inline, crea una nueva referencia en cada render — <code>memo</code>{" "}
            siempre ve props "distintas" y nunca se salta el render. Por eso se combina con{" "}
            <code>useMemo</code> y <code>useCallback</code>.
          </p>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, memo, useCallback } from "react";

let renderCount = 0;

const ExpensiveChild = memo(function ExpensiveChild({ onClick, label }) {
  renderCount++;
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <p style={{ margin: 0 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--fg-muted)" }}>
        Renders: {renderCount}
      </p>
      <button onClick={onClick} style={{ marginTop: 8 }}>Acción</button>
    </div>
  );
});

export default function App() {
  const [count, setCount] = useState(0);
  const [stable, setStable] = useState(true);

  // Con useCallback: referencia estable → memo funciona
  const stableClick = useCallback(() => alert("click"), []);
  // Sin useCallback: nueva función cada render → memo falla
  const unstableClick = () => alert("click");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p>Contador padre: <strong>{count}</strong></p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setCount((c) => c + 1)}>Re-render padre</button>
        <button onClick={() => setStable((v) => !v)}>
          {stable ? "Pasar función inestable" : "Pasar useCallback"}
        </button>
      </div>
      <ExpensiveChild
        onClick={stable ? stableClick : unstableClick}
        label={stable ? "Con useCallback (memo funciona)" : "Sin useCallback (memo falla)"}
      />
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "memo no es gratis — tiene un costo de comparación. Solo úsalo cuando el render del hijo sea mediblemente costoso.",
      "memo solo hace shallow comparison. Si pasas objetos anidados con la misma estructura pero distinta referencia, siempre re-renderiza.",
      "Un componente puede ser puro conceptualmente aunque use hooks — lo que importa es que el render sea determinístico dadas las mismas props y estado.",
    ],
  },
]
