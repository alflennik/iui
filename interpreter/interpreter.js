const fs = require("node:fs/promises")
const path = require("node:path")
const getTokenizer = require("./tokenizer/tokenizer")

;(async () => {
  const filePath = path.resolve(__dirname, "../one.iui")
  const code = await fs.readFile(filePath, { encoding: "utf8" })
  const tokenizer = getTokenizer(code, filePath)

  console.log(code)
})()
