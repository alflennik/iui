import createMemoryObject from "./createMemoryObject.js"
import bootstrap, {
  createExecute,
  extraDigitsOfHiddenPrecision,
  internalPrecision,
  officialPrecision,
  setExecute,
} from "./bootstrap.js"
import { fpFromDecimal } from "@hastom/fixed-point"

// const startTime = performance.now()
// const result = execute(compiled)
// const endTime = performance.now()
// console.log(result)
// console.log(`Execution time: ${endTime - startTime}ms`)

const runtime = {
  createMemoryObject,
  bootstrap,
  createExecute,
  setExecute,
  extraDigitsOfHiddenPrecision,
  internalPrecision,
  officialPrecision,
  fpFromDecimal,
}

globalThis.runtime = runtime
