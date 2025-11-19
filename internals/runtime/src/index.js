import { fpFromDecimal } from "@hastom/fixed-point"

// A BigInt can have up to 19 decimal digits and fit into 64 bits of value storage.
const officialPrecision = 18 // largest possible number is 999 quadrillion

// Enables digits of rounding, so 1/3 + 1/3 + 1/3 = 1 instead of 0.9999999
const extraDigitsOfHiddenPrecision = 1

const internalPrecision = officialPrecision + extraDigitsOfHiddenPrecision

const scopeVars = {
  console,
  log: console.log,
}

const core = {
  name: nameString => {
    return {
      nameString,
      get: () => scopeVars[nameString],
      createForAssignment: () => nameString,
    }
  },
  read: (node1, node2) => {
    const name1 = execute(node1)
    const name2 = execute(node2)
    return scopeVars[name1.nameString][name2.nameString]
  },
  add: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    return result1.add(result2)
  },
  multiply: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    return result1.mul(result2)
  },
  number: numberValue => {
    return fpFromDecimal(numberValue, internalPrecision)
  },
  equals: (node1, node2) => {
    const result1 = execute(node1)
    const result2 = execute(node2)
    return result1.eq(result2) // only supports numbers right now
  },
  function: (parametersNode, statementsNode) => {
    return args => {
      execute(["parameters", args, ...parametersNode.slice(1)])
      execute(statementsNode)
    }
  },
  parameters: (args, ...nodes) => {
    nodes.forEach((node, index) => {
      execute(["assign", node, ["rawValue", args[index]]])
    })
  },
  statements: (...nodes) => {
    nodes.forEach(node => {
      execute(node)
    })
  },
  call: (nameNode, argumentsNode) => {
    const args = execute(argumentsNode)
    const functionValue = execute(nameNode)
    let functionCallable
    if (functionValue.nameString) {
      functionCallable = functionValue.get()
    } else {
      functionCallable = functionValue
    }
    const extracted = args.map(arg => (arg.nameString ? arg.get() : arg))
    functionCallable(extracted)
  },
  arguments: (...nodes) => {
    const results = nodes.map(node => execute(node))
    return results
  },
  assign: (node1, node2) => {
    const name = execute(node1)
    value = execute(node2)

    scopeVars[name.nameString] = value
    return value
  },
  ternary: (node1, node2, node3) => {
    const name = execute(node1[1])
    if ((name.nameString && name.get()) || name) {
      return execute(node2[1])
    } else {
      return execute(node3[1])
    }
  },
  parentheses: node1 => {
    return execute(node1)
  },
  rawValue: arbitraryData => {
    return arbitraryData
  },
  string: (...nodes) => {
    let output = ""
    nodes.forEach(node => {
      if (node[0] === "stringContent") {
        output += node[1]
      } else if (node[0] === "stringReplacement") {
        const name = execute(node[1])
        output += name.get()
      }
    })
    return output
  },
}

const execute = node => {
  const coreFunction = core[node[0]]
  if (!coreFunction) throw new Error(`Invalid Syntax at ${node[0]}`)
  return coreFunction(...node.slice(1))
}

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

// const compiled = [
//   "statements",
//   [
//     "assign",
//     ["name", "result"],
//     [
//       "ternary",
//       [
//         "condition",
//         [
//           "equals",
//           ["multiply", ["number", "3"], ["parentheses", ["add", ["number", "1"], ["number", "1"]]]],
//           ["number", "6"],
//         ],
//       ],
//       ["then", ["string", ["stringContent", '"fantastic"']]],
//       ["else", ["string", ["stringContent", '"huh?"']]],
//     ],
//   ],
//   ["call", ["name", "log"], ["arguments", ["name", "result"]]],
// ]
//
// execute(compiled)

globalThis.runtime = runtime
