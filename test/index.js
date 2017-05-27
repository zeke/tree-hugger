const { before, describe, it } = require('mocha')
const { expect } = require('chai')
const path = require('path')
const fixtureDir = path.join(__dirname, 'fixtures')
const hug = require('..')

describe('tree-hugger', function () {
  this.timeout(400) // keep it fast
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

  it('parses YML (and YAML) ', () => {
    expect(data.processes).to.be.an('object')
    expect(data.meetups).to.be.an('array')
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
})
