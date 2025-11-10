const getId = require("../utilities/getId")

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

module.exports = tokenize
