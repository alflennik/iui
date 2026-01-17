const {
  fpFromDecimal,
  extraDigitsOfHiddenPrecision,
  internalPrecision,
  officialPrecision,
  bootstrap,
} = runtime

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

const getBaseFields = memoryObject => {
  if (memoryObject.getStorageType() === "number") {
    return {
      toString: () => {
        const removeTrailingZeros = str => {
          return str.replace(/(^[0-9]+\..*?)(0+$)/, "$1").replace(/\.$/, "")
        }

        const roundOffPrecisionDigits = fixedPointNumber => {
          const digitsOfOfficialPrecision = fpFromDecimal(
            `1${"0".repeat(officialPrecision - 1)}`,
            internalPrecision
          )
          return fixedPointNumber
            .mul(digitsOfOfficialPrecision)
            .round()
            .div(digitsOfOfficialPrecision)
        }

        const hidePrecisionDigits = str => {
          return str.slice(0, -extraDigitsOfHiddenPrecision)
        }

        return removeTrailingZeros(
          hidePrecisionDigits(roundOffPrecisionDigits(memoryObject.getValue()).toDecimalString())
        )
      },
    }
  }

  if (memoryObject.getStorageType() === "string") {
    return {
      toString: () => {
        return memoryObject.getValue()
      },
    }
  }

  throw new Error("Not implemented")
}

module.exports = { createScope, createControlFlow, getBaseFields }
