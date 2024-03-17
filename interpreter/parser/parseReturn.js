const { tokenStream } = require("./parse")
const { skipToken } = require("./skipToken")

const parseReturn = () => {
  skipToken("*")
  let allowDiscard = false
  if (tokenStream.matches([{ value: "_" }])) {
    allowDiscard = true
    skipToken("_")
  }
  const value = parseExpression({ isStatement: false })
  return { type: "return", allowDiscard, value }
}

module.exports = { parseReturn }
