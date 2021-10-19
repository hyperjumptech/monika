import { exec } from 'child_process'
import { expect } from 'chai'

describe('Remote configurations', () => {
  it('remote config should work', (done) => {
    exec(
      `monika -c https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml`,
      (_, stdout, _err) => {
        expect(stdout).to.contain('xxxUsing remote config')
      }
    )
    done()
  }).timeout(20000)
})
