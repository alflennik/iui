import { parseName } from "./parseName.js"
import { parseString } from "./parseString.js"

const parseExpression = () => {
  // Parsing the various parts of an expression need to happen in the right order, that is,
  // operator precedence needs to be considered. It's not just that 1 + 5 * 10 equals 51, due to
  // the mathematical order of operations, but also, in await userService.login(), the subscript
  // and function call need to happen before await is applied.

  // The way to do this is to withhold the actual parsing of operators until the end of the
  // expression is reached, and then parsing the operators in order of precedence.

  // Will be transformed in place into AST nodes.
  const operatorsOrNodes = []

  const pushExpressionStart = () => {
    // if (tokenMatchesUnaryOperator()) {
    //   const token = tokenizer.nextToken()
    //   const { operatorPrecedence } = token
    //   tokensOrNodes.push({ token, operatorPrecedence, operatorType: "unary" })
    //   parseExpressionStart()
    // }

    // if (tokenMatchesIf()) {
    //   tokensOrNodes.push({ node: parseIf() })
    // }

    if (tokenizer.matches([{ type: "name" }])) {
      operatorsOrNodes.push(parseName())
    } else if (tokenizer.matches([{ value: value => value.endsWith('"') }])) {
      operatorsOrNodes.push(parseString())
    }
  }

  pushExpressionStart()

  while (true) {
    // if (tokenizer.matches([{ value: "(", hasBoundaryLeft: false }])) {
    // parse arguments in the parentheses, but leave precedence unprocessed
    // }

    if (tokenizer.matches([{ value: "=" }])) {
      tokenizer.nextToken()
      operatorsOrNodes.push({ operator: "assignment", precedence: "binaryLowest" })
      pushExpressionStart()
    }

    break
  }

  // Would apply in a scenario like this where two otherwise valid expressions are placed on the
  // same line:
  // &index = 0 index = >< &index
  if (!tokenizer.matches([{ hasNewlineLeft: true }])) {
    const peekToken = tokenizer.peekToken()
    return {
      errors: [
        {
          message: "Missing line break after end of expression",
          line: peekToken.line,
          column: peekToken.column,
        },
      ],
    }
  }

  let precedences = ["binaryLowest"]

  precedences.forEach(precedence => {
    let index = 0
    while (true) {
      const current = operatorsOrNodes[index]

      if (!current) break

      if (current.precedence !== precedence) {
        index += 1
        continue
      }

      if (["assignment"].includes(operatorsOrNodes[index].operator)) {
        const previous = operatorsOrNodes[index - 1]
        const next = operatorsOrNodes[index + 1]
        const node = { type: "assignment", left: previous, right: next }
        operatorsOrNodes.splice(index - 1, 3, node)
        // Because of splice the index can just stay the same for the next iteration
      }
    }
  })

  if (operatorsOrNodes.length !== 1) {
    throw new Error("Is this even possible?")
  }

  return operatorsOrNodes[0]
}

export { parseExpression }
