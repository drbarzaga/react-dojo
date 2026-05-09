import { useEffect, useState } from "react"

export function useCountUp(target: number | null, animate = true, duration = 1000) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    if (target === null || !animate) return

    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setAnimatedValue(Math.round(progress * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, animate, duration])

  if (target === null) {
    return animatedValue
  }

  if (!animate) {
    return target
  }

  return animatedValue
}
