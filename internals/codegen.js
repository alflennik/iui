const fs = require("node:fs")
const path = require("path")

const runtimePath = path.resolve(__dirname, "./runtimeEnvironment/runtimeEnvironment.js")
const runtimeFile = fs.readFileSync(runtimePath, { encoding: "utf-8" })

const generateCode = ast => {
  let output = ""

  const generateNode = astNode => {
    if (typeof astNode.content === "string" && astNode.content.startsWith(".name")) {
      const name = astNode.content.match(/\.name\((.+)\)/)[1]
      return `runtimeEnvironment.variables["${name}"]`
    }

    if (typeof astNode.content === "string" && astNode.content.startsWith(".number")) {
      const number = astNode.content.match(/\.number\((.+)\)/)[1]
      return number
    }

    if (!astNode.content) {
      console.log()
    }

    if (astNode.content[0] == ".string") {
      const stringContent = astNode.content[1][0].content.match(/\.stringContent\((.+)\)/)[1]
      return stringContent
    }

    if (astNode.content[0] == ".assign") {
      const expression1 = generateNode(astNode.content[1][0])
      const expression2 = generateNode(astNode.content[1][1])
      return `${expression1} = ${expression2}\n`
    }

    if (astNode.content[0] == ".call") {
      const expression1 = generateNode(astNode.content[1][0])
      const arguments = astNode.content[1][1].content[1]
        .map(argument => {
          return generateNode(argument)
        })
        .join(",")
      return `${expression1}(${arguments})\n`
    }

    if (astNode.content[0] == ".equals") {
      const expression1 = generateNode(astNode.content[1][0])
      const expression2 = generateNode(astNode.content[1][1])
      return `(${expression1}) == (${expression2})\n`
    }

    if (astNode.content[0] == ".multiply") {
      const expression1 = generateNode(astNode.content[1][0])
      const expression2 = generateNode(astNode.content[1][1])
      return `${expression1} * ${expression2}\n`
    }

    if (astNode.content[0] == ".add") {
      const expression1 = generateNode(astNode.content[1][0])
      const expression2 = generateNode(astNode.content[1][1])
      return `${expression1} + ${expression2}\n`
    }

    if (astNode.content[0] === ".ternaryIf") {
      const expression1 = generateNode(astNode.content[1][0])
      const expression2 = generateNode(astNode.content[1][1].content[1][0])
      const expression3 = generateNode(astNode.content[1][1].content[1][1])
      return `${expression1} ? ${expression2} : ${expression3}\n`
    }

    if (astNode.content[0] === ".parentheses") {
      const expression = generateNode(astNode.content[1][0])
      return `(${expression})\n`
    }

    throw new Error("Unrecognized node")
  }

  ast.forEach(astNode => {
    output += generateNode(astNode)
  })

  let fullOutput = `${runtimeFile}\n\n${output}`

  return fullOutput
}

module.exports = generateCode
