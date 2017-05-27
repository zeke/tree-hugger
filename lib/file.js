const path = require('path')
const pathSeparatorPattern = new RegExp(`${path.sep}`, 'g') // don't forget windoze
const requireYAML = require('require-yml')

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

    return null
  }

  get isJSON () {
    return this.filename.match(/\.(json)$/i)
  }

  get isYAML () {
    return this.filename.match(/\.(yml|yaml)$/i)
  }

  static new (filename) {
    return new File(filename)
  }
}

module.exports = File