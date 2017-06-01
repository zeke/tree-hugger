const { before, describe, it } = require('mocha')
const { expect } = require('chai')
const path = require('path')
const fixtureDir = path.join(__dirname, 'fixtures')
const hug = require('..')

describe('tree-hugger', function () {
  this.timeout(1000) // keep it fast
  let data

  before((done) => {
    hug(fixtureDir).on('data', (_data) => {
      data = _data
      done()
    })
  })

  it('works', () => {
    expect(data).to.be.an('object')
  })

  it('parses JSON', () => {
    expect(data.apps).to.be.an('array')
  })

  it('parses YML (and YAML)', () => {
    expect(data.processes).to.be.an('object')
    expect(data.meetups).to.be.an('array')
  })

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

  it('ignores .DS_Store macOS directories', () => {
    expect(Object.keys(data)).to.not.include('DS_Store')
    expect(Object.keys(data)).to.not.include('.DS_Store')
  })
  it('traverses directories', () => {
    expect(data.userland.dependencies).to.be.an('object')
    expect(data.userland.dependencies.collection).to.be.an('array')
    expect(data.userland.dependencies.collection[0].name).to.eq('react')
  })

  it('preserves underscore', () => {
    expect(data.userland.most_downloaded_packages).to.be.an('object')
  })

  it('preserves dots in filenames', () => {
    expect(data.featured.apps).to.be.an('array')
  })

  describe('chokidar options', () => {
    it('supports ignored string', (done) => {
      const options = {
        ignored: '**/*.md'
      }
      hug(fixtureDir, options).on('data', (_data) => {
        expect(_data.meetups).to.be.an('array')
        expect(_data.simple_markdown).to.deep.eq(undefined)
        done()
      })
    })

    it('supports ignored array', (done) => {
      const options = {
        ignored: ['**/*.md', '**/*.json']
      }
      hug(fixtureDir, options).on('data', (_data) => {
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

      hug(fixtureDir, options).on('data', (_data) => {
        expect(_data.meetups).to.be.an('array')
        expect(_data.simple_markdown).to.deep.eq(undefined)
        done()
      })
    })
  })
})
