const parseName = () => {
  const name = tokenizer.nextToken()
  return { type: "name", name }
}

module.exports = { parseName }
