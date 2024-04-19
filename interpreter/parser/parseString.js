import { parseExpression } from "./parseExpression.js"

const parseString = () => {
  console.log(tokenizer.peekToken())
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
      parts.push({ type: "text", text: token.value })
      continue
    }

    return { error: "Invalid string" }
  }

  return { type: "string", parts }
}

export { parseString }
