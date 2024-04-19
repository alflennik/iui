const parseName = () => {
  const nameToken = tokenizer.nextToken()
  return { type: "name", name: nameToken.value }
}

export { parseName }
