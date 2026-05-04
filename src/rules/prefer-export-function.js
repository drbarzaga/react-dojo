function buildFixedFunctionDeclaration(declaration, context, name) {
  const sourceCode = context.sourceCode
  const arrowFunction = declaration.init

  const paramsText = arrowFunction.params.map((p) => sourceCode.getText(p)).join(", ")

  const bodyText = sourceCode.getText(arrowFunction.body)

  const asyncText = arrowFunction.async ? "async " : ""

  return `${asyncText}function ${name}(${paramsText}) ${bodyText}`
}

function createRuleLogic(context) {
  return {
    ExportNamedDeclaration(node) {
      if (node.declaration && node.declaration.type === "VariableDeclaration") {
        node.declaration.declarations.forEach((declaration) => {
          if (declaration.init && declaration.init.type === "ArrowFunctionExpression") {
            if (declaration.id && declaration.id.type === "Identifier") {
              const name = declaration.id.name
              const isComponent = /^[A-Z]/.test(name)
              const isHook = /^use[A-Z]/.test(name)

              if (isComponent || isHook) {
                context.report({
                  node: declaration,
                  messageId: "useExportFunction",
                  data: { name },
                  fix: function (fixer) {
                    const fixedFunctionDeclaration = buildFixedFunctionDeclaration(
                      declaration,
                      context,
                      name
                    )
                    return fixer.replaceText(node.declaration, fixedFunctionDeclaration)
                  },
                })
              }
            }
          }
        })
      }
    },
  }
}

const preferExportFunctionRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce using `export function` for components and hooks.",
    },
    messages: {
      useExportFunction:
        "Use 'export function {{name}}' instead of an arrow function for components and hooks.",
    },
    fixable: "code",
  },
  create: createRuleLogic,
}

export default preferExportFunctionRule
