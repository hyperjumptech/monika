import { exec } from 'child_process'
import { expect } from 'chai'

describe('Remote configurations', () => {
  it('should show and load with remote config', async (done) => {
    const url =
      'https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml'

    exec(`monika -r 3 -c ${url}`, async (err, out) => {
      if (err) {
        return Promise.reject(err)
      }
      expect(out).to.contain('Using remote config')
      return Promise.resolve(out)
    })

    done()
  }).timeout(5000)
})
