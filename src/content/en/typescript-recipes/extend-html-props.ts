import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const extendHtmlProps: TypeScriptRecipe = {
  id: "extend-html-props",
  label: "Extend HTML Props",
  description:
    "How to create components that accept all props of the underlying HTML element alongside your own, using ComponentProps and the spread operator.",
  category: "props",
  code: `import { ComponentProps, forwardRef } from "react"

// ── Extend element props ─────────────────────────────────
// ComponentProps<"button"> includes onClick, disabled, type, etc.
interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "ghost" | "danger"
  loading?: boolean
}

// Own props are destructured; the rest goes to the element
export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className,
  ...rest               // all native <button> props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={\`btn btn-\${variant} \${className ?? ""}\`}
      {...rest}          // onClick, type, form, aria-*, data-*, etc.
    >
      {loading ? "…" : children}
    </button>
  )
}

// ── With forwardRef for refs ─────────────────────────────
export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={\`input \${className ?? ""}\`}
      {...rest}
    />
  )
)
Input.displayName = "Input"

// ✓ Accepts any native <button> prop
<Button variant="primary" type="submit" form="my-form" aria-label="Save">
  Save
</Button>`,
  do: `// ✓ ComponentProps + spread accepts everything automatically
interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "ghost"
}

function Button({ variant, ...rest }: ButtonProps) {
  return <button {...rest} />  // onClick, type, aria-*, etc.
}`,
  dont: `// ✗ Manually listing native props is fragile and incomplete
interface ButtonProps {
  variant?: "primary" | "ghost"
  onClick?: () => void       // what about onMouseEnter? aria-label?
  disabled?: boolean         // what about form? type? data-*?
  children?: React.ReactNode
}`,
  playground: { files: {} },
}
