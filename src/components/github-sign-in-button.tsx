"use client"

import { authClient } from "@/lib/auth-client"
import { GitHubIcon } from "@/components/svg-icons"

interface Props {
  label: string
}

export function GitHubSignInButton({ label }: Props) {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signIn.social({ provider: "github" })
      }}
      className="flex items-center gap-2 rounded-md border border-[var(--color-line-strong)] bg-[var(--color-bg-raise)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-fg-muted)] hover:bg-[var(--color-bg-hover)]"
    >
      <GitHubIcon className="h-[15px] w-[15px]" />
      {label}
    </button>
  )
}
