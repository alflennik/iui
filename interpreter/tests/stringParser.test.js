import { test, expect } from "../../test.js"
import { getTokenizer } from "../tokenizer/tokenizer.js"
import { parse } from "../parser/parse.js"
import getCurrentLineNumber from "../utilities/getCurrentLineNumber.js"

test("parser can read multiline strings", () => {
  const codeLineStart = getCurrentLineNumber() + 1
  const code = String.raw`
    a = "😀 hi"

    b = "¡¿Qué tal?! 🫵🤓🤚🎉🇲🇽"
  
    d = "Strings can be wrapped on any space character, by converting the space
      to a line break. Additionally, any whitespace which occurs before the 
      first character of the next line is ignored. A consequence of this is
      that wrapping to the second line cannot occur on a double space."

    e = "Since it is invisible, any whitespace at the end of a line will be      
      ignored. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    
    f = "   The same cannot be said for spaces at the beginning and end of a   
      string, after all those spaces are visible.   "
      
    g = "It's  contrived  for  sure,  but  if  you  take  a  sentence  where  the
      \ only  breaks  are  on  double  spaces,  an  escape  character  can
       be  used  to  preserve  the  formatting.  As  you  can  tell  the  
       second  line  is  the  line  that  set  the  indentation  level  and  
       whitespace  is  allowed  after  that."

    h = "Different indentations can be used between different strings. For 
        example, this string is indented by four spaces instead of two. Mixed
        conventions should not be considered a parsing error since the 
        formatter is able to fix it. However, due to ambiguity, insufficient
        indentation on following lines should be considered an error."
    
    i =
      "Another valid option would be to eschew any indentation at all, to give
      a more block-like appearance. In some cases this might be preferable."
          
    j = "
      It's subtle, but if you consider the closing quote, you'll see that its
      indentation is to the left of the text. That would normally not be
      allowed, since it's arguably inconsistent indentation, but it's sometimes 
      useful to visually give an impression similar to code formatted like 
      brackets. Note that extra spaces will appear at the beginning and end 
      of this example.
    "
    
    k = "\
      The automatic conversion of line breaks to spaces can be prevented by
      inserting a backslash at the end of the line.\ 
    "
    
    l = "Multiple paragraphs of text can be created by manually inserting newline
      characters at the appropriate places.\n\
      \n\
      To prevent errant spaces being created after every line break, after
      the newline another backslash will remove the following automatically-\
      created space."
    
    m = \n"Newline strings, which are strings prefixed with a backslash and n, \
      will preserve newlines as newlines, which has the advantage of making \
      paragraphs easier to write, but the disadvantage of making wrapping \
      sentences more difficult.
      
      Whitespace is still ignored at the start of the line.
      
      On the other hand, newline strings are much more preferable when \
      working with text which is sensitive to newlines but not spaces, a \
      prominent example of that being code."
    
    n = \n"\
      mySum = 1 + 1
      myDivision = 3 / 2
      myProduct = 8 ** 8
      crazyNum = (
        mySum
          + mySum
          / myDivision
          ** myProduct
      )
    "

    o = \s"
      <h1>Whitespace Strings</h1>
      <p>Now we arrive at whitespace strings, where all whitespace is 
      preserved. This would be useful when writing code in formats that are 
      extremely tolerant of unusual whitespace. Like HTML.</p>
    "

    reportType = "expense"

    p = \n"\
      Tasks for today:
      - Email Paul
      - Replace all \"\\t\" with spaces
      - Submit {reportType} report
    "

    q = _\n"\
      Tasks for today:
      - Email Paul
      - Replace all "\\t" with spaces
      - Submit _{reportType}_ report
    "_

    r = \_\n"\_
      Tasks for today:
      - Email Paul
      - Replace all "\t" with spaces
      - Submit _{reportType}_ report
    "_
    
    s = \__\s"\__
Tasks for today:
- Email Paul
- Replace all "\t" with spaces
- Submit __{reportType}__ report
"__

    c = "أَنَا أُحِبُّ أَكْلَ الفَوَاكِهِ وَالخُضْرَاوَاتِ"

    c = \n"المهمات: 
      - شراء التفاح
      - بطيخ
      - سبانخ
    "
  `

  const tokenizer = getTokenizer(code, {
    filePath: import.meta.url,
    startingLineNumber: codeLineStart,
  })
  const ast = parse(tokenizer)

  console.log(ast)

  throw new Error("not implemented")
})

test("quick analyzer can raise issues with strings", () => {
  const fail1 = `
    a = "
       Oops I pasted in a string that has one extra space more than I expected,
      hopefully that doesn't cause any issues.
    "
  `

  const fail2 =
    'a = "Hey look a perfectly reasonable mix' +
    "      of space indentation" +
    "\t\t\tand tab indentation"

  const fail3 = `
    a = "\
      This is a completely clean string without any unexpected spaces trailing at the end. 
      Unless of course someone accidentally indented the end quote by one extra space.
       "
  `
})
