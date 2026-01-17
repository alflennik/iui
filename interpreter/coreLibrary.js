const { fpFromDecimal, extraDigitsOfHiddenPrecision, internalPrecision, officialPrecision } =
  runtime

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

module.exports = { getBaseFields }
