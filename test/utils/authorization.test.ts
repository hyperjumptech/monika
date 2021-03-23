import chai, { expect } from 'chai'
import * as auth from '../../src/utils/authorization'

describe('utils authorization tests', () => {
  it('should return basic authorization', async () => {
    chai.spy.on(auth, 'authBasic', () => Promise.resolve('basic token'))
    const token = auth.authorize('basic', {
      username: 'someusername',
      password: 'somepassword',
    })

    expect(auth.authBasic).to.have.been.called()
    expect(token).not.undefined
  })

  it('should return bearer authorization', async () => {
    chai.spy.on(auth, 'authBearer', () => Promise.resolve('bearer token'))
    const token = auth.authorize('bearer', 'token')

    expect(auth.authBearer).to.have.been.called()
    expect(token).not.undefined
  })
})
