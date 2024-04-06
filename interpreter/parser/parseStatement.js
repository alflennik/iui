const { tokenStream } = require("./parse")
const { parseExpression } = require("./parseExpression")
// const { parseReturn } = require("./parseReturn")

const parseStatement = () => {
  // As in: * 123
  // if (tokenStream.matches([{ value: "*" }])) return parseReturn(tokenStream)}

  return parseExpression()
}

module.exports = { parseStatement }
