const { parseVariable } = require("./parseVariable")
const { skipTerm } = require("./skipTerm")

const parseSubscript = () => {
  skipTerm(".")
  return { type: "subscript", variable: parseVariable() }
}

module.exports = { parseSubscript }
