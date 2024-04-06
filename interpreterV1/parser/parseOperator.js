const unaryOperators = {
  _: { precendence: 99 /* TODO */ },
  "><": { precendence: 5 /* TODO */ },
  "-": { precendence: 99 /* TODO */ },
  "!": { precendence: 99 /* TODO */ },
  await: { precendence: 99 /* TODO */ },
  unawait: { precendence: 99 /* TODO */ },
  awaitIfAsync: { precendence: 99 /* TODO */ },
  "...": { precendence: 99 /* TODO */ },
}

const binaryOperators = {
  "=": { precedence: 1 },
  "||": { precedence: 2 },
  "&&": { precedence: 3 },
  as: { precedence: 5 },
  "<": { precedence: 7 },
  ">": { precedence: 7 },
  "<=": { precedence: 7 },
  ">=": { precedence: 7 },
  "==": { precedence: 7 },
  "!=": { precedence: 7 },
  "+": { precedence: 10 },
  "-": { precedence: 10 },
  "*": { precedence: 20 },
  "/": { precedence: 20 },
}

/* prettier-ignore */
const operatorPrecedence = {
  "as": 1, "||": 2, "&&": 3, "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7, "+": 10, "-": 10, 
  "*": 20, "/": 20, "=": 99 /* TODO, also figure out how to reconcile */
}
const operators = Object.keys(operatorPrecedence)

const parseUnaryOperator = () => {}

const parseBinaryOperator = () => {}

module.exports = { operators, parseOperator }
