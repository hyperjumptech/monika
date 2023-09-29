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
import { AxiosError } from 'axios'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import sinon from 'sinon'
import mariadb from 'mariadb'
import { MongoClient, type Db } from 'mongodb'
import net from 'net'
import { Pool } from 'pg'
import * as redis from 'redis'
import * as httpRequest from '../../utils/http'
import { doProbe } from '.'
import { initializeProbeStates } from '../../utils/probe-state'
import type { Probe } from '../../interfaces/probe'
import { afterEach, beforeEach } from 'mocha'
import { getContext, resetContext, setContext } from '../../context'
import type { MonikaFlags } from '../../context/monika-flags'

let urlRequestTotal = 0
let notificationAlert: Record<string, Record<string, any>> = {}
const server = setupServer(
  rest.get('https://example.com', (_, res, ctx) => {
    urlRequestTotal += 1
    return res(ctx.status(200))
  }),
  rest.post('https://example.com/webhook', (req, res, ctx) => {
    const requestBody = req?.body as Record<string, any>
    if (requestBody?.body?.url) {
      notificationAlert[requestBody.body.url] = requestBody as Record<
        string,
        string
      >
    }

    console.log(requestBody)

    console.log(notificationAlert)

    return res(ctx.status(200))
  })
)
const probes: Probe[] = [
  {
    id: '1',
    name: 'Example',
    interval: 1,
    requests: [
      {
        url: 'https://example.com',
        body: '',
        timeout: 30,
      },
    ],
    incidentThreshold: 1,
    recoveryThreshold: 1,
    alerts: [],
  },
]

beforeEach(() => {
  server.listen()
  setContext({ flags: { repeat: 1 } as MonikaFlags })
})
afterEach(() => {
  resetContext()
  urlRequestTotal = 0
  notificationAlert = {}
  server.close()
  sinon.restore()
})

describe('Probe processing', () => {
  describe('HTTP Probe', () => {
    it('should not run probe if the probe is running', async () => {
      // arrange
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      doProbe({ probe: probes[0], notifications: [] })
      await doProbe({ probe: probes[0], notifications: [] })
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      expect(urlRequestTotal).eq(1)
    })

    it('should not run probe if it is not the time', () => {
      // arrange
      initializeProbeStates(probes)

      // act
      doProbe({ probe: probes[0], notifications: [] })

      // assert
      expect(urlRequestTotal).eq(0)
    })

    it('should not run probe if the cycle is end', async () => {
      // arrange
      initializeProbeStates(probes)
      setContext({
        ...getContext(),
        flags: { ...getContext().flags, repeat: 1 },
      })
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await doProbe({ probe: probes[0], notifications: [] })
      await doProbe({ probe: probes[0], notifications: [] })
      await doProbe({ probe: probes[0], notifications: [] })
      // wait for random timeout
      await sleep(3 * seconds)

      resetContext()

      // assert
      expect(urlRequestTotal).eq(1)
    })

    it('should run the probe', async () => {
      // arrange
      const uniqueProbes: Probe[] = Array.from({ length: 5 }).map(
        (_, index) => ({
          ...probes[0],
          id: `${index}`,
        })
      )
      initializeProbeStates(uniqueProbes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        uniqueProbes.map((probe) => doProbe({ probe, notifications: [] }))
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      expect(urlRequestTotal).eq(5)
    })

    it('should send incident notification if the request is failed', async () => {
      // arrange
      sinon.stub(httpRequest, 'sendHttpRequest').callsFake(async () => {
        throw new AxiosError('ECONNABORTED', undefined, undefined, {})
      })
      const probe = {
        ...probes[0],
        id: '2md9a',
        requests: [
          {
            url: 'https://example.com',
            body: '',
            timeout: 30,
          },
        ],
        alerts: [
          {
            id: 'fKBzx',
            assertion: 'response.status == 200',
            message: 'The assertion failed.',
          },
        ],
      }
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
      })
      // wait for random timeout
      await sleep(3 * seconds)
      // wait for send notification function to resolve
      await sleep(2 * seconds)

      // assert
      expect(notificationAlert?.[probe.requests[0].url]?.body?.url).eq(
        'https://example.com'
      )
      expect(notificationAlert?.[probe.requests[0].url]?.body.alert).eq('')
    }).timeout(10_000)

    it('should send incident notification', async () => {
      // arrange
      server.use(
        rest.get('https://example.com', (_, res, ctx) => {
          urlRequestTotal += 1
          return res(ctx.status(404))
        })
      )
      const probe = {
        ...probes[0],
        id: '2md9o',
        alerts: [
          {
            id: 'P7-fN',
            assertion: 'response.status != 200',
            message: 'The assertion failed.',
          },
        ],
      }
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
      })
      // wait for random timeout
      await sleep(3 * seconds)
      // wait for send notification function to resolve
      await sleep(2 * seconds)

      // assert
      expect(notificationAlert?.[probe?.requests?.[0]?.url || 0]?.body?.url).eq(
        'https://example.com'
      )
      expect(
        notificationAlert?.[probe?.requests?.[0]?.url || 0]?.body?.alert
      ).eq('response.status != 200')
    }).timeout(10_000)

    it('should send recovery notification', async () => {
      // arrange
      server.use(
        rest.get('https://example.com', (_, res, ctx) => {
          urlRequestTotal += 1
          return res(ctx.status(404))
        })
      )
      const probe = {
        ...probes[0],
        id: 'fj43l',
        requests: [{ url: 'https://example.com', body: '', timeout: 30 }],
        alerts: [
          { id: 'jFQBd', assertion: 'response.status != 200', message: '' },
        ],
      }
      const notifications = [
        {
          id: 'jFQBd',
          data: { url: 'https://example.com/webhook' },
          type: 'webhook',
        },
      ]
      initializeProbeStates([probe])
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await doProbe({
        probe,
        notifications,
      })
      // wait for random timeout
      await sleep(3 * seconds)
      server.resetHandlers()
      // wait for the send notification function to resolve
      await sleep(3 * seconds)

      // assert
      expect(notificationAlert?.[probe.requests[0].url]?.body?.url).eq(
        'https://example.com'
      )
      expect(notificationAlert?.[probe.requests[0].url]?.body?.alert).eq(
        'response.status != 200'
      )
    }).timeout(10_000)
  })

  describe('Non HTTP Probe', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should probe MariaDB', async () => {
      // arrange
      const requestStub = sinon.stub(mariadb, 'createConnection').callsFake(
        async (_connectionUri) =>
          ({
            end: async () => {
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
            port: 3306,
            username: 'mariadb_user',
            password: 'mariadb_password',
            database: '',
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
      })
      // wait for random timeout
      await sleep(3 * seconds)
      // wait for send notification function to resolve
      await sleep(2 * seconds)

      // assert
      expect(notificationAlert?.[probe.id]?.body?.url).eq('1c8QrZ')
      expect(notificationAlert?.[probe.id]?.body?.alert).eq('')
    }).timeout(10_000)

    it('should send recovery notification for MariaDB probe', async () => {
      // arrange
      const probe = {
        id: '3ngd4',
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
      })
      // wait for random timeout
      await sleep(3 * seconds)

      const requestStub = sinon.stub(mariadb, 'createConnection').callsFake(
        async (_connectionUri) =>
          ({
            end: async () => {
              Promise.resolve()
            },
          } as mariadb.Connection)
      )
      // wait for send notification function to resolve
      await sleep(3 * seconds)

      // assert
      sinon.assert.called(requestStub)
      expect(notificationAlert?.[probe.id]?.body?.url).eq('3ngd4')
      expect(notificationAlert?.[probe.id]?.body?.alert).eq('')
    }).timeout(10_000)

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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
              uri: 'mongodb://mongo_user:mongo_password@localhost:27017',
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
            end: async () => {
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
          query: async () => Promise.resolve(),
          release: async () => Promise.resolve(),
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
          query: async () => Promise.resolve(),
          release: async () => Promise.resolve(),
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
            connect: async () => Promise.resolve(),
            on: () => '',
            ping: async () => 'PONG',
          } as any)
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
            connect: async () => Promise.resolve(),
            on: () => '',
            ping: async () => 'PONG',
          } as any)
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      sinon.assert.calledOnce(requestStub)
    })

    it('should probe socket', async () => {
      const requestStub = sinon.stub(net, 'createConnection').callsFake(() => {
        let data = ''

        return {
          write: (d: any) => {
            data = d
          },
          setTimeout: (timeoutMs: number) => {
            return timeoutMs
          },
          on: (type: string, callback: (data?: any) => void) => {
            switch (type) {
              case 'data':
                callback(data)
                break
              case 'close':
                callback()
                break
              case 'timeout':
                callback()
                break
              case 'error':
                callback('error')
                break

              default:
                break
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
        probes.map((probe) => doProbe({ probe, notifications: [] }))
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
