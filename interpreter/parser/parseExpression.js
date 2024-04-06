const { tokenStream } = require("./parse")

// const operatorsByPrecedence = [{ value: "=", operatorType: "binary" }]

// const binaryOperators = operatorsByPrecedence
//   .filter(({ operatorType }) => operatorType === "binary")
//   .map(operatorByPrecedence => operatorByPrecedence.value)

// const unaryOperators = Object.entries(operatorsByPrecedence)
//   .filter(({ operatorType }) => operatorType === "unary")
//   .map(operatorByPrecedence => operatorByPrecedence.value)

const parseExpression = () => {
  // Parsing the various parts of an expression need to happen in the right order, that is,
  // operator precedence needs to be considered. It's not just that 1 + 5 * 10 equals 51, due to
  // the mathematical order of operations, but also, in await userService.login(), the subscript
  // and function call need to happen before await is applied.

  // The way to do this is to withhold the actual parsing of operators until the end of the
  // expression is reached, and then parsing the operators in order of precedence.

  // Will be transformed in place into AST nodes.
  const operatorsOrNodes = []

  const tokenMatchesUnaryOperator = () => {
    tokenStream.matches([{ value: value => unaryOperators.includes(value) }])
  }

  const tokenMatchesBinaryOperator = () => {
    tokenStream.matches([{ value: value => binaryOperators.includes(value) }])
  }

  const tokenMatchesCall = () => tokenStream.matches([{ value: "(", hasLeftBoundary: false }])

  const tokenMatchesIf = () => tokenStream.matches([{ value: "if" }])

  const tokenMatchesString = () => tokenStream.matches([{ value: value => value.endsWith('"') }])

  const parseExpressionStart = () => {
    if (tokenMatchesUnaryOperator()) {
      const token = tokenStream.nextToken()
      const { operatorPrecedence } = token
      tokensOrNodes.push({ token, operatorPrecedence, operatorType: "unary" })
      parseExpressionStart()
    }

    if (tokenMatchesIf()) {
      tokensOrNodes.push({ node: parseIf() })
    }

    if (tokenMatchesString()) {
      tokensOrNodes.push({ node: parseString() })
    }

    if (tokenStream.matches([{ type: "word" }])) {
      tokensOrNodes.push({ node: parseWord() })
    }

    // if (tokenStream.matches([{ type: "number" }])) {
    //   tokensOrNodes.push({ token: tokenStream.nextToken() })
    // }
  }

  parseExpressionStart()

  while (true) {
    if (tokenMatchesCall()) {
      tokensOrNodes.push({ node: parseCall() })
      continue
    }

    if (tokenMatchesBinaryOperator()) {
      const nextToken = tokenStream.nextToken()
      const { operatorPrecedence, operatorType } = nextToken
      tokensOrNodes.push({ token: nextToken, operatorPrecedence, operatorType })
      parseExpressionStart()
      continue
    }

    break
  }

  let precedences = []
  tokensOrNodes.forEach(tokenOrNode => {
    const precedence = tokenOrNode.token?.operatorPrecedence
    if (precedence && !precedences.includes(precedence)) {
      precedences.push(precedence)
    }
  })
  precedences.sort((a, b) => b - a)

  precedences.forEach(precedence => {
    let index = 0
    while (true) {
      if (tokensOrNodes[index].token?.operatorPrecedence === precedence) {
        const { operatorType } = tokensOrNodes[index].token
        if (operatorType === "binary") {
          const node = parseBinaryOperator(tokensOrNodes.slice(index - 1, index + 1))
          tokensOrNodes.splice(index - 1, 3, node)
          // index intended to stay the same
          continue
        }

        if (operatorType === "unary") {
          const node = parseUnaryOperator(tokensOrNodes.slice(index, index + 1))
          tokensOrNodes.splice(index, 2, node)
          // index intended to stay the same
          continue
        }
      }

      index += 1
      if (index >= tokensOrNodes.length) break
    }
  })

  const nodesOnly = tokensOrNodes.map(tokensOrNodes => tokensOrNodes.node)
}

module.exports = { parseExpression }
