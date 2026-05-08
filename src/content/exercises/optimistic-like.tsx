import type { Exercise } from "./types"

const r19 = { react: "^19.0.0", "react-dom": "^19.0.0" }

export const optimisticLike: Exercise = {
  id: "optimistic-like",
  label: "optimistic like",
  title: "Like optimista",
  lede: "Un post con contador de likes. Al hacer click, el like tarda 800ms en guardarse y la UI no responde hasta que termina. Implementa useOptimistic para que el contador suba al instante y revierta si falla.",
  difficulty: "basic",
  objectives: [
    "Crea el estado optimista con 'useOptimistic' a partir de 'likes'",
    "Al hacer click, llama 'addOptimistic(1)' antes de la petición async",
    "Actualiza el estado real con 'setLikes' cuando la petición tiene éxito",
    "Muestra un indicador visual cuando el like está pendiente",
  ],
  hint: "useOptimistic(state, updateFn) — el updateFn recibe el estado actual y el valor que pasaste a addOptimistic. Retorna el nuevo estado provisional.",
  relatedConcepts: ["useOptimistic", "useTransition"],
  dependencies: r19,
  starter: {
    "/App.js": `import { useState, useOptimistic, useTransition } from "react";

async function saveLike(liked) {
  await new Promise(r => setTimeout(r, 800));
  if (Math.random() < 0.15) throw new Error("Error de red");
  return liked;
}

export default function App() {
  const [likes, setLikes] = useState(42);
  const [liked, setLiked] = useState(false);
  const [, startTransition] = useTransition();

  // TODO: crea optimisticLikes y addOptimistic con useOptimistic
  // updateFn: (currentLikes, delta) => currentLikes + delta

  async function handleLike() {
    const next = !liked;
    const delta = next ? 1 : -1;
    // TODO: llama addOptimistic(delta) aquí para respuesta inmediata

    startTransition(async () => {
      try {
        await saveLike(next);
        setLikes(l => l + delta);
        setLiked(next);
      } catch {
        // si falla, useOptimistic revierte automáticamente
      }
    });
  }

  return (
    <div style={{ padding: 24, maxWidth: 320 }}>
      <div style={{
        padding: 16,
        border: "1px solid var(--line)",
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <p style={{ margin: "0 0 12px", fontSize: 14 }}>
          ¿Te gustó este artículo sobre React 19?
        </p>
        <button
          onClick={handleLike}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            color: liked ? "#e0607e" : "var(--fg-muted)",
            borderColor: liked ? "#e0607e" : "var(--line-strong)",
          }}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          {/* TODO: usa optimisticLikes en lugar de likes */}
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useOptimistic, useTransition } from "react";

async function saveLike(liked) {
  await new Promise(r => setTimeout(r, 800));
  if (Math.random() < 0.15) throw new Error("Error de red");
  return liked;
}

export default function App() {
  const [likes, setLikes] = useState(42);
  const [liked, setLiked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticLikes, addOptimistic] = useOptimistic(
    likes,
    (current, delta) => current + delta
  );

  function handleLike() {
    const next = !liked;
    const delta = next ? 1 : -1;
    addOptimistic(delta); // actualización inmediata

    startTransition(async () => {
      try {
        await saveLike(next);
        setLikes(l => l + delta);
        setLiked(next);
      } catch {
        // useOptimistic revierte automáticamente
      }
    });
  }

  return (
    <div style={{ padding: 24, maxWidth: 320 }}>
      <div style={{
        padding: 16,
        border: "1px solid var(--line)",
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <p style={{ margin: "0 0 12px", fontSize: 14 }}>
          ¿Te gustó este artículo sobre React 19?
        </p>
        <button
          onClick={handleLike}
          disabled={isPending}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            color: liked ? "#e0607e" : "var(--fg-muted)",
            borderColor: liked ? "#e0607e" : "var(--line-strong)",
            opacity: isPending ? 0.7 : 1,
            transition: "opacity 150ms",
          }}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span>{optimisticLikes}</span>
        </button>
      </div>
    </div>
  );
}
`,
  },
}
