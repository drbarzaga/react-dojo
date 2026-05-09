import type { Exercise } from "./types"

export const likeButton: Exercise = {
  id: "like-button",
  label: "like button",
  title: "Botón me gusta",
  lede: "Un botón de 'like' estilo Twitter: el contador empieza en 142 (likes de otros usuarios) y tú sumas o restas 1 al hacer clic.",
  difficulty: "basic",
  objectives: [
    "Declara estado 'likes' inicial en '142'",
    "Declara estado 'isLiked' inicial en 'false'",
    "Al hacer clic: si 'isLiked', 'likes--' y 'isLiked=false'; si no, 'likes++' y 'isLiked=true'",
    "Cambia el color del botón cuando está likeado",
    "Muestra el contador al lado del botón",
  ],
  hint: "Usa un estado numérico para el total de likes (empieza en 142, no en 0) y un boolean para saber si el usuario actual lo likeó",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

const appStyle = {
  padding: 24,
  fontFamily: "system-ui",
  background: "var(--bg)",
  minHeight: "100vh",
};

const rowStyle = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

export default function App() {
  // TODO: declara estado likes con valor inicial 142
  // TODO: declara estado isLiked con valor inicial false

  const handleClick = () => {
    // TODO: si isLiked, resta 1 a likes y pon isLiked en false
    // TODO: si no, suma 1 a likes y pon isLiked en true
  };

  return (
    <div style={appStyle}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Like Button</p>
      <div style={rowStyle}>
        <button
          onClick={handleClick}
          style={{
            backgroundColor: "#e5e7eb", // TODO: rojo (#ef4444) si isLiked, gris (#e5e7eb) si no
            color: "black", // TODO: "white" si isLiked, "black" si no
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 16
          }}
        >
          ♥ Like
        </button>
        <span style={{ fontSize: 18 }}>
          {/* TODO: muestra likes */}
        </span>
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

const appStyle = {
  padding: 24,
  fontFamily: "system-ui",
  background: "var(--bg)",
  minHeight: "100vh",
};

const rowStyle = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

export default function App() {
  const [likes, setLikes] = useState(142);
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = () => {
    if (isLiked) {
      setLikes((l) => l - 1);
      setIsLiked(false);
    } else {
      setLikes((l) => l + 1);
      setIsLiked(true);
    }
  };

  return (
    <div style={appStyle}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Like Button</p>
      <div style={rowStyle}>
        <button
          onClick={handleClick}
          style={{
            backgroundColor: isLiked ? "#ef4444" : "#e5e7eb",
            color: isLiked ? "white" : "black",
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 16
          }}
        >
          ♥ Like
        </button>
        <span style={{ fontSize: 18 }}>{likes}</span>
      </div>
    </div>
  );
}
`,
  },
}
