const { parseExpression } = require("./parseExpression")
const { skipToken } = require("./skipToken")

const parseAssignment = identifier => {
  skipToken("=")
  const value = parseExpression({ isStatement: false })
  return { type: "assignment", identifier, value }
}

const parseTypedAssignment = () => {}

module.exports = { parseAssignment, parseTypedAssignment }
