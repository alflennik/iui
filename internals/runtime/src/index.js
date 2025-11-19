import { fpFromDecimal } from "@hastom/fixed-point"

const variables = {
  log: console.log,
}

const runtime = {
  variables,
  fpFromDecimal,
  execute: () => {
    console.log("hello from runtime")
  },
}

globalThis.runtime = runtime
