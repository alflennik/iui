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

### Extending the Runtime
Since IUI is compiled to JS it might be necessary to add additional JS dependencies to the runtime. Any changes should be added to the compiler/scripts/rebuildJsRuntime.js script which builds the runtime/runtime.js file.