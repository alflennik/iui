import { test, expect } from "../../test.js"
import { getTokenizer, isStringStartBracket } from "../tokenizer/tokenizer.js"
import getCurrentLineNumber from "../utilities/getCurrentLineNumber.js"
import pick from "../utilities/pick.js"

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
  const codeLineStart = getCurrentLineNumber() + 1
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

  const tokenizer = getTokenizer(code, {
    filePath: import.meta.url,
    startingLineNumber: codeLineStart,
  })

  const nextToken = () => pick(tokenizer.nextToken(), ["type", "value"])

  // a = "hello"
  expect(nextToken()).toEqual({ type: "name", value: "a" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "hello" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  // b = _"He said, "Yo.""_
  expect(nextToken()).toEqual({ type: "name", value: "b" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '_"' })
  expect(nextToken()).toEqual({ type: "string", value: 'He said, "Yo."' })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })

  // c = "He said {a}"
  expect(nextToken()).toEqual({ type: "name", value: "c" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "He said " })
  expect(nextToken()).toEqual({ type: "term", value: "{" })
  expect(nextToken()).toEqual({ type: "name", value: "a" })
  expect(nextToken()).toEqual({ type: "term", value: "}" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  // d = _"He said, "_{a}_.""_
  expect(nextToken()).toEqual({ type: "name", value: "d" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '_"' })
  expect(nextToken()).toEqual({ type: "string", value: 'He said, "' })
  expect(nextToken()).toEqual({ type: "term", value: "_{" })
  expect(nextToken()).toEqual({ type: "name", value: "a" })
  expect(nextToken()).toEqual({ type: "term", value: "}_" })
  expect(nextToken()).toEqual({ type: "string", value: '."' })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })

  // e = __"String d is _"He said, "_{a}_.""_ and equals __{d}__"__
  expect(nextToken()).toEqual({ type: "name", value: "e" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '__"' })
  expect(nextToken()).toEqual({
    type: "string",
    value: 'String d is _"He said, "_{a}_.""_ and equals ',
  })
  expect(nextToken()).toEqual({ type: "term", value: "__{" })
  expect(nextToken()).toEqual({ type: "name", value: "d" })
  expect(nextToken()).toEqual({ type: "term", value: "}__" })
  expect(nextToken()).toEqual({ type: "term", value: '"__' })

  // f = "apples, {"bananas"}, cranberries"
  expect(nextToken()).toEqual({ type: "name", value: "f" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "apples, " })
  expect(nextToken()).toEqual({ type: "term", value: "{" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "bananas" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "term", value: "}" })
  expect(nextToken()).toEqual({ type: "string", value: ", cranberries" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  // g = "unwise, {"wild, {"arbitrary {"and excessively nested"}"}"}"
  expect(nextToken()).toEqual({ type: "name", value: "g" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "unwise, " })
  expect(nextToken()).toEqual({ type: "term", value: "{" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "wild, " })
  expect(nextToken()).toEqual({ type: "term", value: "{" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "arbitrary " })
  expect(nextToken()).toEqual({ type: "term", value: "{" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "and excessively nested" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "term", value: "}" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "term", value: "}" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "term", value: "}" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  // h = "honestly, {_"I hope _{__"no one __{___"does this"___}__"__}_"_}."
  expect(nextToken()).toEqual({ type: "name", value: "h" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({ type: "string", value: "honestly, " })
  expect(nextToken()).toEqual({ type: "term", value: "{" })
  expect(nextToken()).toEqual({ type: "term", value: '_"' })
  expect(nextToken()).toEqual({ type: "string", value: "I hope " })
  expect(nextToken()).toEqual({ type: "term", value: "_{" })
  expect(nextToken()).toEqual({ type: "term", value: '__"' })
  expect(nextToken()).toEqual({ type: "string", value: "no one " })
  expect(nextToken()).toEqual({ type: "term", value: "__{" })
  expect(nextToken()).toEqual({ type: "term", value: '___"' })
  expect(nextToken()).toEqual({ type: "string", value: "does this" })
  expect(nextToken()).toEqual({ type: "term", value: '"___' })
  expect(nextToken()).toEqual({ type: "term", value: "}__" })
  expect(nextToken()).toEqual({ type: "term", value: '"__' })
  expect(nextToken()).toEqual({ type: "term", value: "}_" })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })
  expect(nextToken()).toEqual({ type: "term", value: "}" })
  expect(nextToken()).toEqual({ type: "string", value: "." })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  // i = "Tasks for today:\n- Email Paul\n- Submit expense report"
  expect(nextToken()).toEqual({ type: "name", value: "i" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\n- Email Paul\n- Submit expense report`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  // j = _"Tasks for today:\n- Email "coderman"\n- Submit expense report"_
  expect(nextToken()).toEqual({ type: "name", value: "j" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '_"' })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\n- Email "coderman"\n- Submit expense report`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })

  // k = \_"[ \t\n]*"_
  expect(nextToken()).toEqual({ type: "name", value: "k" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\_"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`[ \t\n]*`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })

  // l = \_"Tasks for today:\_n- Email Paul\_n- Replace all "\t" with spaces"_
  expect(nextToken()).toEqual({ type: "name", value: "l" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\_"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\_n- Email Paul\_n- Replace all "\t" with spaces`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })

  // m = "Tasks for today:\n- Email Paul\n- Replace all \"\\t\" with spaces"
  expect(nextToken()).toEqual({ type: "name", value: "m" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`Tasks for today:\n- Email Paul\n- Replace all \"\\t\" with spaces`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  // n = \__"The strings "\\n" and \_"\n"_ will produce equivalent output."__
  expect(nextToken()).toEqual({ type: "name", value: "n" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\__"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`The strings "\\n" and \_"\n"_ will produce equivalent output.`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"__' })

  // o = \__"To create regex selecting whitespace use getRegex(\_"[ \t\n]*"_)""__
  expect(nextToken()).toEqual({ type: "name", value: "o" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\__"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`To create regex selecting whitespace use getRegex(\_"[ \t\n]*"_)"`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"__' })

  /*
    p = 
      "Strings are able to cross multiple lines, but the tokenizer should not 
        process the whitespace. The parser is better equipped to do that."
  */
  expect(nextToken()).toEqual({ type: "name", value: "p" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: '"' })
  expect(nextToken()).toEqual({
    type: "string",
    value: `Strings are able to cross multiple lines, but the tokenizer should not 
        process the whitespace. The parser is better equipped to do that.`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  /*
    q = 
      \n"Newline strings have different parsing behavior but the tokenizer 
        should treat them similarly."
  */
  expect(nextToken()).toEqual({ type: "name", value: "q" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\n"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: `Newline strings have different parsing behavior but the tokenizer 
        should treat them similarly.`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  /*
    r = 
      \s"Whitespace strings have different parsing behavior but the tokenizer 
        should treat them similarly."
  */
  expect(nextToken()).toEqual({ type: "name", value: "r" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\s"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: `Whitespace strings have different parsing behavior but the tokenizer 
        should treat them similarly.`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  /*
    s = \n"\
      Tasks for today:
      - Email Paul
      - Replace all \"\\t\" with spaces
      - Submit {reportType} report
    "
  */
  expect(nextToken()).toEqual({ type: "name", value: "s" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\n"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`\
      Tasks for today:
      - Email Paul
      - Replace all \"\\t\" with spaces
      - Submit `,
  })
  expect(nextToken()).toEqual({ type: "term", value: "{" })
  expect(nextToken()).toEqual({ type: "name", value: "reportType" })
  expect(nextToken()).toEqual({ type: "term", value: "}" })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw` report
    `,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"' })

  /*
    t = _\n"\
      Tasks for today:
      - Email Paul
      - Replace all "\\t" with spaces
      - Submit _{reportType}_ report
    "_
  */
  expect(nextToken()).toEqual({ type: "name", value: "t" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`_\n"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`\
      Tasks for today:
      - Email Paul
      - Replace all "\\t" with spaces
      - Submit `,
  })
  expect(nextToken()).toEqual({ type: "term", value: "_{" })
  expect(nextToken()).toEqual({ type: "name", value: "reportType" })
  expect(nextToken()).toEqual({ type: "term", value: "}_" })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw` report
    `,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })

  /*
    u = \_\n"\_
      Tasks for today:
      - Email Paul
      - Replace all "\t" with spaces
      - Submit _{reportType}_ report
    "_
  */
  expect(nextToken()).toEqual({ type: "name", value: "u" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\_\n"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`\_
      Tasks for today:
      - Email Paul
      - Replace all "\t" with spaces
      - Submit `,
  })
  expect(nextToken()).toEqual({ type: "term", value: "_{" })
  expect(nextToken()).toEqual({ type: "name", value: "reportType" })
  expect(nextToken()).toEqual({ type: "term", value: "}_" })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw` report
    `,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"_' })

  /*
    v = \__\s"\__
Tasks for today:
- Email Paul
- Replace all "\t" with spaces
- Submit __{reportType}__ report
"__
  */
  expect(nextToken()).toEqual({ type: "name", value: "v" })
  expect(nextToken()).toEqual({ type: "term", value: "=" })
  expect(nextToken()).toEqual({ type: "term", value: String.raw`\__\s"` })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw`\__
Tasks for today:
- Email Paul
- Replace all "\t" with spaces
- Submit `,
  })
  expect(nextToken()).toEqual({ type: "term", value: "__{" })
  expect(nextToken()).toEqual({ type: "name", value: "reportType" })
  expect(nextToken()).toEqual({ type: "term", value: "}__" })
  expect(nextToken()).toEqual({
    type: "string",
    value: String.raw` report
`,
  })
  expect(nextToken()).toEqual({ type: "term", value: '"__' })
})

test("tokenizer can identify issues with strings", () => {
  const getErrors = (fail, lineNumber) => {
    const { errors } = getTokenizer(fail, {
      filePath: import.meta.url,
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
    `Found open string \`"\` which was not closed\n  at ${import.meta.url}:${
      fail1LineStart + 3
    }:10`,
  ])

  const fail2LineStart = getCurrentLineNumber() + 1
  const fail2 = `
    greeting = "hello"
    a = "She said {greeting"
    b = ""
    c = ""
  `

  expect(getErrors(fail2, fail2LineStart)).toEqual([
    `Found open string \`"\` which was not closed\n  ` +
      `at ${import.meta.url}:${fail2LineStart + 2}:9`,
    `Found open string substitution "{" which was not closed\n  ` +
      `at ${import.meta.url}:${fail2LineStart + 2}:19`,
    `Found open string \`"\` which was not closed\n  ` +
      `at ${import.meta.url}:${fail2LineStart + 4}:10`,
  ])

  const fail3LineStart = getCurrentLineNumber() + 1
  const fail3 = `
    a = __"should be two underscores"___
  `

  expect(getErrors(fail3, fail3LineStart)).toEqual([
    `String should be closed with \`"__\` but found an extra \`_\`\n  ` +
      `at ${import.meta.url}:${fail3LineStart + 1}:40`,
  ])
})
