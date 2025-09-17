# IUI Programming Language

## VSCode Extension

The VSCode extension supports syntax highlighting and adds a file icon to iui files.

### Developing the Extension
- Use the VSCode launcher to open a VSCode window with the current version of the extension running.
- Use cmd + p to run `Developer: reload window` when making any changes.
- When making changes to the grammar, run `node syntaxes/generate.js` to generate the json.

### Deploying the Extension

- Increment the semantic version number in package.json.
- Install `vsce` with `npm install --global @vscode/vsce`
- Run `vsce publish`. This publishes to VSCode's marketplace.
- Run `vsce package`. This generates a .vsix file.
- Upload the .vsix file to https://open-vsx.org/ so it appears in Cursor.

## Runtime Environment

### Development

Any changes, including new dependencies, should be added to the compiler/generateRuntimeEnvironment.js script. After running that file with Node it will build an updated runtimeEnvironment/runtimeEnvironment.js file.