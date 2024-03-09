const getCharacterStream = code => {
  let index = 0
  let line = 1
  let column = 1

  const nextCharacter = () => {
    const character = code[index]

    index += 1

    if (character === "\n") {
      line += 1
      column = 1
    } else {
      column += 1
    }

    return character
  }

  const peekCharacter = () => {
    return code[index]
  }

  const isEndOfFile = () => {
    return peekCharacter() === undefined
  }

  const fail = message => {
    throw new Error(`${message} at ${line}:${column}`)
  }

  return { nextCharacter, peekCharacter, isEndOfFile, fail }
}

module.exports = getCharacterStream
