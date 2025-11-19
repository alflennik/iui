const getId = require("../utilities/getId")

const parse = ({ lexemes, blockIds }) => {
  const matchersInOrderOfPrecedence = [
    { match: /Start$/, isBlock: true },
    { match: /^(\.name|\.number)/, ignoreForPrecedence: true },
    { match: /^\.stringContent/, ignoreForPrecedence: true },
    { match: /^\.assign$/ },
    { match: /^\.ternaryCondition$/ },
    { match: /^\.ternaryThen$/ },
    { match: /^\.equals$/ },
    { match: /^\.add$/ },
    { match: /^\.multiply$/ },
    { match: /^\.call$/ },
  ]

  const lexemeIdsByPrecedence = {}
  const nestedBlocks = [] // will parse separately

  lexemeIndexesById = Object.fromEntries(lexemes.map(({ id }, index) => [id, index]))

  lexemeLoop: for (let i = 0; i < lexemes.length; i += 1) {
    const lexeme = lexemes[i]

    for (let j = 0; j < matchersInOrderOfPrecedence.length; j += 1) {
      const matcher = matchersInOrderOfPrecedence[j]
      const precedenceIndex = j

      const match = lexeme.content.match(matcher.match)
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

    throw new Error("Unrecognized lexeme")
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
    const blockName = sourceTreeInProgress[startIndex].content.match(/^\.(.+)Start$/)[1]

    const blockSourceTreeNodes = parse({ lexemes: blockContents.slice(1, -1), blockIds })

    const sourceTreeNode = { id: startId, content: [`.${blockName}`, blockSourceTreeNodes] }

    sourceTreeInProgress.splice(startIndex, blockContents.length, sourceTreeNode)
    refreshNodeIndexesById()
  })

  const lexemesIdsInProcessOrder = Object.values(lexemeIdsByPrecedence).reverse()

  const operatorTypes = {
    ".assign": "midfixBinary",
    ".ternaryCondition": "ternaryCondition",
    ".ternaryThen": "ternaryThen",
    ".multiply": "midfixBinary",
    ".add": "midfixBinary",
    ".equals": "midfixBinary",
    ".call": "midfixBinary",
  }

  lexemesIdsInProcessOrder.forEach(id => {
    const index = nodeIndexesById[id]
    const lexeme = sourceTreeInProgress[index]
    let sourceTreeNode
    if (operatorTypes[lexeme.content] === "midfixBinary") {
      sourceTreeNode = {
        id,
        content: [
          lexeme.content,
          [sourceTreeInProgress[index - 1], sourceTreeInProgress[index + 1]],
        ],
      }
      sourceTreeInProgress.splice(index - 1, 3, sourceTreeNode)
    } else if (operatorTypes[lexeme.content] === "ternaryThen") {
      // ternaryThen parses before ternaryCondition
      sourceTreeNodes = [
        {
          id,
          content: [".then", [sourceTreeInProgress[index - 1]]],
        },
        {
          id: getId(),
          content: [".else", [sourceTreeInProgress[index + 1]]],
        },
      ]
      sourceTreeInProgress.splice(index - 1, 3, ...sourceTreeNodes)
    } else if (operatorTypes[lexeme.content] === "ternaryCondition") {
      // Note: ternaryThen has already parsed
      sourceTreeNode = {
        id,
        content: [
          ".ternary",
          [
            {
              id: getId(),
              content: [".condition", [sourceTreeInProgress[index - 1]]],
            },
            sourceTreeInProgress[index + 1],
            sourceTreeInProgress[index + 2],
          ],
        ],
      }

      sourceTreeInProgress.splice(index - 1, 4, sourceTreeNode)
    } else {
      throw new Error("Failed to process operator")
    }
    refreshNodeIndexesById()
  })

  sourceTree = sourceTreeInProgress
  return sourceTree
}

const deepClone = data => JSON.parse(JSON.stringify(data))

module.exports = parse
