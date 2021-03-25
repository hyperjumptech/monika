import chai, { expect } from 'chai'
import * as whatsapp from '../../src/utils/whatsapp'

describe('Whatsappp test', () => {
  it('should send whatsapp notifications', async () => {
    chai.spy.on(whatsapp, 'loginUser', () => Promise.resolve('token'))
    chai.spy.on(whatsapp, 'sendTextMessage', () => Promise.resolve())

    await whatsapp.sendWhatsapp(
      {
        recipients: ['6254583425894'],
        url: 'https://somewhere.com',
        username: 'someusername',
        password: 'somepassword',
      },
      'some alert message'
    )

    expect(whatsapp.loginUser).to.have.been.called()
    expect(whatsapp.sendTextMessage).to.have.been.called()
  })
})
