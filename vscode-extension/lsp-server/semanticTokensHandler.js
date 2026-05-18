const path = require('path')
const highlighter = require('lsp-syntax-highlighter')

const databasePath = path.resolve(__dirname, './grammars/highlighterDatabase.json')

highlighter.load(databasePath)

const semanticTokensHandler = async text => {
  const bracesInProgress = []
  const sectionsInProgress = []

  let stringTypeHack

  const sections = []

  for (let i = 0; i < text.length; i += 1) {
    if (text.slice(i, i + 4).toLowerCase() === 'json') {
      stringTypeHack = 'json'
    } else if (text.slice(i, i + 4).toLowerCase() === 'html') {
      stringTypeHack = 'html'
    } else if (text.slice(i, i + 2).toLowerCase() === 'js') {
      stringTypeHack = 'javascript'
    } else if (
      text.slice(i, i + 3).toLowerCase() === 'css' ||
      text.slice(i, i + 5).toLowerCase() === 'style'
    ) {
      stringTypeHack = 'css'
    }

    if (text.slice(i, i + 2) === '*(') {
      sectionsInProgress.push({ startOffset: i + 2, stringTypeHack })
    } else if (text.slice(i, i + 2) === ')*') {
      const { startOffset, stringTypeHack, replacements } = sectionsInProgress.pop()
      let newReplacements
      if (stringTypeHack === 'css') {
        newReplacements = [
          { startOffset, endOffset: startOffset, text: 'style {' },
          { startOffset: i, endOffset: i, text: '}' },
          ...(replacements ?? []),
        ]
      } else {
        newReplacements = replacements
      }

      sections.push({
        grammar: stringTypeHack ?? 'json',
        startOffset,
        endOffset: i,
        ...(newReplacements && { replacements: newReplacements }),
      })
    } else if (text.slice(i, i + 2) === '*{') {
      bracesInProgress.push({ type: 'replacement', startOffset: i })
    } else if (text[i] === '{' && text[i - 1] !== '*') {
      bracesInProgress.push({ type: 'block' })
    } else if (text[i] === '}') {
      const { type: braceType, startOffset } = bracesInProgress.pop()
      if (braceType === 'replacement' && sectionsInProgress.at(-1)) {
        if (!sectionsInProgress.at(-1).replacements) {
          sectionsInProgress.at(-1).replacements = []
        }
        sectionsInProgress.at(-1).replacements.push({ startOffset, endOffset: i + 1, text: '' })
      }
    }
  }

  const { encodedTokens, tokens } = await highlighter.highlight({ text, sections })

  return { data: encodedTokens }
}

module.exports = semanticTokensHandler
