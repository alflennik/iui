const fs = require("node:fs/promises")
const path = require("node:path")
const { exec } = require("node:child_process")
const { promisify } = require("node:util")

const execAsync = promisify(exec)

const runtimeFolderPath = path.resolve(__dirname, "../", "runtime")
const runtimeFolderTmpPath = path.join(runtimeFolderPath, "temp")

const setUpRuntime = async () => {
  await emptyRuntimeFolder()

  const { success, output } = await runCommand("npm init --yes")
  if (!success) throw new Error(output)

  console.log("installing @hastom/fixed-point")
  await runCommand("npm i @hastom/fixed-point")
  console.log("installing esbuild")
  await runCommand("npm i esbuild")
  await runCommand("./node_modules/.bin/esbuild --version") // check it works

  console.log("bundling runtime")

  await fs.writeFile(
    path.join(runtimeFolderTmpPath, "./index.js"),
    `
      import { fpFromDecimal } from "@hastom/fixed-point"

      const variables = {
        log: console.log
      }

      const runtime = {
        variables,
        fpFromDecimal
      }

      globalThis.runtime = runtime
    `
  )

  await runCommand("./node_modules/.bin/esbuild index.js --bundle --outfile=bundled.js")

  await runCommand("cp bundled.js ../runtime.js")

  await emptyRuntimeTmpFolder()

  console.log("done.")

  // console.log("success", success, "output", output)
}

const emptyRuntimeFolder = async () => {
  await fs.rm(runtimeFolderPath, { recursive: true, force: true })
  await fs.mkdir(runtimeFolderPath, { recursive: true })
  await fs.mkdir(runtimeFolderTmpPath, { recursive: true })
}

const emptyRuntimeTmpFolder = async () => {
  await fs.rm(runtimeFolderTmpPath, { recursive: true, force: true })
}

const runCommand = async command => {
  const { stdout, stderr } = await execAsync(command, { cwd: runtimeFolderTmpPath })
  const output = stdout + stderr
  return { success: true, output }
}

setUpRuntime()
