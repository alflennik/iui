import getBaseFields from "./baseFields.js"
import bootstrap from "./bootstrap.js"

const log = args => {
  const memoryObject = args.positional[0]
  const baseFields = getBaseFields(memoryObject)
  bootstrap.log(baseFields.toString())
}

export default {
  log,
}
