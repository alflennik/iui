const { tokenStream, failedToParse } = require("./parse")

const skipTerm = value => {
  if (!tokenStream.matches([{ value }])) {
    failedToParse()
  }
  tokenStream.nextToken()
}

module.exports = { skipTerm }
