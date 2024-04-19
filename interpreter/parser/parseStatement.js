import { parseExpression } from "./parseExpression.js"
// const { parseReturn } = require("./parseReturn")

const parseStatement = () => {
  // As in: * 123
  // if (tokenizer.matches([{ value: "*" }])) return parseReturn(tokenizer)}

  return parseExpression()
}

export { parseStatement }
