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

  try {
    await runCommand("npm init --yes")

    console.info("installing @hastom/fixed-point")
    await runCommand("npm i @hastom/fixed-point")
    console.info("installing crypto-random")
    await runCommand("npm i crypto-random")
    console.info("installing esbuild")
    await runCommand("npm i esbuild")
    await runCommand("./node_modules/.bin/esbuild --version") // check it works

    console.info("bundling runtime environment")

    await fs.copyFile(
      path.join(runtimeFolderPath, "./src/index.js"),
      path.join(tempFolderPath, "./index.js")
    )

    await runCommand(
      "./node_modules/.bin/esbuild index.js --bundle --outfile=bundled.js --external:crypto"
    )

    await runCommand("cp bundled.js ../runtime.js")
  } catch (error) {
    console.error(error)
  } finally {
    await deleteTempFolder()
  }

  console.info("done.")
  // console.log("success", success, "output", output)
}

const deleteAllGeneratedFiles = async () => {
  await fs.rm(path.join(runtimeFolderPath, "runtime.js"), { force: true })
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
