const lex = require("./lexer")
const tokenize = require("./tokenizer")

const parse = sourceCode => {
  // console.log(sourceCode)
  const tokens = tokenize(sourceCode)
  // console.log(tokens.map(token => token.content).join("•"))
  const { lexemes, blockIds } = lex(tokens)
  // console.log(JSON.stringify(lexemes))
  // console.log(lexemes.map(lexeme => lexeme.content).join("•"))

  const prettyFormatAst = (nodes, indentLevel = 0) => {
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
            childrenFormatted = prettyFormatAst(childrenRaw, indentLevel + 1)
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
  const ast = parseOperators({ lexemes, blockIds })
  // console.log(prettyFormatAst(ast))
  // console.log()
  return ast
}

const parseOperators = ({ lexemes, blockIds }) => {
  const matchersInOrderOfPrecedence = [
    { match: /Start$/, isBlock: true },
    { match: /^(\.name|\.number)/, ignoreForPrecedence: true },
    { match: /^\.stringContent/, ignoreForPrecedence: true },
    { match: /^\.assign$/ },
    { match: /^\.ternaryIf$/ },
    { match: /^\.ternaryElse$/ },
    { match: /^\.equals$/ },
    { match: /^\.add$/ },
    { match: /^\.multiply$/ },
    { match: /^\.call$/ },
  ]

  const lexemeIdsByPrecedence = {}
  const nestedBlocks = [] // will parse separately

  lexemeIndexesById = Object.fromEntries(lexemes.map(({ id }, index) => [id, index]))

  lexemeLoop: for (let i = 0; i < lexemes.length; i += 1) {
    const lexeme = lexemes[i]

    for (let j = 0; j < matchersInOrderOfPrecedence.length; j += 1) {
      const matcher = matchersInOrderOfPrecedence[j]
      const precedenceIndex = j

      const match = lexeme.content.match(matcher.match)
      if (match) {
        if (matcher.ignoreForPrecedence === true) {
          continue lexemeLoop
        }
        if (matcher.isBlock) {
          const startId = lexeme.id
          const endId = blockIds[startId]
          const startIndex = lexemeIndexesById[startId]
          const endIndex = lexemeIndexesById[endId]
          const blockContents = lexemes.slice(startIndex, endIndex + 1)
          nestedBlocks.push({ startId, endId, blockContents })
          i += blockContents.length - 1
          continue lexemeLoop
        }

        lexemeIdsByPrecedence[precedenceIndex] = lexeme.id
        continue lexemeLoop
      }
    }

    throw new Error("Unrecognized lexeme")
  }

  let astInProgress = deepClone(lexemes)

  let nodeIndexesById
  const refreshNodeIndexesById = () => {
    nodeIndexesById = Object.fromEntries(astInProgress.map(({ id }, index) => [id, index]))
  }
  refreshNodeIndexesById()

  nestedBlocks.forEach(nestedBlock => {
    const { startId, blockContents } = nestedBlock
    const startIndex = nodeIndexesById[startId]
    const blockName = astInProgress[startIndex].content.match(/^\.(.+)Start$/)[1]

    const blockAstNodes = parseOperators({ lexemes: blockContents.slice(1, -1), blockIds })

    const astNode = { id: startId, content: [`.${blockName}`, blockAstNodes] }

    astInProgress.splice(startIndex, blockContents.length, astNode)
    refreshNodeIndexesById()
  })

  const lexemesIdsInProcessOrder = Object.values(lexemeIdsByPrecedence).reverse()

  const operatorTypes = {
    ".assign": "midfixBinary",
    ".ternaryIf": "midfixBinary",
    ".ternaryElse": "midfixBinary",
    ".multiply": "midfixBinary",
    ".add": "midfixBinary",
    ".equals": "midfixBinary",
    ".call": "midfixBinary",
  }

  lexemesIdsInProcessOrder.forEach(id => {
    const index = nodeIndexesById[id]
    const lexeme = astInProgress[index]
    let astNode
    if (operatorTypes[lexeme.content] === "midfixBinary") {
      astNode = {
        id,
        content: [lexeme.content, [astInProgress[index - 1], astInProgress[index + 1]]],
      }
    }
    if (!astNode) {
      throw new Error("Failed to process operator")
    }
    astInProgress.splice(index - 1, 3, astNode)
    refreshNodeIndexesById()
  })

  ast = astInProgress
  return ast
}

const deepClone = data => JSON.parse(JSON.stringify(data))

module.exports = parse
