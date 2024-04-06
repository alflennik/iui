const { tokenStream } = require("./parse")
const { parseTypedAssignment } = require("./parseAssignment")
const { parseExpression } = require("./parseExpression")
const { parseReturn } = require("./parseReturn")

const parseStatement = () => {
  // As in: * 123
  if (tokenStream.matches([{ value: "*" }])) return parseReturn(tokenStream)

  // As in: abc.type("") = "hello"
  if (
    tokenStream.matches([
      { type: "variable" },
      { value: ".", hasWhitespaceRight: false },
      { value: "type" },
    ])
  ) {
    return parseTypedAssignment(tokenStream)
  }

  return parseExpression({ isStatement: true })
}

module.exports = { parseStatement }
