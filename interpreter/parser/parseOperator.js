const unaryOperators = {
  _: { precendence: 99 /* TODO */ },
  "-": { precendence: 99 /* TODO */ },
  "!": { precendence: 99 /* TODO */ },
  await: { precendence: 99 /* TODO */ },
  lock: { precendence: 99 /* TODO */ },
  "...": { precendence: 99 /* TODO */ },
}

/* prettier-ignore */
const operatorPrecedence = {
  "as": 1, "||": 2, "&&": 3, "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7, "+": 10, "-": 10, "*": 20,
  "/": 20, "=": 99 /* TODO, also figure out how to reconcile */, "_=": 99
}
const operators = Object.keys(operatorPrecedence)

const parseOperator = () => {}

module.exports = { operators, parseOperator }
