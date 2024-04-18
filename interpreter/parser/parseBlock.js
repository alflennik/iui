const { parseStatement } = require("./parseStatement")

const parseBlockContents = () => {
  const statements = []
  let statement
  while ((statement = parseStatement())) {
    statements.push(statement)
  }
  return statements
}

// const parseBlockSpecial = parseContents => {
//   let isCaptureBlock
//   if (tokenizer.match({ value: "{" })) {
//     isCaptureBlock = true
//     skipToken("{")
//   } else {
//     isCaptureBlock = false
//     skipToken(":")
//   }
//   const statements = parseContents()
//   return { type: "block", isCaptureBlock, statements }
// }

// const parseBlock = () => {
//   return parseBlockSpecial(parseBlockContents)
// }

module.exports = { parseBlockContents /* , parseBlockSpecial, parseBlock */ }
