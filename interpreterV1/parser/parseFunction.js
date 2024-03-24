const { parseBlock } = require("./parseBlock")
const { parseObjectContents, parseDestructureContents } = require("./parseObject")
const { skipToken } = require("./skipToken")

const parseAwait = () => {}
const parseUnawait = () => {}

const parseFunction = () => {
  skipToken("(")
  const parameters = parseObjectContents()
  skipToken(")")
  const block = parseBlock()
  return { type: "function", isAsync: false, parameters, block }
}

const parseAsyncFunction = () => {
  skipToken("async")
  const parsedFunction = parseFunction()
  return { type: parsedFunction.type, isAsync: true, ...parsedFunction }
}

const parseCall = () => {
  skipToken("(")
  const arguments = parseDestructureContents()
  skipToken(")")
  return { type: "call", arguments }
}

module.exports = { parseAwait, parseUnawait, parseFunction, parseAsyncFunction, parseCall }
