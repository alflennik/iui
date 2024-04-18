const { parseBlockContents } = require("./parseBlock")

// let failedToParse

const parse = tokenizer => {
  global.tokenizer = tokenizer

  // failedToParse = () => {
  //   throw new Error(
  //     `Failed to parse syntax at ${tokenizer.filePath}:${tokenizer.lineNumber}:` +
  //       `${tokenizer.columnNumber}`
  //   )
  // }

  return parseBlockContents()
}

module.exports = parse
// module.exports.failedToParse = failedToParse
