const { tokenStream, failedToParse } = require("./parse")

const skipToken = value => {
  if (!tokenStream.matches([{ value }])) {
    failedToParse()
  }
  tokenStream.nextToken()
}

module.exports = { skipToken }
