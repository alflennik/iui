const lex = require("./lexer")
const tokenize = require("./tokenizer")
const parse = require("./parser")

const compile = sourceCode => {
  console.log(sourceCode)

  const tokens = tokenize(sourceCode)
  console.log(
    tokens.map(token => (token.stringContent ? token.stringContent : token.content)).join("•")
  )

  const { lexemes, blockIds } = lex(tokens)

  console.log(JSON.stringify(lexemes))
  console.log(
    lexemes
      .map(lexeme =>
        Array.isArray(lexeme.content)
          ? `.${lexeme.content[0]}(${lexeme.content[1]})`
          : `.${lexeme.content}`
      )
      .join("•")
  )
  const sourceTree = parse({ lexemes, blockIds })

  console.log(JSON.stringify(sourceTree, null, 2))
  console.log(prettyFormatSourceTree(sourceTree))

  console.log(JSON.stringify(sourceTree, null, 2))

  return sourceTree
}

const prettyFormatSourceTree = (node, indentLevel = 0) => {
  let whitespace = ""
  for (i = 0; i < indentLevel; i += 1) {
    whitespace += "  "
  }

  const isDeepestNode = !Array.isArray(node[1])
  if (isDeepestNode) {
    return `${whitespace}.${node[0]}(${node[1]})`
  }
  const name = node[0]
  const childrenRaw = node.slice(1)

  const childrenFormatted = childrenRaw
    .map(childRaw => prettyFormatSourceTree(childRaw, indentLevel + 1))
    .join("\n")

  return `${whitespace}.${name}(\n${childrenFormatted}\n${whitespace})`
}

module.exports = compile
