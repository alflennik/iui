const { parseExpression } = require("./parseExpression")
// const { parseReturn } = require("./parseReturn")

const parseStatement = () => {
  // As in: * 123
  // if (tokenizer.matches([{ value: "*" }])) return parseReturn(tokenizer)}

  return parseExpression()
}

module.exports = { parseStatement }
