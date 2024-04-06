const getTokenizer = (code, { filePath, startingLineNumber = 1 } = {}) => {
  let character = code[0]
  let index = 0
  let line = startingLineNumber
  let column = 1

  const errors = []

  const getSyntaxError = (message, { line: errorLine, column: errorColumn } = { line, column }) => {
    if (filePath) {
      return `${message}\n  at ${filePath}:${errorLine}:${errorColumn}`
    } else {
      return `${message}\n  at ${errorLine}:${errorColumn}`
    }
  }

  const tokens = []
  const openBrackets = []
  const brackets = {}
  let shouldBreak = false

  while (true) {
    if (shouldBreak) break

    // let fiftyBefore = index - 50 > 0 ? index - 50 : 0
    // console.log(code.slice(fiftyBefore, index) + ">" + code.slice(index, index + 100))
    // if (index >= 599) {
    //   console.log()
    // }

    let isString
    let isStringSubstitution
    let currentStringUnderscores

    const refreshValues = () => {
      isString = !!(openBrackets.at(-1) && openBrackets.at(-1).bracket.endsWith('"'))
      isStringSubstitution = !!(
        openBrackets.at(-2) &&
        openBrackets.at(-2).bracket.endsWith('"') &&
        openBrackets.at(-1).bracket.endsWith("{")
      )
      currentStringUnderscores =
        isString || isStringSubstitution
          ? Array.from(openBrackets.at(-1).bracket)
              .filter(char => char === "_")
              .join("")
          : ""
    }

    refreshValues()

    // After calling advanceCharacters remember to check shouldBreak
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
      character = code[index]

      if (character === undefined) shouldBreak = true

      refreshValues()
    }

    let stringBracket

    const isStringStart = () => {
      /* 
      Can be:
        "example string"
        _"example string"_
        __"example string"__
        \n"example string"
        \s"example string"
        _\n"example string"_
        __\s"example string"__
        \_\s"example string"_
        \__\s"example string"__
      */

      stringBracket = undefined
      const validFirstCharacter = ['"', "_", "\\"]
      const validSecondaryCharacter = ['"', "_", "\\", "n", "s"]

      if (isString || !validFirstCharacter.includes(character)) return false
      if (character === '"') {
        stringBracket = '"'
        return true
      }
      stringBracket = character
      let peek = 1
      while (true) {
        peekCharacter = code[index + peek]

        if (peekCharacter === '"') {
          stringBracket += '"'
          if (isStringStartBracket(stringBracket)) return true
          stringBracket = undefined
          return false
        }

        if (validSecondaryCharacter.includes(peekCharacter)) {
          peek += 1
          stringBracket += peekCharacter
          continue
        }

        stringBracket = undefined
        return false
      }
    }

    let stringSubstitutionBracket

    const isStringSubstitutionStart = () => {
      stringSubstitutionBracket = undefined
      if (!isString) return
      const openSubstitutionBracket = `${currentStringUnderscores}{`
      const peekAhead = code.slice(index, index + openSubstitutionBracket.length)
      if (peekAhead === openSubstitutionBracket) {
        stringSubstitutionBracket = openSubstitutionBracket
        return true
      }
      return false
    }

    const isStringSubstitutionEnd = () => {
      stringSubstitutionBracket = undefined
      if (!isStringSubstitution) return false
      const closingBracket = `}${currentStringUnderscores}`
      const peekAhead = code.slice(index, index + closingBracket.length)
      if (peekAhead === closingBracket) {
        stringSubstitutionBracket = closingBracket
        return true
      }
      return false
    }

    const isStringEnd = () => {
      stringBracket = undefined
      if (!isString || isStringSubstitution) return false
      const closingBracket = `"${currentStringUnderscores}`
      const peekAhead = code.slice(index, index + closingBracket.length)
      const peekAhead1More = code.slice(
        index + closingBracket.length,
        index + closingBracket.length + 1
      )
      if (peekAhead === closingBracket) {
        if (peekAhead1More === "_") {
          errors.push(
            getSyntaxError(
              `String should be closed with \`${closingBracket}\` but found an extra \`_\``,
              { line, column: column + closingBracket.length }
            )
          )
          shouldBreak = true
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

    if (isStringStart()) {
      openBrackets.push({ bracket: stringBracket, line, column, index })
      tokens.push({ type: "term", value: stringBracket, line, column })
      advanceCharacters(stringBracket.length)
      continue
    }

    if (isStringSubstitutionStart()) {
      tokens.push({ type: "term", value: stringSubstitutionBracket, line, column })
      openBrackets.push({ bracket: stringSubstitutionBracket, line, column, index })
      advanceCharacters(stringSubstitutionBracket.length)
      continue
    }

    if (isStringSubstitutionEnd()) {
      advanceCharacters(stringSubstitutionBracket.length)
      const openBracket = openBrackets.splice(-1, 1)[0]
      brackets[`${openBracket.line}:${openBracket.column}`] = `${line}:${column}`
      tokens.push({ type: "term", value: stringSubstitutionBracket, line, column })
      continue
    }

    if (isStringEnd()) {
      advanceCharacters(stringBracket.length)
      const openBracket = openBrackets.splice(-1, 1)[0]
      brackets[`${openBracket.line}:${openBracket.column}`] = `${line}:${column}`
      tokens.push({ type: "term", value: stringBracket, line, column })
      continue
    }

    if (isString) {
      let startingLine = line
      let startingColumn = column
      let value = ""
      let isEscapedCharacter
      while (true) {
        if (shouldBreak) break

        if (isEscapedCharacter) {
          isEscapedCharacter = false
        } else {
          if (isStringSubstitutionStart() || isStringEnd()) break
          if (character === "\\") isEscapedCharacter = true
        }

        value += character
        advanceCharacters(1)
      }
      tokens.push({ type: "string", value, line: startingLine, column: startingColumn })
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

  if (errors.length) return { errors }

  openBrackets.forEach((openBracket, index) => {
    if (openBracket.bracket.endsWith('"')) {
      errors.push(
        getSyntaxError(`Found open string \`${openBracket.bracket}\` which was not closed`, {
          line: openBracket.line,
          column: openBracket.column,
        })
      )
      return
    }

    const isInString = openBrackets[index - 1]?.bracket.endsWith('"')
    if (isInString && openBracket.bracket.endsWith("{")) {
      errors.push(
        getSyntaxError(
          `Found open string substitution "${openBracket.bracket}" which was not closed`,
          {
            line: openBracket.line,
            column: openBracket.column,
          }
        )
      )
      return
    }

    throw new Error("open bracket error not yet implemented")
  })

  console.log(openBrackets)
  console.log()

  if (errors.length) return { errors }

  // console.log(tokens)

  let tokenIndex = 0

  const matches = matchers => {}

  const readToken = () => {
    const nextToken = tokens[tokenIndex]
    tokenIndex += 1
    return nextToken
  }

  return { matches, readToken }
}

const isStringStartBracket = bracket => {
  // Can start with an optional \
  // Then any number of _
  // Then optionally \n or \s
  // Must end with "
  return !!bracket.match(/^(\\?_+|_*)(\\s|\\n|)"$/)
}

module.exports = { getTokenizer, isStringStartBracket }
