const getId = require("../utilities/getId")

const lex = tokens => {
  const lexemes = []
  const openBlocks = []
  const blockIds = {}

  const startId = getId()
  lexemes.push({ id: startId, content: "fileStart" })

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    const previousToken = tokens[i - 1]
    const previousLexeme = lexemes[lexemes.length - 1]
    const nextToken = tokens[i + 1]

    if (token.content.match(/^\s/)) continue // ignore whitespace now

    if (previousToken?.content != "." && token.content.match(/(await|return|if|else)/)) {
      lexemes.push({ id: getId(), content: token.content })
      continue
    }

    if (token.content.match(/^[0-9]/)) {
      const withoutUnderscores = token.content.replace(/_/g, "")
      lexemes.push({ id: getId(), content: ["number", withoutUnderscores] })
      continue
    }

    if (token.content.match(/^&?[a-zA-Z0-9]+/)) {
      let isArrowFunction = false
      if (nextToken.content === "=>") {
        isArrowFunction = true
        i += 1
      } else if (nextToken.content.match(/^\s+$/) && tokens[i + 2].content === "=>") {
        isArrowFunction = true
        i += 2
      }

      if (isArrowFunction) {
        const blockStartId = getId()
        const blockEndId = getId()
        blockIds[blockStartId] = blockEndId
        lexemes.push(
          { id: blockStartId, content: "parametersStart" },
          { id: token.id, content: ["name", token.content] },
          { id: blockEndId, content: "parametersEnd" },
          { id: getId(), content: "function" }
        )
        continue
      }
      lexemes.push({ id: getId(), content: ["name", token.content] })
      continue
    }

    if (token.content === "{") {
      const id = getId()
      openBlocks.push([id, "statementsStart"])
      lexemes.push({ id, content: "statementsStart" })
      continue
    }

    if (token.content === "}") {
      const [blockStartId, blockOpenedAs] = openBlocks.pop()
      const id = getId()
      if (!blockStartId || blockOpenedAs !== "statementsStart") throw new Error("Mismatched braces")

      blockIds[blockStartId] = id

      lexemes.push({ id, content: "statementsEnd" })
      continue
    }

    if (token.content.startsWith('"') || token.content.startsWith("'")) {
      const blockStartId = getId()
      const blockEndId = getId()
      blockIds[blockStartId] = blockEndId
      lexemes.push(
        { id: blockStartId, content: "stringStart" },
        { id: getId(), content: ["stringContent", token.content] },
        { id: blockEndId, content: "stringEnd" }
      )
      continue
    }

    if (token.content === "=") {
      lexemes.push({ id: getId(), content: "assign" })
      continue
    }

    if (token.content === "==") {
      lexemes.push({ id: getId(), content: "equals" })
      continue
    }

    if (token.content === "?") {
      lexemes.push({ id: getId(), content: "ternary" })
      continue
    }
    if (token.content === ":" && previousToken.content?.match(/^\s/)) {
      lexemes.push({ id: getId(), content: "ternaryElse" })
      continue
    }

    if (token.content === "+") {
      lexemes.push({ id: getId(), content: "add" })
      continue
    }

    if (token.content === ".") {
      lexemes.push({ id: getId(), content: "read" })
      continue
    }

    if (token.content === "-") {
      if (nextToken?.match(/^\s/)) {
        lexemes.push({ id: getId(), content: "subtract" })
        continue
      }
      lexemes.push({ id: getId(), content: "negate" })
      continue
    }

    if (token.content === "*") {
      lexemes.push({ id: getId(), content: "multiply" })
      continue
    }

    if (token.content === "(") {
      const id = getId()
      if (previousLexeme && previousLexeme.content[0] !== "name") {
        openBlocks.push([id, "parenthesesStart"])
        lexemes.push({ id, content: "parenthesesStart" })
        continue
      } else {
        lexemes.push({ id: getId(), content: "call" })
        lexemes.push({ id, content: "argumentsStart" })
        openBlocks.push([id, "argumentsStart"])
        continue
      }
    }

    if (token.content === ")") {
      const [blockStartId, blockOpenedAs] = openBlocks.pop()
      const id = getId()
      if (!blockStartId) throw new Error("Mismatched parentheses")

      blockIds[blockStartId] = id

      if (blockOpenedAs === "parenthesesStart") {
        lexemes.push({ id, content: "parenthesesEnd" })
        continue
      } else {
        lexemes.push({ id, content: "argumentsEnd" })
        continue
      }
    }

    if (token.content === "[") {
      const id = getId()
      openBlocks.push([id, "objectStart"])
      lexemes.push({ id, content: "objectStart" })
      continue
    }

    if (token.content === "]") {
      const [blockStartId, blockOpenedAs] = openBlocks.pop()
      const id = getId()
      if (!blockStartId || blockOpenedAs !== "objectStart") throw new Error("Mismatched brackets")

      blockIds[blockStartId] = id

      lexemes.push({ id, content: "objectEnd" })
      continue
    }

    if (token.content === ":" && openBlocks.at(-1)?.[1] === "objectStart") {
      lexemes.push({ id: token.id, content: "named" })
      continue
    }

    throw new Error("Failed to process syntax")
  }

  const endId = getId()
  blockIds[startId] = endId
  lexemes.push({ id: endId, content: "fileEnd" })

  return { lexemes, blockIds }
}

module.exports = lex
