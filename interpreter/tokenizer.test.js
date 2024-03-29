const { getTokenizer, isStringStartBracket } = require("./tokenizer")

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

/*
test("tokenizer can identify issues with strings", () => {
  const fail1 = `\
    a = "
    b = ""
    c = ""
  `
  expect(getTokenizer(fail1)).toThrowErrorMatching(`Found '"' on line 3 which was not closed`)

  const fail2 = `\
    greeting = "hello"
    a = "She said {greeting"
    b = ""
    c = ""
  `

  expect(getTokenizer(fail2)).toThrowErrorMatching(`Found "{" on line 2 which was not closed`)
})

test("parser can read multiline strings", () => {
  const code = `
    a = 
      "Strings can be wrapped on any space character, by converting the space
        to a line break. Additionally, any whitespace which occurs before the 
        first character of the next line is ignored. A consequence of this is
        that wrapping to the second line cannot occur on a double space."

    b = 
      "Since it is invisible, any whitespace at the end of a line will be      
        ignored. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    
    c = 
      "   The same cannot be said for spaces at the beginning and end of a   
        string, after all those spaces are visible.   "
      
    d = 
      "It's  contrived  for  sure,  but  if  you  take  a  sentence  where  the
        \  only  breaks  are  on  double  spaces,  an  escape  character  can
         be  used  to  preserve  the  formatting.  As  you  can  tell  the  
         second  line  is  the  line  that  set  the  indentation  level  and  
         whitespace  is  allowed  after  that.

    e =
      "Different indentations can be used between different strings. For 
          example, this string is indented by four spaces instead of two. Mixed
          conventions should not be considered a parsing error since the 
          formatter is able to fix it. However, due to ambiguity, insufficient
          indentation on following lines should be considered an error."
    
    f =
      "Another valid option would be to eschew any indentation at all, to give
      a more block-like appearance. In some cases this might be preferable."
          
    g = "
      It's subtle, but if you consider the closing quote, you'll see that its
      indentation is to the left of the text. That would normally not be
      allowed, since it's arguably inconsistent indentation, but it's sometimes 
      useful to visually give an impression similar to code formatted like 
      brackets. Note that extra newlines will appear at the beginning and end 
      of this example.
    "
    
    h = 
      "\
      The automatic conversion of line breaks to spaces can be prevented by
      inserting a backslash at the end of the line.\
      "
    
    i =
      "Multiple paragraphs of text can be created by manually inserting newline
        characters at the appropriate places.\n\
        \n\
        To prevent errant spaces being created after every line break, after
        the newline another backslash will remove the following automatically-
        created space."
    
    j = 
      \n"Newline strings, which are strings prefixed with a backslash and n, \
        will preserve newlines as newlines, which has the advantage of making \
        paragraphs easier to write, but the disadvantage of making wrapping \
        sentences more difficult.
        
        Whitespace is still ignored at the start of the line.
        
        On the other hand, newline strings are much more preferable when \
        working with text which is sensitive to newlines but not spaces, a \
        prominent example of that being code."
    
    k = \n"\
      mySum = 1 + 1
      myDivision = 3 / 2
      myProduct = 8 ** 8"
      crazyNum = (
        mySum
          + mySum
          / myDivision
          ** myProduct
      )
    "

    l = \s"
      <h1>Whitespace Strings</h1>
      <p>Now we arrive at whitespace strings, where all whitespace is 
      preserved. This would be useful when writing code in formats that are 
      extremely tolerant of unusual whitespace. Like HTML.</p>
    "

    reportType = "expense"

    m = \n"\
      Tasks for today:
      - Email Paul
      - Replace all \"\\t\" with spaces
      - Submit {reportType} report
    "

    n = _\n"\
      Tasks for today:
      - Email Paul
      - Replace all "\\t" with spaces
      - Submit _{reportType}_ report
    "_

    o = \_\n"\_
      Tasks for today:
      - Email Paul
      - Replace all "\t" with spaces
      - Submit _{reportType}_ report
    "_
    
    p = \__\s"\__
Tasks for today:
- Email Paul
- Replace all "\t" with spaces
- Submit __{reportType}__ report
"__
  `

  throw new Error("not implemented")
})

test("quick analyzer can raise issues with strings", () => {
  const fail1 = `
    a = "
       Oops I pasted in test that has one extra space more than I expected, 
      hopefully that doesn't cause any issues.
    "
  `
})
*/
