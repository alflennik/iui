const process = sourceCode => {
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
  const ast = parse({ lexemes, blockIds })
  // console.log(prettyFormatAst(ast))
  // console.log()
  return ast
}

const tokenize = sourceCode => {
  const matchers = [
    // strings
    { match: /^"[^"]*"/ },
    // any names, numbers, type name or keywords
    { match: /^&?[a-zA-Z0-9]+/ },
    // also numbers can include underscores (not at the beginning or end)
    { match: /^[0-9][0-9_]*[0-9]+/ },
    // symbols that aren't whitespace sensitive
    { match: /^[\[\]\(\):]/ },
    // symbols that are whitespace sensitive
    { match: /^[=*+\-?|]+/ },
    // whitespace
    { match: /^\s/ },
  ]

  let tokens = []
  let remainingSourceCode = sourceCode

  let safetySwitch = 0

  while (remainingSourceCode.length) {
    safetySwitch += 1

    let success = false

    for (matcher of matchers) {
      const match = remainingSourceCode.match(matcher.match)
      if (match) {
        tokens.push({ id: getId(), content: match[0] })
        remainingSourceCode = remainingSourceCode.substring(match[0].length)
        success = true
        break
      }
    }

    if (!success) throw new Error("Unexpected character encountered")

    if (safetySwitch > 100_000) throw new Error("Infinite loop detected")
  }

  if (remainingSourceCode) {
    throw new Error("Failed to parse")
  }

  return tokens
}

const lex = tokens => {
  const lexemes = []
  const openBlocks = []
  const blockIds = {}

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    const previousToken = tokens[i - 1]
    const previousLexeme = lexemes[lexemes.length - 1]
    const nextToken = tokens[i + 1]

    if (token.content.match(/^\s/)) continue // ignore whitespace now

    if (previousToken?.content != "." && token.content.match(/(await)/)) {
      lexemes.push({ id: getId(), content: `.${token.content}` })
      continue
    }

    if (token.content.match(/^[0-9]/)) {
      const withoutUnderscores = token.content.replace(/_/g, "")
      lexemes.push({ id: getId(), content: `.number(${withoutUnderscores})` })
      continue
    }

    if (token.content.match(/^&?[a-zA-Z0-9]+/)) {
      lexemes.push({ id: getId(), content: `.name(${token.content})` })
      continue
    }

    if (token.content.startsWith('"')) {
      const blockStartId = getId()
      const blockEndId = getId()
      blockIds[blockStartId] = blockEndId
      lexemes.push(
        { id: blockStartId, content: ".stringStart" },
        { id: getId(), content: `.stringContent(${token.content})` },
        { id: blockEndId, content: ".stringEnd" }
      )
      continue
    }

    if (token.content === "=") {
      lexemes.push({ id: getId(), content: ".assign" })
      continue
    }

    if (token.content === "==") {
      lexemes.push({ id: getId(), content: ".equals" })
      continue
    }

    if (token.content === "?") {
      lexemes.push({ id: getId(), content: ".ternaryIf" })
      continue
    }
    if (token.content === ":" && previousToken.content?.match(/^\s/)) {
      lexemes.push({ id: getId(), content: ".ternaryElse" })
      continue
    }

    if (token.content === "+") {
      lexemes.push({ id: getId(), content: ".add" })
      continue
    }

    if (token.content === "-") {
      if (nextToken?.match(/^\s/)) {
        lexemes.push({ id: getId(), content: ".subtract" })
        continue
      }
      lexemes.push({ id: getId(), content: ".negate" })
      continue
    }

    if (token.content === "*") {
      lexemes.push({ id: getId(), content: ".multiply" })
      continue
    }

    if (token.content === "(") {
      const id = getId()
      if (previousLexeme && !previousLexeme.content.startsWith(".name")) {
        openBlocks.push([id, ".parenthesesStart"])
        lexemes.push({ id, content: ".parenthesesStart" })
        continue
      } else {
        lexemes.push({ id: getId(), content: ".call" })
        lexemes.push({ id, content: ".argumentsStart" })
        openBlocks.push([id, ".argumentsStart"])
        continue
      }
    }

    if (token.content === ")") {
      const [blockStartId, blockOpenedAs] = openBlocks.pop()
      const id = getId()
      if (!blockStartId) throw new Error("Mismatched parentheses")

      blockIds[blockStartId] = id

      if (blockOpenedAs === ".parenthesesStart") {
        lexemes.push({ id, content: ".parenthesesEnd" })
        continue
      } else {
        lexemes.push({ id, content: ".argumentsEnd" })
        continue
      }
    }

    throw new Error("Failed to process syntax")
  }

  return { lexemes, blockIds }
}

const parse = ({ lexemes, blockIds }) => {
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

    const blockAstNodes = parse({ lexemes: blockContents.slice(1, -1), blockIds })

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

const getId = () => Math.random().toString().slice(2, 10)
const deepClone = data => JSON.parse(JSON.stringify(data))

module.exports = {
  process,
}
