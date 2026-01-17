const { createMemoryObject, createExecute, setExecute } = runtime

const createCore = require("./core")
const { createScope, createControlFlow } = require("./coreLibrary")
const standardLibrary = require("./standardLibrary")

const scope = createScope()

Object.entries(standardLibrary).map(([name, functionValue]) => {
  const memoryObject = createMemoryObject()
  memoryObject.assignFunction(functionValue)
  scope.add(name, memoryObject)
})

const controlFlow = createControlFlow()

const { core, executeIsReady } = createCore({ controlFlow, scope })

const execute = createExecute(core)
setExecute(execute)
executeIsReady(execute)

module.exports = execute
