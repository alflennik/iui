import { parseStatement } from "./parseStatement.js"

const parseStatements = detectEnd => {
  const statements = []
  while (!detectEnd()) {
    statements.push(parseStatement())
  }
  return statements
}

const parseFileStatements = () => {
  const detectEnd = () => {
    return tokenizer.matches([{ isEnd: true }])
  }
  return parseStatements(detectEnd)
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

export { parseFileStatements /* , parseBlockSpecial, parseBlock */ }
