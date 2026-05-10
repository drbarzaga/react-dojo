import type { Plugin } from "prettier"

type Parser = "babel" | "babel-ts" | "css" | "html" | "json"

function detectParser(filename: string): Parser | null {
  if (/\.(jsx?|mjs|cjs)$/.test(filename)) return "babel"
  if (/\.(tsx?|mts|cts)$/.test(filename)) return "babel-ts"
  if (/\.(css|scss|less)$/.test(filename)) return "css"
  if (/\.(html?)$/.test(filename)) return "html"
  if (/\.jsonc?$/.test(filename)) return "json"
  return null
}

async function loadPlugins(parser: Parser): Promise<Plugin[]> {
  if (parser === "babel" || parser === "babel-ts" || parser === "json") {
    const [babel, estree] = await Promise.all([
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
    ])
    return [estree.default as Plugin, babel.default as Plugin]
  }
  if (parser === "css") {
    const css = await import("prettier/plugins/postcss")
    return [css.default as Plugin]
  }
  if (parser === "html") {
    const html = await import("prettier/plugins/html")
    return [html.default as Plugin]
  }
  return []
}

export async function formatCode(code: string, filename: string): Promise<string | null> {
  const parser = detectParser(filename)
  if (!parser) return null

  try {
    const standalone = await import("prettier/standalone")
    const plugins = await loadPlugins(parser)

    const formatted = await standalone.format(code, {
      parser,
      plugins,
      semi: false,
      singleQuote: false,
      trailingComma: "es5",
      tabWidth: 2,
      printWidth: 100,
    })
    return formatted
  } catch (error) {
    console.warn("[playground] format failed:", error)
    return null
  }
}
