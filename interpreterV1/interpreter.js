const fs = require("node:fs/promises")
const path = require("node:path")
const getTokenStream = require("./tokenizer")
const getInputStream = require("./inputStream")

;(async () => {
  const code = await fs.readFile(path.resolve(__dirname, "../one.iui"), { encoding: "utf8" })

  console.log(code)

  const ast = parse(getTokenStream(getInputStream(code)))

  // const tokens = []

  // let i
  // let currentToken
  // while ((currentToken = tokenStream.nextToken())) {
  //   i += 1
  //   tokens.push(currentToken)
  //   if (i > 10000) throw new Error("failed to exit while loop")
  // }

  // console.log(tokens)
  // console.log()
})()
