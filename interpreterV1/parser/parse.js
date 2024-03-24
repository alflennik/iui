const { parseBlockContents } = require("./parseBlock")

/*

Missing:

- case
- types
- unaryOperators
- parseOperator
- parseTypedAssignment
- parseAwait
- parseUnawait
- parseDestructure
- parseObject
- parseDestructureContents
- parseObjectContents

*/

let tokenStream
let failedToParse

const parse = providedTokenStream => {
  tokenStream = providedTokenStream

  failedToParse = () => {
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
