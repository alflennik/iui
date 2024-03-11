const { parseBlockContents } = require("./parseBlock")

let tokenStream
let failedToParse

const parse = providedTokenStream => {
  tokenStream = providedTokenStream

  failedToParse = tokenStream => {
    throw new Error(
      `Failed to parse syntax at ${tokenStream.filePath}:${tokenStream.lineNumber}:` +
        `${tokenStream.columnNumber}`
    )
  }

  return parseBlockContents()
}

module.exports = parse
module.exports.tokenStream = tokenStream
module.exports.failedToParse = failedToParse
