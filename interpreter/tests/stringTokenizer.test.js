const { test, expect } = require("../../test")
const { getTokenizer, isStringStartBracket } = require("../tokenizer/tokenizer")

const pick = (object, keys) => {
  const newObject = {}
  keys.forEach(key => {
    newObject[key] = object[key]
  })
  return newObject
}

const getCurrentLineNumber = () => {
  const error = new Error()
  return Number(error.stack.match(/:\d+:\d+/g)[1].match(/:(\d+)/)[1])
}

test("isValidStringBracket can validate correct brackets", () => {
  const validBrackets = [
    String.raw`"`,
    String.raw`_"`,
    String.raw`\_"`,
    String.raw`\__"`,
    String.raw`\n"`,
    String.raw`\s"`,
    String.raw`_\n"`,
    String.raw`__\s"`,
    String.raw`\_\s"`,
    String.raw`\__\n"`,
    String.raw`\___\n"`,
  ]
  const invalidBrackets = [
    String.raw`_\"`,
    String.raw`\\_"`,
    String.raw`\\"`,
    String.raw`\n`,
    String.raw`\ss"`,
    String.raw`\s_"`,
    String.raw`__s"`,
    String.raw`\s__"`,
  ]
  validBrackets.forEach(validBracket => {
    expect(isStringStartBracket(validBracket)).toEqual(true)
  })
  invalidBrackets.forEach(invalidBracket => {
    expect(isStringStartBracket(invalidBracket)).toEqual(false)
  })
  console.log()
})

test("tokenizer can read strings", () => {
  const code = String.raw`
    a = "hello"
    b = _"He said, "Yo.""_
    c = "He said {a}"
    d = _"He said, "_{a}_.""_
    e = __"String d is _"He said, "_{a}_.""_ and equals __{d}__"__
    f = "apples, {"bananas"}, cranberries"
    g = "unwise, {"wild, {"arbitrary {"and excessively nested"}"}"}"
    h = "honestly, {_"I hope _{__"no one __{___"does this"___}__"__}_"_}."
    i = "Tasks for today:\n- Email Paul\n- Submit expense report"
    j = _"Tasks for today:\n- Email "coderman"\n- Submit expense report"_
    k = \_"[ \t\n]*"_
    l = \_"Tasks for today:\_n- Email Paul\_n- Replace all "\t" with spaces"_
    m = "Tasks for today:\n- Email Paul\n- Replace all \"\\t\" with spaces"
    n = \__"The strings "\\n" and \_"\n"_ will produce equivalent output."__
    o = \__"To create regex selecting whitespace use getRegex(\_"[ \t\n]*"_)""__

    p = 
      "Strings are able to cross multiple lines, but the tokenizer should not 
        process the whitespace. The parser is better equipped to do that."

    q = 
      \n"Newline strings have different parsing behavior but the tokenizer 
        should treat them similarly."

    r = 
      \s"Whitespace strings have different parsing behavior but the tokenizer 
        should treat them similarly."

    s = \n"\
      Tasks for today:
      - Email Paul
      - Replace all \"\\t\" with spaces
      - Submit {reportType} report
    "

    t = _\n"\
      Tasks for today:
      - Email Paul
      - Replace all "\\t" with spaces
      - Submit _{reportType}_ report
    "_

    u = \_\n"\_
      Tasks for today:
      - Email Paul
      - Replace all "\t" with spaces
      - Submit _{reportType}_ report
    "_

    v = \__\s"\__
Tasks for today:
- Email Paul
- Replace all "\t" with spaces
- Submit __{reportType}__ report
"__
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

  // f = "apples, {"bananas"}, cranberries"
  expect(readToken()).toEqual({ type: "word", value: "f" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "apples, " })
  expect(readToken()).toEqual({ type: "term", value: "{" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "string", value: "bananas" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({ type: "term", value: "}" })
  expect(readToken()).toEqual({ type: "string", value: ", cranberries" })
  expect(readToken()).toEqual({ type: "term", value: '"' })

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

  // i = "Tasks for today:\n- Email Paul\n- Submit expense report"
  expect(readToken()).toEqual({ type: "word", value: "i" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\n- Email Paul\n- Submit expense report`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  // j = _"Tasks for today:\n- Email "coderman"\n- Submit expense report"_
  expect(readToken()).toEqual({ type: "word", value: "j" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '_"' })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\n- Email "coderman"\n- Submit expense report`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"_' })

  // k = \_"[ \t\n]*"_
  expect(readToken()).toEqual({ type: "word", value: "k" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\_"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`[ \t\n]*`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"_' })

  // l = \_"Tasks for today:\_n- Email Paul\_n- Replace all "\t" with spaces"_
  expect(readToken()).toEqual({ type: "word", value: "l" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\_"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\_n- Email Paul\_n- Replace all "\t" with spaces`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"_' })

  // m = "Tasks for today:\n- Email Paul\n- Replace all \"\\t\" with spaces"
  expect(readToken()).toEqual({ type: "word", value: "m" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\n- Email Paul\n- Replace all \"\\t\" with spaces`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  // n = \__"The strings "\\n" and \_"\n"_ will produce equivalent output."__
  expect(readToken()).toEqual({ type: "word", value: "n" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\__"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`The strings "\\n" and \_"\n"_ will produce equivalent output.`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"__' })

  // o = \__"To create regex selecting whitespace use getRegex(\_"[ \t\n]*"_)""__
  expect(readToken()).toEqual({ type: "word", value: "o" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\__"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`To create regex selecting whitespace use getRegex(\_"[ \t\n]*"_)"`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"__' })

  /*
    p = 
      "Strings are able to cross multiple lines, but the tokenizer should not 
        process the whitespace. The parser is better equipped to do that."
  */
  expect(readToken()).toEqual({ type: "word", value: "p" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: '"' })
  expect(readToken()).toEqual({
    type: "string",
    value: `Strings are able to cross multiple lines, but the tokenizer should not 
        process the whitespace. The parser is better equipped to do that.`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  /*
    q = 
      \n"Newline strings have different parsing behavior but the tokenizer 
        should treat them similarly."
  */
  expect(readToken()).toEqual({ type: "word", value: "q" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\n"` })
  expect(readToken()).toEqual({
    type: "string",
    value: `Newline strings have different parsing behavior but the tokenizer 
        should treat them similarly.`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  /*
    r = 
      \s"Whitespace strings have different parsing behavior but the tokenizer 
        should treat them similarly."
  */
  expect(readToken()).toEqual({ type: "word", value: "r" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\s"` })
  expect(readToken()).toEqual({
    type: "string",
    value: `Whitespace strings have different parsing behavior but the tokenizer 
        should treat them similarly.`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  /*
    s = \n"\
      Tasks for today:
      - Email Paul
      - Replace all \"\\t\" with spaces
      - Submit {reportType} report
    "
  */
  expect(readToken()).toEqual({ type: "word", value: "s" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\n"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`\
      Tasks for today:
      - Email Paul
      - Replace all \"\\t\" with spaces
      - Submit `,
  })
  expect(readToken()).toEqual({ type: "term", value: "{" })
  expect(readToken()).toEqual({ type: "word", value: "reportType" })
  expect(readToken()).toEqual({ type: "term", value: "}" })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw` report
    `,
  })
  expect(readToken()).toEqual({ type: "term", value: '"' })

  /*
    t = _\n"\
      Tasks for today:
      - Email Paul
      - Replace all "\\t" with spaces
      - Submit _{reportType}_ report
    "_
  */
  expect(readToken()).toEqual({ type: "word", value: "t" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`_\n"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`\
      Tasks for today:
      - Email Paul
      - Replace all "\\t" with spaces
      - Submit `,
  })
  expect(readToken()).toEqual({ type: "term", value: "_{" })
  expect(readToken()).toEqual({ type: "word", value: "reportType" })
  expect(readToken()).toEqual({ type: "term", value: "}_" })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw` report
    `,
  })
  expect(readToken()).toEqual({ type: "term", value: '"_' })

  /*
    u = \_\n"\_
      Tasks for today:
      - Email Paul
      - Replace all "\t" with spaces
      - Submit _{reportType}_ report
    "_
  */
  expect(readToken()).toEqual({ type: "word", value: "u" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\_\n"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`\_
      Tasks for today:
      - Email Paul
      - Replace all "\t" with spaces
      - Submit `,
  })
  expect(readToken()).toEqual({ type: "term", value: "_{" })
  expect(readToken()).toEqual({ type: "word", value: "reportType" })
  expect(readToken()).toEqual({ type: "term", value: "}_" })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw` report
    `,
  })
  expect(readToken()).toEqual({ type: "term", value: '"_' })

  /*
    v = \__\s"\__
Tasks for today:
- Email Paul
- Replace all "\t" with spaces
- Submit __{reportType}__ report
"__
  */
  expect(readToken()).toEqual({ type: "word", value: "v" })
  expect(readToken()).toEqual({ type: "term", value: "=" })
  expect(readToken()).toEqual({ type: "term", value: String.raw`\__\s"` })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw`\__
Tasks for today:
- Email Paul
- Replace all "\t" with spaces
- Submit `,
  })
  expect(readToken()).toEqual({ type: "term", value: "__{" })
  expect(readToken()).toEqual({ type: "word", value: "reportType" })
  expect(readToken()).toEqual({ type: "term", value: "}__" })
  expect(readToken()).toEqual({
    type: "string",
    value: String.raw` report
`,
  })
  expect(readToken()).toEqual({ type: "term", value: '"__' })
})

test("tokenizer can identify issues with strings", () => {
  const getErrors = (fail, lineNumber) => {
    const { errors } = getTokenizer(fail, {
      filePath: __filename,
      startingLineNumber: lineNumber,
    })
    return errors
  }

  const fail1LineStart = getCurrentLineNumber() + 1
  const fail1 = `
    a = "
    b = ""
    c = ""
  `

  expect(getErrors(fail1, fail1LineStart)).toEqual([
    `Found open string \`"\` which was not closed\n  at ${__filename}:${fail1LineStart + 3}:10`,
  ])

  const fail2LineStart = getCurrentLineNumber() + 1
  const fail2 = `
    greeting = "hello"
    a = "She said {greeting"
    b = ""
    c = ""
  `

  expect(getErrors(fail2, fail2LineStart)).toEqual([
    `Found open string \`"\` which was not closed\n  ` + `at ${__filename}:${fail2LineStart + 2}:9`,
    `Found open string substitution "{" which was not closed\n  ` +
      `at ${__filename}:${fail2LineStart + 2}:19`,
    `Found open string \`"\` which was not closed\n  ` +
      `at ${__filename}:${fail2LineStart + 4}:10`,
  ])

  const fail3LineStart = getCurrentLineNumber() + 1
  const fail3 = `
    a = __"should be two underscores"___
  `

  expect(getErrors(fail3, fail3LineStart)).toEqual([
    `String should be closed with \`"__\` but found an extra \`_\`\n  ` +
      `at ${__filename}:${fail3LineStart + 1}:40`,
  ])
})
