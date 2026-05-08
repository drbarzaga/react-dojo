import type { Exercise } from "./types"

export const formReducer: Exercise = {
  id: "form-reducer",
  label: "form reducer",
  title: "Formulario con validación",
  lede: "Un formulario de registro con tres campos (email, password, confirmación). Modela los cambios y la validación con useReducer: cada acción nombrada, reducer puro, errores derivados en cada transición.",
  difficulty: "intermediate",
  objectives: [
    "Reducer con acciones 'change', 'blur', 'submit'",
    "Estado: '{ values, touched, submitted }' — errors se derivan en render, no se guardan",
    "Valida email (formato), password (≥ 6 chars), confirm (igual a password)",
    "Solo muestra errores de un campo cuando está 'touched' o tras submit",
    "Submit deshabilitado si hay errores — pero calculado en render, no guardado",
    "Al submit exitoso, muestra un estado 'enviado'",
  ],
  hint: "No guardes 'isValid' en estado — derívalo de errors. Los errores se recalculan en el reducer con una función pura validate(values).",
  relatedConcepts: ["useReducer", "useState"],
  starter: {
    "/App.js": `import { useReducer } from "react";

const initial = {
  values: { email: "", password: "", confirm: "" },
  touched: { email: false, password: false, confirm: false },
  submitted: false,
};

function validate(values) {
  const errors = {};
  if (!/^\\S+@\\S+\\.\\S+$/.test(values.email)) errors.email = "email inválido";
  if (values.password.length < 6) errors.password = "mínimo 6 caracteres";
  if (values.confirm !== values.password) errors.confirm = "no coincide";
  return errors;
}

function reducer(state, action) {
  switch (action.type) {
    case "change":
      // TODO: actualiza values[action.field]
      return state;
    case "blur":
      // TODO: marca touched[action.field] = true
      return state;
    case "submit":
      // TODO: marca submitted = true
      return state;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);
  const errors = validate(state.values);
  const hasErrors = Object.keys(errors).length > 0;

  function field(name, type = "text") {
    const showError = (state.touched[name] || state.submitted) && errors[name];
    return (
      <div style={{ marginBottom: 12 }}>
        <input
          type={type}
          placeholder={name}
          value={state.values[name]}
          onChange={(e) => dispatch({ type: "change", field: name, value: e.target.value })}
          onBlur={() => dispatch({ type: "blur", field: name })}
          style={{ width: "100%" }}
        />
        {showError && (
          <small style={{ color: "var(--error, #c98b82)" }}>{errors[name]}</small>
        )}
      </div>
    );
  }

  if (state.submitted && !hasErrors) {
    return <p style={{ padding: 24, fontFamily: "system-ui" }}>enviado ✓</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "submit" });
      }}
      style={{ padding: 24, fontFamily: "system-ui", maxWidth: 360 }}
    >
      {field("email", "email")}
      {field("password", "password")}
      {field("confirm", "password")}
      <button type="submit" disabled={hasErrors}>crear cuenta</button>
    </form>
  );
}
`,
  },
  solution: {
    "/App.js": `import { useReducer } from "react";

const initial = {
  values: { email: "", password: "", confirm: "" },
  touched: { email: false, password: false, confirm: false },
  submitted: false,
};

function validate(values) {
  const errors = {};
  if (!/^\\S+@\\S+\\.\\S+$/.test(values.email)) errors.email = "email inválido";
  if (values.password.length < 6) errors.password = "mínimo 6 caracteres";
  if (values.confirm !== values.password) errors.confirm = "no coincide";
  return errors;
}

function reducer(state, action) {
  switch (action.type) {
    case "change":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
      };
    case "blur":
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case "submit":
      return { ...state, submitted: true };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);
  const errors = validate(state.values);
  const hasErrors = Object.keys(errors).length > 0;

  function field(name, type = "text") {
    const showError = (state.touched[name] || state.submitted) && errors[name];
    return (
      <div style={{ marginBottom: 12 }}>
        <input
          type={type}
          placeholder={name}
          value={state.values[name]}
          onChange={(e) => dispatch({ type: "change", field: name, value: e.target.value })}
          onBlur={() => dispatch({ type: "blur", field: name })}
          style={{ width: "100%" }}
        />
        {showError && (
          <small style={{ color: "var(--error, #c98b82)" }}>{errors[name]}</small>
        )}
      </div>
    );
  }

  if (state.submitted && !hasErrors) {
    return <p style={{ padding: 24, fontFamily: "system-ui" }}>enviado ✓</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "submit" });
      }}
      style={{ padding: 24, fontFamily: "system-ui", maxWidth: 360 }}
    >
      {field("email", "email")}
      {field("password", "password")}
      {field("confirm", "password")}
      <button type="submit" disabled={hasErrors}>crear cuenta</button>
    </form>
  );
}
`,
  },
}
