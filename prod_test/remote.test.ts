import { exec } from 'child_process'
import { expect } from 'chai'

describe('Remote configurations', () => {
  it('remote config should work config', (done) => {
    exec(
      `monika -r 3 -c https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml`,
      (_, stdout) => {
        expect(stdout).to.contain('Using remote config.')
        done()
      }
    )
  })
})
