const { tokenStream } = require("./parse")
const { parseBlock } = require("./parseBlock")
const { parseExpression } = require("./parseExpression")
const { skipTerm } = require("./skipTerm")

const parseIf = () => {
  skipTerm("if")
  const condition = parseExpression()
  const block = parseBlock()
  const branches = [{ condition, block }]
  while (true) {
    if (tokenStream.match([{ value: "else" }, { value: "if" }])) {
      skipTerm("else")
      skipTerm("if")
      const condition = parseExpression()
      const block = parseBlock()
      branches.push({ condition, block })
    } else {
      break
    }
  }
  let defaultBranch
  if (tokenStream.match([{ value: "else" }])) {
    skipTerm("else")
    const block = parseBlock()
    defaultBranch = { block }
  }
  return { type: "if", branches, defaultBranch }
}

module.exports = { parseIf }
