import { useState, useEffect, useRef } from "react"

interface Options {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export function useIntersectionObserver<T extends HTMLElement>(options: Options = {}) {
  const { threshold = 0, root = null, rootMargin = "0px" } = options
  const ref = useRef<T>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([e]) => setEntry(e), { threshold, root, rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, root, rootMargin])

  return { ref, entry, isIntersecting: entry?.isIntersecting ?? false }
}
