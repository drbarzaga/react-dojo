import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const discriminatedUnions: TypeScriptRecipe = {
  id: "discriminated-unions",
  label: "Discriminated Unions",
  description:
    "Conditional props based on a discriminant. Prevents invalid prop combinations that regular interfaces cannot catch.",
  category: "patterns",
  code: `// ── Problem with regular intersection ──────────────────
// Nothing prevents passing href AND onClick at the same time
interface BadLinkButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
}

// ── Solution: discriminated union ───────────────────────
type LinkButtonProps =
  | {
      as: "link"
      href: string           // required when as="link"
      onClick?: never        // not allowed
      children: React.ReactNode
    }
  | {
      as: "button"
      href?: never           // not allowed
      onClick: () => void    // required when as="button"
      children: React.ReactNode
    }

export function LinkButton(props: LinkButtonProps) {
  if (props.as === "link") {
    return <a href={props.href}>{props.children}</a>
  }
  return <button onClick={props.onClick}>{props.children}</button>
}

// ✓ Correct
<LinkButton as="link" href="/about">About</LinkButton>
<LinkButton as="button" onClick={() => {}}>Confirm</LinkButton>

// ✗ Error: href does not exist on the "button" variant
<LinkButton as="button" href="/about" onClick={() => {}}>X</LinkButton>

// ✗ Error: onClick is missing on the "button" variant
<LinkButton as="button">No handler</LinkButton>`,
  do: `// ✓ Discriminated union — invalid combinations are impossible
type Props =
  | { as: "link"; href: string; onClick?: never }
  | { as: "button"; onClick: () => void; href?: never }

// TypeScript guarantees href and onClick can't coexist`,
  dont: `// ✗ Optional props allow invalid states
interface Props {
  href?: string
  onClick?: () => void  // nothing prevents passing both
}

// This compiles without error even though it makes no sense
<LinkButton href="/path" onClick={() => {}} />`,
  playground: { files: {} },
}
