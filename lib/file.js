const path = require('path')
const fs = require('fs')
const pathSeparatorPattern = new RegExp(`${path.sep}`, 'g') // don't forget windoze
const requireYAML = require('require-yml')
const requireMarkdown = require('gray-matter')

class File {
  constructor (filename, crawlPath) {
    this.filename = filename
    this.crawlPath = crawlPath
    this.key = this.getKey()
    this.data = this.getData()
  }

  getKey () {
    const extPattern = new RegExp(path.extname(this.filename) + '$')

    return path.relative(this.crawlPath, this.filename)
      .replace(pathSeparatorPattern, '.') // slashes to dots
      .replace(extPattern, '') // remove extension
      .replace(/^\./, '') // leading slashes (dots)
      .replace(/\.$/, '') // trailing slashes (dots)
  }

  getData () {
    if (this.isJSON) {
      try {
        return require(this.filename)
      } catch (e) {
        return null
      }
    }

    if (this.isYAML) {
      try {
        return requireYAML(this.filename)
      } catch (e) {
        return null
      }
    }

    if (this.isMarkdown) {
      try {
        const data = requireMarkdown(fs.readFileSync(this.filename, 'utf8'))
        delete data.orig
        return data
      } catch (e) {
        return null
      }
    }

    return null
  }

  get isJSON () {
    return this.filename.match(/\.(json)$/i)
  }

  get isYAML () {
    return this.filename.match(/\.(yml|yaml)$/i)
  }

  get isMarkdown () {
    return this.filename.match(/\.(md|markdown|mdown)$/i)
  }

  static new (filename) {
    return new File(filename)
  }
}

module.exports = File
