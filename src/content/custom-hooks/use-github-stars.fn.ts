import { useEffect, useState } from "react"

interface GitHubStarsState {
  stars: number | null
  loading: boolean
  error: string | null
}

interface GitHubStarsInternalState extends GitHubStarsState {
  repo: string
}

const TTL_MS = 60 * 60 * 1000

export function useGitHubStars(repo: string): GitHubStarsState {
  const [cache] = useState(() => new Map<string, { value: number; ts: number }>())
  const cachedStars = cache.get(repo)?.value ?? null

  const [state, setState] = useState<GitHubStarsInternalState>(() => ({
    repo,
    stars: cachedStars,
    loading: cachedStars === null,
    error: null,
  }))

  useEffect(() => {
    const cached = cache.get(repo) ?? null
    if (cached && Date.now() - cached.ts < TTL_MS) return

    let cancelled = false

    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ stargazers_count: number }>
      })
      .then((data) => {
        if (!cancelled && typeof data.stargazers_count === "number") {
          cache.set(repo, { value: data.stargazers_count, ts: Date.now() })
          setState({
            repo,
            stars: data.stargazers_count,
            loading: false,
            error: null,
          })
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState({
            repo,
            stars: null,
            loading: false,
            error: err.message,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [repo, cache])

  if (cachedStars !== null) {
    return { stars: cachedStars, loading: false, error: null }
  }

  if (state.repo !== repo) {
    return { stars: null, loading: true, error: null }
  }

  return { stars: state.stars, loading: state.loading, error: state.error }
}
