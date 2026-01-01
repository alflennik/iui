const getId = require("../utilities/getId")

const tokenize = sourceCode => {
  const matchers = [
    // strings
    { match: /^"[^"]*"/ },
    { match: /^'[^']*'/ },
    // any names, type name or keywords
    { match: /^&?[a-zA-Z][a-zA-Z0-9]*/ },
    // numbers which can include underscores (not at the beginning or end) and one dot (not at end)
    // No underscores next to the dot
    { match: /^\d[\d_]+\d\.\d[\d_]+\d/ }, // dot and underscores on both sides
    { match: /^\d[\d_]+\d\.\d/ }, // dot and underscores on left
    { match: /^\d*\.\d[\d_]+\d/ }, // dot and underscores on right
    { match: /^\d*\.\d+/ }, // dot at beginning or middle
    { match: /^\d+/ },
    // symbols that aren't whitespace sensitive
    { match: /^[\[\]\(\):{}\.]/ },
    { match: /^=>/ },
    // symbols that are whitespace sensitive
    { match: /^[=*+\-?|]+/ },
    // whitespace
    { match: /^[ \t]+/ }, // spaces and tabs
    { match: /^\n/ }, // handle newlines separately since they have parsing implications
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

    if (!success) {
      throw new Error("Unexpected character encountered")
    }

    if (safetySwitch > 100_000) {
      throw new Error("Infinite loop detected")
    }
  }

  if (remainingSourceCode) {
    throw new Error("Failed to parse")
  }

  return tokens
}

module.exports = tokenize
