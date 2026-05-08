import type { Exercise } from "./types"

export const formValidation: Exercise = {
  id: "form-validation",
  label: "form validation",
  title: "Validación de formulario",
  lede: "Un formulario con validación en tiempo real. Muestra errores cuando el campo está vacío al hacer submit, o cuando el email no es válido.",
  difficulty: "basic",
  objectives: [
    "Dos campos: name y email",
    "Estado errors: { name: '', email: '' }",
    "Al hacer submit: validar name (no vacío) y email (contiene @)",
    "Si hay errores, mostrarlos debajo de cada campo en rojo",
    "Si no hay errores, mostrar 'Éxito!' en verde",
  ],
  hint: "Usa el evento onSubmit del form,preventDefault(), y valida antes de hacer anything",
  relatedConcepts: ["useState"],
  starter: {
    "/App.js": `import { useState } from "react";

export default function App() {
  // TODO: declara estado form con { name: "", email: "" }
  // TODO: declara estado errors con { name: "", email: "" }
  // TODO: declara estado success en false

  const handleChange = (e) => {
    // TODO: actualiza el campo correspondiente en form
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: valida nombre (no vacío) y email (contiene @)
    // TODO: si hay errores, actualiza errors; si no, marca success
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ marginBottom: 16 }}>
        <input
          name="name"
          onChange={handleChange}
          placeholder="nombre"
          style={{ padding: 8, fontSize: 16, width: "100%" }}
        />
        {/* TODO: muestra el error de nombre */}
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          name="email"
          onChange={handleChange}
          placeholder="email"
          style={{ padding: 8, fontSize: 16, width: "100%" }}
        />
        {/* TODO: muestra el error de email */}
      </div>
      <button type="submit" style={{ padding: "8px 16px", fontSize: 16 }}>
        Enviar
      </button>
      {/* TODO: muestra mensaje de éxito */}
    </form>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = { name: "", email: "" };

    if (!form.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    if (!form.email.includes("@")) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email) {
      setSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ marginBottom: 16 }}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="nombre"
          style={{ padding: 8, fontSize: 16, width: "100%" }}
        />
        {errors.name && (
          <span style={{ color: "red", fontSize: 14 }}>{errors.name}</span>
        )}
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="email"
          style={{ padding: 8, fontSize: 16, width: "100%" }}
        />
        {errors.email && (
          <span style={{ color: "red", fontSize: 14 }}>{errors.email}</span>
        )}
      </div>
      <button type="submit" style={{ padding: "8px 16px", fontSize: 16 }}>
        Enviar
      </button>
      {success && (
        <p style={{ color: "green", marginTop: 16 }}>Éxito!</p>
      )}
    </form>
  );
}
`,
  },
}
