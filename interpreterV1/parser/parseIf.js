const { tokenStream } = require("./parse")
const { parseBlock } = require("./parseBlock")
const { parseExpression } = require("./parseExpression")
const { skipToken } = require("./skipToken")

const parseIf = () => {
  skipToken("if")
  const condition = parseExpression()
  const block = parseBlock()
  const branches = [{ condition, block }]
  while (true) {
    if (tokenStream.match([{ value: "else" }, { value: "if" }])) {
      skipToken("else")
      skipToken("if")
      const condition = parseExpression()
      const block = parseBlock()
      branches.push({ condition, block })
    } else {
      break
    }
  }
  let defaultBranch
  if (tokenStream.match([{ value: "else" }])) {
    skipToken("else")
    const block = parseBlock()
    defaultBranch = { block }
  }
  return { type: "if", branches, defaultBranch }
}

module.exports = { parseIf }
