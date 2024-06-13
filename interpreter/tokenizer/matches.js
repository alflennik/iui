const getMatcher = ({ tokens, getTokenIndex /* , brackets */ }) => {
  const matches = matchers => {
    let peekIndex = getTokenIndex()

    for (const matcher of matchers) {
      const peekToken = tokens[peekIndex]

      if (matcher.isEnd === true) return !peekToken

      if (!peekToken) return false

      if (matcher.type && matcher.type !== peekToken.type) return false

      if (matcher.value) {
        if (typeof matcher.value === "function") {
          if (!matcher.value(peekToken.value)) return false
        } else {
          if (matcher.value !== peekToken.value) return false
        }
      }

      if (matcher.hasNewlineLeft && !peekToken.whitespace.includes("\n")) return false

      peekIndex += 1
    }

    return true
  }
  return matches
}

export default getMatcher
