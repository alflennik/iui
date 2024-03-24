const getTokenizer = require("./tokenizer")

const pick = (object, keys) => {
  const newObject = {}
  keys.forEach(key => {
    newObject[key] = object[key]
  })
  return newObject
}

const expect = input => {
  return {
    toEqual: output => {
      if (JSON.stringify(input) !== JSON.stringify(output))
        throw new Error(`${JSON.stringify(input)} did not equal ${JSON.stringify(output)}`)
    },
  }
}

const test = async (name, body) => {
  try {
    body()
  } catch (error) {
    console.error("[FAILED]", name)
    console.error(error)
    return
  }

  console.log("[PASSED]", name)
}

test("tokenizer can read strings", () => {
  const code = `
    a = "hello"
    b = _"He said, "Yo.""_
    c = "He said {a}"
    d = _"He said, "_{a}_.""_
    e = __"String d is _"He said, "_{a}_.""_ and equals __{d}__"__
    f = "apples, {"bananas"}, cranberries"
    g = "unwise, {"wild, {"arbitrary {"and excessively nested"}"}"}"
    h = "honestly, {_"I hope _{__"no one __{___"does this"___}__"__}_"_}."
  `

  const tokenizer = getTokenizer(code)

  const readToken = () => pick(tokenizer.readToken(), ["type", "value"])

  // a = "hello"
  expect(readToken()).toEqual({ type: "word", value: "a" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "hello" })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  // b = _"He said, "Yo.""_
  expect(readToken()).toEqual({ type: "word", value: "b" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '_"' })
  expect(readToken()).toEqual({ type: "string", value: 'He said, "Yo."' })
  expect(readToken()).toEqual({ type: "term", value: '"_' })

  // c = "He said {a}"
  expect(readToken()).toEqual({ type: "word", value: "c" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "He said " })
  expect(readToken()).toEqual({ type: "term", value: "{" })
  expect(readToken()).toEqual({ type: "word", value: "a" })
  expect(readToken()).toEqual({ type: "term", value: "}" })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  // d = _"He said, "_{a}_.""_
  expect(readToken()).toEqual({ type: "word", value: "d" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '_"' })
  expect(readToken()).toEqual({ type: "string", value: 'He said, "' })
  expect(readToken()).toEqual({ type: "term", value: "_{" })
  expect(readToken()).toEqual({ type: "word", value: "a" })
  expect(readToken()).toEqual({ type: "term", value: "}_" })
  expect(readToken()).toEqual({ type: "string", value: '."' })
  expect(readToken()).toEqual({ type: "term", value: '"_' })

  // e = __"String d is _"He said, "_{a}_.""_ and equals __{d}__"__
  expect(readToken()).toEqual({ type: "word", value: "e" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '__"' })
  expect(readToken()).toEqual({
    type: "string",
    value: 'String d is _"He said, "_{a}_.""_ and equals ',
  })
  expect(readToken()).toEqual({ type: "term", value: "__{" })
  expect(readToken()).toEqual({ type: "word", value: "d" })
  expect(readToken()).toEqual({ type: "term", value: "}__" })
  expect(readToken()).toEqual({ type: "term", value: '"__' })

  // g = "unwise, {"wild, {"arbitrary {"and excessively nested"}"}"}"
  expect(readToken()).toEqual({ type: "word", value: "g" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "unwise, " })
  expect(readToken()).toEqual({ type: "term", value: "{" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "wild, " })
  expect(readToken()).toEqual({ type: "term", value: "{" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "arbitrary " })
  expect(readToken()).toEqual({ type: "term", value: "{" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "and excessively nested" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "term", value: "}" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "term", value: "}" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "term", value: "}" })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  // h = "honestly, {_"I hope _{__"no one __{___"does this"___}__"__}_"_}."
  expect(readToken()).toEqual({ type: "word", value: "h" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "honestly, " })
  expect(readToken()).toEqual({ type: "term", value: "{" })
  expect(readToken()).toEqual({ type: "term", value: '_"' })
  expect(readToken()).toEqual({ type: "string", value: "I hope " })
  expect(readToken()).toEqual({ type: "term", value: "_{" })
  expect(readToken()).toEqual({ type: "term", value: '__"' })
  expect(readToken()).toEqual({ type: "string", value: "no one " })
  expect(readToken()).toEqual({ type: "term", value: "__{" })
  expect(readToken()).toEqual({ type: "term", value: '___"' })
  expect(readToken()).toEqual({ type: "string", value: "does this" })
  expect(readToken()).toEqual({ type: "term", value: '"___' })
  expect(readToken()).toEqual({ type: "term", value: "}__" })
  expect(readToken()).toEqual({ type: "term", value: '"__' })
  expect(readToken()).toEqual({ type: "term", value: "}_" })
  expect(readToken()).toEqual({ type: "term", value: '"_' })
  expect(readToken()).toEqual({ type: "term", value: "}" })
  expect(readToken()).toEqual({ type: "string", value: "." })
  expect(readToken()).toEqual({ type: "term", value: '"' })
})
