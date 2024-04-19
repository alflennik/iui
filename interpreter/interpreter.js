import fs from "node:fs/promises"
import path from "node:path"
import getTokenizer from "./tokenizer/tokenizer"
//
;(async () => {
  const filePath = path.resolve(__dirname, "../one.iui")
  const code = await fs.readFile(filePath, { encoding: "utf8" })
  const tokenizer = getTokenizer(code, filePath)
  const ast = parse(tokenizer)

  console.log(code)
})()
