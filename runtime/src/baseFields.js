const getBaseFields = memoryObject => {
  if (memoryObject.getStorageType() === "number") {
    return {
      toString: () => {
        return memoryObject.getValue().toDecimalString()
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

export default getBaseFields
