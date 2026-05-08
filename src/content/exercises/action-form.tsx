import type { Exercise } from "./types"

const r19 = { react: "^19.0.0", "react-dom": "^19.0.0" }

export const actionForm: Exercise = {
  id: "action-form",
  label: "action form",
  title: "Formulario con useActionState",
  lede: "Un formulario de registro que hoy usa useState + onSubmit. Migra la lógica a useActionState para centralizar estado, validaciones y pending en un solo lugar — sin useState extra.",
  difficulty: "intermediate",
  objectives: [
    "Crea una función 'action' async que recibe '(prevState, formData)'",
    "Valida 'username' (mín 3 chars) y 'email' (contiene '@') y retorna '{ error }'",
    "Si es válido, retorna '{ ok: true, username }'",
    "Conecta la action a 'useActionState' y usa 'formAction' como atributo 'action' del form",
    "Deshabilita los inputs y el botón mientras 'isPending' es 'true'",
  ],
  hint: "La función action siempre recibe el estado anterior como primer argumento. Retorna el nuevo estado — ya sea { error } o { ok, username }. useActionState se encarga del pending automáticamente.",
  relatedConcepts: ["useActionState", "useFormStatus"],
  dependencies: r19,
  starter: {
    "/App.js": `import { useState } from "react";

// TODO: reemplaza con useActionState
// async function registerAction(prevState, formData) { ... }

export default function App() {
  // TODO: const [state, formAction, isPending] = useActionState(registerAction, null)

  // código original con useState (a reemplazar)
  const [state, setState] = useState(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username")?.toString().trim();
    const email = formData.get("email")?.toString().trim();

    setIsPending(true);
    await new Promise(r => setTimeout(r, 900));

    if (!username || username.length < 3) {
      setState({ error: "Username: mínimo 3 caracteres." });
    } else if (!email || !email.includes("@")) {
      setState({ error: "Email inválido." });
    } else {
      setState({ ok: true, username });
    }
    setIsPending(false);
  }

  if (state?.ok) {
    return (
      <div style={{ padding: 24 }}>
        <p>✅ Bienvenido, <strong>@{state.username}</strong>!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 300 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Crear cuenta</h3>
      {/* TODO: cambia onSubmit por action={formAction} */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input name="username" placeholder="Usuario" disabled={isPending} />
        <input name="email" placeholder="Email" disabled={isPending} />
        {state?.error && (
          <p style={{ color: "#c87474", fontSize: 12, margin: 0 }}>{state.error}</p>
        )}
        <button type="submit" disabled={isPending}>
          {isPending ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useActionState } from "react";

async function registerAction(prevState, formData) {
  await new Promise(r => setTimeout(r, 900));
  const username = formData.get("username")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  if (!username || username.length < 3) return { error: "Username: mínimo 3 caracteres." };
  if (!email || !email.includes("@")) return { error: "Email inválido." };
  return { ok: true, username };
}

export default function App() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  if (state?.ok) {
    return (
      <div style={{ padding: 24 }}>
        <p>✅ Bienvenido, <strong>@{state.username}</strong>!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 300 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Crear cuenta</h3>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input name="username" placeholder="Usuario" disabled={isPending} />
        <input name="email" placeholder="Email" disabled={isPending} />
        {state?.error && (
          <p style={{ color: "#c87474", fontSize: 12, margin: 0 }}>{state.error}</p>
        )}
        <button type="submit" disabled={isPending}>
          {isPending ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}
`,
  },
}
