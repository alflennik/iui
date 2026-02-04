# IUI Programming Language

## IUI CLI

To run iui code, use a command like the following:

```
node iui one.iui
```

## VSCode Extension

The VSCode extension supports syntax highlighting and adds a file icon to iui files.

### Developing the Extension
- Open just the extension folder in VSCode.
- Use the VSCode launcher to open a VSCode window with the current version of the extension running.
- Use cmd + p to run `Developer: reload window` when making any changes.
- When making changes to the grammar, run `node syntaxes/generate.js` to generate the json.

### Deploying the Extension

- Open just the extension folder in VSCode.
- Increment the semantic version number in package.json.
- Update `vsce` to the latest version with `npm install --global @vscode/vsce`
- Run `vsce publish`. This publishes to VSCode's marketplace.
- Run `vsce package`. This generates a .vsix file.
- Upload the .vsix file to https://open-vsx.org/ so it appears in Cursor. Click "Publish" and click "Publish Extension". Then select the .vsix file.

## Runtime

### Development

Any changes or new dependencies should be added to the compiler/generateRuntime.js script. After running that file with Node it will build an updated runtime/runtime.js file.