const getId = require("../utilities/getId")

const tokenize = sourceCode => {
  const matchers = [
    // strings
    ...(() => {
      const stringMatchers = []

      const stringCharacters = ['"', "'" /* , "`" */]
      const levels = ["", "*" /* , '**', '***', '****', '*****' */]

      stringCharacters.forEach(stringCharacter => {
        levels.forEach(level => {
          const levelFormatted = level
            .split("")
            .map(char => `\\${char}`)
            .join("")

          stringMatchers.push(
            // something"
            // Ending the string needs to come before starting the string because otherwise every
            // level 0 quote would count as starting a new string
            {
              match: `^${stringCharacter}${levelFormatted}`,
              tokenizerMode: `${level}${stringCharacter}string`,
              endTokenizerMode: true,
            },
            // "something
            {
              match: `^${levelFormatted}${stringCharacter}`,
              startTokenizerMode: `${level}${stringCharacter}string`,
            },
            // "Hello, *{username}"
            {
              match: `^${levelFormatted}{`,
              tokenizerMode: `${level}${stringCharacter}string`,
              startTokenizerMode: `${level}stringReplacement`,
            },
            // The }, world" in "{greeting}, world"
            {
              match: /^}/,
              tokenizerMode: `${level}stringReplacement`,
              endTokenizerMode: true,
            },
            // String content where anything is allowed except the replacement or end string syntax
            {
              match: `(.*?)(?:(${stringCharacter}${levelFormatted}|${levelFormatted}{))`,
              tokenizerMode: `${level}${stringCharacter}string`,
              // Since the tokenizer already produces an array of strings, there needs to be a way
              // to distinguish source code from string content, otherwise they would get confused
              contentType: "stringContent",
            }
          )
        })
      })

      return stringMatchers
    })(),

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

  const tokenizerModes = []

  let safetySwitch = 0

  while (remainingSourceCode.length) {
    safetySwitch += 1

    let success = false

    const tokenizerMode = tokenizerModes.at(-1)

    for (matcher of matchers) {
      if (matcher.tokenizerMode && tokenizerMode !== matcher.tokenizerMode) continue

      const match = remainingSourceCode.match(matcher.match)
      if (match) {
        let content = match[1] !== undefined ? match[1] : match[0]

        remainingSourceCode = remainingSourceCode.substring(content.length)

        if (matcher.contentType) {
          tokens.push({ id: getId(), [matcher.contentType]: content, content: "" })
        } else {
          tokens.push({ id: getId(), content })
        }

        success = true

        if (matcher.startTokenizerMode) tokenizerModes.push(matcher.startTokenizerMode)
        if (matcher.endTokenizerMode) tokenizerModes.pop()
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

  if (tokenizerModes.length) {
    throw new Error("Syntax error")
  }

  return tokens
}

module.exports = tokenize
