import { useState, useCallback } from "react"

interface UseClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<void>
}

export function useClipboard(resetInterval = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), resetInterval)
      } catch {
        setCopied(false)
      }
    },
    [resetInterval]
  )

  return { copied, copy }
}
