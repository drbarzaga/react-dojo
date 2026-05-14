import { estado } from "@/content/estado"
import { efectos } from "@/content/efectos"
import { rendimiento } from "@/content/rendimiento"
import { concurrencia } from "@/content/concurrencia"
import { composicion } from "@/content/composicion"
import { entrevistas } from "@/content/entrevistas"
import { Playground } from "@/components/playground"
import type { Concept, Category } from "@/content/types"

export type { Concept, Category, Section } from "@/content/types"

type ConceptOverride = Partial<
  Pick<Concept, "label" | "kicker" | "title" | "lede" | "pitfalls" | "sections" | "playground">
>

const overrides: Record<string, ConceptOverride> = {
  useState: {
    kicker: "Hook · Local state",
    title: "Minimal memory",
    lede: "useState turns a component into something that remembers. Each call reserves a memory cell tied to that instance, and each update schedules a new render cycle.",
    sections: [
      {
        heading: "The signature",
        body: (
          <p>
            <code>const [state, setState] = useState(initial)</code>. The argument can be a value or
            a function — use the function when the initial calculation is expensive, so it only runs
            on the first render.
          </p>
        ),
      },
      {
        heading: "Functional update",
        body: (
          <p>
            When the next state depends on the previous one, pass a function to{" "}
            <code>setState</code>. React gives you the most recent value, avoiding race conditions
            when updating multiple times in the same event.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Calling setState(state + 1) three times in a row only adds 1, not 3 — React reads the value captured by the render.",
      "State does not 'merge' like in classes: if you store an object, you must copy it entirely when updating.",
      "There is no way to change the dependency array of useState — the initial value is only honored on the first render.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

// Expensive initial value → function. Only runs once.
function initial() {
  console.log("computing initial...");
  return 0;
}

export default function App() {
  const [count, setCount] = useState(initial);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p style={{ fontSize: 48, margin: 0, display: "flex", justifyContent: "center" }}>{count}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => setCount((c) => c + 1)}>+1</button>
        <button onClick={() => setCount((c) => c - 1)}>−1</button>
        <button onClick={() => {
          // Three functional updates are applied in chain.
          setCount((c) => c + 1);
          setCount((c) => c + 1);
          setCount((c) => c + 1);
        }}>+3 (functional)</button>
        <button onClick={() => setCount(0)}>reset</button>
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useReducer: {
    kicker: "Hook · Complex state",
    title: "Explicit transitions",
    lede: "When the next state depends on the previous state and what happened, useReducer turns the fuzzy logic of multiple setState calls into a named and testable transition.",
    sections: [
      {
        heading: "The reducer shape",
        body: (
          <p>
            <code>(state, action) =&gt; newState</code>. Keep the reducer pure: no fetch, no
            mutation, no <code>Math.random()</code>. If you need effects, fire them after the{" "}
            <code>dispatch</code>.
          </p>
        ),
      },
      {
        heading: "When it beats useState",
        body: (
          <p>
            When there are <em>several ways</em> to modify the same state, when transition logic
            repeats across multiple events, or when you want to log/debug each change in a single
            place.
          </p>
        ),
      },
    ],
    pitfalls: [
      "The reducer MUST be pure: no fetch, no side-effect console.log, no random IDs.",
      "Do not mutate state: state.items.push() breaks React. Always return new objects/arrays.",
      "If you store values that rarely change, useReducer can be overkill — useState is enough.",
    ],
    playground: (
      <Playground
        files={{
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
      return { ...state, items: state.items.filter((it) => it.id !== action.id) };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = e.currentTarget.text.value.trim();
          if (text) dispatch({ type: "add", text });
          e.currentTarget.reset();
        }}
      >
        <input name="text" placeholder="add task..." autoFocus />
      </form>
      <ul style={{ paddingLeft: 18 }}>
        {state.items.map((it) => (
          <li key={it.id} style={{ textDecoration: it.done ? "line-through" : "none", display: "flex", alignItems: "center" }}>
            <button
              onClick={() => dispatch({ type: "toggle", id: it.id })}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                cursor: "pointer",
                textAlign: "left",
                flex: 1,
                color: "inherit",
                textDecoration: "inherit"
              }}
            >
              {it.text}
            </button>
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
        }}
      />
    ),
  },
  useRef: {
    kicker: "Hook · Mutable reference",
    title: "A box that persists",
    lede: "useRef gives you a box with a .current property that survives between renders but, unlike state, does not trigger re-renders when you change its contents.",
    sections: [
      {
        heading: "Two honest uses",
        body: (
          <>
            <p>
              <strong>Access the DOM:</strong> pass it to a node with <code>ref={"{myRef}"}</code>{" "}
              and read <code>myRef.current</code> after mount.
            </p>
            <p>
              <strong>Store values between renders:</strong> counters, timer IDs, previous values —
              anything you need to remember but don't want to trigger re-renders.
            </p>
          </>
        ),
      },
      {
        heading: "Why not state",
        body: (
          <p>
            If rendering the value doesn't change the UI, it shouldn't be in state. Keeping it in a
            ref avoids render cycles and keeps the component faster.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Reading or writing .current during render makes the component impure — do it in effects or event handlers.",
      "Refs are not reactive: changing .current does not cause the component to re-render.",
      "Do not use a ref to store something you want to show in the UI — use state for that.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useRef, useState, useEffect } from "react";

export default function App() {
  const inputRef = useRef(null);
  const renders = useRef(0);
  const [text, setText] = useState("");

  useEffect(() => { renders.current += 1; });

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="type something..."
        style={{ padding: 8, width: "100%" }}
      />
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={() => inputRef.current?.focus()}>focus</button>
        <button onClick={() => { inputRef.current.value = ""; setText(""); }}>clear</button>
      </div>
      <p style={{ marginTop: 16, fontFamily: "monospace", color: "var(--fg-muted)" }}>
        renders: {renders.current} · text: "{text}"
      </p>
      <p style={{ fontSize: 13, color: "var(--fg-muted)" }}>
        Notice: the counter does NOT trigger re-renders. It only changes when rendering for another reason.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useOptimistic: {
    kicker: "Hook · React 19",
    title: "Optimistic UI without blocking",
    lede: "useOptimistic shows a provisional state while an async operation is in progress. The UI responds instantly; if the operation fails without updating real state, React reverts automatically.",
    sections: [
      {
        heading: "The signature",
        body: (
          <p>
            <code>{"const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)"}</code>
            . <em>state</em> is the real one; <em>updateFn</em> describes how to compute the
            provisional state from it and a temporary value.
          </p>
        ),
      },
      {
        heading: "When to use it",
        body: (
          <p>
            Actions that almost always succeed: likes, votes, sent messages, drag and drop. Don't
            use it when failures are frequent or costly to undo visually.
          </p>
        ),
      },
    ],
    pitfalls: [
      "The optimistic value is only temporary: it disappears when the async action settles.",
      "If the action throws without updating the real state, the revert is automatic — but the user will see a flash back to the original state.",
      "useOptimistic requires React 19 or Canary. It does not work in React 18.",
    ],
    playground: (
      <Playground
        dependencies={{ react: "^19.0.0", "react-dom": "^19.0.0" }}
        files={{
          "/App.js": `import { useState, useOptimistic, useTransition } from "react";

async function sendMessage(text) {
  await new Promise(r => setTimeout(r, 900));
  if (Math.random() < 0.2) throw new Error("Network error");
  return { id: Date.now(), text };
}

export default function App() {
  const [messages, setMessages] = useState([{ id: 1, text: "Hello 👋" }]);
  const [optimisticMsgs, addOptimistic] = useOptimistic(
    messages,
    (prev, text) => [...prev, { id: Date.now(), text, pending: true }]
  );
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  function handleSend(e) {
    e.preventDefault();
    const text = e.target.msg.value.trim();
    if (!text) return;
    e.target.reset();
    setError(null);

    startTransition(async () => {
      addOptimistic(text);
      try {
        const saved = await sendMessage(text);
        setMessages(prev => [...prev, saved]);
      } catch {
        setError("Send failed. Try again.");
      }
    });
  }

  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
        {optimisticMsgs.map((m, i) => (
          <li key={m.id ?? i} style={{
            padding: "5px 0",
            color: m.pending ? "var(--fg-muted)" : "var(--fg)",
            fontStyle: m.pending ? "italic" : "normal",
            fontSize: 13,
          }}>
            {m.pending ? "⏳ " : "✓ "}{m.text}
          </li>
        ))}
      </ul>
      {error && <p style={{ color: "#c87474", fontSize: 12, marginBottom: 8 }}>{error}</p>}
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input name="msg" placeholder="Type a message..." style={{ flex: 1 }} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useActionState: {
    kicker: "Hook · React 19",
    title: "State from a form action",
    lede: "useActionState connects an async action to local state. It receives the action function and an initial state; it returns the current state, the action ready for use as a form attribute, and an isPending flag.",
    sections: [
      {
        heading: "The signature",
        body: (
          <p>
            <code>{"const [state, formAction, isPending] = useActionState(fn, initial)"}</code>. The{" "}
            <em>fn</em> receives the previous state and the <code>FormData</code>, and returns the
            new state — sync or async.
          </p>
        ),
      },
      {
        heading: "No extra useState",
        body: (
          <p>
            Unlike the classic <em>onSubmit + useState</em> pattern, useActionState centralizes the
            flow: one place handles logic, state, and pending. Works with and without JS enabled
            (progressive enhancement).
          </p>
        ),
      },
    ],
    pitfalls: [
      "The action receives (prevState, formData) — not just formData. If you forget prevState, the signature is wrong.",
      "useActionState is a react-dom hook. Do not import it from react.",
      "isPending only reflects server actions or async transitions — synchronous actions return false immediately.",
    ],
    playground: (
      <Playground
        dependencies={{ react: "^19.0.0", "react-dom": "^19.0.0" }}
        files={{
          "/App.js": `import { useActionState } from "react";

async function submitContact(prev, formData) {
  await new Promise(r => setTimeout(r, 900));
  const name = formData.get("name")?.trim();
  const email = formData.get("email")?.trim();
  if (!name || !email) return { error: "All fields are required." };
  if (!email.includes("@")) return { error: "Invalid email." };
  return { ok: true, name };
}

export default function App() {
  const [state, formAction, isPending] = useActionState(submitContact, null);

  if (state?.ok) {
    return (
      <div style={{ padding: 24 }}>
        <p>✅ Thanks, <strong>{state.name}</strong>. We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 320 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Contact</h3>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input name="name" placeholder="Name" disabled={isPending} />
        <input name="email" placeholder="Email" disabled={isPending} />
        {state?.error && (
          <p style={{ color: "#c87474", fontSize: 12, margin: 0 }}>{state.error}</p>
        )}
        <button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useEffect: {
    kicker: "Hook · Synchronization",
    title: "Synchronize with the outside world",
    lede: "useEffect is not 'code that runs after render'. It's the way to tell React: while this component is on screen, keep something in the external world in sync with its state.",
    sections: [
      {
        heading: "The setup → cleanup loop",
        body: (
          <p>
            Every time the dependencies change, React runs the cleanup of the previous effect and
            then the setup of the new one. That's why returning a cleanup function matters: it's
            what cancels stale subscriptions, timers, or requests.
          </p>
        ),
      },
      {
        heading: "The dependencies",
        body: (
          <p>
            The <code>[]</code> array declares which <em>reactive values</em> the effect uses.
            Omitting one causes stale closures; adding things you don't use triggers unnecessary
            re-runs. Treat the linter like a strict but correct partner.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Forgetting to return a cleanup function when subscribing to events or intervals causes memory leaks.",
      "Every value used inside the effect that comes from the component should be in the dependency array.",
      "useEffect with [] does not mean 'run once' — it means 'no dependencies'. If the effect depends on something and you omit it, you'll get stale values.",
    ],
    playground: (
      <Playground
        showConsole
        files={{
          "/App.js": `import { useEffect, useState } from "react";

export default function App() {
  const [userId, setUserId] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch("https://jsonplaceholder.typicode.com/users/" + userId, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    // cleanup: cancel the fetch if userId changes before it resolves
    return () => ctrl.abort();
  }, [userId]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4].map((id) => (
          <button
            key={id}
            onClick={() => setUserId(id)}
            style={{ fontWeight: id === userId ? 700 : 400 }}
          >
            user {id}
          </button>
        ))}
      </div>
      <pre style={{ marginTop: 16, fontSize: 13, background: "var(--surface-1)", padding: 12, borderRadius: 4 }}>
        {loading ? "loading..." : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useLayoutEffect: {
    kicker: "Hook · Synchronous synchronization",
    title: "Before the browser paints",
    lede: "useLayoutEffect runs right after the DOM commit but before the browser paints. Use it when you need to measure the DOM and apply a change before the user sees the intermediate result.",
    sections: [
      {
        heading: "The real use case",
        body: (
          <p>
            Tooltips that reposition based on their size, animations that need a calculated initial
            position, scroll adjustments after inserting content. If you use <code>useEffect</code>{" "}
            in these cases, you'll see a flicker.
          </p>
        ),
      },
      {
        heading: "The cost",
        body: (
          <p>
            It blocks the browser from painting. If the work is heavy, it hurts the frame rate. The
            rule: <em>useEffect by default</em>, useLayoutEffect only when you need to measure and
            mutate the DOM in the same turn.
          </p>
        ),
      },
    ],
    pitfalls: [
      "useLayoutEffect blocks the browser from painting — keep it fast. If the logic can wait, use useEffect.",
      "In SSR it fires synchronously on the server: avoid side effects that only make sense in the browser.",
      "Reading layout and synchronously triggering a re-render can cause a double render cycle — profile before using it.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useLayoutEffect, useRef, useState } from "react";

export default function App() {
  const [text, setText] = useState("Hello");
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current) setWidth(ref.current.getBoundingClientRect().width);
  }, [text]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ padding: 8, width: "100%" }}
      />
      <div style={{ marginTop: 16, display: "inline-block" }}>
        <span ref={ref} style={{ fontSize: 32, fontWeight: 600 }}>{text}</span>
        <div
          style={{
            marginTop: 4,
            height: 2,
            background: "var(--accent)",
            width: width + "px",
            transition: "width 200ms",
          }}
        />
      </div>
      <p style={{ marginTop: 12, color: "var(--fg-muted)" }}>
        measured width: <code>{width.toFixed(1)}px</code> — the underline adjusts without flicker.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useEffectEvent: {
    kicker: "Hook · Experimental",
    title: "Non-reactive logic inside effects",
    lede: "useEffectEvent extracts logic that must run inside an effect but should not re-trigger it when it changes. It breaks the tension between 'I need to read this value' and 'I don't want the effect to depend on it'.",
    sections: [
      {
        heading: "The problem",
        body: (
          <p>
            An effect that opens a connection shouldn't re-open it every time the log message
            changes — but if you use the log inside the effect, React requires you to include it in
            the dependencies, causing unnecessary reconnections.
          </p>
        ),
      },
      {
        heading: "The solution",
        body: (
          <p>
            Wrap the non-reactive logic in a <code>useEffectEvent</code>. The resulting function can
            be called from the effect without being one of its dependencies. Still experimental in
            React 19: import as <code>experimental_useEffectEvent</code>.
          </p>
        ),
      },
    ],
    pitfalls: [
      "useEffectEvent is still experimental in React 19 and is not in the stable API.",
      "The event function cannot be used as a dependency — it's not reactive.",
      "Do not use it as an escape hatch to avoid adding real dependencies that should be there.",
    ],
    playground: (
      <Playground
        showConsole
        files={{
          "/App.js": `import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";

// Polyfill of useEffectEvent: same semantics as the experimental API
function useEffectEvent(fn) {
  const ref = useRef(fn);
  useLayoutEffect(() => { ref.current = fn; });
  return useCallback((...args) => ref.current(...args), []);
}

function createConnection(url) {
  return {
    connect() { console.log("✅ connected to " + url); },
    disconnect() { console.log("❌ disconnected from " + url); },
  };
}

function ChatRoom({ roomUrl, theme }) {
  // onConnected reads 'theme' but is not a dependency of the effect
  const onConnected = useEffectEvent(() => {
    console.log("theme at connect time:", theme);
  });

  useEffect(() => {
    const conn = createConnection(roomUrl);
    conn.connect();
    onConnected();
    return () => conn.disconnect();
  }, [roomUrl]); // only roomUrl — changing theme does NOT reconnect

  return (
    <p style={{ fontFamily: "monospace", fontSize: 13 }}>
      room: <strong>{roomUrl}</strong> · theme: {theme}
    </p>
  );
}

export default function App() {
  const [room, setRoom] = useState("general");
  const [theme, setTheme] = useState("dark");
  return (
    <div style={{ padding: 24 }}>
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
        Open the console. Changing theme does not reconnect; changing room does.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {["general", "support", "random"].map(r => (
          <button key={r} onClick={() => setRoom(r)}
            style={{ fontWeight: room === r ? "bold" : "normal" }}>{r}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["dark", "light"].map(t => (
          <button key={t} onClick={() => setTheme(t)}
            style={{ fontWeight: theme === t ? "bold" : "normal" }}>{t}</button>
        ))}
      </div>
      <ChatRoom roomUrl={room} theme={theme} />
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useMemo: {
    kicker: "Hook · Memoization",
    title: "Cache the computation",
    lede: "useMemo stores the result of a computation and reuses it while its dependencies haven't changed. It's a performance tool, not a correctness one — use it when you measure it's worth it.",
    sections: [
      {
        heading: "When it matters",
        body: (
          <p>
            For genuinely expensive calculations (transforming large lists, parsing, sorting) or to
            maintain <em>referential identity</em> of objects/arrays passed to memoized children or
            other hooks' dependencies.
          </p>
        ),
      },
      {
        heading: "When it's noise",
        body: (
          <p>
            For simple functions, primitive values, or calculations that React resolves faster than
            the dependency comparison itself. Memoization has a cost: comparing deps, retaining
            references in memory.
          </p>
        ),
      },
    ],
    pitfalls: [
      "useMemo is not free: it adds memory and comparison overhead. Don't use it for cheap calculations.",
      "If you forget a dependency, you'll get stale cached values — React won't warn you.",
      "useMemo alone doesn't prevent child re-renders — you also need React.memo on the child.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useMemo, useState } from "react";

function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export default function App() {
  const [n, setN] = useState(30);
  const [other, setOther] = useState(0);

  const t0 = performance.now();
  const value = useMemo(() => fibonacci(n), [n]);
  const elapsed = (performance.now() - t0).toFixed(2);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <label>
        n = {n}
        <input
          type="range" min="20" max="38" value={n}
          onChange={(e) => setN(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </label>
      <p style={{ fontFamily: "monospace", marginTop: 12 }}>
        fib({n}) = {value}
        <br />
        last measurement: {elapsed} ms
      </p>
      <button onClick={() => setOther((x) => x + 1)}>
        re-render without touching n ({other})
      </button>
      <p style={{ color: "var(--fg-muted)", fontSize: 13 }}>
        Increment the other counter: the computation does NOT repeat (ms ≈ 0).
        Move the slider: it recalculates.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useCallback: {
    kicker: "Hook · Function memoization",
    title: "A stable function",
    lede: "useCallback is useMemo for functions. It returns the same reference while its dependencies haven't changed — useful when the function travels to a memoized child or is included in another hook's deps.",
    sections: [
      {
        heading: "When it helps",
        body: (
          <p>
            When you pass a callback to a component wrapped in <code>memo()</code>, or when the
            function is a dependency of a <code>useEffect</code> and you don't want the effect to
            restart on every render.
          </p>
        ),
      },
      {
        heading: "Without a consumer, it's ceremony",
        body: (
          <p>
            Wrapping every function in useCallback doesn't speed anything up on its own. It only
            matters when someone downstream benefits from the reference being stable.
          </p>
        ),
      },
    ],
    pitfalls: [
      "useCallback without React.memo on the consumer has no effect on renders.",
      "Omitting a dependency causes the callback to close over a stale value.",
      "Every function 'stabilized' with useCallback adds cognitive overhead. Measure before adding it.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { memo, useCallback, useState } from "react";

const Item = memo(function Item({ label, onClick }) {
  console.log("render Item:", label);
  return <button onClick={onClick} style={{ marginRight: 6 }}>{label}</button>;
});

export default function App() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // Without useCallback, Item would re-render even with memo.
  const handleA = useCallback(() => setCount((c) => c + 1), []);
  const handleB = useCallback(() => setCount((c) => c - 1), []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p>count: {count} · other: {other}</p>
      <Item label="+1" onClick={handleA} />
      <Item label="−1" onClick={handleB} />
      <hr style={{ margin: "16px 0" }} />
      <button onClick={() => setOther((x) => x + 1)}>
        change ONLY 'other' ({other})
      </button>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginTop: 8 }}>
        Open the console: Item does NOT re-render when 'other' changes
        thanks to memo + stable callback.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  memo: {
    kicker: "API · Components",
    title: "Skip the render",
    lede: "memo() wraps a component so React compares its props with the previous ones. If nothing changed by reference, the render is skipped. It's the piece that makes useCallback and useMemo worthwhile.",
    sections: [
      {
        heading: "The comparison",
        body: (
          <p>
            By default, shallow comparison: <code>===</code> on each prop. That's why passing a new
            object literal on every render breaks memoization. Pass primitives, or stabilize
            references with useMemo/useCallback.
          </p>
        ),
      },
      {
        heading: "When you don't want it",
        body: (
          <p>
            If the component is trivial or its props change on almost every render, comparing is
            more expensive than rendering. Save memo for expensive subtrees or long lists.
          </p>
        ),
      },
    ],
    pitfalls: [
      "memo compares by reference: if the parent passes a new object or function on every render, memo won't help.",
      "memo is not a silver bullet: if the props change frequently, the comparison overhead is pure cost.",
      "Don't add memo prematurely. Profile first, then wrap what the Profiler identifies as expensive.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { memo, useMemo, useState } from "react";

const Card = memo(function Card({ user }) {
  console.log("render Card:", user.name);
  return (
    <div style={{ padding: 12, background: "var(--surface-1)", borderRadius: 4, marginTop: 6, border: "1px solid var(--line)"}}>
      <strong>{user.name}</strong> · {user.role}
    </div>
  );
});

export default function App() {
  const [tick, setTick] = useState(0);

  // CASE A: new object on every render → memo never hits
  const userUnstable = { name: "Ada", role: "engineer" };

  // CASE B: useMemo stabilizes the reference → memo works
  const userStable = useMemo(() => ({ name: "Lin", role: "designer" }), []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p>tick: {tick}</p>
      <button onClick={() => setTick((t) => t + 1)}>+1 tick</button>

      <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13, color: "var(--fg-muted)" }}>
        Without stabilizing (re-renders every tick):
      </p>
      <Card user={userUnstable} />

      <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13, color: "var(--fg)" }}>
        With useMemo (does NOT re-render):
      </p>
      <Card user={userStable} />

      <p style={{ color: "var(--fg-muted)", fontSize: 12, marginTop: 12 }}>
        Open the console and click +1 tick. You'll see Ada every time, Lin only once.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useTransition: {
    kicker: "Hook · Concurrency",
    title: "Low-priority updates",
    lede: "useTransition marks an update as 'non-urgent'. React processes it without blocking user input and gives you an isPending flag to show intermediate feedback.",
    sections: [
      {
        heading: "Urgent vs transition",
        body: (
          <p>
            Typing in an input is urgent: the character must appear instantly. Recalculating a
            filtered list of 10,000 items is a transition: it can wait a couple of frames without
            feeling sluggish.
          </p>
        ),
      },
      {
        heading: "The pattern",
        body: (
          <p>
            <code>const [isPending, startTransition] = useTransition()</code>. Wrap <em>only</em>{" "}
            the slow setState inside <code>startTransition(() =&gt; ...)</code>. Everything else
            remains urgent.
          </p>
        ),
      },
    ],
    pitfalls: [
      "startTransition does not defer the UI update indefinitely — React still processes it as soon as it can.",
      "You cannot mark DOM events (like onChange) as transitions — only state updates inside startTransition.",
      "isPending only reflects the transition, not any data loading behind it.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useTransition } from "react";

const items = Array.from({ length: 8000 }, (_, i) => "item " + i);

export default function App() {
  const [query, setQuery] = useState("");
  const [list, setList] = useState(items);
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    const v = e.target.value;
    setQuery(v); // urgent: input responds instantly
    startTransition(() => {
      // non-urgent: filtering 8k items can wait
      setList(items.filter((it) => it.includes(v)));
    });
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <input
        value={query}
        onChange={onChange}
        placeholder="filter..."
        style={{ padding: 8, width: "100%" }}
      />
      <p style={{ color: isPending ? "var(--fg)" : "var(--fg-muted)", fontFamily: "monospace", fontSize: 12 }}>
        {isPending ? "updating..." : list.length + " results"}
      </p>
      <ul style={{ height: 200, overflow: "auto", margin: 0, padding: "0 0 0 16px" }}>
        {list.slice(0, 200).map((it) => <li key={it}>{it}</li>)}
      </ul>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useDeferredValue: {
    kicker: "Hook · Concurrency",
    title: "A lagging version",
    lede: "useDeferredValue takes a value and returns a 'slow' copy that React updates with low priority. Useful when you don't control the setState — only the value arriving as a prop.",
    sections: [
      {
        heading: "When to use it",
        body: (
          <p>
            When you receive a fast-changing value and pass it to an expensive component. The input
            stays smooth because the expensive component re-renders with the deferred value, not the
            current one.
          </p>
        ),
      },
      {
        heading: "Vs useTransition",
        body: (
          <p>
            useTransition controls the <em>setState</em>; useDeferredValue controls a{" "}
            <em>received value</em>. Often interchangeable — choose based on where you have control.
          </p>
        ),
      },
    ],
    pitfalls: [
      "useDeferredValue does not debounce: it defers based on React's scheduler, not time.",
      "The deferred value may briefly show stale UI — show a visual indicator when deferred !== current.",
      "If the component receiving the deferred value is not wrapped in memo, there's no benefit.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useDeferredValue, useState, useMemo } from "react";

function HeavyList({ query }) {
  const items = useMemo(() => {
    const result = [];
    for (let i = 0; i < 6000; i++) {
      const s = "row " + i;
      if (s.includes(query)) result.push(s);
    }
    // simulate extra work
    let x = 0;
    for (let i = 0; i < 80_000; i++) x += i;
    return result;
  }, [query]);

  return (
    <ul style={{ height: 200, overflow: "auto", margin: 0, padding: "0 0 0 16px" }}>
      {items.slice(0, 200).map((it) => <li key={it}>{it}</li>)}
    </ul>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const stale = query !== deferred;

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="type..."
        style={{ padding: 8, width: "100%" }}
      />
      <p style={{ color: stale ? "var(--fg)" : "var(--fg-muted)", fontSize: 12, fontFamily: "monospace" }}>
        {stale ? "updating..." : "up to date"}
      </p>
      <div style={{ opacity: stale ? 0.5 : 1, transition: "opacity 200ms" }}>
        <HeavyList query={deferred} />
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  Suspense: {
    kicker: "Component · Loading",
    title: "Wait gracefully",
    lede: "Suspense declares a boundary: 'while children are loading, show this fallback'. It's the piece that lets components fetch data directly and lets React know what to show in the meantime.",
    sections: [
      {
        heading: "Who suspends",
        body: (
          <p>
            Any component that reads from a resource not yet resolved: an undownloaded{" "}
            <code>lazy()</code>, a pending <code>use(promise)</code>, or frameworks like Next/Relay
            that wrap their loaders.
          </p>
        ),
      },
      {
        heading: "Composition",
        body: (
          <p>
            You can nest Suspense in cascades so different regions of the UI load at their own pace,
            without blocking the entire screen with a single giant spinner.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Suspense only catches suspending promises — not arbitrary async state (useState with loading flags still needs manual handling).",
      "Too many nested Suspense boundaries can cause waterfall loading — batch what can be batched.",
      "The fallback must be synchronous and fast to render — avoid heavy computations inside it.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { Suspense, use, useState } from "react";

const cache = new Map();
function fetchUser(id) {
  if (!cache.has(id)) {
    cache.set(id, new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, name: "User " + id, joined: 2020 + (id % 5) });
      }, 800);
    }));
  }
  return cache.get(id);
}

function User({ id }) {
  const user = use(fetchUser(id));
  return (
    <div style={{ padding: 12, background: "var(--surface-1)", borderRadius: 4, border: "1px solid var(--line)" }}>
      <strong>{user.name}</strong> · joined {user.joined}
    </div>
  );
}

export default function App() {
  const [id, setId] = useState(1);
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setId(n)}>load {n}</button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <Suspense fallback={<em style={{ color: "var(--fg-muted)" }}>loading user...</em>}>
          <User id={id} />
        </Suspense>
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  use: {
    kicker: "API · React 19",
    title: "Read a resource, inline",
    lede: "use() reads a value from a Promise or a Context from within the render. If the resource isn't ready yet, the component suspends — leaving the nearest Suspense to handle the wait.",
    sections: [
      {
        heading: "One API, two cases",
        body: (
          <p>
            <code>use(promise)</code> waits for the result or suspends. <code>use(context)</code> is
            like useContext but can be called conditionally — something useContext doesn't allow.
          </p>
        ),
      },
      {
        heading: "Replaces old patterns",
        body: (
          <p>
            Instead of <em>useState + useEffect + setData</em> to load, you pass the promise to the
            component and use() consumes it. More declarative, fewer intermediate states.
          </p>
        ),
      },
    ],
    pitfalls: [
      "use() can be called conditionally — unlike hooks, it's not bound to call order rules.",
      "If the promise rejects, the nearest Error Boundary catches it — make sure one exists.",
      "use() for Context is an alternative to useContext, but useContext is clearer for most cases.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { Suspense, use, createContext } from "react";

const ThemeCtx = createContext("light");

function Title({ show }) {
  // Classic useContext doesn't allow conditional calls. use() does.
  if (!show) return null;
  const theme = use(ThemeCtx);
  return <h2 style={{ color: theme === "dark" ? "var(--fg)" : "var(--fg-muted)" }}>theme: {theme}</h2>;
}

const tipPromise = new Promise((r) =>
  setTimeout(() => r("Combine use() with Suspense for declarative fetch."), 700)
);

function Tip() {
  const text = use(tipPromise);
  return <p style={{ fontStyle: "italic" }}>"{text}"</p>;
}

export default function App() {
  return (
    <ThemeCtx.Provider value="dark">
      <div style={{ fontFamily: "system-ui", padding: 24 }}>
        <Title show={true} />
        <Suspense fallback={<em>loading tip...</em>}>
          <Tip />
        </Suspense>
      </div>
    </ThemeCtx.Provider>
  );
}
`,
        }}
      />
    ),
  },
  useContext: {
    kicker: "Hook · Context",
    title: "Skip prop drilling",
    lede: "useContext reads a value published by the nearest Provider up the tree. It's the way to share theme, locale, session, or any cross-cutting dependency without passing it through every component.",
    sections: [
      {
        heading: "Three pieces",
        body: (
          <p>
            <code>createContext(default)</code> creates the channel. A{" "}
            <code>&lt;Ctx.Provider value=...&gt;</code> publishes a value.{" "}
            <code>useContext(Ctx)</code> reads it in any descendant.
          </p>
        ),
      },
      {
        heading: "Costs to keep in mind",
        body: (
          <p>
            When the value changes, all consumers re-render. If your value is{" "}
            <code>{`{ user, setUser }`}</code> created inline, it changes on every render. Memoize
            the value or split it into multiple contexts.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Passing a new object as value on every render causes all consumers to re-render. Memoize the value with useMemo.",
      "Context is not a state manager: it has no built-in optimization. Split contexts by update frequency.",
      "A missing Provider makes useContext return the default value — make the default as safe as possible.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { createContext, useContext, useState, useMemo } from "react";

const ThemeCtx = createContext(null);

function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

function Toolbar() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      switch to {theme === "dark" ? "light" : "dark"}
    </button>
  );
}

function Card() {
  const { theme } = useTheme();
  const bg = theme === "dark" ? "#1f1f22" : "#e5e3d9";
  const fg = theme === "dark" ? "#e5e5e5" : "#1a1a1a";
  return (
    <div style={{ padding: 16, background: bg, color: fg, borderRadius: 4, marginTop: 12, border: "1px solid rgba(127,127,127,0.22)" }}>
      Current theme: <strong>{theme}</strong>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <div style={{ fontFamily: "system-ui", padding: 24 }}>
        <Toolbar />
        <Card />
      </div>
    </ThemeProvider>
  );
}
`,
        }}
      />
    ),
  },
  createPortal: {
    kicker: "API · React DOM",
    title: "Render outside the tree",
    lede: "createPortal renders a node elsewhere in the DOM while keeping it as a logical child of your component. The piece that lets modals and tooltips escape hostile overflow:hidden and z-index.",
    sections: [
      {
        heading: "What it preserves",
        body: (
          <p>
            Even though the DOM node is elsewhere, the portal remains inside the React tree:
            contexts flow through it, synthetic events bubble up to the logical parent, and effects
            fire as if they were in place.
          </p>
        ),
      },
      {
        heading: "The destination",
        body: (
          <p>
            Usually <code>document.body</code> or a dedicated node with id <code>modal-root</code>.
            Make sure the destination exists before the render — mounting it in index.html is
            safest.
          </p>
        ),
      },
    ],
    pitfalls: [
      "The portal is visually outside the parent but logically inside: events bubble through the React tree, not the DOM tree.",
      "SSR and portals require careful handling — document.body may not exist on the server.",
      "z-index and stacking context still depend on the DOM parent — just creating a portal doesn't fix all stacking issues.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";
import { createPortal } from "react-dom";

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "grid", placeItems: "center", zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-1)", padding: 24, borderRadius: 6, minWidth: 280,
          color: "var(--fg)",
          border: "1px solid var(--line-strong)",
          fontFamily: "system-ui", boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {children}
        <button onClick={onClose} style={{ marginTop: 16 }}>close</button>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      fontFamily: "system-ui", padding: 24,
      overflow: "hidden", height: 200, border: "1px solid var(--line-strong)", borderRadius: 4,
    }}>
      <p>This container has <code>overflow:hidden</code> and limited height.</p>
      <button onClick={() => setOpen(true)}>open modal</button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 style={{ margin: 0 }}>Hello from the portal</h3>
        <p>Even though my logical parent is constrained, I cover the full screen.</p>
      </Modal>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  lazy: {
    kicker: "API · Code splitting",
    title: "Import on demand",
    lede: "lazy() receives a function that returns a dynamic import, and produces a component that loads its code only when rendered for the first time. Combined with Suspense, it splits the bundle automatically.",
    sections: [
      {
        heading: "Where it shines",
        body: (
          <p>
            Views not seen until the user navigates, heavy modals that few users open, rich editors,
            charts. Anything that inflates the initial bundle without justifying its cost for the
            first paint.
          </p>
        ),
      },
      {
        heading: "Suspense is mandatory",
        body: (
          <p>
            While the code downloads, the component suspends. You need a{" "}
            <code>&lt;Suspense fallback=...&gt;</code> above it or React throws an error.
          </p>
        ),
      },
    ],
    pitfalls: [
      "lazy() requires a Suspense boundary above it — without it, React throws.",
      "Don't declare lazy() inside a component — it recreates the lazy reference on every render, losing the cache.",
      "In SSR with Next.js use dynamic() instead of lazy() — it handles server-side behavior properly.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { lazy, Suspense, useState } from "react";

const Heavy = lazy(() =>
  // simulate a slow download
  new Promise((resolve) =>
    setTimeout(() => resolve({ default: HeavyComponent }), 900)
  )
);

function HeavyComponent() {
  return (
    <div style={{ padding: 16, background: "var(--surface-1)", borderRadius: 4, border: "1px solid var(--line-strong)" }}>
      <strong>Heavy component</strong> — imagine a rich text editor,
      a chart, a map. Only downloaded now.
    </div>
  );
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <button onClick={() => setShow(true)}>load component</button>
      <div style={{ marginTop: 16 }}>
        {show && (
          <Suspense fallback={<em style={{ color: "var(--fg-muted)" }}>downloading...</em>}>
            <Heavy />
          </Suspense>
        )}
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  useId: {
    kicker: "Hook · Accessibility",
    title: "Unique, stable IDs",
    lede: "useId generates a unique identifier per component, stable between renders and consistent between client and server. Designed to connect inputs with labels, aria-describedby, and other accessible pairs.",
    sections: [
      {
        heading: "Why not Math.random()",
        body: (
          <p>
            In SSR, the ID generated on the server must match the one on the client to avoid
            hydration errors. <code>useId</code> guarantees that correspondence; random values
            don't.
          </p>
        ),
      },
      {
        heading: "Not for list keys",
        body: (
          <p>
            useId gives one ID per component, not per element. For list keys, use your data's IDs.
            For multiple IDs in the same component, append suffixes:{" "}
            <code>{`\`\${id}-name\``}</code>.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Do not use useId as a list key — it's for accessibility attributes, not data identity.",
      "The generated ID includes colons (:) — don't use it in CSS selectors without escaping.",
      "If you need multiple IDs per component, generate a base with useId and append suffixes: id + '-label', id + '-description'.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useId } from "react";

function Field({ label, hint, type = "text" }) {
  const id = useId();
  const hintId = id + "-hint";
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600 }}>
        {label}
      </label>
      <input id={id} type={type} aria-describedby={hintId} style={{ padding: 8, width: "100%" }} />
      <small id={hintId} style={{ color: "var(--fg-muted)" }}>{hint}</small>
    </div>
  );
}

export default function App() {
  return (
    <form style={{ fontFamily: "system-ui", padding: 24 }}>
      <Field label="Name" hint="As it appears on your passport." />
      <Field label="Email" type="email" hint="We'll send you a code." />
      <p style={{ color: "var(--fg-muted)", fontSize: 13 }}>
        Inspect the DOM: each Field has a distinct, stable id without collisions.
      </p>
    </form>
  );
}
`,
        }}
      />
    ),
  },
  "compound-components": {
    kicker: "Pattern · Composition",
    title: "Components that understand each other",
    lede: "Compound Components is a pattern where a parent component shares state implicitly with its children through Context. The children are independent pieces that know how to talk to the parent — without manual props between them. It's the foundation of Radix UI, shadcn/ui, and most modern design systems.",
    sections: [
      {
        heading: "The core idea",
        body: (
          <p>
            Instead of controlling everything from the parent with props (<code>activeTab</code>,{" "}
            <code>onTabChange</code>, <code>tabLabels</code>…), you create an internal context that
            subcomponents consume. The user composes the pieces freely:{" "}
            <code>{`<Tabs><Tabs.List>…</Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>`}</code>. State
            lives in <code>Tabs</code>, but no child needs to receive explicit props.
          </p>
        ),
      },
      {
        heading: "How it's built",
        body: (
          <p>
            Create a private context. The root component manages state and provides the context.
            Subcomponents consume it. Attach subcomponents as static properties of the parent (
            <code>Tabs.List</code>, <code>Tabs.Tab</code>, <code>Tabs.Panel</code>) so the API is
            self-discoverable — the user types <code>Tabs.</code> and their editor shows the
            available pieces.
          </p>
        ),
      },
    ],
    pitfalls: [
      "The context is private to the pattern — don't export it globally. Each Tabs instance has its own Provider.",
      "If the user nests two Tabs, the nearest context wins. That's usually correct, but verify it's intentional.",
      "Attaching subcomponents as static properties (Tabs.List) is convention, not mandatory — you can also export them separately.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { createContext, useContext, useState } from "react";

// Private context — not exported
const TabsCtx = createContext(null);

function useTabs() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("useTabs must be used inside <Tabs>");
  return ctx;
}

function Tabs({ defaultTab, children }) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      <div style={{ fontFamily: "system-ui" }}>{children}</div>
    </TabsCtx.Provider>
  );
}

function TabList({ children }) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--line-strong)", paddingBottom: 2 }}>
      {children}
    </div>
  );
}

function Tab({ id, children }) {
  const { active, setActive } = useTabs();
  const isActive = active === id;
  return (
    <button
      onClick={() => setActive(id)}
      style={{
        padding: "6px 14px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontWeight: isActive ? 700 : 400,
        color: isActive ? "var(--fg)" : "var(--fg-muted)",
        borderBottom: isActive ? "2px solid var(--fg)" : "2px solid transparent",
        marginBottom: -2,
      }}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }) {
  const { active } = useTabs();
  if (active !== id) return null;
  return (
    <div style={{ padding: "16px 0", color: "var(--fg)" }}>
      {children}
    </div>
  );
}

// Attach subcomponents as static properties
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default function App() {
  return (
    <Tabs defaultTab="react">
      <Tabs.List>
        <Tabs.Tab id="react">React</Tabs.Tab>
        <Tabs.Tab id="vue">Vue</Tabs.Tab>
        <Tabs.Tab id="svelte">Svelte</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="react">
        <strong>React</strong> — UI library based on components and reactive state.
      </Tabs.Panel>
      <Tabs.Panel id="vue">
        <strong>Vue</strong> — progressive framework with its own reactivity system.
      </Tabs.Panel>
      <Tabs.Panel id="svelte">
        <strong>Svelte</strong> — compiler that eliminates the runtime, generates minimal JS.
      </Tabs.Panel>
    </Tabs>
  );
}
`,
        }}
      />
    ),
  },
  useFormStatus: {
    kicker: "Hook · React 19 · react-dom",
    title: "Read the form state from a child",
    lede: "useFormStatus reads the state of the nearest form up the tree: whether it's pending, what data it submitted, and with what method. It lets you create reusable components without prop drilling.",
    sections: [
      {
        heading: "Usage rule",
        body: (
          <p>
            Must be called from a component that is a <em>child</em> of the{" "}
            <code>&lt;form&gt;</code>, not from the same component that renders it. It's the inverse
            pattern to passing <code>isPending</code> as a prop.
          </p>
        ),
      },
      {
        heading: "What it exposes",
        body: (
          <p>
            <code>{"{ pending, data, method, action }"}</code>. <em>pending</em> is the most-used
            flag. <em>data</em> is the <code>FormData</code> in-flight — useful for showing a
            preview of the value while it waits.
          </p>
        ),
      },
    ],
    pitfalls: [
      "useFormStatus must be in a component nested inside the form — not in the form component itself.",
      "It only works with native HTML forms or React 19 form actions — not with custom onSubmit handlers alone.",
      "pending is true only while the form action (async function) is running.",
    ],
    playground: (
      <Playground
        dependencies={{ react: "^19.0.0", "react-dom": "^19.0.0" }}
        files={{
          "/App.js": `import { useActionState } from "react";
import { useFormStatus } from "react-dom";

async function saveUsername(prev, formData) {
  await new Promise(r => setTimeout(r, 1000));
  const username = formData.get("username")?.trim();
  if (!username) return { error: "Name cannot be empty." };
  if (username.length < 3) return { error: "Minimum 3 characters." };
  return { saved: username };
}

// This CHILD component can read the form state without props
function SubmitButton() {
  const { pending, data } = useFormStatus();
  const preview = data?.get("username");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
      {pending && preview && (
        <span style={{ fontSize: 12, color: "var(--fg-muted)", fontStyle: "italic" }}>
          saving "{preview}"...
        </span>
      )}
    </div>
  );
}

export default function App() {
  const [state, formAction] = useActionState(saveUsername, null);
  return (
    <div style={{ padding: 24, maxWidth: 320 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Edit profile</h3>
      {state?.saved && (
        <p style={{ fontSize: 13, marginBottom: 12 }}>
          ✅ Saved as <strong>@{state.saved}</strong>
        </p>
      )}
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input name="username" placeholder="Username"
          defaultValue={state?.saved ?? ""} />
        {state?.error && (
          <p style={{ color: "#c87474", fontSize: 12, margin: 0 }}>{state.error}</p>
        )}
        <SubmitButton />
      </form>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "virtual-dom": {
    kicker: "Interview · Fundamentals",
    title: "Why doesn't React touch the DOM directly?",
    lede: "The Virtual DOM is an in-memory representation of the UI tree. React compares it against the previous state (reconciliation) and only applies the minimum necessary changes to the real DOM — rather than rewriting the whole thing.",
    sections: [
      {
        heading: "The full cycle",
        body: (
          <p>
            <strong>Render →</strong> React generates a new tree of JS objects.{" "}
            <strong>Diffing →</strong> Compares the new tree against the previous one (O(n)
            algorithm). <strong>Commit →</strong> Only the differences are applied to the real DOM.
            The DOM is slow; JS objects are fast — that's where the gain is.
          </p>
        ),
      },
      {
        heading: "Reconciliation and keys",
        body: (
          <p>
            When React compares lists it needs to identify which element is which. Without{" "}
            <code>key</code>, it assumes position and may reuse the wrong node. With a stable{" "}
            <code>key</code>, it reconciles correctly even when reordering.
          </p>
        ),
      },
    ],
    pitfalls: [
      "The Virtual DOM is not automatically faster than the real DOM — it adds an extra comparison step. Its value is in predictability and developer experience.",
      "React's reconciler uses heuristics — it doesn't find the perfect diff. Understanding the key prop is essential to help it.",
      "In React 18+ the model is more nuanced with concurrent rendering: the same virtual tree can be rendered in multiple 'lanes'.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

// Without a stable key React reuses nodes by position.
// Shuffle the order and observe how the input keeps its value.

const colors = ["Red", "Green", "Blue", "Yellow"];

function List({ useKey }) {
  const [items, setItems] = useState(colors);

  const shuffle = () =>
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));

  return (
    <div style={{ marginBottom: 24 }}>
      <strong>{useKey ? "With key (correct)" : "Without key (bug)"}</strong>
      <button onClick={shuffle} style={{ marginLeft: 8 }}>Shuffle</button>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
        {items.map((item, i) => (
          <li key={useKey ? item : i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 80 }}>{item}</span>
            <input placeholder="type something..." />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <List useKey={false} />
      <List useKey={true} />
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "controlado-vs-no-controlado": {
    label: "Controlled vs Uncontrolled",
    kicker: "Interview · Forms",
    title: "Who holds the input's truth?",
    lede: "A controlled component delegates the input value to React — state is the source of truth. An uncontrolled component lets the DOM hold the value and reads it with a ref when needed.",
    sections: [
      {
        heading: "Controlled",
        body: (
          <p>
            <code>value</code> comes from state and <code>onChange</code> updates it. React controls
            every keystroke. Ideal when you need real-time validation, transform the input as the
            user types, or synchronize multiple fields.
          </p>
        ),
      },
      {
        heading: "Uncontrolled",
        body: (
          <p>
            The DOM holds the value. You read it with <code>useRef</code> at the moment you need it
            (for example, on submit). Simpler for forms where the intermediate value doesn't matter
            — like a file upload.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Mixing controlled and uncontrolled in the same input (value + no onChange, or defaultValue + value) generates React warnings and unpredictable behavior.",
      "For uncontrolled inputs, read the ref only in handlers (onSubmit) — not during render.",
      "Controlled inputs with expensive validation on every keystroke can make the input feel sluggish — consider debouncing.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useRef } from "react";

// ── Controlled ────────────────────────────────
function ControlledForm() {
  const [value, setValue] = useState("");
  const upper = value.toUpperCase();

  return (
    <section>
      <h3>Controlled</h3>
      <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
        React is the source of truth. Transformed to uppercase in real time.
      </p>
      <input
        value={upper}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
      />
      <p>State: <code>"{upper}"</code></p>
    </section>
  );
}

// ── Uncontrolled ─────────────────────────────
function UncontrolledForm() {
  const ref = useRef(null);
  const [submitted, setSubmitted] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(ref.current.value);
  };

  return (
    <section>
      <h3>Uncontrolled</h3>
      <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
        The DOM holds the value. React only reads it on submit.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input ref={ref} placeholder="Type something..." />
        <button type="submit">Submit</button>
      </form>
      {submitted && <p>Submitted: <code>"{submitted}"</code></p>}
    </section>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", display: "flex", flexDirection: "column", gap: 24 }}>
      <ControlledForm />
      <hr />
      <UncontrolledForm />
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "prop-drilling": {
    kicker: "Interview · Architecture",
    title: "When props travel where they shouldn't",
    lede: "Prop drilling occurs when data passes through several intermediate components just to reach a deep one that actually needs it. The intermediaries don't use the data — they just forward it.",
    sections: [
      {
        heading: "The problem",
        body: (
          <p>
            Each intermediate component receives a prop it doesn't use, becoming coupled to a
            decision that isn't its concern. If the data changes shape, you have to update every
            link in the chain.
          </p>
        ),
      },
      {
        heading: "The solutions",
        body: (
          <p>
            <strong>Context API</strong> — for global state that many components need (theme, user,
            locale). <strong>Composition</strong> — pass components as <code>children</code> instead
            of data, avoiding the tunnel entirely. <strong>External state</strong> (Zustand, Redux)
            — when the state logic is complex.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Not all prop passing is drilling — passing 2 levels is normal. The problem appears when 4+ components forward a prop without using it.",
      "Context solves drilling but introduces its own coupling: all consumers re-render when the value changes.",
      "Sometimes the real solution is component composition (slot pattern) rather than Context or drilling.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { createContext, useContext, useState } from "react";

// ── Without Context: drilling through B and C ───
function WithDrilling() {
  const [user, setUser] = useState("Ana");
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <strong>With prop drilling</strong>
      <A_drill user={user} setUser={setUser} />
    </div>
  );
}
function A_drill({ user, setUser }) {
  return <B_drill user={user} setUser={setUser} />;   // A doesn't use user
}
function B_drill({ user, setUser }) {
  return <C_drill user={user} setUser={setUser} />;   // B doesn't either
}
function C_drill({ user, setUser }) {
  return (
    <div>
      Hello, <strong>{user}</strong>
      <button onClick={() => setUser("Carlos")} style={{ marginLeft: 8 }}>
        Change
      </button>
    </div>
  );
}

// ── With Context: only C accesses the context ────
const UserCtx = createContext(null);

function WithContext() {
  const [user, setUser] = useState("Ana");
  return (
    <UserCtx.Provider value={{ user, setUser }}>
      <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12, marginTop: 12 }}>
        <strong>With Context</strong>
        <A_ctx />
      </div>
    </UserCtx.Provider>
  );
}
function A_ctx() { return <B_ctx />; }
function B_ctx() { return <C_ctx />; }
function C_ctx() {
  const { user, setUser } = useContext(UserCtx);
  return (
    <div>
      Hello, <strong>{user}</strong>
      <button onClick={() => setUser("Carlos")} style={{ marginLeft: 8 }}>
        Change
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <WithDrilling />
      <WithContext />
    </div>
  );
}
`,
        }}
      />
    ),
  },
  hoc: {
    kicker: "Interview · Patterns",
    title: "Components that wrap components",
    lede: "A Higher-Order Component is a function that receives a component and returns a new one with additional behavior. It's the logic reuse pattern from the pre-hooks era — today hooks replace it in most cases, but it still appears in legacy code and libraries.",
    sections: [
      {
        heading: "The signature",
        body: (
          <p>
            <code>const Enhanced = withSomething(Component)</code>. The HOC adds props, wraps in
            providers, injects behavior — without the original component knowing it's being wrapped.
            By convention they're named with a <code>with</code> prefix.
          </p>
        ),
      },
      {
        heading: "HOC vs Hook",
        body: (
          <p>
            Hooks are simpler and more composable. Use a HOC when you need to wrap the component's
            JSX tree (error boundaries, providers) or when working with a library that requires
            them. For pure reusable logic, a custom hook is the modern choice.
          </p>
        ),
      },
    ],
    pitfalls: [
      "HOCs lose the original component name in DevTools — always set displayName on the wrapper.",
      "They can create prop collisions if the HOC and the wrapped component have props with the same name.",
      "Multiple HOCs wrapping the same component create a 'wrapper hell' that's hard to debug — hooks are usually cleaner.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

// HOC that adds a render logger
function withLogger(Component) {
  return function Logged(props) {
    console.log(\`[render] \${Component.displayName || Component.name}\`, props);
    return <Component {...props} />;
  };
}

// HOC that adds a loading state
function withLoading(Component) {
  return function WithLoading({ isLoading, ...rest }) {
    if (isLoading) return <p style={{ color: "var(--fg-muted)" }}>Loading...</p>;
    return <Component {...rest} />;
  };
}

// Base component
function UserCard({ name, role }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <strong>{name}</strong>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--fg-muted)" }}>{role}</p>
    </div>
  );
}

// HOC composition
const UserCardEnhanced = withLogger(withLoading(UserCard));

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <button onClick={() => setLoading((v) => !v)} style={{ marginBottom: 16 }}>
        {loading ? "Simulate load complete" : "Simulate loading"}
      </button>
      <UserCardEnhanced
        isLoading={loading}
        name="Ana García"
        role="Frontend Engineer"
      />
      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 12 }}>
        Open the console to see the render log.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "render-props": {
    kicker: "Interview · Patterns",
    title: "Delegating what to render",
    lede: "The Render Props pattern consists of passing a function as a prop that the component calls to get JSX. The component controls when and with what data it renders; the parent controls what is rendered with that data.",
    sections: [
      {
        heading: "The core idea",
        body: (
          <p>
            Instead of the component deciding its own output, it receives a <code>render</code>{" "}
            function (or <code>children</code> as a function) and calls it with its internal data.
            The parent receives that data and returns JSX — separating logic from presentation.
          </p>
        ),
      },
      {
        heading: "Render Props vs hooks",
        body: (
          <p>
            Hooks solve the same problem (sharing logic) more directly. Today render props mainly
            appear in UI libraries like Headless UI or Radix, where accessibility logic is
            completely separated from visual presentation.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Render Props defined inline (render={() => <Child/>}) create a new function on every parent render, potentially breaking memoization.",
      "Deeply nested Render Props create 'callback hell' — today custom hooks are usually the cleaner solution.",
      "The name 'render prop' refers to the pattern, not to a prop literally named 'render' — it can be children or any name.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useEffect } from "react";

// Component that encapsulates mouse tracking logic
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return render(pos);  // delegates JSX to the parent
}

// Two different uses of the same MouseTracker
export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3>Coordinates</h3>
      <MouseTracker
        render={({ x, y }) => (
          <p>x: {x} · y: {y}</p>
        )}
      />

      <h3 style={{ marginTop: 24 }}>Tracking dot</h3>
      <div style={{ position: "relative", height: 200, border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
        <MouseTracker
          render={({ x, y }) => (
            <div style={{
              position: "absolute",
              left: x - 6,
              top: y - 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "var(--accent)",
              pointerEvents: "none",
              transform: "translate(-50%,-50%)"
            }} />
          )}
        />
        <p style={{ padding: 12, color: "var(--fg-muted)", fontSize: 13 }}>Move your cursor here</p>
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "componentes-puros": {
    label: "Pure Components",
    kicker: "Interview · Performance",
    title: "Same input, always the same output",
    lede: "A pure component is one that given the same props produces exactly the same JSX — with no side effects in the render. React can skip its re-render if the props haven't changed, making the UI predictable and optimizable.",
    sections: [
      {
        heading: "React.memo",
        body: (
          <p>
            <code>memo(Component)</code> wraps the component and memoizes the last output. On the
            next render, if props are equal by reference (shallow equality), React reuses the
            previous result without calling the function. Useful for expensive children that receive
            stable props.
          </p>
        ),
      },
      {
        heading: "The reference trap",
        body: (
          <p>
            <code>memo</code> compares props with <code>Object.is</code>. If the parent passes an
            object literal or inline function, it creates a new reference on every render —{" "}
            <code>memo</code> always sees "different" props and never skips the render. That's why
            it's combined with <code>useMemo</code> and <code>useCallback</code>.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Reading external state (Date.now(), Math.random(), global variables) inside the render makes a component impure.",
      "A component can be 'pure' in the React sense but have intentional side effects in effects or event handlers — those are not render side effects.",
      "memo makes a component 'skip renders' but doesn't make it pure — purity is about the output depending only on the input.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, memo, useCallback } from "react";

let renderCount = 0;

const ExpensiveChild = memo(function ExpensiveChild({ onClick, label }) {
  renderCount++;
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <p style={{ margin: 0 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--fg-muted)" }}>
        Renders: {renderCount}
      </p>
      <button onClick={onClick} style={{ marginTop: 8 }}>Action</button>
    </div>
  );
});

export default function App() {
  const [count, setCount] = useState(0);
  const [stable, setStable] = useState(true);

  // With useCallback: stable reference → memo works
  const stableClick = useCallback(() => alert("click"), []);
  // Without useCallback: new function every render → memo fails
  const unstableClick = () => alert("click");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p>Parent counter: <strong>{count}</strong></p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setCount((c) => c + 1)}>Re-render parent</button>
        <button onClick={() => setStable((v) => !v)}>
          {stable ? "Pass unstable function" : "Pass useCallback"}
        </button>
      </div>
      <ExpensiveChild
        onClick={stable ? stableClick : unstableClick}
        label={stable ? "With useCallback (memo works)" : "Without useCallback (memo fails)"}
      />
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "error-boundary": {
    kicker: "API · Error handling",
    title: "Isolate errors so they don't bring down the entire UI",
    lede: "Without an Error Boundary, an error in any child component destroys the entire tree and the user sees a blank screen. An Error Boundary intercepts the error, displays a fallback UI, and leaves the rest of the application intact.",
    sections: [
      {
        heading: "Why do they exist?",
        body: (
          <p>
            React propagates render errors upward until something catches them. If nothing does, the
            entire tree unmounts. An Error Boundary acts like a <code>try/catch</code> for the
            component tree: it catches the error, updates its own state to show a fallback, and
            leaves the rest of the app untouched. It's the foundation of graceful degradation in
            React.
          </p>
        ),
      },
      {
        heading: "How to build one",
        body: (
          <>
            <p>
              It must be a <strong>class</strong> — there's no native functional equivalent. It
              needs two lifecycle methods:
            </p>
            <ul>
              <li>
                <code>static getDerivedStateFromError(error)</code> — a static, pure method that
                returns the new state. React calls it during the render phase to display the
                fallback.
              </li>
              <li>
                <code>componentDidCatch(error, info)</code> — runs after render. This is where side
                effects go: logs, sending data to a monitoring service (Sentry, Datadog…).
              </li>
            </ul>
            <p>
              Use it just like <code>{"<Suspense>"}</code>: wrap the subtree you want to protect.
            </p>
          </>
        ),
      },
      {
        heading: "What it catches and what it doesn't",
        body: (
          <>
            <p>
              ✅ Catches errors in <strong>render</strong>, lifecycle methods, and child component
              constructors.
            </p>
            <p>❌ Does not catch:</p>
            <ul>
              <li>
                <strong>Event handlers</strong> — events don't go through React's render cycle. Use{" "}
                <code>try/catch</code> inside the handler.
              </li>
              <li>
                <strong>Async code</strong> — <code>setTimeout</code>, <code>fetch</code>, promises.
                The error occurs outside the React tree.
              </li>
              <li>
                <strong>Server-side rendering (SSR)</strong>.
              </li>
              <li>
                <strong>Its own errors</strong> — an Error Boundary can't catch its own errors. You
                need another Error Boundary parent to wrap it.
              </li>
            </ul>
          </>
        ),
      },
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { Component, useState } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, background: "#fee2e2", borderRadius: 8, color: "#991b1b" }}>
          <strong>Something went wrong 😕</strong>
          <p style={{ fontSize: 13, marginTop: 8 }}>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 8, padding: "4px 12px", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function UserProfile({ broken }) {
  if (broken) throw new Error("Failed to load profile");
  return <p style={{ color: "var(--fg)" }}>✓ Profile loaded successfully</p>;
}

export default function App() {
  const [broken, setBroken] = useState(false);
  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 400, padding: 24 }}>
      <h2 style={{ color: "var(--fg)" }}>Error Boundary</h2>
      <button
        onClick={() => setBroken((b) => !b)}
        style={{ marginBottom: 16, padding: "6px 14px", cursor: "pointer" }}
      >
        {broken ? "Fix" : "Break"} component
      </button>
      <ErrorBoundary key={String(broken)}>
        <UserProfile broken={broken} />
      </ErrorBoundary>
    </div>
  );
}
`,
        }}
      />
    ),
    pitfalls: [
      "Event handlers don't propagate errors to the React tree — use try/catch inside the handler, not an Error Boundary.",
      "An Error Boundary can't catch its own errors — you need another Error Boundary parent wrapping it.",
      "In development with StrictMode, React intentionally re-throws the error after catching it. In production the behavior is as expected.",
      "A retry button that only resets hasError won't help if the child still throws. Pass a key that changes when you want React to fully unmount and remount the boundary from scratch.",
    ],
  },
  jsx: {
    kicker: "Interview · Fundamentals",
    title: "What is JSX and what does it compile to?",
    lede: "JSX is syntactic sugar over React.createElement. The browser doesn't understand it — a compiler (Babel/SWC) transforms it into JS function calls before it runs.",
    sections: [
      {
        heading: "What the compiler does",
        body: (
          <p>
            <code>{'<Button color="red">Click</Button>'}</code> becomes{" "}
            <code>{'React.createElement(Button, { color: "red" }, "Click")'}</code>. JSX isn't magic
            — it's a more readable way to create objects that describe nodes in the UI tree.
          </p>
        ),
      },
      {
        heading: "JSX is not HTML",
        body: (
          <p>
            Key differences: <code>className</code> instead of <code>class</code>,{" "}
            <code>htmlFor</code> instead of <code>for</code>, events in camelCase (
            <code>onClick</code>), and <code>style</code> takes a JS object instead of a string.
            Also, all elements must be closed — including <code>{"<br />"}</code> and{" "}
            <code>{"<img />"}</code>.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Since React 17 you no longer need to import React to use JSX — the new transform injects it automatically.",
      "Expressions inside {} must be valid JS expressions, not statements. You can't use if directly — use a ternary or &&.",
      "A component must return a single root element. Use <></> (Fragment) to wrap multiple elements without adding extra DOM nodes.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import React from "react";

// JSX — what you write
function WithJSX() {
  return (
    <div className="card" style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 6 }}>
      <p style={{ margin: 0, fontWeight: "bold" }}>Hello from JSX</p>
      <button onClick={() => alert("JSX")} style={{ marginTop: 8 }}>Click me</button>
    </div>
  );
}

// Equivalent — what the compiler produces
function WithoutJSX() {
  return React.createElement(
    "div",
    { style: { padding: 16, border: "1px solid var(--line)", borderRadius: 6 } },
    React.createElement("p", { style: { margin: 0, fontWeight: "bold" } }, "Hello without JSX"),
    React.createElement("button", { onClick: () => alert("createElement"), style: { marginTop: 8 } }, "Click me")
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 13, color: "var(--fg-muted)" }}>
        Both produce the same result. JSX is just syntactic sugar.
      </p>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>With JSX:</p>
        <WithJSX />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>Without JSX (React.createElement):</p>
        <WithoutJSX />
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "key-prop": {
    label: "Key prop",
    kicker: "Interview · Reconciliation",
    title: "key is not just for lists",
    lede: "The key prop tells React which DOM node corresponds to which element between renders. When key changes, React unmounts the old component and mounts a fresh one — which lets you reset state intentionally.",
    sections: [
      {
        heading: "The identity mechanism",
        body: (
          <p>
            React compares the new tree against the previous one by type and position. If an element
            has the same <code>key</code> as before, React reuses it (updates). If the{" "}
            <code>key</code> changes, React unmounts it and mounts from scratch — including its
            internal state and effects.
          </p>
        ),
      },
      {
        heading: "key as intentional reset",
        body: (
          <p>
            Passing a <code>key</code> that changes with an external ID is the idiomatic way to
            reset a component without adding reset logic inside it. When the user switches items,
            the <code>key</code> changes and React mounts a clean instance automatically.
          </p>
        ),
      },
    ],
    pitfalls: [
      "Using the array index as a key is an anti-pattern when the list can be reordered — React will reuse the wrong node.",
      "key is not a readable prop — you can't access it with props.key. If you need the value, pass it as a separate prop.",
      "key must be unique among siblings, not globally. The same value can appear in separate lists without issue.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState } from "react";

const users = ["Ana", "Carlos", "Maria"];

// Form with its own internal state
function UserForm({ name }) {
  const [notes, setNotes] = useState("");
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>User: {name}</p>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes about this user..."
        style={{ width: "100%", boxSizing: "border-box" }}
      />
      {notes && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--fg-muted)" }}>
          Saved: "{notes}"
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [userId, setUserId] = useState(0);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--fg-muted)" }}>
        Type something in the input, then switch users.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {users.map((u, i) => (
          <button
            key={u}
            onClick={() => setUserId(i)}
            style={{ fontWeight: userId === i ? "bold" : "normal" }}
          >
            {u}
          </button>
        ))}
      </div>

      <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>Without key — state persists across users:</p>
      <UserForm name={users[userId]} />

      <p style={{ margin: "16px 0 8px", fontSize: 12, color: "var(--fg-muted)" }}>With key={"{userId}"} — state resets on change:</p>
      <UserForm key={userId} name={users[userId]} />
    </div>
  );
}
`,
        }}
      />
    ),
  },
  hydration: {
    label: "Hydration",
    kicker: "Interview · SSR",
    title: "What does hydrating mean in React?",
    lede: "Hydration is the process by which React takes control of server-generated HTML. Instead of recreating the DOM, it attaches event listeners to the existing HTML — the user sees content immediately while React makes it interactive.",
    sections: [
      {
        heading: "The SSR + hydration flow",
        body: (
          <p>
            <strong>Server →</strong> generates static HTML the browser shows instantly.{" "}
            <strong>Client →</strong> downloads the JS and React calls <code>hydrateRoot</code>{" "}
            instead of <code>createRoot</code>. React walks the existing HTML, compares it with what
            it would generate, and attaches handlers — without repainting the DOM if everything
            matches.
          </p>
        ),
      },
      {
        heading: "Hydration mismatch",
        body: (
          <p>
            If the server HTML doesn't match what React would render on the client (e.g. a{" "}
            <code>new Date()</code>, a <code>localStorage</code> value, or a random number), React
            warns and rebuilds that subtree from scratch. The fix is to defer that content to a{" "}
            <code>useEffect</code> or mark the node with <code>suppressHydrationWarning</code>.
          </p>
        ),
      },
    ],
    pitfalls: [
      "In Next.js App Router, Server Components are not hydrated — only Client Components ('use client') need hydration.",
      "suppressHydrationWarning only suppresses the warning on the marked node, it doesn't resolve the actual mismatch. Use it only for intentionally dynamic content (timestamps, ads).",
      "A hydration mismatch can cause a visual flash if React has to reconstruct part of the DOM on the client.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useEffect } from "react";

// Pattern: component that only renders on the client
function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : fallback;
}

// This would cause a hydration mismatch in a real SSR app:
// server and client generate different times
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time.toLocaleTimeString()}</span>;
}

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--fg-muted)" }}>
          ⚠️ Direct render — would cause mismatch in SSR:
        </p>
        <LiveClock />
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--fg-muted)" }}>
          ✅ With ClientOnly — renders only on the client:
        </p>
        <ClientOnly fallback={<span style={{ color: "var(--fg-muted)" }}>--:--:--</span>}>
          <LiveClock />
        </ClientOnly>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "var(--fg-muted)" }}>
        The fallback is what the server would have rendered. The client replaces it after mounting.
      </p>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "forward-ref": {
    label: "forwardRef",
    kicker: "Interview · Refs",
    title: "Passing a ref into a component",
    lede: "forwardRef lets a component expose its internal DOM node to a parent via ref. Without it, passing ref to a custom component does nothing — ref is not a regular prop and React intercepts it.",
    sections: [
      {
        heading: "Why ref is not a prop",
        body: (
          <p>
            React reserves <code>ref</code> (along with <code>key</code>) and doesn't pass it as a
            regular prop. If you want the parent to access a child's internal DOM, the child must
            explicitly opt in with <code>forwardRef</code>.
          </p>
        ),
      },
      {
        heading: "useImperativeHandle",
        body: (
          <p>
            Instead of exposing the raw DOM node, you can use <code>useImperativeHandle</code>{" "}
            together with <code>forwardRef</code> to expose only the operations you want to allow
            (focus, scroll, play…) — hiding the real DOM and maintaining the component's
            encapsulation.
          </p>
        ),
      },
    ],
    pitfalls: [
      "In React 19, forwardRef is no longer needed — ref can be passed as a regular prop. If you're on React 18 or earlier, it's still required.",
      "Exposing the raw DOM breaks encapsulation. Prefer useImperativeHandle to limit what the parent can do.",
      "forwardRef only forwards the ref one level — if your inner component is also custom, it needs its own forwardRef.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useRef, forwardRef, useImperativeHandle } from "react";

// Basic forwardRef: exposes the input directly
const BasicInput = forwardRef(function BasicInput({ label }, ref) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>{label}</label>
      <input
        ref={ref}
        style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "6px 10px", width: "100%", boxSizing: "border-box" }}
        placeholder="Field with forwardRef..."
      />
    </div>
  );
});

// useImperativeHandle: exposes only what we want
const SecureInput = forwardRef(function SecureInput({ label }, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => { if (inputRef.current) inputRef.current.value = ""; },
    // The real DOM is not exposed — only these two operations
  }));

  return (
    <div>
      <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>{label}</label>
      <input
        ref={inputRef}
        style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "6px 10px", width: "100%", boxSizing: "border-box" }}
        placeholder="Field with useImperativeHandle..."
      />
    </div>
  );
});

export default function App() {
  const basicRef = useRef(null);
  const secureRef = useRef(null);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <BasicInput ref={basicRef} label="Basic forwardRef" />
        <button onClick={() => basicRef.current?.focus()} style={{ marginTop: 8 }}>
          Focus
        </button>
      </div>
      <div>
        <SecureInput ref={secureRef} label="With useImperativeHandle" />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => secureRef.current?.focus()}>Focus</button>
          <button onClick={() => secureRef.current?.clear()}>Clear</button>
        </div>
      </div>
    </div>
  );
}
`,
        }}
      />
    ),
  },
  "strict-mode": {
    label: "StrictMode",
    kicker: "Interview · Tooling",
    title: "Why do my effects run twice?",
    lede: "StrictMode activates extra behaviors only in development to catch subtle bugs: it mounts and unmounts components twice to verify effects have cleanup, and warns about deprecated APIs.",
    sections: [
      {
        heading: "The double mount",
        body: (
          <p>
            In development, React mounts the component, unmounts it, and mounts it again. This
            simulates what happens with fast refresh and real remount scenarios. If your{" "}
            <code>useEffect</code> breaks when run twice, it means the cleanup function is missing.
          </p>
        ),
      },
      {
        heading: "Development only",
        body: (
          <p>
            The double mount doesn't happen in production. Its only purpose is to surface effects
            without cleanup before they reach users. The right signal isn't "why does this run
            twice?" but "does my effect work correctly if it runs twice?".
          </p>
        ),
      },
    ],
    pitfalls: [
      "If the double mount breaks your effect, don't remove StrictMode — it's a signal the effect needs a cleanup return.",
      "StrictMode doesn't affect production components — it's only a development tool to catch bugs early.",
      "In React 18+, the double mount also verifies components support unmount/remount without losing data — useful for the future Offscreen API.",
    ],
    playground: (
      <Playground
        files={{
          "/App.js": `import { useState, useEffect, StrictMode } from "react";

function Timer({ label, withCleanup }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);

    if (withCleanup) {
      // With cleanup: StrictMode unmounts → clears the interval → remounts
      // Only 1 interval runs at the end
      return () => clearInterval(id);
    }
    // Without cleanup: StrictMode creates 2 intervals → counter runs at double speed
  }, []);

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
      <p style={{ margin: 0, fontSize: 13 }}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: 24, fontVariantNumeric: "tabular-nums" }}>
        {seconds}s
      </p>
    </div>
  );
}

export default function App() {
  return (
    <StrictMode>
      <div style={{ fontFamily: "system-ui", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--fg-muted)" }}>
          In StrictMode (dev), effects mount → unmount → mount.
          Without cleanup, resources are duplicated.
        </p>
        <Timer label="✅ With cleanup (return () => clearInterval)" withCleanup={true} />
        <Timer label="⚠️ Without cleanup — double speed due to duplicate interval" withCleanup={false} />
      </div>
    </StrictMode>
  );
}
`,
        }}
      />
    ),
  },
}

function applyOverrides(concepts: Concept[]): Concept[] {
  return concepts.map((c) => {
    const override = overrides[c.id]
    if (!override) return c
    return { ...c, ...override }
  })
}

export const allConcepts: Concept[] = [
  ...applyOverrides(estado),
  ...applyOverrides(efectos),
  ...applyOverrides(rendimiento),
  ...applyOverrides(concurrencia),
  ...applyOverrides(composicion),
  ...applyOverrides(entrevistas),
]

export const conceptIndex: Record<string, Concept> = Object.fromEntries(
  allConcepts.map((c) => [c.id, c])
)

export const categories: Category[] = [
  {
    id: "state",
    kicker: "I",
    title: "State & Memory",
    conceptIds: ["useState", "useReducer", "useRef", "useOptimistic", "useActionState"],
  },
  {
    id: "sync",
    kicker: "II",
    title: "Synchronization",
    conceptIds: ["useEffect", "useLayoutEffect", "useEffectEvent"],
  },
  {
    id: "performance",
    kicker: "III",
    title: "Performance",
    conceptIds: ["useMemo", "useCallback", "memo"],
  },
  {
    id: "concurrency",
    kicker: "IV",
    title: "Concurrency",
    conceptIds: ["useTransition", "useDeferredValue", "Suspense", "use"],
  },
  {
    id: "composition",
    kicker: "V",
    title: "Composition",
    conceptIds: [
      "useContext",
      "createPortal",
      "lazy",
      "useId",
      "useFormStatus",
      "compound-components",
      "error-boundary",
    ],
  },
  {
    id: "interviews",
    kicker: "VI",
    title: "Interviews",
    conceptIds: [
      "virtual-dom",
      "controlado-vs-no-controlado",
      "prop-drilling",
      "hoc",
      "render-props",
      "componentes-puros",
      "jsx",
      "key-prop",
      "hydration",
      "forward-ref",
      "strict-mode",
    ],
  },
]
