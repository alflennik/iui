/* prettier-ignore */
const operatorPrecedence = {
  "as": 1, "||": 2, "&&": 3, "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7, "+": 10, "-": 10, "*": 20,
  "/": 20,
}
const operators = Object.keys(operatorPrecedence)

const parseOperator = () => {}

module.exports = { operators, parseOperator }
