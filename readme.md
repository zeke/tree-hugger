# tree-hugger 

🌳 Squeeze metadata from a tree of JSON, YAML, and Markdown files.

## Installation

with npm:

```sh
npm install tree-hugger --save
```

with yarn:

```sh
yarn add tree-hugger
```

## Usage

Say you have a tree of data files:

```
❯ tree test/fixtures 
test/fixtures
├── apps.json
├── authors.yml
├── party.md
├── processes.yaml
├── releases.json
├── userland
│   ├── dependencies.json
│   ├── dev_dependencies.json
│   └── starred_apps.json
└── versions.json
```

Some JSON, some YML, some YAML.

Watch the directory, listening for the `data` event:

```js
const hug = require('tree-hugger')
const path = require('path')
const dataDir = path.join(__dirname, 'test', 'fixtures')

hug(dataDir)
  .on('data', (data) => {
    console.log(data)
  })
```

You can use all of the options supported by the 
[chokidar](https://github.com/paulmillr/chokidar#api) file watcher. 

Here's an example that ignores certain paths using chokidar's 
[anymatch](https://github.com/es128/anymatch#usage) pattern support:

```js
const options = {
  ignored: [
    '**/*.md',
    '**/*.json',
    (filename) => filename.includes('.html')
  ]
}

hug(dataDir, options)
  .on('data', (data) => {
    console.log(data)
  })
```

tree-hugger will emit the `data` event when it finishes scanning the tree,
then it will _continue watching_ the tree, emitting the `data` event
any time a file is added, changed, or removed.

## API

### `hug(dir, [options])`

- `dir` String (required) - the full path of the directory to watch
- `options` Object (optional) - options to pass to the underlying [chokidar](https://github.com/paulmillr/chokidar) file watcher.

## Tests

```sh
npm install
npm test
```

## License

MIT
