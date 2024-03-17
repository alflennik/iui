const { tokenStream } = require("./parse")

const parseNotice = expression => {
  const notice = tokenStream.nextToken()
  const isOptional = notice.includes("?")
  const isResult = notice.includes("!")
  const isUntyped = notice.includes("%")

  return { type: "notice", isOptional, isResult, isUntyped, expression }
}

module.exports = { parseNotice }
