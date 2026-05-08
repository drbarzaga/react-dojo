import type { Exercise } from "./types"

export const todoList: Exercise = {
  id: "todo-list",
  label: "todo list",
  title: "Lista con useReducer",
  lede: "Lista de tareas con tres acciones: agregar, alternar done, y eliminar. Implementa el reducer manteniendo las reglas de pureza: nada de mutación, cada transición devuelve un estado nuevo.",
  difficulty: "intermediate",
  objectives: [
    "Define un 'reducer' con acciones: 'add', 'toggle', 'remove'",
    "Estado inicial: '{ items: [], next: 1 }' — 'next' sirve como ID incremental",
    "Submit del form hace 'dispatch' de 'add'",
    "Click en el texto hace 'dispatch' de 'toggle' (línea cruzada cuando done)",
    "Botón × hace 'dispatch' de 'remove'",
    "El reducer NO debe mutar el estado ('spread', 'filter', 'map')",
  ],
  hint: "Trata cada case del switch como una función pura: recibe state y action, devuelve un objeto nuevo sin tocar el anterior.",
  relatedConcepts: ["useReducer"],
  starter: {
    "/App.js": `import { useReducer } from "react";

const initial = { items: [], next: 1 };

function reducer(state, action) {
  switch (action.type) {
    case "add":
      // TODO: añade un item { id, text, done: false }
      return state;
    case "toggle":
      // TODO: alterna done del item con action.id
      return state;
    case "remove":
      // TODO: elimina el item con action.id
      return state;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = e.currentTarget.text.value.trim();
          if (text) dispatch({ type: "add", text });
          e.currentTarget.reset();
        }}
      >
        <input name="text" placeholder="agregar tarea..." autoFocus style={{ width: "100%" }} />
      </form>
      <ul style={{ paddingLeft: 18, marginTop: 12 }}>
        {state.items.map((it) => (
          <li key={it.id} style={{ textDecoration: it.done ? "line-through" : "none", marginBottom: 4 }}>
            <span onClick={() => dispatch({ type: "toggle", id: it.id })} style={{ cursor: "pointer" }}>
              {it.text}
            </span>
            <button onClick={() => dispatch({ type: "remove", id: it.id })} style={{ marginLeft: 8 }}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useReducer } from "react";

const initial = { items: [], next: 1 };

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return {
        next: state.next + 1,
        items: [...state.items, { id: state.next, text: action.text, done: false }],
      };
    case "toggle":
      return {
        ...state,
        items: state.items.map((it) =>
          it.id === action.id ? { ...it, done: !it.done } : it
        ),
      };
    case "remove":
      return {
        ...state,
        items: state.items.filter((it) => it.id !== action.id),
      };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = e.currentTarget.text.value.trim();
          if (text) dispatch({ type: "add", text });
          e.currentTarget.reset();
        }}
      >
        <input name="text" placeholder="agregar tarea..." autoFocus style={{ width: "100%" }} />
      </form>
      <ul style={{ paddingLeft: 18, marginTop: 12 }}>
        {state.items.map((it) => (
          <li key={it.id} style={{ textDecoration: it.done ? "line-through" : "none", marginBottom: 4 }}>
            <span onClick={() => dispatch({ type: "toggle", id: it.id })} style={{ cursor: "pointer" }}>
              {it.text}
            </span>
            <button onClick={() => dispatch({ type: "remove", id: it.id })} style={{ marginLeft: 8 }}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
  },
}
