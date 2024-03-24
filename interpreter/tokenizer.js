const getTokenizer = (code, filePath) => {
  let index = 0
  let line = 1
  let column = 1

  const getSyntaxError = message => {
    if (filePath) {
      throw new Error(`${message} at ${filePath}:${line}:${column}`)
    } else {
      throw new Error(`${message} at ${line}:${column}`)
    }
  }

  const tokens = []
  const openBrackets = []
  const brackets = {}

  // These two booleans are not meant to both be true at the same time, these values will alternate
  // between true and false when handling nested strings like "apples {"bananas"}".
  let isString
  let isStringEscape

  while (true) {
    const character = code[index]
    console.log(`${code.slice(0, index)}>${code.substr(index)}`)

    if (character === undefined) break

    const advanceCharacters = characterCount => {
      for (let i = 0; i < characterCount; i += 1) {
        index += 1

        if (character === "\n") {
          line += 1
          column = 1
        } else {
          column += 1
        }
      }
    }

    // Strings can be formatted like "" but also, to escape characters within, they can be like
    // _"He said, "Yo.""_, which allows quotes within the string. There is even
    // __"You can double escape and include _""_ in there."__ with as many underscores as desired.
    let stringBracket

    const isStringStart = () => {
      stringBracket = undefined
      if (isString || !(character === '"' || character === "_")) return false
      if (character === '"') {
        stringBracket = '"'
        return true
      }
      stringBracket = "_"
      let peek = 1
      while (true) {
        peekCharacter = code[index + peek]
        if (peekCharacter === "_") {
          stringBracket += "_"
          peek += 1
        } else if (peekCharacter === '"') {
          stringBracket += '"'
          return true
        } else {
          stringBracket = undefined
          return false
        }
      }
    }

    if (isStringStart()) {
      isString = true
      isStringEscape = false
      openBrackets.push({ bracket: stringBracket, line, column, index })
      tokens.push({ type: "term", value: stringBracket, line, column })
      advanceCharacters(stringBracket.length)
      continue
    }

    let stringEscapeBracket
    const isStringEscapeStart = () => {
      stringEscapeBracket = undefined
      if (isStringEscape || !(character === "{" || character === "_")) return false
      if (character === "{") {
        stringEscapeBracket = "{"
        return true
      }
      stringEscapeBracket = "_"
      let peek = 1
      while (true) {
        peekCharacter = code[index + peek]
        if (peekCharacter === "_") {
          peek += 1
          stringEscapeBracket += "_"
        } else if (peekCharacter === "{") {
          stringEscapeBracket += "{"
          return true
        } else {
          stringEscapeBracket = undefined
          return false
        }
      }
    }

    if (isStringEscapeStart()) {
      isString = false
      isStringEscape = true

      // When the tokenizer encounters a string escape it should actually handle this as two tokens,
      // one token is the string up to this point and the other is the open brace for the escape.
      const currentStringBracket = openBrackets.at(-1)
      const string = code.slice(
        currentStringBracket.index + currentStringBracket.bracket.length,
        index
      )
      if (string.length) {
        tokens.push({
          type: "string",
          value: string,
          line: currentStringBracket.line,
          column: currentStringBracket.column,
        })
      }

      tokens.push({ type: "term", value: stringEscapeBracket, line, column })
      openBrackets.push({ bracket: stringEscapeBracket, line, column, index })
      advanceCharacters(stringEscapeBracket.length)
      continue
    }

    const isStringEscapeEnd = () => {
      stringEscapeBracket = undefined
      if (!isStringEscape) return false
      const openingBracket = openBrackets.at(-1).bracket // Something like { or __{
      const closingBracket = `}${openingBracket.slice(0, -1)}`
      const peekAhead = code.slice(index, index + closingBracket.length)
      const peekAhead1More = code.slice(
        index + closingBracket.length,
        index + closingBracket.length + 1
      )
      if (peekAhead === closingBracket) {
        if (peekAhead1More === "_") {
          throw getSyntaxError('Unexpected token "_"')
        }
        stringEscapeBracket = closingBracket
        return true
      }
      return false
    }

    if (isStringEscapeEnd()) {
      advanceCharacters(stringEscapeBracket.length)
      isString = true
      isStringEscape = false
      const openBracket = openBrackets.splice(-1, 1)[0]
      brackets[`${openBracket.line}:${openBracket.column}`] = `${line}:${column}`
      tokens.push({ type: "term", value: stringEscapeBracket, line, column })
      continue
    }

    const isStringEnd = () => {
      stringBracket = undefined
      if (!isString || isStringEscape) return false
      const openingBracket = openBrackets.at(-1).bracket // Something like " or __"
      const closingBracket = `"${openingBracket.slice(0, -1)}`
      const peekAhead = code.slice(index, index + closingBracket.length)
      const peekAhead1More = code.slice(
        index + closingBracket.length,
        index + closingBracket.length + 1
      )
      if (peekAhead === closingBracket) {
        if (peekAhead1More === "_") {
          throw getSyntaxError('Unexpected token "_"')
        } else if (peekAhead1More === "{") {
          // Consider the fairly reasonable sentence, `She said, "hello."` If there is a greeting
          // variable, it turns into _"She said, "_{greeting}_""_. But the issue is the "_ which
          // appears part of the way through the string. Do you see that? So when a "_ is seen we
          // still need to check for { to resolve the ambiguity.
          return false
        }
        stringBracket = closingBracket
        return true
      }
      return false
    }

    if (isStringEnd()) {
      advanceCharacters(stringBracket.length)
      isString = false
      const openBracket = openBrackets.splice(-1, 1)[0]
      brackets[`${openBracket.line}:${openBracket.column}`] = `${line}:${column}`

      const currentString = code.slice(
        openBracket.index + openBracket.bracket.length,
        index - stringBracket.length
      )
      if (currentString.length) {
        tokens.push({ type: "string", value: currentString, line, column })
      }

      tokens.push({ type: "term", value: stringBracket, line, column })
      continue
    }

    if (character === "=") {
      tokens.push({ type: "term", value: "=", line, column })
      advanceCharacters(1)
      continue
    }

    if (!isString && character.match(/[a-z]/)) {
      let word = character
      let peek = 1
      while (true) {
        peekCharacter = code[index + peek]
        if (peekCharacter.match(/[a-zA-Z0-9]/)) {
          word += peekCharacter
          peek += 1
          continue
        }
        break
      }
      tokens.push({ type: "word", value: word, line, column })
      advanceCharacters(word.length)
      continue
    }

    advanceCharacters(1)
  }

  console.log(tokens)

  let tokenIndex = 0

  const matches = matchers => {}

  const readToken = () => {
    const nextToken = tokens[tokenIndex]
    tokenIndex += 1
    return nextToken
  }

  return { matches, readToken }
}

module.exports = getTokenizer
