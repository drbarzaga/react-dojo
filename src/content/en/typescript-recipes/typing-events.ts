import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const typingEvents: TypeScriptRecipe = {
  id: "typing-events",
  label: "Typing Events",
  description:
    "Correct types for the most common event handlers: click, change, submit, keyboard, and drag.",
  category: "events",
  code: `import {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  DragEvent,
} from "react"

// Button click
function handleClick(e: MouseEvent<HTMLButtonElement>) {
  e.preventDefault()
  console.log(e.currentTarget.textContent)
}

// Text input
function handleChange(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value)
}

// Select
function handleSelect(e: ChangeEvent<HTMLSelectElement>) {
  console.log(e.target.value)
}

// Form submit
function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const form = new FormData(e.currentTarget)
  console.log(form.get("email"))
}

// Keyboard
function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") console.log("Enter pressed")
  if (e.metaKey && e.key === "s") console.log("Cmd+S")
}

// Drag
function handleDrop(e: DragEvent<HTMLDivElement>) {
  const data = e.dataTransfer.getData("text/plain")
  console.log(data)
}`,
  do: `// ✓ Specific type — you get access to the right properties
function handleChange(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value)       // string ✓
  console.log(e.target.checked)     // boolean ✓
}`,
  dont: `// ✗ any removes all type safety
function handleChange(e: any) {
  console.log(e.target.value)       // TypeScript validates nothing
  console.log(e.target.nonexistent) // no error even if it doesn't exist
}`,
  playground: { files: {} },
}
