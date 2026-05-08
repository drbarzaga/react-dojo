import type { Exercise } from "./types"

export const colorPicker: Exercise = {
  id: "color-picker",
  label: "color picker",
  title: "Selector de color",
  lede: "Un selector de color con palette predefinida y opción de color personalizado. Muestra el color seleccionado y su valor hex.",
  difficulty: "basic",
  objectives: [
    "Palette de colores predefinidos en un array",
    "Estado selectedColor",
    "Click en color para seleccionarlo",
    "Input type='color' para color personalizado",
    "Mostrar color seleccionado con preview y valor hex",
  ],
  hint: "Usa input type='color' para el picker personalizado.",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

const colors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#71717a", "#000000",
];

const colorBtnStyle = (selected) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  border: selected ? "2px solid #fff" : "2px solid transparent",
  cursor: "pointer",
  boxShadow: selected ? "0 0 0 2px #3b82f6" : "none",
});

const swatchStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  border: "1px solid #3f3f46",
};

export default function App() {
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const handleColorClick = (color) => {
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", background: "var(--bg)", minHeight: "100vh" }}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Color Picker</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            style={{ ...colorBtnStyle(selectedColor === color), background: color }}
            title={color}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ ...swatchStyle, background: selectedColor }} />
        <input
          type="color"
          value={selectedColor}
          onChange={() => {}}
          style={{ ...swatchStyle, padding: 0, cursor: "pointer" }}
        />
        <span style={{ color: "#fff", fontFamily: "monospace", fontSize: 14 }}>
        </span>
      </div>
    </div>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

const colors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#71717a", "#000000",
];

const colorBtnStyle = (selected) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  border: selected ? "2px solid #fff" : "2px solid transparent",
  cursor: "pointer",
  boxShadow: selected ? "0 0 0 2px #3b82f6" : "none",
});

const swatchStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  border: "1px solid #3f3f46",
};

export default function App() {
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const handleColorClick = (color) => setSelectedColor(color);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", background: "var(--bg)", minHeight: "100vh" }}>
      <p style={{ marginBottom: 24, color: "#71717a" }}>Color Picker</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            style={{ ...colorBtnStyle(selectedColor === color), background: color }}
            title={color}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ ...swatchStyle, background: selectedColor }} />
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          style={{ ...swatchStyle, padding: 0, cursor: "pointer" }}
        />
        <span style={{ color: "#fff", fontFamily: "monospace", fontSize: 14 }}>{selectedColor.toUpperCase()}</span>
      </div>
    </div>
  );
}
`,
  },
}
