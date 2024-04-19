const pick = (object, keys) => {
  const newObject = {}
  keys.forEach(key => {
    newObject[key] = object[key]
  })
  return newObject
}

export default pick
