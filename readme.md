# tree-hugger 

🌳 Squeeze metadata from a tree of JSON, YAML, Markdown, and HTML files.

## Installation

`npm install tree-hugger` or `yarn add tree-hugger`

## Usage

Say you have a tree of data files:

```
├── a.json
├── b.yml
├── c.yaml
└── d
    ├── e.json
    └── f.json
```

tree-hugger scans the whole tree, collecting the data in those files as it goes. When it 
finishes scanning, it assembles all the data into a single JSON object and 
fires a `data` event:

```js
const hug = require('tree-hugger')

hug(__dirname).on('data', (data) => {
  console.log(data)
})
```

Filenames and directories become keys in the `data` object, with filename extensions omitted:

```
a.json                  => data.a
b.yml                   => data.b
c.yaml                  => data.c
d/e.json                => data.d.e
d/f.json                => data.d.f
```

tree-hugger will emit the `data` event when it finishes scanning the tree,
then it will _continue watching_ the tree, emitting the `data` event
any time a file is added, changed, or removed.

### Data Files

The following file types are treated as data files:

- `.json`
- `.yml`
- `.yaml`
- `.md` (See [Frontmatter](#frontmatter))
- `.html`  (See [Frontmatter](#frontmatter))

### Options

You can use all of the options supported by the 
[chokidar](https://github.com/paulmillr/chokidar#api) file watcher. 

Here's an example that ignores certain paths:

```js
const options = {
  ignored: [
    '**/.git/**',
    '**/node_modules/**',
    '**/*.md',
    'ignore_me.yml',
    (filename) => filename.includes('.html')
  ]
}

hug(dataDir, options)
  .on('data', (data) => {
    console.log(data)
  })
```

chokidar's `ignore` option uses the fast and flexible `anymatch` library under the hood.
See [anymatch's usage docs](https://github.com/es128/anymatch#usage) for details about 
the nuances of ignoring with globs, regular expressions, functions, etc.

### Frontmatter

In addition to JSON and YML files, tree-hugger also treats HTML and Markdown files 
as structured data. The Jekyll static site builder popularized
the use of [YML frontmatter](http://jekyllrb.com/docs/frontmatter/) as a way to add 
key-value data to an otherwise unstructured document, like a blog post:

```
---
title: "Project of the Week: WebTorrent"
author: zeke
permalink: /blog/webtorrent
---

Here is the actual content of the post...
```

When tree-hugger encounters a file like this, it parses it using the 
[gray-matter](https://github.com/jonschlinkert/gray-matter) parser.

Assuming the file above was named `/posts/webtorrent.md`, the following data structure
would be generated:

```js
{
  posts: {
    webtorrent: {
      data: {
        title: 'Project of the Week WebTorrent'
      },
      content: 'Here is the actual content of the post...'
    }
  }
}
```

The above parsing technique is applied to Markdown files **and HTML files**.

Files that do not contain frontmatter are still parsed, they just
end up with an empty `data object`:


```md
I am lonely markdown.
```

becomes

```js
{
  lonely: {
    data: {},
    content: 'I am lonely markdown.'
  }
}
```

### `onFileData` Middleware

You can specify a custom function to modify data files as they're added.
This function accepts a `data` object and should return a modified `data` object.

```js
const options = {
  onFileData: function (data) {
    // return object untouched
    if (!data.title) return data

    // remove all exclamation points!!!
    return Object.assign({}, data, {
      title: data.title.replace(/!/gm, '')
    })
  }
}

hug(dataDir, options)
  .on('data', (data) => {
    console.log(data)
  })
```

## API

### `hug(dir, [options])`

- `dir` String (required) - the full path of the directory to watch
- `options` Object (optional) - options to pass to the underlying [chokidar](https://github.com/paulmillr/chokidar) file watcher.
  - `onFileData` Function (optional) - a custom function that can be used to modify datafiles. See [`onFileData` middleware](#onfiledata-middleware).

## Tests

```sh
npm install
npm test
```

## License

MIT
