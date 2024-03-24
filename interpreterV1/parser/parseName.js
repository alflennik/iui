const { tokenStream } = require("./parse")

const parseName = () => {
  const name = tokenStream.nextToken()
  return { type: "name", name }
}

module.exports = { parseName }
