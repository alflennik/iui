const parse = ({ lexemes, blockIds }) => {
  createSourceTreeInProgress = ({ lexemes }) => {
    const sourceTreeInProgress = { content: [] }

    const idToNodeMap = new Map()

    let previousSibling
    lexemes.forEach((lexeme, index) => {
      const alreadyReadyToBeNode =
        Array.isArray(lexeme.content) &&
        ["name", "number", "stringContent"].includes(lexeme.content[0])

      const node = {
        type: alreadyReadyToBeNode ? "node" : "lexeme",
        id: lexeme.id,
        index,
        name: Array.isArray(lexeme.content) ? lexeme.content[0] : lexeme.content,
        content: Array.isArray(lexeme.content) ? lexeme.content.slice(1) : null,
        parent: sourceTreeInProgress,
        previousSibling,
        nextSibling: undefined,
      }
      idToNodeMap.set(lexeme.id, node)
      if (previousSibling) previousSibling.nextSibling = node
      sourceTreeInProgress.content.push(node)
      previousSibling = node
    })

    const getById = id => {
      return idToNodeMap.get(id)
    }

    const createBlockNode = ({ startNode, endNode }) => {
      const blockName = startNode.name.match(/^(.+)Start$/)[1]
      if (blockName === "parameters" && endNode.index - startNode.index > 3) {
        console.log()
      }

      const firstNode = startNode.nextSibling
      const lastNode = endNode.previousSibling

      const count = lastNode.index - firstNode.index + 1
      const parent = startNode.parent

      const children = parent.content.splice(firstNode.index, count)

      parent.content.splice(startNode.index, 2) // remove start and end nodes
      idToNodeMap.delete(startNode.id)
      idToNodeMap.delete(endNode.id)

      const newNode = {
        type: "block",
        id: startNode.id,
        index: startNode.index,
        name: blockName,
        content: children,
        parent,
        previousSibling: startNode.previousSibling,
        nextSibling: endNode.nextSibling,
      }

      idToNodeMap.set(startNode.id, newNode)

      let previousSibling
      children.forEach((child, index) => {
        child.parent = newNode
        child.index = index
        child.previousSibling = previousSibling
        if (previousSibling) previousSibling.nextSibling = child

        previousSibling = child
      })
      if (previousSibling) previousSibling.nextSibling = undefined

      previousSibling = startNode.previousSibling
      if (previousSibling) previousSibling.nextSibling = newNode

      const nextSibling = endNode.nextSibling
      if (nextSibling) nextSibling.previousSibling = newNode

      parent.content.splice(startNode.index, 0, newNode)

      for (let i = newNode.index; i < parent.content.length; i += 1) {
        parent.content[i].index = i
      }
    }

    const createOperatorNode = ({ operatorNode, nodesBefore = [], nodesAfter = [] }) => {
      const parent = operatorNode.parent

      const firstNode =
        nodesBefore.length && operatorNode.index > nodesBefore[0].index
          ? nodesBefore[0]
          : operatorNode

      const lastNode =
        nodesAfter.length && operatorNode.index < nodesAfter.at(-1).index
          ? nodesAfter.at(-1)
          : operatorNode

      const newNode = {
        type: "node",
        id: operatorNode.id,
        index: firstNode.index,
        name: operatorNode.name,
        content: [...nodesBefore, ...nodesAfter],
        parent: operatorNode.parent,
        previousSibling: firstNode.previousSibling,
        nextSibling: lastNode.nextSibling,
      }

      const count = lastNode.index - firstNode.index + 1

      parent.content.splice(firstNode.index, count, newNode)

      idToNodeMap.set(operatorNode.id, newNode)

      let previousSibling
      newNode.content.forEach((node, index) => {
        node.parent = newNode
        node.index = index
        node.previousSibling = previousSibling
        if (previousSibling) previousSibling.nextSibling = node

        previousSibling = node
      })
      if (previousSibling) previousSibling.nextSibling = undefined

      previousSibling = newNode.previousSibling
      if (previousSibling) previousSibling.nextSibling = newNode

      const nextSibling = newNode.nextSibling
      if (nextSibling) nextSibling.previousSibling = newNode

      for (let i = newNode.index; i < parent.content.length; i += 1) {
        parent.content[i].index = i
      }
    }

    return {
      sourceTreeInProgress,
      getById,
      createOperatorNode,
      createBlockNode,
    }
  }

  const { sourceTreeInProgress, getById, createOperatorNode, createBlockNode } =
    createSourceTreeInProgress({ lexemes: deepClone(lexemes) })

  const blocksToParse = []

  blockIds.forEach(([startId, endId]) => {
    const startNode = getById(startId)
    const endNode = getById(endId)
    createBlockNode({ startNode, endNode })
    blocksToParse.push(getById(startId))
  })

  blocksToParse.forEach(block => {
    const matchersInOrderOfPrecedence = [
      { match: /^stringContent/, ignoreForPrecedence: true },
      { match: /^(name|number)$/, ignoreForPrecedence: true },
      { match: /^call$/ },
      { match: /^read$/ },
      { match: /^multiply$/ },
      { match: /^add$/ },
      { match: /^equals$/ },
      { match: /^function$/ },
      { match: /^ternaryElse$/ },
      { match: /^ternary$/ },
      { match: /^named$/ },
      { match: /^else$/ },
      { match: /^if$/ },
      { match: /^assign$/ },
      { match: /^return$/ },
    ]

    const nodesByPrecedence = {}

    nodeLoop: for (let i = 0; i < block.content.length; i += 1) {
      const node = block.content[i]

      if (node.type === "block") continue nodeLoop

      for (let j = 0; j < matchersInOrderOfPrecedence.length; j += 1) {
        const matcher = matchersInOrderOfPrecedence[j]
        const precedenceIndex = j

        const match = node.name.match(matcher.match)
        if (match) {
          if (matcher.ignoreForPrecedence === true) {
            continue nodeLoop
          }

          if (!nodesByPrecedence[precedenceIndex]) {
            nodesByPrecedence[precedenceIndex] = []
          }
          nodesByPrecedence[precedenceIndex].push(node)

          continue nodeLoop
        }
      }

      throw new Error(`Unrecognized lexeme "${node.name}"`)
    }

    const nodesInProcessOrder = Object.values(nodesByPrecedence).flat()

    if (nodesInProcessOrder?.length > 2) {
      console.log()
    }

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

    nodesInProcessOrder.forEach(node => {
      if (node.name === "function") {
        console.log()
      }
      if (operatorTypes[node.name] === "midfixBinary") {
        createOperatorNode({
          nodesBefore: [node.previousSibling],
          operatorNode: node,
          nodesAfter: [node.nextSibling],
        })
      } else if (operatorTypes[node.name] === "prefixUrnary") {
        createOperatorNode({
          operatorNode: node,
          nodesAfter: [node.nextSibling],
        })
      } else if (operatorTypes[node.name] === "midfixTernary1") {
        const nextSibling = node.nextSibling

        createOperatorNode({
          nodesBefore: [node.previousSibling],
          operatorNode: node,
          nodesAfter: [nextSibling, nextSibling.nextSibling],
        })
      } else if (operatorTypes[node.name] === "specialOperatorIf") {
        const parent = node.parent

        const nodesAfter = [parent.content[node.index + 1], parent.content[node.index + 2]]

        let elseNodeIndex = 3
        while (true) {
          // TODO: else if
          if (parent.content[elseNodeIndex]?.name === "else") {
            nodesAfter.push(parent.content[node.index + elseNodeIndex])
            break
          }

          break
        }

        createOperatorNode({
          operatorNode: node,
          nodesAfter,
        })
      } else {
        throw new Error(`Failed to process operator "${lexeme.content}"`)
      }
    })
  })

  console.log(sourceTreeInProgress)

  if (sourceTreeInProgress.length > 1) {
    throw new Error(`Failed to process operator`)
  }

  const sourceTreeRaw = sourceTreeInProgress.content[0]

  const convertToShorthand = sourceTreeNode => {
    if (sourceTreeNode.content) {
      if (sourceTreeNode.type === "lexeme") {
        throw new Error(`Failed to process operator "${sourceTreeNode.content}"`)
      }
      return [
        sourceTreeNode.name,
        ...sourceTreeNode.content.map(sourceTreeNode => convertToShorthand(sourceTreeNode)),
      ]
    }
    return sourceTreeNode
  }

  const sourceTree = convertToShorthand(sourceTreeRaw)

  return sourceTree
}

const deepClone = data => JSON.parse(JSON.stringify(data))

module.exports = parse
