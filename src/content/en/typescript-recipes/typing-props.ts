import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const typingProps: TypeScriptRecipe = {
  id: "typing-props",
  label: "Typing Props",
  description:
    "How to define a component's props interface: required props, optional props, children, and default values.",
  category: "props",
  code: `import { PropsWithChildren } from "react"

interface ButtonProps {
  label: string                  // required
  variant?: "primary" | "ghost"  // optional with union type
  disabled?: boolean
  onClick?: () => void
}

// PropsWithChildren<T> adds children?: ReactNode to any interface
export function Button({
  label,
  variant = "primary",   // default value
  disabled = false,
  onClick,
  children,
}: PropsWithChildren<ButtonProps>) {
  return (
    <button disabled={disabled} onClick={onClick}>
      {children ?? label}
    </button>
  )
}

// If the component always requires children, extend explicitly:
// interface CardProps extends PropsWithChildren<{ title: string }> {}

// ✓ Correct
<Button label="Save" />
<Button label="Delete" variant="ghost" onClick={() => {}} />
<Button label="ignored">With children</Button>

// ✗ Error: missing required prop
<Button />

// ✗ Error: invalid variant
<Button label="X" variant="danger" />`,
  do: `// PropsWithChildren adds children?: ReactNode automatically
interface ButtonProps {
  label: string
  variant?: "primary" | "ghost"
}

function Button({ label, children }: PropsWithChildren<ButtonProps>) {
  return <button>{children ?? label}</button>
}`,
  dont: `// ✗ Adding ReactNode manually is redundant
import { ReactNode } from "react"

interface ButtonProps {
  label: string
  variant?: "primary" | "ghost"
  children?: ReactNode  // PropsWithChildren already does this
}`,
  playground: { files: {} },
}
