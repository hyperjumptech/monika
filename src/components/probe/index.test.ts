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

import { expect } from 'chai'

import sinon from 'sinon'
import mariadb from 'mariadb'
import { MongoClient, type Db } from 'mongodb'
import net from 'net'
import { Pool } from 'pg'
import * as redis from 'redis'
import { doProbe, getProbeStatesWithValidAlert } from '.'
import type { ServerAlertState } from '../../interfaces/probe-status'
import { initializeProbeStates } from '../../utils/probe-state'
import type { Probe } from '../../interfaces/probe'
import { getContext, resetContext, setContext } from '../../context'
import express from 'express'
import bodyParser from 'body-parser'

function getProbes(port: number) {
  return [
    {
      id: '1',
      name: 'Example',
      interval: 1,
      requests: [
        {
          url: `http://localhost:${port}`,
          body: '',
          timeout: 30,
        },
      ],
      incidentThreshold: 1,
      recoveryThreshold: 1,
      alerts: [],
    },
  ]
}

let urlRequestTotal = 0

function createMockServer(
  port: number,
  onWebhookInvoked: (body: any) => void = () => {
    // do nothing
  }
) {
  const appExpress = express()
  appExpress.use(bodyParser.json())
  appExpress.all('*', (req, res) => {
    if (req.path.endsWith('webhook')) {
      onWebhookInvoked(req.body)
      res.status(200).send()
    } else {
      urlRequestTotal += 1
      res.status(200).send()
    }
  })

  return appExpress.listen(port, 'localhost')
}

describe('Probe processing', () => {
  afterEach(() => {
    urlRequestTotal = 0
  })

  describe('getProbeStatesWithValidAlert function', () => {
    const probeStates: ServerAlertState[] = [
      {
        isFirstTime: false,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: false,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: false,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'UP',
        shouldSendNotification: false,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'UP',
        shouldSendNotification: true,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: true,
      },
      {
        isFirstTime: false,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: true,
      },
    ]

    it('should return probe states with valid alert', () => {
      // arrange
      const expected: ServerAlertState[] = [
        {
          isFirstTime: true,
          alertQuery: '',
          state: 'DOWN',
          shouldSendNotification: true,
        },
        {
          isFirstTime: false,
          alertQuery: '',
          state: 'DOWN',
          shouldSendNotification: true,
        },
      ]

      // act
      const probeStatesWithValidAlert =
        getProbeStatesWithValidAlert(probeStates)

      // assert
      expect(probeStatesWithValidAlert).deep.eq(expected)
    })
  })

  describe('HTTP Probe', () => {
    it('should not run probe if the probe is running', async () => {
      // arrange
      const server = createMockServer(4000)
      initializeProbeStates(getProbes(4000))
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      doProbe({ probe: getProbes(4000)[0], notifications: [] })
      await doProbe({ probe: getProbes(4000)[0], notifications: [] })
      // wait for random timeout
      await sleep(4000)

      server.close()
      // assert
      expect(urlRequestTotal).eq(1)
    }).timeout(10_000)

    it('should not run probe if it is not the time', () => {
      // arrange
      const server = createMockServer(4001)
      initializeProbeStates(getProbes(4001))

      // act
      doProbe({ probe: getProbes(4001)[0], notifications: [] })

      server.close()
      // assert
      expect(urlRequestTotal).eq(0)
    })

    it('should not run probe if the cycle is end', async () => {
      // arrange
      initializeProbeStates(getProbes(4002))
      setContext({
        ...getContext(),
        flags: { ...getContext().flags, repeat: 1 },
      })
      const server = createMockServer(4002)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await doProbe({ probe: getProbes(4002)[0], notifications: [] })
      await doProbe({ probe: getProbes(4002)[0], notifications: [] })
      await doProbe({ probe: getProbes(4002)[0], notifications: [] })
      // wait for random timeout
      await sleep(4 * seconds)

      resetContext()

      server.close()
      // assert
      expect(urlRequestTotal).eq(1)
    }).timeout(10_000)

    it('should run the probe', async () => {
      // arrange
      const server = createMockServer(4003)
      const uniqueProbes: Probe[] = Array.from({ length: 5 }).map(
        (_, index) => ({
          ...getProbes(4003)[0],
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
      await sleep(6 * seconds)

      server.close()
      // assert
      expect(urlRequestTotal).eq(5)
    }).timeout(10_000)

    it('should send incident notification', async () => {
      // arrange
      let notificationAlert: any = {}
      const server = createMockServer(4004, (body) => {
        notificationAlert = body
      })
      const probe = {
        ...getProbes(4004)[0],
        id: '2md9o',
        alerts: [
          {
            assertion: 'response.status == 200',
            message: 'The request failed.',
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
            data: { url: 'http://localhost:4004/webhook' },
            type: 'webhook',
          },
        ],
      })
      // wait for random timeout
      await sleep(3 * seconds)
      // wait for send notification function to resolve
      await sleep(2 * seconds)

      server.close()
      // assert
      expect(notificationAlert.body.url).eq('http://localhost:4004')
      expect(notificationAlert.body.alert).eq('response.status == 200')
    }).timeout(10_000)

    it('should send recovery notification', async () => {
      // arrange
      const appExpress = express()
      let statusCode = 200
      appExpress.all('*', (req, res) => {
        console.log(req.url, 'has been invoked. sending code', statusCode)
        res.status(statusCode).send()
      })
      const dynamicResultServer = appExpress.listen(4005, 'localhost')

      const probe = {
        ...getProbes(4005)[0],
        id: 'fj43l',
        requests: [{ url: 'http://localhost:4005', body: '', timeout: 30 }],
        alerts: [{ assertion: 'response.status != 200', message: '' }],
      }

      let notificationAlert: any | undefined
      const serverWebhook = createMockServer(4006, (body) => {
        console.log('serverWebhook onWebhookInvoked', JSON.stringify(body))
        notificationAlert = body
      })
      const notifications = [
        {
          id: 'jFQBd',
          data: { url: 'http://localhost:4006/webhook' },
          type: 'webhook',
        },
      ]
      console.log(
        '/************************* TEST should send recovery notification'
      )
      initializeProbeStates([probe])
      // wait until the interval passed
      const seconds = 1000
      await sleep(2 * seconds)

      // act
      console.log('expect probe return 400')
      statusCode = 400 // service down
      await doProbe({
        probe,
        notifications,
      })
      console.log('wait next cycle')
      await sleep(2 * seconds)
      statusCode = 200 // service restored
      console.log('expect probe return 200')
      await doProbe({
        probe,
        notifications,
      })
      // wait for send notification function to resolve
      let waitCounts = 0
      while ((notificationAlert?.body?.alert?.length || 0) === 0) {
        if (waitCounts > 10) break
        // eslint-disable-next-line no-await-in-loop
        await sleep(seconds)
        console.log(
          'in a while, notificationAlert is',
          JSON.stringify(notificationAlert)
        )
        waitCounts++
      }

      dynamicResultServer.close()
      serverWebhook.close()

      // assert
      expect(notificationAlert.body.url).eq('http://localhost:4005')
      expect(notificationAlert.body.alert).eq('response.status != 200')
    }).timeout(30_000)
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
          id: '1',
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
          id: '1',
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
          id: '1',
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
          id: '1',
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
          id: '1',
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
          id: '1',
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
          id: '1',
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
