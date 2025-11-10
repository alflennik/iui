// Execute this file with Node in order to make changes to runtime.js

const fs = require("node:fs/promises")
const path = require("node:path")
const { exec } = require("node:child_process")
const { promisify } = require("node:util")

const execAsync = promisify(exec)

const runtimeFolderPath = path.resolve(__dirname)
const tempFolderPath = path.join(runtimeFolderPath, "temp")

const generateRuntime = async () => {
  await deleteAllGeneratedFiles()

  await runCommand("npm init --yes")

  console.info("installing @hastom/fixed-point")
  await runCommand("npm i @hastom/fixed-point")
  console.info("installing esbuild")
  await runCommand("npm i esbuild")
  await runCommand("./node_modules/.bin/esbuild --version") // check it works

  console.info("bundling runtime environment")

  await fs.writeFile(
    path.join(tempFolderPath, "./index.js"),
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

  await deleteTempFolder()

  console.info("done.")

  // console.log("success", success, "output", output)
}

const deleteAllGeneratedFiles = async () => {
  await fs.rm(path.join(runtimeFolderPath, "runtime.js"))
  await fs.mkdir(tempFolderPath, { recursive: true })
}

const deleteTempFolder = async () => {
  await fs.rm(tempFolderPath, { recursive: true, force: true })
}

const runCommand = async command => {
  const { stdout, stderr } = await execAsync(command, { cwd: tempFolderPath })
  return stdout + stderr
}

generateRuntime()
