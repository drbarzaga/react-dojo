"use client"

import { useEffect, useLayoutEffect, useState } from "react"

const TTL_MS = 60 * 60 * 1000

function readCache(key: string): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { value, ts } = JSON.parse(raw)
    return Date.now() - ts < TTL_MS ? value : null
  } catch {
    return null
  }
}

export function useGitHubStars(repo: string) {
  const key = `gh-stars:${repo}`
  const [previousRepo, setPreviousRepo] = useState(repo)
  const [stars, setStars] = useState<number | null>(null)
  const [animate, setAnimate] = useState(false)

  if (repo !== previousRepo) {
    setPreviousRepo(repo)
    setStars(readCache(`gh-stars:${repo}`))
    setAnimate(false)
  }

  useLayoutEffect(() => {
    queueMicrotask(() => {
      const cached = readCache(key)
      if (cached !== null) {
        setStars(cached)
        setAnimate(false)
      }
    })
  }, [repo, key])

  useEffect(() => {
    if (readCache(key) !== null) {
      return
    }

    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.stargazers_count === "number") {
          setStars(d.stargazers_count)
          setAnimate(true)
          sessionStorage.setItem(key, JSON.stringify({ value: d.stargazers_count, ts: Date.now() }))
        }
      })
      .catch(() => {})
  }, [repo, key])

  return { stars, animate }
}
