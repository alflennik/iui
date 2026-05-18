const fs = require('fs')
const semanticTokensHandler = require('./semanticTokensHandler')
const highlighter = require('lsp-syntax-highlighter')

const log = (() => {
  const stream = fs.createWriteStream('/tmp/lsp.log')

  return {
    write: message => {
      if (typeof message === 'object') {
        stream.write(JSON.stringify(message))
      } else {
        stream.write(message)
      }
      stream.write('\n')
    },
  }
})()

const documents = {}

const methodLookup = {
  initialize: message => {
    log.write(message)
    return {
      capabilities: { textDocumentSync: 1, ...highlighter.getCapabilities() },
      serverInfo: { name: 'lsp-from-scratch', version: '0.0.1' },
    }
  },
  shutdown: () => {
    return null
  },
  exit: () => {
    process.exit(0)
  },
  'textDocument/didOpen': message => {
    // log.write(message);
    const params = message.params

    documents[params.textDocument.uri] = params.textDocument.text
  },
  'textDocument/didChange': message => {
    // sendMessage({
    //   id: Math.random().toString().slice(2),
    //   method: "window/showMessageRequest",
    //   params: { type: 3, message: "Did change" },
    // });
    const params = message.params
    documents[params.textDocument.uri] = params.contentChanges[0].text
  },
  'textDocument/semanticTokens/full': async request => {
    const document = documents[request.params.textDocument.uri]
    return semanticTokensHandler(document)
  },
}

const sendMessage = messageObject => {
  const messageString = JSON.stringify(messageObject)
  const messageLength = Buffer.byteLength(messageString, 'utf-8')
  const header = `Content-Length: ${messageLength}\r\n\r\n`

  log.write(header + messageString)
  process.stdout.write(header + messageString)
}

const respond = (id, result) => {
  const message = JSON.stringify({ id, result })
  const messageLength = Buffer.byteLength(message, 'utf-8')
  const header = `Content-Length: ${messageLength}\r\n\r\n`

  log.write(header + message)
  process.stdout.write(header + message)
}

let buffer = ''
process.stdin.on('data', async chunk => {
  buffer += chunk

  while (true) {
    // Check for the Content-Length line
    const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n/)
    if (!lengthMatch) break

    const contentLength = parseInt(lengthMatch[1], 10)
    const messageStart = buffer.indexOf('\r\n\r\n') + 4

    // Continue unless the full message is in the buffer
    if (buffer.length < messageStart + contentLength) break

    const rawMessage = buffer.slice(messageStart, messageStart + contentLength)
    const message = JSON.parse(rawMessage)

    log.write({ id: message.id, method: message.method })

    const method = methodLookup[message.method]

    if (method) {
      const result = await method(message)

      if (result !== undefined) {
        respond(message.id, result)
      }
    }

    // Remove the processed message from the buffer
    buffer = buffer.slice(messageStart + contentLength)
  }
})
