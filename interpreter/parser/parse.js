const { parseBlockContents } = require("./parseBlock")

let tokenizer
// let failedToParse

const parse = providedTokenizer => {
  tokenizer = providedTokenizer

  // failedToParse = () => {
  //   throw new Error(
  //     `Failed to parse syntax at ${tokenizer.filePath}:${tokenizer.lineNumber}:` +
  //       `${tokenizer.columnNumber}`
  //   )
  // }

  return parseBlockContents()
}

module.exports = parse
module.exports.tokenizer = tokenizer
// module.exports.failedToParse = failedToParse
