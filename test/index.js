const { before, describe, it } = require('mocha')
const { expect } = require('chai')
const path = require('path')
const fs = require('fs')
const fixtureDirA = path.join(__dirname, 'fixtures', 'a')
const fixtureDirB = path.join(__dirname, 'fixtures', 'b')
const hug = require('..')

describe('tree-hugger', function () {
  this.timeout(1000) // keep it fast
  let data

  before((done) => {
    hug(fixtureDirA).on('data', (_data) => {
      data = _data
      done()
    })
  })

  describe('JSON', () => {
    it('parses .json files', () => {
      expect(fs.existsSync(path.join(fixtureDirA, 'apps.json'))).to.eq(true)
      expect(data.apps).to.be.an('array')
    })
  })

  describe('YAML', () => {
    it('parses .yml files', () => {
      expect(fs.existsSync(path.join(fixtureDirA, 'meetups.yml'))).to.eq(true)
      expect(data.meetups).to.be.an('array')
    })

    it('parses .yaml files', () => {
      expect(fs.existsSync(path.join(fixtureDirA, 'processes.yaml'))).to.eq(true)
      expect(data.processes).to.be.an('object')
    })
  })

  describe('Markdown', () => {
    it('parses Markdown with frontmatter', () => {
      expect(data.webtorrent).to.be.an('object')
      expect(data.webtorrent.data.title).to.be.a('string')
      expect(data.webtorrent.content).to.be.a('string')
    })

    it('parses Markdown without frontmatter', () => {
      expect(data.simple_markdown).to.be.an('object')
      expect(data.simple_markdown.data).to.deep.equal({})
      expect(data.simple_markdown.content).to.be.a('string')
    })
  })

  describe('HTML', () => {
    it('parses HTML with frontmatter', () => {
      expect(data.html_with_frontmatter).to.be.an('object')
      expect(data.html_with_frontmatter.data.title).to.eq('Blog')
      expect(data.html_with_frontmatter.content).to.be.a('string')
    })

    it('parses HTML without frontmatter', () => {
      expect(data.html_without_frontmatter).to.be.an('object')
      expect(data.html_without_frontmatter.data).to.deep.equal({})
      expect(data.html_without_frontmatter.content).to.be.a('string')
    })
  })

  describe('chokidar watching', () => {
    it('can watch multiple paths', (done) => {
      const paths = [fixtureDirA, fixtureDirB]
      hug(paths).on('data', (_data) => {
        expect(_data.meetups).to.be.an('array')
        expect(_data.some.someKey).to.be.eq(123)
        expect(_data.subdir.some_more).to.eq('hello')
        done()
      })
    })
  })

  describe('`onFileData` option for custom data processing', () => {
    it('allows a custom middleware function', (done) => {
      const options = {
        onFileData: function (data) {
          if (!data || !data.content) return data
          return Object.assign({}, data, {
            content: data.content.replace(/WebTorrent/gm, 'PRODUCT_NAME')
          })
        }
      }
      hug(fixtureDirA, options).on('data', (data) => {
        expect(data.webtorrent).to.be.an('object')
        expect(data.webtorrent.data.title).to.be.a('string')
        expect(data.webtorrent.content).to.include('What is PRODUCT_NAME?')
        expect(data.webtorrent.content).to.include('see a demo of PRODUCT_NAME')
        done()
      })
    })
  })

  describe('chokidar options', () => {
    it('supports ignored string', (done) => {
      const options = {
        ignored: '**/*.md'
      }
      hug(fixtureDirA, options).on('data', (_data) => {
        expect(_data.meetups).to.be.an('array')
        expect(_data.simple_markdown).to.deep.eq(undefined)
        done()
      })
    })

    it('supports ignored array', (done) => {
      const options = {
        ignored: ['**/*.md', '**/*.json']
      }
      hug(fixtureDirA, options).on('data', (_data) => {
        expect(_data.meetups).to.be.an('array')
        expect(_data.awesome_electron).to.deep.eq(undefined)
        expect(_data.simple_markdown).to.deep.eq(undefined)
        done()
      })
    })

    it('supports ignored function', (done) => {
      const options = {
        ignored: (filename) => filename.includes('.md')
      }

      hug(fixtureDirA, options).on('data', (_data) => {
        expect(_data.meetups).to.be.an('array')
        expect(_data.simple_markdown).to.deep.eq(undefined)
        done()
      })
    })
  })

  describe('basic behavior', () => {
    it('ignores .DS_Store macOS directories', () => {
      expect(Object.keys(data)).to.not.include('DS_Store')
      expect(Object.keys(data)).to.not.include('.DS_Store')
    })

    it('traverses nested directories', () => {
      expect(data.userland.dependencies).to.be.an('object')
      expect(data.userland.dependencies.collection).to.be.an('array')
      expect(data.userland.dependencies.collection[0].name).to.eq('react')
    })

    it('preserves underscores', () => {
      expect(data.userland.most_downloaded_packages).to.be.an('object')
    })

    it('treats dots in filenames as delimiters in the generated tree', () => {
      expect(data.featured.apps).to.be.an('array')
    })
  })
})
