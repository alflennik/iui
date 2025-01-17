const { tokenStream } = require("./parse")
const { parseBlockSpecial, parseBlock } = require("./parseBlock")
const { parseExpression } = require("./parseExpression")

const parseGiven = () => {
  skipToken("given")
  const value = parseExpression()
  const { branches, defaultBranch } = parseBlockSpecial(() => {
    let defaultBranch
    let branches = []

    while (true) {
      if (tokenStream.match([{ oneOf: [{ value: "}" }, { value: ";" }] }])) {
        break
      }
      if (tokenStream.match([{ value: "else" }])) {
        skipToken("else")
        defaultBranch = { block: parseBlock() }
      }
      const comparison = parseExpression()
      const block = parseBlock()
      branches.push({ comparison, block })
    }
  })
  return { type: "given", value, branches, defaultBranch }
}

module.exports = { parseGiven }
