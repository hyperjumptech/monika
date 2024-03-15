/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import { expect } from '@oclif/test'
import { http } from 'msw'
import { setupServer } from 'msw/node'
import sinon from 'sinon'
import mariadb from 'mariadb'
import { MongoClient, type Db } from 'mongodb'
import net from 'net'
import { Pool } from 'pg'
import * as redis from 'redis'
import { doProbe } from '.'
import { initializeProbeStates } from '../../utils/probe-state'
import type { Probe } from '../../interfaces/probe'
import { getContext, resetContext, setContext } from '../../context'
import type { MonikaFlags } from '../../flag'
import { FAILED_REQUEST_ASSERTION } from '../../looper'
import { closeLog, openLogfile } from '../logger/history'

let notificationAlert: Record<
  string,
  Record<string, Record<string, never>>
> = {}
const server = setupServer(
  http.get('https://example.com', (_, res, ctx) => res(ctx.status(200))),
  http.post('https://example.com/webhook', async (req, res, ctx) => {
    const requestBody = await req.json()
    if (requestBody?.body?.url) {
      notificationAlert[requestBody.body.url] = requestBody
    }

    return res(ctx.status(200))
  })
)

describe('Base Probe processing', () => {
  before(async () => {
    server.listen()
    await openLogfile()
  })
  beforeEach(() => {
    setContext({ flags: { repeat: 1 } as MonikaFlags })
  })
  afterEach(() => {
    resetContext()
    notificationAlert = {}
    server.resetHandlers()
    sinon.restore()
  })
  after(async () => {
    server.close()
    await closeLog()
  })

  describe('Non HTTP Probe', () => {
    it('should probe MariaDB', async () => {
      // arrange
      const requestStub = sinon.stub(mariadb, 'createConnection').callsFake(
        async (_connectionUri) =>
          ({
            async end() {
              Promise.resolve()
            },
          } as mariadb.Connection)
      )
      const probes = [
        {
          id: '1',
          interval: 1,
          mariadb: [
            {
              host: 'localhost',
              port: 3306,
              username: 'mariadb_user',
              password: 'mariadb_password',
              database: '',
            },
          ],
        } as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should send incident notification for MariaDB probe', async () => {
      // arrange
      const probe = {
        id: '1c8QrZ',
        interval: 1,
        mariadb: [
          {
            host: 'localhost',
            port: 3307,
            username: 'mariadb_user',
            password: 'mariadb_password',
            database: '',
          },
        ],
        alerts: [
          {
            id: 'Cqkjh',
            ...FAILED_REQUEST_ASSERTION,
          },
        ],
      } as Probe
      initializeProbeStates([probe])
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await doProbe({
        probe,
        notifications: [
          {
            id: 'jFQBd',
            data: { url: 'https://example.com/webhook' },
            type: 'webhook',
          },
        ],
        signal: new AbortController().signal,
      })
      // wait for random timeout
      await sleep(3 * seconds)
      // wait for send notification function to resolve
      await sleep(2 * seconds)

      // assert
      expect(notificationAlert?.[probe.id]?.body?.url).eq('1c8QrZ')
      expect(notificationAlert?.[probe.id]?.body?.alert).eq('')

      // restore
      sinon.stub(mariadb, 'createConnection').callsFake(
        async (_connectionUri) =>
          ({
            async end() {
              Promise.resolve()
            },
          } as mariadb.Connection)
      )
    }).timeout(10_000)

    it('should send recovery notification for MariaDB probe', async () => {
      // simulate the incindent first by throwing on first call
      // then simulate recovery on second call
      const requestStub = sinon.stub(mariadb, 'createConnection')
      requestStub.onFirstCall().throws()
      requestStub.onSecondCall().callsFake(
        async (_connectionUri) =>
          ({
            async end() {
              Promise.resolve()
            },
          } as mariadb.Connection)
      )

      // repeat needs to be 0 so that monika can probe twice
      // where in the first time it will send incident notification
      // then in the second time it will send recovery notification
      setContext({
        ...getContext(),
        flags: { ...getContext().flags, repeat: 0 },
      })

      // arrange
      const probe = {
        id: '3ngd4',
        incidentThreshold: 1,
        interval: 1,
        mariadb: [
          {
            host: 'localhost',
            port: 3308,
            username: 'mariadb_user',
            password: 'mariadb_password',
            database: '',
          },
        ],
        alerts: [
          {
            id: 'Cqkjh',
            ...FAILED_REQUEST_ASSERTION,
          },
        ],
      } as Probe
      initializeProbeStates([probe])
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await doProbe({
        probe,
        notifications: [
          {
            id: 'jFQBd',
            data: { url: 'https://example.com/webhook' },
            type: 'webhook',
          },
        ],
        signal: new AbortController().signal,
      })
      // gonna need to wait for a while until monika does the probing twice
      await sleep(7000)

      // assert
      sinon.assert.called(requestStub)
      expect(notificationAlert?.[probe.id]?.body?.url).eq('3ngd4')
      expect(notificationAlert?.[probe.id]?.body?.alert).eq('')
    }).timeout(15_000)

    it('should probe MongoDB', async () => {
      // arrange
      const requestStub = sinon
        .stub(MongoClient.prototype, 'connect')
        .resolves()
      sinon.stub(MongoClient.prototype, 'on').resolves()
      sinon.stub(MongoClient.prototype, 'db').callsFake(
        () =>
          ({
            command: async () => ({ ok: 1 }),
          } as unknown as Db)
      )
      sinon.stub(MongoClient.prototype, 'close').resolves()
      const probes = [
        {
          id: 'FMqVc',
          interval: 1,
          mongo: [
            {
              host: 'localhost',
              password: 'mongo_password',
              port: '27017',
              username: 'mongo_user',
            },
          ],
        } as unknown as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe MongoDB with uri', async () => {
      // arrange
      const requestStub = sinon
        .stub(MongoClient.prototype, 'connect')
        .resolves()
      sinon.stub(MongoClient.prototype, 'on').resolves()
      sinon.stub(MongoClient.prototype, 'db').callsFake(
        () =>
          ({
            command: async () => ({ ok: 1 }),
          } as unknown as Db)
      )
      sinon.stub(MongoClient.prototype, 'close').resolves()
      const probes = [
        {
          id: '3cYAU',
          interval: 1,
          mongo: [
            {
              uri: 'mongodb://mongo_user:mongo_password@localhost:27018',
            },
          ],
        } as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe MySQL', async () => {
      // arrange
      const requestStub = sinon.stub(mariadb, 'createConnection').callsFake(
        async (_connectionUri) =>
          ({
            async end() {
              Promise.resolve()
            },
          } as mariadb.Connection)
      )
      const probes = [
        {
          id: 'YFwQH',
          interval: 1,
          mysql: [
            {
              host: 'localhost',
              port: 3307,
              username: 'mysql_user',
              password: 'mysql_password',
              database: '',
            },
          ],
        } as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe PostgreSQL', async () => {
      // arrange
      const requestStub = sinon
        .stub(Pool.prototype, 'connect')
        .callsFake(() => ({
          async query() {},
          async release() {},
        }))
      const probes = [
        {
          id: 'LxMkT',
          interval: 1,
          postgres: [
            {
              database: 'postgres_db',
              host: 'localhost',
              password: 'postgres_password',
              port: '5432',
              username: 'postgres_user',
            },
          ],
        } as unknown as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe PostgreSQL with uri', async () => {
      // arrange
      const requestStub = sinon
        .stub(Pool.prototype, 'connect')
        .callsFake(() => ({
          async query() {},
          async release() {},
        }))
      const probes = [
        {
          id: 'FAzEj',
          interval: 1,
          postgres: [
            {
              uri: 'postgres://postgres_user:postgres_password@localhost:5432/postgres_db',
            },
          ],
        } as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe Redis', async () => {
      // arrange
      const requestStub = sinon.stub(redis, 'createClient').callsFake(
        () =>
          ({
            async connect() {},
            on: () => '',
            ping: async () => 'PONG',
          } as never)
      )
      const probes = [
        {
          id: 'npTJ4',
          interval: 1,
          redis: [
            {
              host: 'localhost',
              password: 'redis_password',
              port: '6379',
            },
          ],
        } as unknown as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe Redis with uri', async () => {
      // arrange
      const requestStub = sinon.stub(redis, 'createClient').callsFake(
        () =>
          ({
            async connect() {},
            on: () => '',
            ping: async () => 'PONG',
          } as never)
      )
      const probes = [
        {
          id: '1',
          interval: 1,
          redis: [
            {
              uri: 'redis://:redis_password@localhost:6379',
            },
          ],
        } as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe socket', async () => {
      const requestStub = sinon.stub(net, 'createConnection').callsFake(() => {
        let data: Buffer | Uint8Array
        return {
          write(d: Buffer | Uint8Array) {
            data = d
          },
          setTimeout(timeoutMs: number) {
            return timeoutMs
          },
          on(
            type: string,
            callback: (data?: Buffer | Uint8Array | Error) => void
          ) {
            switch (type) {
              case 'data': {
                callback(data)
                break
              }

              case 'close': {
                callback()
                break
              }

              case 'timeout': {
                callback()
                break
              }

              case 'error': {
                callback(new Error('Stub Error'))
                break
              }

              default: {
                break
              }
            }
          },
        } as unknown as net.Socket
      })
      const probes = [
        {
          id: '3Ua7L',
          interval: 1,
          socket: {
            host: 'localhost',
            port: '8080',
            data: 'some-data',
          },
        } as unknown as Probe,
      ]
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        probes.map((probe) =>
          doProbe({
            probe,
            notifications: [],
            signal: new AbortController().signal,
          })
        )
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })
  })
})

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
