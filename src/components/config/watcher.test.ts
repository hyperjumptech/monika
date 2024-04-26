import { existsSync } from 'node:fs'
import { rename, writeFile } from 'node:fs/promises'
import { expect } from 'chai'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

import { resetContext, setContext } from '../../context'
import { sanitizeFlags } from '../../flag'
import type { Config } from '../../interfaces/config'
import type { Probe } from '../../interfaces/probe'
import { getProbes } from './probe'
import { watchConfigChanges } from './watcher'

describe('Config watcher', () => {
  const config: Config = {
    probes: [
      {
        id: '1',
        requests: [{ url: 'https://example.com' }],
      } as Probe,
    ],
  }
  const server = setupServer(
    http.get(
      'https://example.com/monika.json',
      () => new HttpResponse(JSON.stringify(config))
    )
  )

  before(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    resetContext()
  })

  after(() => {
    server.close()
  })

  it('should polling config from a URL', async () => {
    // arrange
    const configIntervalSeconds = 1
    setContext({
      flags: sanitizeFlags({
        config: ['https://example.com/monika.json'],
        'config-interval': configIntervalSeconds,
      }),
    })

    // act
    const watchers = watchConfigChanges()
    const seconds = 1000
    await sleep(configIntervalSeconds * seconds)

    // assert
    expect(getProbes()[0].requests?.[0].url).eq(
      config.probes[0].requests?.[0].url
    )

    for (const { cancel } of watchers) {
      cancel()
    }
  })

  it('should watch config file changes', async () => {
    // arrange
    if (existsSync('monika.json')) {
      await rename('monika.json', 'monika_backup.json')
    }

    await writeFile('monika.json', JSON.stringify(config), { encoding: 'utf8' })

    setContext({
      flags: sanitizeFlags({
        config: ['monika.json'],
      }),
    })

    // act
    const watchers = watchConfigChanges()
    const newConfig = {
      probes: [
        {
          id: '2',
          requests: [
            {
              url: 'https://example.com/changed',
            },
          ],
        },
      ],
    }
    await writeFile('monika.json', JSON.stringify(newConfig), {
      encoding: 'utf8',
    })
    await sleep(1000)

    // assert
    expect(getProbes()[0].id).eq('2')
    expect(getProbes()[0].requests?.[0].url).eq('https://example.com/changed')
    for (const { cancel } of watchers) {
      cancel()
    }

    if (existsSync('monika_backup.json')) {
      await rename('monika_backup.json', 'monika.json')
    }
  })
})

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
