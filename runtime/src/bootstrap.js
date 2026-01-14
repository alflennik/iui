import { fpFromDecimal } from "@hastom/fixed-point"
import cryptoRandom from "crypto-random"
import createMemoryObject from "./createMemoryObject.js"

const getRandomNumber = () => cryptoRandom.value()

// A BigInt can have up to 19 decimal digits fit into 64 bits of value storage
const officialPrecision = 18 // largest possible number is 999 quadrillion

// Enables digits of rounding, so 1/3 + 1/3 + 1/3 = 1 instead of 0.9999999
const extraDigitsOfHiddenPrecision = 1

const internalPrecision = officialPrecision + extraDigitsOfHiddenPrecision

const createExecute = core => {
  return node => {
    const coreFunction = core[node[0]]
    if (!coreFunction) {
      throw new Error(`Invalid Syntax at ${node[0]}`)
    }
    return coreFunction(...node.slice(1))
  }
}

let execute
const setExecute = newExecute => {
  execute = newExecute
}

const bootstrap = {
  getRandomNumber: () => {
    return fpFromDecimal(getRandomNumber(), internalPrecision)
  },
  add: (memoryObject1, memoryObject2) => {
    const number1 = memoryObject1.getValue()
    const number2 = memoryObject2.getValue()
    const memoryObject = createMemoryObject()
    memoryObject.assignNumber(number1.add(number2))
    return memoryObject
  },
  subtract: (memoryObject1, memoryObject2) => {
    const number1 = memoryObject1.getValue()
    const number2 = memoryObject2.getValue()
    const memoryObject = createMemoryObject()
    memoryObject.assignNumber(number1.sub(number2))
    return memoryObject
  },
  multiply: (memoryObject1, memoryObject2) => {
    const number1 = memoryObject1.getValue()
    const number2 = memoryObject2.getValue()
    const memoryObject = createMemoryObject()
    memoryObject.assignNumber(number1.mul(number2))
    return memoryObject
  },
  numberEquals: (memoryObject1, memoryObject2) => {
    const number1 = memoryObject1.getValue()
    const number2 = memoryObject2.getValue()
    return number1.eq(number2)
  },
  number: numberValue => {
    return fpFromDecimal(numberValue, internalPrecision)
  },
  call: (memoryObject1, args) => {
    const functionValue = memoryObject1.getValue()
    return functionValue(args)
  },
  if: (conditionNode, thenNode, ...elseIfNodes) => {
    const condition = execute(conditionNode)
    if (condition) {
      return execute(thenNode[1])
    }
    for (let i = 0; i < elseIfNodes.length; i += 1) {
      if (elseIfNodes[i][0] === "condition") {
        const condition = execute(elseIfNodes[i][1])
        if (condition) {
          return execute(elseIfNodes[i][2])
        }
      } else if (elseIfNodes[i][0] === "then") {
        return execute(elseIfNodes[i][2])
      } else {
        throw new Error("Syntax error")
      }
    }
  },
  log: console.log,
}

export { createExecute, setExecute }
export default bootstrap
