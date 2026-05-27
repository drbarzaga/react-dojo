import type { CustomHook } from "@/content/custom-hooks/types"

export const useGitHubStars: CustomHook = {
  id: "useGitHubStars",
  label: "useGitHubStars",
  description:
    "Fetches the star count of a public GitHub repository. Includes an in-memory cache with a 1-hour TTL to respect the API rate limit, and automatically cancels the request if the repo changes.",
  category: "utility",
  code: `import { useState, useEffect } from "react"

interface GitHubStarsState {
  stars: number | null
  loading: boolean
  error: string | null
}

const cache = new Map<string, { value: number; ts: number }>()
const TTL_MS = 60 * 60 * 1000 // 1 hour

export function useGitHubStars(repo: string): GitHubStarsState {
  const [state, setState] = useState<GitHubStarsState>({
    stars: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const cached = cache.get(repo)
    if (cached && Date.now() - cached.ts < TTL_MS) {
      setState({ stars: cached.value, loading: false, error: null })
      return
    }

    let cancelled = false
    setState({ stars: null, loading: true, error: null })

    fetch(\`https://api.github.com/repos/\${repo}\`)
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled && typeof data.stargazers_count === "number") {
          cache.set(repo, { value: data.stargazers_count, ts: Date.now() })
          setState({ stars: data.stargazers_count, loading: false, error: null })
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ stars: null, loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [repo])

  return state
}`,
  playground: {
    files: {
      "/App.js": `import { useState, useEffect } from "react"

const cache = new Map()
const TTL_MS = 60 * 60 * 1000

function useGitHubStars(repo) {
  const [state, setState] = useState({ stars: null, loading: true, error: null })

  useEffect(() => {
    const cached = cache.get(repo)
    if (cached && Date.now() - cached.ts < TTL_MS) {
      setState({ stars: cached.value, loading: false, error: null })
      return
    }

    let cancelled = false
    setState({ stars: null, loading: true, error: null })

    fetch("https://api.github.com/repos/" + repo)
      .then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json() })
      .then((data) => {
        if (!cancelled && typeof data.stargazers_count === "number") {
          cache.set(repo, { value: data.stargazers_count, ts: Date.now() })
          setState({ stars: data.stargazers_count, loading: false, error: null })
        }
      })
      .catch((err) => { if (!cancelled) setState({ stars: null, loading: false, error: err.message }) })

    return () => { cancelled = true }
  }, [repo])

  return state
}

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k"
  return String(n)
}

const REPOS = [
  "drbarzaga/react-dojo",
  "facebook/react",
  "vercel/next.js",
  "vitejs/vite",
  "tailwindlabs/tailwindcss",
  "microsoft/typescript",
]

export default function App() {
  const [repo, setRepo] = useState(REPOS[0])
  const { stars, loading, error } = useGitHubStars(repo)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useGitHubStars</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16 }}>
        Switch the repository to fetch its stars in real time.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {REPOS.map((r) => (
          <button
            key={r}
            onClick={() => setRepo(r)}
            style={{
              textAlign: "left",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: repo === r ? 700 : 400,
              padding: "6px 10px",
              borderRadius: 6,
              background: repo === r ? "var(--line)" : "transparent",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div style={{
        padding: "16px 20px",
        border: "1px solid var(--line)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>⭐</span>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--fg-muted)", marginBottom: 2 }}>
            {repo}
          </div>
          {loading && <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>Loading…</div>}
          {error && <div style={{ fontSize: 13, color: "#f87171" }}>Error: {error}</div>}
          {!loading && !error && stars !== null && (
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace" }}>
              {formatStars(stars)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}`,
    },
  },
}
