import { parseExpression } from "./parseExpression.js"

const parseString = () => {
  const stringStartBracket = tokenizer.nextToken().value
  const currentUnderscores = Array.from(stringStartBracket)
    .filter(character => character === "_")
    .join("")
  const stringEndBracket = `"${currentUnderscores}`
  const substitutionStartBracket = `${currentUnderscores}{`
  const substitutionEndBracket = `}${currentUnderscores}`

  const parts = []

  while (true) {
    const token = tokenizer.nextToken()

    if (token.value === stringEndBracket) {
      break
    }

    if (token.value === substitutionStartBracket) {
      if (tokenizer.peekToken().value === substitutionEndBracket) {
        tokenizer.nextToken()
        continue
      }

      const expression = parseExpression()

      if (tokenizer.peekToken().value !== substitutionEndBracket) {
        return { error: "Invalid string" }
      }
      tokenizer.nextToken()

      parts.push({ type: "substitution", expression })
      continue
    }

    if (token.type === "string") {
      let text = ""
      let runningWhitespace = ""
      let line = 0
      let indentationLength = null
      let indentationCharacter = null
      let lastNonwhitespaceCharacterSeen = null

      const characters = Array.from(token.value)
      console.log(token.value)
      let i = 0
      let character = characters[i]
      while (true) {
        const advanceCharacters = count => {
          i += count
          character = characters[i]
        }

        if (!character) {
          break
        } else if (character === " " || character === "\t") {
          runningWhitespace += character
        } else if (character === "\n") {
          line += 1
          runningWhitespace = ""
          text += lastNonwhitespaceCharacterSeen === "\\" ? "" : " "
          if (line > 1) {
            let shouldBreakFromReachingEnd = false

            advanceCharacters(1)

            for (let j = 0; j < indentationLength; j += 1) {
              if (character !== indentationCharacter) {
                if (!character) {
                  shouldBreakFromReachingEnd = true
                  break
                }

                if (character === " " || character === "\t") {
                  throw new Error(
                    "Indention contains a mix of spaces and tabs, you must use one or the other"
                  )
                }

                throw new Error("Indentation did not match the second line of the string")
              }

              advanceCharacters(1)
            }

            if (shouldBreakFromReachingEnd) break
            continue
          }
        } else {
          if (line === 1 && indentationLength === null) {
            if (runningWhitespace.includes("\t")) {
              if (runningWhitespace.includes(" ")) {
                throw new Error(
                  "Indention contains a mix of spaces and tabs, you must use one or the other"
                )
              } else {
                indentationCharacter = "\t"
              }
            } else {
              indentationCharacter = " "
            }
            indentationLength = runningWhitespace.length
            runningWhitespace = ""
          }
          text += runningWhitespace
          runningWhitespace = ""
          text += character
          lastNonwhitespaceCharacterSeen = character
        }

        advanceCharacters(1)
      }

      text += runningWhitespace

      parts.push({ type: "text", text })
      continue
    }

    return { error: "Invalid string" }
  }

  return { type: "string", parts }
}

export { parseString }
