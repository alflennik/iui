import createMemoryObject from "./createMemoryObject.js"
import bootstrap, { createExecute, setExecute } from "./bootstrap.js"

const createScope = () => {
  const blocks = [{ id: bootstrap.getRandomNumber().toString().slice(2), names: {} }]

  return {
    enter: () => {
      const id = bootstrap.getRandomNumber().toString().slice(2)
      blocks.push({ id, names: {} })
    },
    add: (nameString, value) => {
      const currentBlock = blocks.at(-1)
      currentBlock.names[nameString] = value
    },
    get: nameString => {
      let depth = blocks.length - 1
      while (depth >= 0) {
        const result = blocks[depth].names[nameString]
        if (result) return result
        depth -= 1
      }
    },
    exit: () => {
      delete blocks[blocks.length - 1]
    },
  }
}
const scope = createScope()

scope.add(
  "log",
  (() => {
    const memoryObject = createMemoryObject()
    memoryObject.assignFunction(console.log)
    return memoryObject
  })()
)

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
    const functionValue = args => {
      scope.enter()

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
      execute(statementsNode)
      scope.exit()
    }
    const memoryObject = createMemoryObject()
    memoryObject.assignFunction(functionValue)
    return memoryObject
  },
  parameters: () => {
    throw new Error("Syntax error") // Only meant to be executed in function node
  },
  statements: (...nodes) => {
    nodes.forEach(node => {
      execute(node)
    })
  },
  call: (nameNode, argumentsNode) => {
    const args = execute(argumentsNode)
    const functionValue = execute(nameNode)
    return bootstrap.call(functionValue, args)
  },
  arguments: (...nodes) => {
    const results = nodes.map(node => execute(node))
    return results
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
  ifStatement: (conditionNode, thenNode, ...elseIfNodes) => {
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
        output += execute(node[1])
      } else {
        throw new Error("Syntax error")
      }
    })
    return output
  },
  object: (...nodes) => {
    const memoryObject = createMemoryObject()
    let index = 0
    nodes.forEach(node => {
      if (node[0] === "name") {
        const result = execute(node)
        memoryObject.setIndex(index, result)
        index += 1
      } else if (node[0] === "named") {
        const nameString = node[1]
        result = (() => {
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

const compiled = [
  "statements",
  [
    "assign",
    ["name", "result"],
    [
      "ternary",
      [
        "condition",
        [
          "equals",
          ["multiply", ["number", "3"], ["parentheses", ["add", ["number", "1"], ["number", "1"]]]],
          ["number", "6"],
        ],
      ],
      ["then", ["string", ["stringContent", '"fantastic"']]],
      ["else", ["string", ["stringContent", '"huh?"']]],
    ],
  ],
  ["call", ["name", "log"], ["arguments", ["name", "result"]]],
]

/* prettier-ignore */
// const compiled = (
//   ["statements",
//     ["assign",
//       ["name", "greet"],
//       ["function",
//         ["parameters", ["name", "nameString"]],
//         ["statements",
//           ["call",
//             ["read", ["name", "console"], ["name", "log"]],
//             ["arguments",
//               ["string", ["stringText", "hello, "], ["stringReplacement", ["name", "nameString"]]],
//             ],
//           ],
//         ]
//       ],
//     ],
//     ["call", ["name", "greet"], ["arguments", ["string", ["stringText", "Philonius"]]]]
//   ]
// )
//
execute(compiled)

globalThis.runtime = runtime
