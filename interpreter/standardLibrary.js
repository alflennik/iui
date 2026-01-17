const { getBaseFields } = require("./coreLibrary.js")

const { bootstrap } = runtime

const log = args => {
  const memoryObject = args.positional[0]
  const baseFields = getBaseFields(memoryObject)
  bootstrap.log(baseFields.toString())
}

module.exports = {
  log,
}
