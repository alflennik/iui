import createMemoryObject from "./createMemoryObject.js"
import bootstrap, { createExecute, setExecute } from "./bootstrap.js"
import getBaseFields from "./baseFields.js"
import standardLibrary from "./standardLibrary.js"

const createScope = () => {
  const blocks = [{ id: bootstrap.getRandomNumber().toString().slice(2), parent: null, names: {} }]

  return {
    enter: ({ parent } = {}) => {
      const id = bootstrap.getRandomNumber().toString().slice(2)
      blocks.push({ id, parent: parent || blocks.at(-1), names: {} })
    },
    add: (nameString, value) => {
      const currentBlock = blocks.at(-1)
      currentBlock.names[nameString] = value
    },
    get: nameString => {
      let block = blocks.at(-1)
      while (block) {
        const result = block.names[nameString]
        if (result) return result
        block = block.parent
      }
    },
    closure: () => {
      return blocks.at(-1)
    },
    exit: () => {
      blocks.pop()
    },
  }
}

const scope = createScope()

Object.entries(standardLibrary).map(([name, functionValue]) => {
  const memoryObject = createMemoryObject()
  memoryObject.assignFunction(functionValue)
  scope.add(name, memoryObject)
})

const createControlFlow = () => {
  let isReturning = false

  return {
    getIsReturning: () => isReturning,
    triggerReturn: () => {
      isReturning = true
    },
    completeReturn: () => {
      isReturning = false
    },
  }
}

const controlFlow = createControlFlow()

const core = {
  name: nameString => {
    return scope.get(nameString)
  },
  // myObject.field
  read: (node1, node2) => {
    const memoryObject = execute(node1)
    if (node2[0] !== "name") throw new Error("Syntax error")
    const nameString = node2[1]

    return memoryObject.read(nameString)
  },
  // myObject["field"]
  access: (node1, node2) => {
    memoryObject1 = execute(node1)
    memoryObject2 = execute(node2)
    return memoryObject1.access(memoryObject2)
  },
  // myArray[0, -1]
  accessRange: (node1, node2, node3) => {
    memoryObject1 = execute(node1)
    memoryObject2 = execute(node2)
    memoryObject3 = node3 ? execute(node3) : null
    return memoryObject1.accessRange(memoryObject2, memoryObject3)
  },
  add: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    return bootstrap.add(result1, result2)
  },
  addAndAssign: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    result1.reassign(bootstrap.add(result1, result2))
  },
  subtract: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    return bootstrap.subtract(result1, result2)
  },
  subtractAndAssign: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    result1.reassign(bootstrap.subtract(result1, result2))
  },
  multiply: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    return bootstrap.multiply(result1, result2)
  },
  number: numberValue => {
    const memoryObject = createMemoryObject()
    memoryObject.assignNumber(bootstrap.number(numberValue))
    return memoryObject
  },
  equals: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    if (result1.getStorageType() === "string" || result1.getStorageType() === "string") {
      return result1.getValue() === result2.getValue()
    } else if (result1.getStorageType() === "number" || result2.getStorageType() === "number") {
      return bootstrap.numberEquals(result1, result2)
    }
    throw new Error("Equals not intelligent enough yet")
  },
  blockExpression: (...nodes) => {
    scope.enter()

    nodes.forEach(node => {
      execute(node)
    })

    scope.exit()
  },
  function: (parametersNode, statementsNode) => {
    const parentScope = scope.closure()

    const functionValue = args => {
      scope.enter({ parent: parentScope })

      if (parametersNode[0] !== "parameters") throw new Error("Syntax error")

      let index = 0
      parametersNode.slice(1).forEach(node => {
        if (node[0] === "spread") {
          if (node[1][0] !== "name") throw new Error("Syntax error")
          scope.add(node[1][0], args.positional[index])
          index += 1
        } else if (node[0] === "name") {
          scope.add(node[1], args.positional[index])
          index += 1
        } else if (node[0] === "named") {
          nameString = node[1]
          scope.add(nameString, args.named[nameString])
        } else {
          throw new Error("Syntax error")
        }
      })

      if (statementsNode[0] !== "statements") throw new Error("Syntax error")
      const returnValue = execute(statementsNode)
      scope.exit()
      return returnValue
    }
    const memoryObject = createMemoryObject()
    memoryObject.assignFunction(functionValue)
    return memoryObject
  },
  parameters: () => {
    throw new Error("Syntax error") // Only meant to be executed in function node
  },
  call: (nameNode, argumentsNode) => {
    const args = execute(argumentsNode)
    const functionValue = execute(nameNode)
    return bootstrap.call(functionValue, args)
  },
  arguments: (...nodes) => {
    const positional = []
    nodes.forEach(node => {
      if (node[0] === "named") throw new Error("Not implemented")
      const result = execute(node)
      positional.push(result)
    })
    const results = { positional }
    return results
  },
  return: node => {
    controlFlow.triggerReturn()
    return execute(node)
  },
  statements: (...nodes) => {
    for (const node of nodes) {
      const returnValue = execute(node)
      if (controlFlow.getIsReturning()) {
        controlFlow.completeReturn()
        return returnValue
      }
    }
  },
  file: (...nodes) => {
    scope.enter()

    nodes.forEach(node => {
      execute(node)
    })

    scope.exit()
  },
  // value = getValue()
  // myObject.&value = getValue()
  assign: (node1, node2) => {
    const initialNameString = (() => {
      if (node1[0] === "name") return node1[1]
      if (node1[0] === "blaze") {
        if (node1[1][0] === "name") return node1[1][1]
      }
      return null
    })()

    if (initialNameString) {
      const result = execute(node2)
      scope.add(initialNameString, result)
      return result
    } else {
      const result1 = execute(node1)
      const result2 = execute(node2)
      result1.reassign(result2)
      return result1
    }
  },
  // myField, &myField = getField()
  multipleAssign: (node1, node2, node3) => {
    if (node1[0] !== "name" || node2[0] !== "name") throw new Error("Syntax error")
    const nameString1 = node1[1]
    const nameString2 = node2[1]
    result = execute(node3)
    scope.add(nameString1, result)
    scope.add(nameString2, result)
  },
  ternary: (conditionNode, thenNode, elseNode) => {
    if (conditionNode[0] !== "condition") throw new Error("Syntax error")
    const condition = execute(conditionNode[1])
    if (condition) {
      return execute(thenNode[1])
    } else {
      return execute(elseNode[1])
    }
  },
  if: (conditionNode, thenNode, ...elseIfNodes) => {
    return bootstrap.if(conditionNode, thenNode, ...elseIfNodes)
  },
  // TODO:
  // while: () => {}
  parentheses: node1 => {
    return execute(node1)
  },
  string: (...nodes) => {
    let output = ""
    nodes.forEach(node => {
      if (node[0] === "stringContent") {
        output += node[1]
      } else if (node[0] === "stringReplacement") {
        const result = execute(node[1])
        const baseFields = getBaseFields(result)
        output += baseFields.toString()
      } else {
        throw new Error("Syntax error")
      }
    })
    const memoryObject = createMemoryObject()
    memoryObject.assignString(output)
    return memoryObject
  },
  object: (...nodes) => {
    const memoryObject = createMemoryObject()
    memoryObject.assignEmptyObject()
    let index = 0
    nodes.forEach(node => {
      if (node[0] === "name") {
        const result = execute(node)
        memoryObject.setIndex(index, result)
        index += 1
      } else if (node[0] === "named") {
        const nameString = node[1][1]
        const result = (() => {
          // myObject = [myName: myNameValue]
          if (node[2]) return execute(node[2])
          // myObject = [myName:]
          return execute(node[1])
        })()
        memoryObject.setName(nameString, result)
      } else {
        throw new Error("Syntax error")
      }
    })
    // TODO: base fields
    return memoryObject
  },
  tryThrow: node => execute(node), // noop for now
  blaze: node => execute(node), // noop for now
}

const execute = createExecute(core)
setExecute(execute)

// const startTime = performance.now()
// const result = execute(compiled)
// const endTime = performance.now()
// console.log(result)
// console.log(`Execution time: ${endTime - startTime}ms`)

const runtime = {
  // variables,
  // fpFromDecimal,
  execute,
}

globalThis.runtime = runtime
