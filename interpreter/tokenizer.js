const getTokenStream = characterStream => {
  /* prettier-ignore */
  const keywords = [
    "true", "false", "null", "if", "else", "given", "import", "watch", "async", "await", "unawait",
    "try"
  ]
  /* prettier-ignore */
  const symbols = [
    "[", "]", "{", "}", "(", ")", ":", ";", "<", ">", "+", "-", "=", "/", ".", "!", "?", "%", "*"
  ]

  const isKeyword = word => keywords.includes(word)

  const isDigitStart = character => character.match(/[0-9]/)
  const isDigitBody = character => character.match(/[0-9,\.]/)
  const isStringStart = character => character === '"'
  const isStringBody = character => character !== '"'
  const isStringEnd = isStringStart
  const isDigitEnd = character => character.match(/[0-9]/)
  const isIdentifierStart = character => character.match(/[&a-zA-Z]/)
  const isIdentifierBody = character => character.match(/[a-zA-Z0-9]/)
  const isSymbol = character => symbols.includes(character)
  const isWhitespace = character => [" ", "\t", "\n"].includes(character)
  // Need comments too

  const readWhile = ({ start: startCondition, body: bodyCondition, end: endCondition }) => {
    let token = ""
    while (!characterStream.isEndOfFile()) {
      const character = characterStream.peekCharacter()
      const isFirstCharacter = token.length === 0
      if ((isFirstCharacter && startCondition(character)) || bodyCondition(character)) {
        token += characterStream.nextCharacter()
      } else if (endCondition(character)) {
        token += characterStream.nextCharacter()
        break
      } else {
        break
      }
    }
    return token
  }

  const readWhitespace = () => {
    const token = readWhile({ start: isWhitespace, body: isWhitespace, end: isWhitespace })
    return { type: "whitespace", token }
  }

  const readString = () => {
    const token = readWhile({ start: isStringStart, body: isStringBody, end: isStringEnd })
    return { type: "string", token }
  }

  const readNumber = () => {
    const token = readWhile({ start: isDigitStart, body: isDigitBody, end: isDigitEnd })
    return { type: "number", token }
  }

  const readSymbol = () => {
    const token = readWhile({ start: isSymbol, body: isSymbol, end: isSymbol })
    return { type: "symbol", token }
  }

  const readIdentifier = () => {
    const token = readWhile({
      start: isIdentifierStart,
      body: isIdentifierBody,
      end: isIdentifierBody,
    })

    return isKeyword(token) ? { type: "keyword", token } : { type: "declaration", token }
  }

  const nextToken = () => {
    if (characterStream.isEndOfFile()) return null

    const character = characterStream.peekCharacter()
    if (!character) {
      console.log()
    }

    if (isWhitespace(character)) return readWhitespace()
    if (isDigitStart(character)) return readNumber()
    if (isStringStart(character)) return readString()
    if (isIdentifierStart(character)) return readIdentifier()
    if (isSymbol(character)) return readSymbol()

    characterStream.fail(`Failed to read token at character "${character}"`)
  }

  return { nextToken }
}

module.exports = getTokenStream
