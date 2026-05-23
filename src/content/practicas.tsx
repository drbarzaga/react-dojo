import { Playground } from "@/components/playground"
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
          "/App.js": `import { useState, useEffect } from "react";

const productos = [
  { id: 1, nombre: "Monitor", categoria: "tech", precio: 300 },
  { id: 2, nombre: "Teclado", categoria: "tech", precio: 80 },
  { id: 3, nombre: "Silla", categoria: "muebles", precio: 250 },
  { id: 4, nombre: "Lámpara", categoria: "muebles", precio: 45 },
  { id: 5, nombre: "Auriculares", categoria: "tech", precio: 120 },
];

// ❌ MAL: useEffect para filtrar (causa render extra)
function FiltroMal() {
  const [categoria, setCategoria] = useState("todos");
  const [filtrados, setFiltrados] = useState(productos);

  useEffect(() => {
    // Esto corre DESPUÉS del render — hay un render con datos viejos
    setFiltrados(
      categoria === "todos"
        ? productos
        : productos.filter((p) => p.categoria === categoria)
    );
  }, [categoria]);

  return (
    <div style={{ marginBottom: 32 }}>
      <strong>❌ useEffect para filtrar</strong>
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
        style={{ display: "block", margin: "8px 0" }}>
        <option value="todos">Todos</option>
        <option value="tech">Tech</option>
        <option value="muebles">Muebles</option>
      </select>
      <ul>{filtrados.map((p) => <li key={p.id}>{p.nombre} — \${p.precio}</li>)}</ul>
    </div>
  );
}

// ✅ BIEN: filtrar durante el render
function FiltroBien() {
  const [categoria, setCategoria] = useState("todos");

  // Calculado en el render, siempre fresco, sin efecto
  const filtrados =
    categoria === "todos"
      ? productos
      : productos.filter((p) => p.categoria === categoria);

  return (
    <div>
      <strong>✅ Filtrado en render</strong>
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
        style={{ display: "block", margin: "8px 0" }}>
        <option value="todos">Todos</option>
        <option value="tech">Tech</option>
        <option value="muebles">Muebles</option>
      </select>
      <ul>{filtrados.map((p) => <li key={p.id}>{p.nombre} — \${p.precio}</li>)}</ul>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <FiltroMal />
      <FiltroBien />
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
]
