let [inputFilePath, outputFilePath] = (() => {
  let checked = 0

  if (process.argv[0].endsWith("/node")) {
    checked += 1
  }

  if (process.argv[checked].endsWith("/iui")) {
    checked += 1
  }

  return [process.argv[checked], process.argv[checked + 1]]
})()

if (!inputFilePath) {
  console.error("Please specify a file you would like to run")
  process.exit(1)
}

const processFile = async () => {
  // Sets runtime global
  await import("../runtime/runtime.js")

  // TODO: make this less awkward
  const compile = require("../compiler/compiler")
  const { execute } = require("../interpreter/core")
  const path = require("node:path")
  const fs = require("node:fs/promises")

  const fullInputPath = path.resolve(process.cwd(), inputFilePath)

  const fileExists = !!(await fs.stat(fullInputPath).catch(() => false))

  if (!fileExists) {
    console.error(`File '${inputFilePath}' does not exist`)
    process.exit(1)
  }

  if (outputFilePath) {
    throw new Error("Not implemented")
  } else {
    const sourceCode = await fs.readFile(fullInputPath, { encoding: "utf-8" })

    const sourceTree = compile(sourceCode)

    execute(sourceTree)
  }
}

processFile()
