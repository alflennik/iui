const path = require('path')
const { LanguageClient, TransportKind } = require('vscode-languageclient/node')

let client

const activate = context => {
  const serverModule = context.asAbsolutePath(path.join('server', 'server.js'))

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: { module: serverModule, transport: TransportKind.stdio },
  }

  const clientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'iui' },
      { scheme: 'untitled', language: 'iui' },
      { scheme: 'git', language: 'iui' },
      { scheme: 'vscode-remote', language: 'iui' },
    ],
  }

  client = new LanguageClient(
    'REPLACE_ME language-server-id',
    'REPLACE_ME language server name',
    serverOptions,
    clientOptions,
  )

  client.start() // This will also launch the server
}

const deactivate = () => {
  if (client) return client.stop()
}

module.exports = { activate, deactivate }
