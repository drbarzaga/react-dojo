export type HookCategory = "state" | "dom" | "utility" | "async"

export interface CustomHook {
  id: string
  label: string
  description: string
  category: HookCategory
  code: string
  playground: {
    files: Record<string, string>
    dependencies?: Record<string, string>
  }
}
