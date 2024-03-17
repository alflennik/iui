const { parseBlock } = require("./parseBlock")
const { parseExpression } = require("./parseExpression")
const { skipToken } = require("./skipToken")

const parseWatch = () => {
  skipToken("watch")
  const watched = parseExpression({ isStatement: false })
  const block = parseBlock()

  return { type: "watch", watched, block }
}

module.exports = { parseWatch }
