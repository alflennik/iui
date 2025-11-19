const lex = require("./lexer")
const tokenize = require("./tokenizer")
const parse = require("./parser")

const compile = sourceCode => {
  console.log(sourceCode)

  const tokens = tokenize(sourceCode)
  console.log(tokens.map(token => token.content).join("•"))

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

  const stripIds = sourceTreeNode => {
    if (sourceTreeNode.content) {
      return [
        sourceTreeNode.content[0],
        ...sourceTreeNode.content.slice(1).map(sourceTreeNode => stripIds(sourceTreeNode)),
      ]
    }
    return sourceTreeNode
  }
  const sourceTreeClean = sourceTree.map(node => stripIds(node))

  console.log(JSON.stringify(sourceTree, null, 2))
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
      const isDeepestNode = !node.content?.[1]?.[0]?.id
      if (isDeepestNode) {
        return `${whitespace}.${node.content[0]}(${node.content[1]})`
      }
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

      return `${whitespace}.${name}(\n${childrenFormatted}\n${whitespace})`
    })
    .join("\n")
}

module.exports = compile
