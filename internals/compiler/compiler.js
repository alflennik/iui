const lex = require("./lexer")
const tokenize = require("./tokenizer")
const parse = require("./parser")

const compile = sourceCode => {
  console.log(sourceCode)

  const tokens = tokenize(sourceCode)
  console.log(tokens.map(token => token.content).join("•"))

  const { lexemes, blockIds } = lex(tokens)

  console.log(JSON.stringify(lexemes))
  console.log(lexemes.map(lexeme => lexeme.content).join("•"))
  const sourceTree = parse({ lexemes, blockIds })

  console.log(prettyFormatSourceTree(sourceTree))

  return sourceTree
}

const prettyFormatSourceTree = (nodes, indentLevel = 0) => {
  let whitespace = ""
  for (i = 0; i < indentLevel; i += 1) {
    whitespace += "  "
  }

  return nodes
    .map(node => {
      if (Array.isArray(node.content)) {
        const name = node.content[0]
        const childrenRaw = node.content[1]

        let childrenFormatted
        if (Array.isArray(childrenRaw)) {
          childrenFormatted = prettyFormatSourceTree(childrenRaw, indentLevel + 1)
        } else if (childrenRaw == null) {
          childrenFormatted = ""
        } else {
          childrenFormatted = childrenRaw
        }

        return `${whitespace}${name}(\n${childrenFormatted}\n${whitespace})`
      }
      return `${whitespace}${node.content}`
    })
    .join("\n")
}

module.exports = compile
