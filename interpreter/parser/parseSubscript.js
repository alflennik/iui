const { parseName } = require("./parseName")
const { skipToken } = require("./skipToken")

const parseSubscript = expression => {
  skipToken(".")
  const name = parseName()
  return { type: "subscript", expression, name }
}

const parseDynamicSubscript = expression => {
  skipToken("[")
  const nameExpression = parseExpression({ isStatement: false })
  skipToken("]")
  return { type: "dynamicSubscript", expression, nameExpression }
}

module.exports = { parseSubscript, parseDynamicSubscript }
