const { parseBlock } = require("./parseBlock")
const { parseObjectContents, parseDestructureContents } = require("./parseObject")
const { skipTerm } = require("./skipTerm")

const parseAwait = () => {}
const parseUnawait = () => {}

const parseFunction = () => {
  skipTerm("(")
  const parameters = parseObjectContents()
  skipTerm(")")
  const block = parseBlock()
  return { type: "function", isAsync: false, parameters, block }
}

const parseAsyncFunction = () => {
  skipTerm("async")
  const parsedFunction = parseFunction()
  return { type: parsedFunction.type, isAsync: true, ...parsedFunction }
}

const parseCall = () => {
  skipTerm("(")
  const arguments = parseDestructureContents()
  skipTerm(")")
  return { type: "call", arguments }
}

module.exports = { parseAwait, parseUnawait, parseFunction, parseAsyncFunction, parseCall }
