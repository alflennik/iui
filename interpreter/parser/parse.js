import { parseFileStatements } from "./parseBlock.js"

// let failedToParse

const parse = tokenizer => {
  global.tokenizer = tokenizer

  // failedToParse = () => {
  //   throw new Error(
  //     `Failed to parse syntax at ${tokenizer.filePath}:${tokenizer.lineNumber}:` +
  //       `${tokenizer.columnNumber}`
  //   )
  // }

  return parseFileStatements()
}

export { parse }
// module.exports.failedToParse = failedToParse
