const chokidar = require('chokidar')
const {set, unset} = require('lodash')
const Emitter = require('events')
const File = require('./lib/file')

class Crawler extends Emitter {
  constructor (tree, options = {}) {
    super()
    this.tree = tree
    this.data = {}
    this.watcher = chokidar.watch(tree, options)
      .on('add', this.addFile)
      .on('change', this.addFile)
      .on('unlink', this.removeFile)
      .on('ready', this.ready)

    // save reference to parent crawler for use in event handlers,
    // where `this` is the chokidar watcher instance
    this.watcher.crawler = this
    return this
  }

  addFile (filename) {
    const file = new File(filename, this.crawler.tree)
    if (file.data) {
      set(this.crawler.data, file.key, file.data)
      this.crawler.emit('add', file)
    }
  }

  removeFile (filename) {
    const file = new File(filename, this.crawler.tree)
    unset(this.crawler.data, file.key)
  }

  ready () {
    this.crawler.emit('data', this.crawler.data)
  }
}

module.exports = function hug (dir, options = {}) {
  return new Crawler(dir, options)
}
