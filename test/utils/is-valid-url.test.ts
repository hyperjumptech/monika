import { expect } from '@oclif/test'
import { isValidURL } from './../../src/utils/is-valid-url'

describe('check if URL is valid', () => {
  it('should return true if URL using http protocol', () => {
    const valid = isValidURL('http://www.google.com')
    expect(valid).to.be.a('boolean')
    expect(valid).to.be.equals(true)
  })

  it('should return true if URL using https protocol', () => {
    const valid = isValidURL('https://www.google.com')
    expect(valid).to.be.a('boolean')
    expect(valid).to.be.equals(true)
  })

  it('should return false if not using http or https protocol', () => {
    const valid = isValidURL('www.google.com')
    expect(valid).to.be.a('boolean')
    expect(valid).to.be.equals(false)
  })
})
