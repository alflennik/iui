const compile = require("../compiler/compiler")
const path = require("node:path")
const fs = require("node:fs/promises")
const { spawn } = require("node:child_process")

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
  const fullInputPath = path.resolve(process.cwd(), inputFilePath)

  const fileExists = !!(await fs.stat(fullInputPath).catch(() => false))

  if (!fileExists) {
    console.error(`File '${inputFilePath}' does not exist`)
    process.exit(1)
  }

  const sourceCode = await fs.readFile(fullInputPath, { encoding: "utf-8" })

  const sourceTree = compile(sourceCode)

  const runtime = await fs.readFile(path.resolve(__dirname, "../runtime/runtime.js"), {
    encoding: "utf-8",
  })

  // TODO: output should be source code, not source tree.
  const js = `
    const sourceTree = ${JSON.stringify(sourceTree, null, 2)};

    ${runtime};

    runtime.execute(sourceTree)
  `

  if (outputFilePath) {
    await fs.writeFile(outputFilePath, js, { encoding: "utf-8" })
  } else {
    await new Promise(resolve => {
      const child = spawn("node", ["-e", js], {
        stdio: "inherit",
      })

      child.on("close", code => {
        resolve()
      })
    })
  }
}

processFile()
