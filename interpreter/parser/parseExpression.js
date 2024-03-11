const { tokenStream } = require("./parse")
const { parseAssignment } = require("./parseAssignment")
const {
  parseFunction,
  parseAsyncFunction,
  parseAwait,
  parseUnawait,
  parseCall,
} = require("./parseFunction")
const { parseGiven } = require("./parseGiven")
const { parseIf } = require("./parseIf")
const { parseNotice } = require("./parseNotice")
const { parseDestructure, parseObject } = require("./parseObject")
const { operators, parseOperator } = require("./parseOperator")
const { parseSubscript } = require("./parseSubscript")
const { skipTerm } = require("./skipTerm")

const continuations = [
  [
    // As in: user.password
    [{ value: ".", hasWhitespaceRight: false }],
    parseSubscript,
  ],
  [
    // As in: logOut()
    [{ value: "(", hasWhitespaceLeft: false }],
    parseCall,
  ],
  [
    // As in: homework<?>
    [{ type: "notice", hasWhitespaceLeft: false }],
    parseNotice,
  ],
  [
    // As in: 1 + 1 or 99 / 9
    [
      {
        matchValue: value => operators.includes(value),
        hasWhitespaceLeft: true,
        hasWhitespaceRight: true,
      },
    ],
    parseOperator,
  ],
]

const statementOnlyContinuations = [
  [
    // abc = 123
    [{ value: "=", hasWhitespaceLeft: true, hasWhitespaceRight: true }],
    parseAssignment,
  ],
]

const parseExpression = ({ isStatement }) => {
  if (tokenStream.matches([{ value: "(" }])) {
    // As in: (a:) { * a }
    if (
      tokenStream.matches([
        { bracketPair: "()" },
        { matchValue: value => value === "{" || value === ":", whitespaceLeft: " " },
      ])
    ) {
      return continueExpression(parseFunction(), { isStatement })
    }

    // As in: (1 + 1) / 50
    skipTerm("(")
    result = parseExpression({ isStatement })
    skipTerm(")")
    return result
  }
  if (tokenStream.matches([{ value: "async" }])) {
    return continueExpression(parseAsyncFunction(), { isStatement })
  }
  if (tokenStream.matches([{ value: "if" }])) {
    return continueExpression(parseIf(), { isStatement })
  }
  if (tokenStream.matches([{ value: "given" }])) {
    return continueExpression(parseGiven(), { isStatement })
  }
  if (tokenStream.matches([{ value: "[" }])) {
    if (tokenStream.matches([{ bracketPair: "[]" }, { value: "=" }])) {
      return parseDestructure()
    }
    return continueExpression(parseObject(), { isStatement })
  }
  if (tokenStream.matches([{ value: "await" }])) {
    return continueExpression(parseAwait(), { isStatement })
  }
  if (tokenStream.matches([{ value: "unawait" }])) {
    return continueExpression(parseUnawait(), { isStatement })
  }
}

const continueExpression = (currentExpression, { isStatement }) => {
  while (true) {
    let continuation = continuations.find(continuation => {
      return tokenStream.matches(continuation[0])
    })

    if (!continuation && isStatement) {
      continuation = statementOnlyContinuations.find(continuation => {
        return tokenStream.matches(continuation[0])
      })
    }

    if (continuation) {
      currentExpression = continuation[1](currentExpression, tokenStream)
    }

    break
  }

  if (tokenStream.matches({ hasNewlineLeft: true })) {
    return currentExpression
  }

  failedToParse(tokenStream)
}

module.exports = { parseExpression, continueExpression }
