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

import { writeFile } from 'node:fs/promises'

import events from '../../events'
import type { Config, ValidatedConfig } from '../../interfaces/config'
import { getContext, setContext } from '../../context'
import type { MonikaFlags } from '../../flag'
import { getEventEmitter } from '../../utils/events'
import { sendHttpRequest } from '../..//utils/http'
import { log } from '../../utils/pino'
import { getRawConfig } from './get'
import { getProbes, setProbes } from './probe'
import { sanitizeConfig } from './sanitize'
import { validateConfig } from './validate'

export async function initConfig() {
  const { flags } = getContext()
  const hasConfig =
    flags.config.length > 0 ||
    flags.har ||
    flags.insomnia ||
    flags.postman ||
    flags.sitemap ||
    flags.text

  if (!hasConfig) {
    await createExampleConfigFile()
  }

  const config = await getRawConfig()
  await updateConfig(config)
}

async function createExampleConfigFile() {
  const outputFilePath = getContext().flags['config-filename']
  const url =
    'https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml'

  try {
    const resp = await sendHttpRequest({ url })
    await writeFile(outputFilePath, resp.data, { encoding: 'utf8' })
  } catch {
    const ymlConfig = `
    probes:
    - id: '1'
      requests:
        - url: http://example.com
    
    db_limit:
      max_db_size: 1000000000
      deleted_data: 1
      cron_schedule: '*/1 * * * *'
    `
    await writeFile(outputFilePath, ymlConfig, { encoding: 'utf8' })
  }

  setContext({ flags: { ...getContext().flags, config: [outputFilePath] } })
  log.info(
    `${outputFilePath} file has been created in this directory. You can change the URL to probe and other configurations in that ${outputFilePath} file.`
  )
}

export function getValidatedConfig(): ValidatedConfig {
  const { config, flags } = getContext()

  if (!config) {
    if (!isSymonModeFrom(flags)) {
      throw new Error('Configuration setup has not been run yet')
    }

    return sanitizeConfig({
      probes: [],
    })
  }

  return { ...config, probes: getProbes() }
}

export async function updateConfig(config: Config): Promise<void> {
  const validatedConfig = await validateConfig(config)
  const sanitizedConfig = sanitizeConfig(validatedConfig)
  const hasConfigChange =
    getContext().config?.version !== sanitizedConfig.version

  if (!hasConfigChange) {
    return
  }

  const isInitalSetup = getContext().config?.version === undefined
  if (!isInitalSetup) {
    log.info('Config changes. Updating config...')
  }

  setContext({ config: sanitizedConfig })
  setProbes(sanitizedConfig.probes)
  getEventEmitter().emit(events.config.updated)
}

export function isSymonModeFrom({
  symonKey,
  symonUrl,
}: Pick<MonikaFlags, 'symonKey' | 'symonUrl'>): boolean {
  return Boolean(symonUrl) && Boolean(symonKey)
}
