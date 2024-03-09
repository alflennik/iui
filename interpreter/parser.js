const parse = tokenStream => {
  /* prettier-ignore */
  const operatorPrecedence = {
    "||": 2, "&&": 3, "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7, "+": 10, "-": 10, ".": 20,
    "/": 20,
  }
  const operators = Object.keys(operatorPrecedence)

  const continueExpression = left => {
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
        // TODO: should only be allowed in statements
        // abc = 123
        [{ value: "=", hasWhitespaceLeft: true, hasWhitespaceRight: true }],
        parseAssignment,
      ],
      [
        [
          {
            matchValue: value => operators.includes(value),
            hasWhitespaceLeft: true,
            hasWhitespaceRight: true,
          },
        ],
        parseBinaryOperator,
      ],
    ]

    let currentExpression = left
    while (true) {
      const continuation = continuations.find(continuation => {
        return tokenStream.matches(continuation[0])
      })

      if (continuation) {
        currentExpression = continuation[1](currentExpression, tokenStream)
      }

      break
    }

    if (tokenStream.matches({ hasNewlineLeft: true })) {
      return currentExpression
    } else {
      skipTerm({ value: ";;" })
      return currentExpresion
    }
  }

  const parseExpression = () => {
    if (tokenStream.matches([{ value: "(" }])) {
      // As in: (a:) { * a }
      if (tokenStream.matches([{ bracketPair: "()" }, { value: "{", whitespaceLeft: " " }])) {
        return continueExpression(parseFunction())
      }

      // As in: (1 + 1) / 50
      skipTerm("(")
      result = parseExpression()
      skipTerm(")")
      return result
    }
    if (tokenStream.matches([{ value: "async" }])) {
      return continueExpression(parseAsyncFunction())
    }
    if (tokenStream.matches([{ value: "if" }])) {
      return continueExpression(parseIf())
    }
    if (tokenStream.matches([{ value: "given" }])) {
      return continueExpression(parseGiven())
    }
    // TODO: handle destructuring as well
    if (tokenStream.matches([{ value: "[" }])) {
      if (tokenStream.matches([{ bracketPair: "[]" }, { value: "=" }])) {
        return parseDestructuredObject()
      }
      return continueExpression(parseObject())
    }
    if (tokenStream.matches([{ value: "await" }])) {
      return continueExpression(parseAwait())
    }
    if (tokenStream.matches([{ value: "unawait" }])) {
      return continueExpression(parseUnawait())
    }
  }

  const parseStatement = tokenStream => {
    // * 123
    if (tokenStream.matches([{ value: "*" }])) return parseReturn(tokenStream)

    // abc.type("") = "hello"
    if (
      tokenStream.matches([
        { type: "variable" },
        { value: ".", hasWhitespaceRight: false },
        { value: "type" },
      ])
    ) {
      return parseTypedAssignment(tokenStream)
    }

    return parseExpression(tokenStream)
  }

  const parseBlock = tokenStream => {
    const statements = []
    let statement
    while ((statement = parseStatement(tokenStream))) {
      statements.push(statement)
      while (
        tokenStream.matches([{ value: ";;", hasWhitespaceLeft: true, hasWhitespaceRight: true }])
      ) {
        skipTerm({ value: ";;" })
      }
    }
    return statements
  }

  return parseBlock(tokenStream)
}

module.exports = parse
