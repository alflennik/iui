const getCurrentLineNumber = () => {
  const error = new Error()
  return Number(error.stack.match(/:\d+:\d+/g)[1].match(/:(\d+)/)[1])
}

export default getCurrentLineNumber
