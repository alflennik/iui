/* Run this file using node */

const path = require("path")
const fs = require("fs/promises")

const generate = async () => {
  const startBoundary = "((?<=\\s)|^)"
  const endBoundary = "(?=\\s)"

  const notPrecededByName = "(?<![.a-zA-Z0-9])"
  const notFollowedByName = "(?![a-zA-Z0-9])"

  let output = {
    $schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    name: "iui",
    patterns: [{ include: "#general" }],
    repository: {
      general: {
        patterns: [
          { include: "#embeddedLanguages" },
          {
            name: "keyword.control.iui",
            match: `${notPrecededByName}(if|else|while|for|catch|await|continue|break|export|throw|try|action|register|watch)${notFollowedByName}`,
          },
          {
            name: "keyword.control.iui",
            match: `${notPrecededByName}(\\*\\*\\*\\*\\*return|\\*\\*\\*\\*return|\\*\\*\\*return|\\*\\*return|\\*return|return)${notFollowedByName}`,
          },
          {
            name: "constant.numeric.iui",
            match: `${notPrecededByName}[0-9][0-9_]*\\.?[0-9_]*`,
          },
          {
            name: "punctuation.terminator.statement.iui",
            match: ";",
          },
          {
            name: "support.constant.iui constant.language.boolean.iui",
            match: `${notPrecededByName}(true|false|null)${notFollowedByName}`,
          },
          {
            name: "support.constant.iui constant.language.null.iui",
            match: `${notPrecededByName}null${notFollowedByName}`,
          },
          { include: "#comments" },
          { include: "#strings" },
          {
            name: "constant.character.escape.iui",
            match: "<!>",
          },
          {
            name: "keyword.control.iui",
            match: "=>",
          },
          {
            name: "punctuation.definition.block.iui",
            match: "(\\**{|})",
          },
          {
            name: "support.function.iui",
            match: `${startBoundary}(=|\\+=|-=|\\*=|\\/=|==|!=|&&|>|<|<=|>=|\\|\\||-|\\+|\\*|\\/|\\?|:)${endBoundary}`,
          },
          {
            name: "keyword.control.iui",
            match: `(\\[|\\]|\\||\\(|\\))`,
          },
          {
            name: "keyword.control.iui",
            match: "(<|>)",
          },
          {
            name: "support.constant.iui",
            match: "@[a-z][a-zA-Z0-9]*",
          },
          {
            name: "support.function.iui",
            match: `${startBoundary}\\.\\.\\.:`,
          },
          {
            // .:time
            name: "variable.other.readwrite.iui",
            match: `\\.:&?([a-zA-Z][a-zA-Z0-9]*)?`,
          },
          {
            name: "entity.name.function.iui",
            match: "[a-z][a-zA-Z0-9]*(?=\\()",
          },
          {
            name: "support.function.iui",
            match: `${startBoundary}!`,
          },
          {
            name: "support.function.iui",
            match: `:`,
          },
          {
            // Select this:
            // myVariable = (
            // With the idea that what follows is probably a function
            name: "entity.name.function.iui",
            match: "&?[a-z][a-zA-Z0-9]*(?=\\s+=\\s+\\()",
          },
          {
            // Also this:
            // myVariable = blahblah =>
            name: "entity.name.function.iui",
            match: "&?[a-z][a-zA-Z0-9]*(?=\\s+=\\s+&?[a-z][a-zA-Z0-9]*\\s+=>)",
          },
          {
            // name: (
            // What follows is probably a function
            name: "entity.name.function.iui",
            match: "&?[a-z][a-zA-Z0-9]*(?=\\s*:\\s+\\()",
          },
          {
            // key:
            name: "support.variable.iui",
            match: "[a-z][a-zA-Z0-9]*(?=:)",
          },
          {
            // .value
            name: "support.variable.iui",
            match: "(?<=\\.)[a-z][a-zA-Z0-9]*",
          },
          {
            // myVariable
            name: "support.variable.iui",
            match: `(?<!&)[a-z][a-zA-Z0-9]*`,
          },
          {
            // &mutableVariable
            name: "variable.other.readwrite.iui",
            match: "&[a-z][a-zA-Z0-9]*",
          },
          {
            name: "entity.name.type.iui",
            match: "&?[A-Z][a-zA-Z0-9]*",
          },
          {
            name: "support.function.iui",
            match: "\\.",
          },
          {
            name: "punctuation.separator.comma.iui",
            match: "\\,",
          },
        ],
      },
      comments: {
        patterns: [
          { name: "comment.line.iui", match: "//.*" },
          { name: "comment.block.iui", begin: "/\\*", end: "\\*/" },
        ],
      },
      strings: {
        patterns: (() => {
          return ["*****", "****", "***", "**", "*", ""].map(asterisks => {
            const asterisksEscaped = asterisks
              .split("")
              .map(asterisk => (asterisk === "" ? "" : "\\*"))
              .join("")

            return {
              name: "string.quoted.iui",
              begin: `${asterisksEscaped}(["'\`])`,
              end: String.raw`\1${asterisksEscaped}`,
              patterns: [
                {
                  name: "constant.character.escape.iui",
                  match: `\\\\${asterisksEscaped}.`,
                },
                {
                  // Backslashes at the end of the line. Extra spaces shouldn't affect it.
                  name: "constant.character.escape.iui",
                  match: `\\\\${asterisksEscaped} *$`,
                },
                {
                  begin: `(${asterisksEscaped}{)`,
                  beginCaptures: {
                    1: {
                      name: "keyword.operator.placeholder.iui",
                    },
                  },
                  end: "(})",
                  endCaptures: {
                    1: {
                      name: "keyword.operator.placeholder.iui",
                    },
                  },
                  name: "source.iui",
                  patterns: [{ include: "#general" }],
                },
              ],
            }
          })
        })(),
      },
      embeddedLanguagesInner: {
        patterns: [
          {
            begin: "\\(",
            end: "\\)",
            name: "meta.unknown-language",
            patterns: [{ include: "#embeddedLanguagesInner" }],
          },
          {
            // name: "keyword.operator.placeholder.iui",
            begin: `\\*{`,
            end: "}",
            patterns: [{ include: "#general" }],
          },
        ],
      },
      embeddedLanguages: {
        patterns: [
          {
            begin: "(\\*\\()",
            beginCaptures: {
              0: "constant.character.escape.iui",
            },
            end: "(\\))",
            endCaptures: {
              0: "constant.character.escape.iui",
            },
            contentName: "meta.unknown-language",
            patterns: [{ include: "#embeddedLanguagesInner" }],
          },
        ],
      },
    },
    scopeName: "source.iui",
  }

  output = {
    "(WARNING)": `THIS FILE IS AUTOGENERATED, DO NOT EDIT DIRECTLY. EDIT "generate.js" INSTEAD.`,
    ...output,
  }

  let json = JSON.stringify(output, null, 2)

  const indexOfWarning = json.indexOf('INSTEAD.",')
  const jsonWithSomeDramaticWhitespace =
    json.substring(0, indexOfWarning + 10) +
    "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n" +
    json.substring(indexOfWarning + 10)

  const outputPath = path.resolve(__dirname, "iui.tmLanguage.json")
  await fs.writeFile(outputPath, jsonWithSomeDramaticWhitespace)
}

generate()
