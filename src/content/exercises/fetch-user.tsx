import type { Exercise } from "./types"

export const fetchUser: Exercise = {
  id: "fetch-user",
  label: "fetch user",
  title: "Fetch con cancelación",
  lede: "Carga datos de un usuario al cambiar de id. El truco: si el usuario hace click rápido entre varios ids, la respuesta vieja puede llegar después de la nueva y sobrescribir la UI. Cancela con AbortController.",
  difficulty: "intermediate",
  objectives: [
    "'useEffect' que dispara un fetch cada vez que cambia 'userId'",
    "Crea un 'AbortController' y pásalo al fetch como '{ signal }'",
    "En el cleanup del efecto, llama 'ctrl.abort()'",
    "Ignora el error 'AbortError' — es esperado al cancelar",
    "Muestra 'cargando...', error, o los datos según el estado",
    "Los botones cambian 'userId' instantáneamente, sin esperar al fetch",
  ],
  hint: "La función que devuelve useEffect se ejecuta ANTES del próximo setup, así que abortar ahí cancela la carrera. El fetch rechaza con AbortError — filtra ese caso en el catch.",
  relatedConcepts: ["useEffect", "useState"],
  starter: {
    "/App.js": `import { useEffect, useState } from "react";

export default function App() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: crea un AbortController
    setLoading(true);
    setError(null);

    fetch("https://jsonplaceholder.typicode.com/users/" + userId /* TODO: signal */)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        // TODO: ignora AbortError
        setError(err.message);
        setLoading(false);
      });

    // TODO: cleanup → abort
  }, [userId]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((id) => (
          <button
            key={id}
            onClick={() => setUserId(id)}
            style={{ fontWeight: id === userId ? 700 : 400 }}
          >
            user {id}
          </button>
        ))}
      </div>
      {loading && <p style={{ color: "var(--fg-muted)" }}>cargando...</p>}
      {error && <p style={{ color: "var(--error, #c98b82)" }}>error: {error}</p>}
      {!loading && user && (
        <div>
          <strong>{user.name}</strong>
          <p style={{ color: "var(--fg-muted)", margin: "4px 0" }}>
            {user.email} · {user.company?.name}
          </p>
        </div>
      )}
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useEffect, useState } from "react";

export default function App() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    fetch("https://jsonplaceholder.typicode.com/users/" + userId, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [userId]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((id) => (
          <button
            key={id}
            onClick={() => setUserId(id)}
            style={{ fontWeight: id === userId ? 700 : 400 }}
          >
            user {id}
          </button>
        ))}
      </div>
      {loading && <p style={{ color: "var(--fg-muted)" }}>cargando...</p>}
      {error && <p style={{ color: "var(--error, #c98b82)" }}>error: {error}</p>}
      {!loading && user && (
        <div>
          <strong>{user.name}</strong>
          <p style={{ color: "var(--fg-muted)", margin: "4px 0" }}>
            {user.email} · {user.company?.name}
          </p>
        </div>
      )}
    </div>
  );
}
`,
  },
}
