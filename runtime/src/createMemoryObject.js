// Not used yet

const valuesSymbol = Symbol("values")

const createMemoryObject = () => {
  const defaultValues = {
    storageType: "null",
    objectFields: new Map(),
    objectIndexes: [],
    function: null,
    number: null,
    string: null,
    null: false,
    boolean: null,
    error: null,
  }

  let values = {
    ...defaultValues,
  }

  const container = {
    // Use symbol to make these read-only
    [valuesSymbol]: values,
    getStorageType: () => values.storageType,
    setBaseFields: baseFields => {
      values.baseFields = baseFields
    },
    assignNumber: number => {
      Object.keys(values).map(key => {
        if (key === "storageType") {
          values.storageType = "number"
        } else if (key === "number") {
          values.number = number
        } else {
          values[key] = defaultValues[key]
        }
      })
    },
    assignObject: object => {
      // Ensure this memory object shares the same memory as the assigned object so current and
      // future values alike continue to be shared
      values = object[valuesSymbol]
    },
    assignString: basicString => {
      Object.keys(values).map(key => {
        if (key === "storageType") {
          values.storageType = "string"
        } else if (key === "string") {
          values.string = basicString
        } else {
          values[key] = defaultValues[key]
        }
      })
    },
    assignNull: () => {
      Object.keys(values).map(key => {
        if (key === "storageType") {
          values.storageType = "null"
        } else if (key === "null") {
          values.null = true
        } else {
          values[key] = defaultValues[key]
        }
      })
    },
    assignBoolean: booleanValue => {
      Object.keys(values).map(key => {
        if (key === "storageType") {
          values.storageType = "boolean"
        } else if (key === "boolean") {
          values.boolean = booleanValue
        } else {
          values[key] = defaultValues[key]
        }
      })
    },
    assignFunction: functionValue => {
      Object.keys(values).map(key => {
        if (key === "storageType") {
          values.storageType = "function"
        } else if (key === "function") {
          values.function = functionValue
        } else {
          values[key] = defaultValues[key]
        }
      })
    },
    reassign: memoryObject => {
      newValues = memoryObject[valuesSymbol]
      Object.keys(key => {
        values[key] = newValues[key]
      })
    },
    read: nameString => {
      result = values.objectFields.get(nameString)
      if (result === undefined) return null
      return result
    },
    access: memoryObject => {
      accessValues = memoryObject[valuesSymbol]
      if (accessValues.number) {
        const jsNumber = accessValues.number.toDecimal()
        const result = objectIndexes.at(jsNumber)
        if (result === undefined) return null
        return result
      }
      if (accessValues.string) {
        const result = values.objectFields.get(accessValues.string)
        if (result === undefined) return null
        return result
      }
      if (accessValues.null || accessValues.error) {
        return null
      }
    },
    accessRange: (numberObject1, numberObject2 = null) => {
      const number1 = numberObject1[valuesSymbol].number.toDecimal()
      let number2
      if (numberObject2) {
        number2 = numberObject2[valuesSymbol].number.toDecimal()
      }

      if (values.string) {
        const newString = values.string.slice(number1, number2)
        const newMemoryObject = createMemoryObject()
        newMemoryObject.assignString(newString)
        return newMemoryObject
      }
      newObjectIndexes = values.objectIndexes.slice(number1, number2)
      const newMemoryObject = createMemoryObject()
      newMemoryObject.assignIndexes(newObjectIndexes)
    },
    getValue: () => {
      return values[values.storageType]
    },
    setIndex: (index, memoryObject) => {
      values.objectIndexes[index] = memoryObject
    },
    setName: (nameString, memoryObject) => {
      values.objectFields.set(nameString, memoryObject)
    },
  }

  return container
}

export default createMemoryObject
