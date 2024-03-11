const { parseExpression } = require("./parseExpression")
const { parseVariable } = require("./parseVariable")
const { skipTerm } = require("./skipTerm")

const parseAssignment = () => {
  const variable = parseVariable()
  skipTerm("=")
  const value = parseExpression({ isStatement: false })
  return { type: "assignment", variable, value }
}

const parseTypedAssignment = () => {}

module.exports = { parseAssignment, parseTypedAssignment }
