const generateCode = require("./codegen")
const parse = require("./parser")

const compile = sourceCode => {
  const ast = parse(sourceCode)

  const js = generateCode(ast)

  return js
}

module.exports = compile
