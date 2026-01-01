const getId = require("../utilities/getId")

const parse = ({ lexemes, blockIds }) => {
  const recurse = ({ lexemes, blockIds }) => {
    const matchersInOrderOfPrecedence = [
      { match: /Start$/, isBlock: true },
      { match: /^(name|number)$/, ignoreForPrecedence: true },
      { match: /^stringContent/, ignoreForPrecedence: true },
      { match: /^return$/ },
      { match: /^assign$/ },
      { match: /^if$/ },
      { match: /^else$/ },
      { match: /^ternary$/ },
      { match: /^ternaryElse$/ },
      { match: /^function$/ },
      { match: /^named$/ },
      { match: /^equals$/ },
      { match: /^add$/ },
      { match: /^multiply$/ },
      { match: /^read$/ },
      { match: /^call$/ },
    ]

    const lexemeIdsByPrecedence = {}
    const nestedBlocks = [] // will parse separately

    lexemeIndexesById = Object.fromEntries(lexemes.map(({ id }, index) => [id, index]))

    lexemeLoop: for (let i = 0; i < lexemes.length; i += 1) {
      const lexeme = lexemes[i]

      for (let j = 0; j < matchersInOrderOfPrecedence.length; j += 1) {
        const matcher = matchersInOrderOfPrecedence[j]
        const precedenceIndex = j

        const lexemeContent =
          typeof lexeme.content === "string" ? lexeme.content : lexeme.content[0]

        const match = lexemeContent.match(matcher.match)
        if (match) {
          if (matcher.ignoreForPrecedence === true) {
            continue lexemeLoop
          }
          if (matcher.isBlock) {
            const startId = lexeme.id
            const endId = blockIds[startId]
            const startIndex = lexemeIndexesById[startId]
            const endIndex = lexemeIndexesById[endId]
            const blockContents = lexemes.slice(startIndex, endIndex + 1)
            nestedBlocks.push({ startId, endId, blockContents })
            i += blockContents.length - 1
            continue lexemeLoop
          }

          lexemeIdsByPrecedence[precedenceIndex] = lexeme.id
          continue lexemeLoop
        }
      }

      throw new Error(`Unrecognized lexeme "${lexeme.content}"`)
    }

    let sourceTreeInProgress = deepClone(lexemes)

    let nodeIndexesById
    const refreshNodeIndexesById = () => {
      nodeIndexesById = Object.fromEntries(sourceTreeInProgress.map(({ id }, index) => [id, index]))
    }
    refreshNodeIndexesById()

    nestedBlocks.forEach(nestedBlock => {
      const { startId, blockContents } = nestedBlock
      const startIndex = nodeIndexesById[startId]
      const blockName = sourceTreeInProgress[startIndex].content.match(/^(.+)Start$/)[1]

      const blockSourceTreeNodes = recurse({ lexemes: blockContents.slice(1, -1), blockIds })

      const sourceTreeNode = { id: startId, content: [blockName, ...blockSourceTreeNodes] }

      sourceTreeInProgress.splice(startIndex, blockContents.length, sourceTreeNode)
      refreshNodeIndexesById()
    })

    const lexemesIdsInProcessOrder = Object.values(lexemeIdsByPrecedence).reverse()

    const operatorTypes = {
      // Order doesn't matter
      add: "midfixBinary",
      assign: "midfixBinary",
      call: "midfixBinary",
      else: "prefixUrnary",
      equals: "midfixBinary",
      function: "midfixBinary",
      if: "specialOperatorIf",
      multiply: "midfixBinary",
      named: "midfixBinary",
      read: "midfixBinary",
      return: "prefixUrnary",
      ternary: "midfixTernary1",
      ternaryElse: "prefixUrnary",
    }

    lexemesIdsInProcessOrder.forEach(id => {
      const index = nodeIndexesById[id]
      const lexeme = sourceTreeInProgress[index]
      if (lexeme.content === "call") {
        console.log(lexeme.content)
      }
      let sourceTreeNode
      if (operatorTypes[lexeme.content] === "midfixBinary") {
        sourceTreeNode = {
          id,
          content: [
            lexeme.content,
            sourceTreeInProgress[index - 1],
            sourceTreeInProgress[index + 1],
          ],
        }
        sourceTreeInProgress.splice(index - 1, 3, sourceTreeNode)
      } else if (operatorTypes[lexeme.content] === "prefixUrnary") {
        sourceTreeNode = {
          id,
          content: [lexeme.content, sourceTreeInProgress[index + 1]],
        }
        sourceTreeInProgress.splice(index, 2, sourceTreeNode)
      } else if (operatorTypes[lexeme.content] === "midfixTernary1") {
        sourceTreeNode = {
          id: id,
          content: [
            lexeme.content,
            {
              id: getId(),
              content: sourceTreeInProgress[index - 1],
            },
            {
              id: getId(),
              content: sourceTreeInProgress[index + 1],
            },
            {
              id: getId(),
              content: sourceTreeInProgress[index + 2],
            },
          ],
        }
        sourceTreeInProgress.splice(index - 1, 3, ...sourceTreeNodes)
      } else if (operatorTypes[lexeme.content] === "specialOperatorIf") {
        let condition = sourceTreeInProgress[index + 1]
        let then = sourceTreeInProgress[index + 2]
        let elseNode
        let elseNodeIndex = 3
        while (true) {
          if (sourceTreeInProgress[elseNodeIndex]?.content[0] === "else") {
            elseNode = sourceTreeInProgress[index + elseNodeIndex]
            elseNodeIndex += 1
            break
          }

          break
        }
        let content = ["if", condition, then]
        if (elseNode) {
          content.push(elseNode)
        }
        sourceTreeNode = { id, content }
        sourceTreeInProgress.splice(index, elseNodeIndex, sourceTreeNode)
      } else {
        throw new Error(`Failed to process operator "${lexeme.content}"`)
      }
      refreshNodeIndexesById()
    })

    return sourceTreeInProgress
  }

  const sourceTreeInProgress = recurse({ lexemes, blockIds })

  if (sourceTreeInProgress.length > 1) {
    throw new Error(`Failed to process operator`)
  }

  const sourceTreeRaw = sourceTreeInProgress[0]

  const stripIds = sourceTreeNode => {
    if (sourceTreeNode.content) {
      const lexemeDetected = !Array.isArray(sourceTreeNode.content)
      if (lexemeDetected) {
        throw new Error(`Failed to process operator "${sourceTreeNode.content}"`)
      }
      return [
        sourceTreeNode.content[0],
        ...sourceTreeNode.content.slice(1).map(sourceTreeNode => stripIds(sourceTreeNode)),
      ]
    }
    return sourceTreeNode
  }

  const sourceTree = stripIds(sourceTreeRaw)

  return sourceTree
}

const deepClone = data => JSON.parse(JSON.stringify(data))

module.exports = parse
