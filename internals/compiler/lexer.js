const getId = require("../utilities/getId")

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
      lexemes.push({ id: getId(), content: ".ternaryCondition" })
      continue
    }
    if (token.content === ":" && previousToken.content?.match(/^\s/)) {
      lexemes.push({ id: getId(), content: ".ternaryThen" })
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

module.exports = lex
