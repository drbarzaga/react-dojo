import type { Exercise } from "./types"

export const richTextEditor: Exercise = {
  id: "rich-text-editor",
  label: "rich text editor",
  title: "Editor de texto enriquecido",
  lede: "Construye un editor donde las palabras que empiezan con '@' se colorean de azul, las que empiezan con '#' de verde, los emails de naranja y las URLs de púrpura. Además, muestra un contador que se incrementa cada vez que se detecta un email o URL nuevo (no repetido).",
  difficulty: "advanced",
  objectives: [
    "Parsea el texto en 'tokens' usando regex: @mención, #hashtag, email, url y texto normal",
    "Renderiza cada token con su color correspondiente dentro de un div con 'contentEditable' simulado o un div superpuesto",
    "Mantén en un Set los emails y URLs únicos ya detectados",
    "Muestra un contador que solo incrementa al detectar un email/URL nunca visto antes",
    "El input debe ser un 'textarea' funcional; el resaltado se superpone visualmente",
    "El div de resaltado debe sincronizarse con el scroll del textarea",
  ],
  hint: "El truco es superponer un div sobre el textarea con pointer-events:none. El textarea es transparente (color: transparent) y el div de abajo renderiza el HTML coloreado. Ambos comparten el mismo font, tamaño y padding para que los textos se alineen perfectamente.",
  relatedConcepts: ["useState", "useRef", "useEffect"],
  starter: {
    "/App.js": `import { useState, useRef, useEffect } from "react";

const COLORS = {
  mention: "#3b82f6",   // azul  → @usuario
  hashtag: "#22c55e",   // verde → #tema
  email:   "#f97316",   // naranja → correo@ejemplo.com
  url:     "#a855f7",   // púrpura → https://...
};

// TODO 1: implementa tokenize(text)
// Debe devolver un array de { type, value } donde type es:
// "mention" | "hashtag" | "email" | "url" | "text"
function tokenize(text) {
  return [{ type: "text", value: text }];
}

// TODO 2: implementa buildHighlightHtml(tokens)
// Devuelve un string HTML donde cada token coloreado es un <span style="color:...">
// El texto normal NO tiene span (o usa color heredado)
// IMPORTANTE: escapa los caracteres especiales HTML en el valor del token
function buildHighlightHtml(tokens) {
  return tokens.map((t) => t.value).join("");
}

export default function App() {
  const [text, setText] = useState("");
  // TODO 3: agrega estado para el contador de links únicos
  // Tip: usa useRef para el Set de vistos y useState para el número a mostrar

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  // TODO 4: sincroniza el scroll del div de resaltado con el textarea
  useEffect(() => {
    // cuando el textarea hace scroll, mueve también highlightRef
  }, []);

  const tokens = tokenize(text);
  const highlightHtml = buildHighlightHtml(tokens);

  // TODO 5: cada vez que cambie el texto, detecta emails/URLs nuevos
  // y actualiza el contador solo si hay tokens que no habías visto antes

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 600 }}>
      <h2 style={{ marginBottom: 4 }}>Editor de texto enriquecido</h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Escribe texto con @menciones, #hashtags, emails o URLs.
      </p>

      {/* Contador — TODO: conectar al estado real */}
      <div style={{ marginBottom: 12, fontFamily: "monospace", fontSize: 13 }}>
        🔗 Links únicos detectados: <strong>0</strong>
      </div>

      {/* Contenedor del editor */}
      <div style={{ position: "relative", width: "100%" }}>
        {/* Capa de resaltado (debajo, pointer-events:none) */}
        <div
          ref={highlightRef}
          dangerouslySetInnerHTML={{ __html: highlightHtml }}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%",
            height: "100%",
            padding: "8px 12px",
            fontFamily: "system-ui",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowY: "auto",
            boxSizing: "border-box",
            pointerEvents: "none",
            color: "#1f2937",
          }}
        />
        {/* Textarea transparente (encima) */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Escribe algo... prueba con @usuario, #tema, correo@test.com o https://ejemplo.com"
          style={{
            position: "relative",
            width: "100%",
            padding: "8px 12px",
            fontFamily: "system-ui",
            fontSize: 14,
            lineHeight: 1.6,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            resize: "vertical",
            boxSizing: "border-box",
            background: "transparent",
            color: "transparent",
            caretColor: "#1f2937",
            outline: "none",
          }}
        />
      </div>

      {/* Leyenda */}
      <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
        {Object.entries(COLORS).map(([type, color]) => (
          <span key={type} style={{ color, fontFamily: "monospace" }}>
            ■ {type}
          </span>
        ))}
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState, useRef, useEffect, useCallback } from "react";

const COLORS = {
  mention: "#3b82f6",
  hashtag: "#22c55e",
  email:   "#f97316",
  url:     "#a855f7",
};

const TOKEN_PATTERNS = [
  { type: "email",   regex: /[\\w.+-]+@[\\w-]+\\.[\\w.]+/ },
  { type: "url",     regex: /https?:\\/\\/[^\\s]+/ },
  { type: "mention", regex: /@[\\w]+/ },
  { type: "hashtag", regex: /#[\\w]+/ },
];

function tokenize(text) {
  const tokens = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestMatch = null;
    let matchedType = null;

    for (const { type, regex } of TOKEN_PATTERNS) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (earliestMatch === null || match.index < earliestMatch.index) {
          earliestMatch = match;
          matchedType = type;
        }
      }
    }

    if (!earliestMatch) {
      tokens.push({ type: "text", value: remaining });
      break;
    }

    if (earliestMatch.index > 0) {
      tokens.push({ type: "text", value: remaining.slice(0, earliestMatch.index) });
    }

    tokens.push({ type: matchedType, value: earliestMatch[0] });
    remaining = remaining.slice(earliestMatch.index + earliestMatch[0].length);
  }

  return tokens;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHighlightHtml(tokens) {
  return tokens
    .map((token) => {
      const escaped = escapeHtml(token.value);
      if (token.type === "text") return escaped;
      return \`<span style="color:\${COLORS[token.type]};font-weight:500">\${escaped}</span>\`;
    })
    .join("");
}

export default function App() {
  const [text, setText] = useState("");
  const [linkCount, setLinkCount] = useState(0);
  const seenLinksRef = useRef(new Set());

  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    if (!textarea || !highlight) return;

    function syncScroll() {
      highlight.scrollTop = textarea.scrollTop;
    }

    textarea.addEventListener("scroll", syncScroll);
    return () => textarea.removeEventListener("scroll", syncScroll);
  }, []);

  const handleChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);

    const tokens = tokenize(newText);
    let addedNew = false;

    for (const token of tokens) {
      if (token.type === "email" || token.type === "url") {
        if (!seenLinksRef.current.has(token.value)) {
          seenLinksRef.current.add(token.value);
          addedNew = true;
        }
      }
    }

    if (addedNew) {
      setLinkCount(seenLinksRef.current.size);
    }
  }, []);

  const tokens = tokenize(text);
  const highlightHtml = buildHighlightHtml(tokens);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 600 }}>
      <h2 style={{ marginBottom: 4 }}>Editor de texto enriquecido</h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Escribe texto con @menciones, #hashtags, emails o URLs.
      </p>

      <div style={{ marginBottom: 12, fontFamily: "monospace", fontSize: 13 }}>
        🔗 Links únicos detectados:{" "}
        <strong
          style={{
            background: linkCount > 0 ? "#f97316" : "transparent",
            color: linkCount > 0 ? "#fff" : "inherit",
            padding: linkCount > 0 ? "1px 6px" : 0,
            borderRadius: 4,
            transition: "all 200ms",
          }}
        >
          {linkCount}
        </strong>
      </div>

      <div style={{ position: "relative", width: "100%" }}>
        <div
          ref={highlightRef}
          dangerouslySetInnerHTML={{ __html: highlightHtml }}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%",
            height: "100%",
            padding: "8px 12px",
            fontFamily: "system-ui",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowY: "auto",
            boxSizing: "border-box",
            pointerEvents: "none",
            color: "#1f2937",
          }}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          rows={8}
          placeholder="Escribe algo... prueba con @usuario, #tema, correo@test.com o https://ejemplo.com"
          style={{
            position: "relative",
            width: "100%",
            padding: "8px 12px",
            fontFamily: "system-ui",
            fontSize: 14,
            lineHeight: 1.6,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            resize: "vertical",
            boxSizing: "border-box",
            background: "transparent",
            color: "transparent",
            caretColor: "#1f2937",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
        {Object.entries(COLORS).map(([type, color]) => (
          <span key={type} style={{ color, fontFamily: "monospace" }}>
            ■ {type}
          </span>
        ))}
      </div>
    </div>
  );
}
`,
  },
}
