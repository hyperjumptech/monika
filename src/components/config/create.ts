import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { type } from 'node:os'

import { ux } from '@oclif/core'
import yml from 'js-yaml'

import { addDefaultNotifications } from './get'
import { parseConfig } from './parse'
import { getContext } from '../../context'
import { log } from '../../utils/pino'

export async function createConfig(): Promise<void> {
  const { flags } = getContext()

  const isConvertFromOtherFormat =
    flags.har || flags.insomnia || flags.postman || flags.sitemap || flags.text
  if (!isConvertFromOtherFormat) {
    log.info(
      'Opening Monika Configuration Generator in your default browser...'
    )
    open('https://hyperjumptech.github.io/monika-config-generator/')
    return
  }

  const { path, type } = getPathAndType()

  if (!existsSync(path)) {
    throw new Error(`Couldn't found the ${path} file.`)
  }

  const parse = await parseConfig(path, type, flags)
  const file = flags.output || 'monika.yml'

  if (existsSync(file) && !flags.force) {
    const answer = await ux.ux.prompt(
      `\n${file} file is already exists. Overwrite (Y/n)?`
    )

    if (answer.toLowerCase() !== 'y') {
      log.warn(
        'Command cancelled. You can use the -o flag to specify an output file or --force to overwrite without prompting.'
      )
      return
    }
  }

  const data = yml.dump(addDefaultNotifications(parse))
  await writeFile(file, data, {
    encoding: 'utf8',
  })
  log.info(`${file} file has been created.`)
}

function open(url: string) {
  const operatingSystem = type()

  switch (operatingSystem) {
    case 'Darwin': {
      spawnSync('open', [url])
      break
    }

    case 'Linux': {
      spawnSync('xdg-open', [url])
      break
    }

    case 'Windows NT': {
      spawnSync('start', [url])
      break
    }

    default: {
      throw new Error(`Unknown operating system: ${operatingSystem}`)
    }
  }
}

type PathAndType = {
  path: string
  type: string
}

function getPathAndType(): PathAndType {
  const { flags } = getContext()

  if (flags.har) {
    return { path: flags.har, type: 'har' }
  }

  if (flags.insomnia) {
    return { path: flags.insomnia, type: 'insomnia' }
  }

  if (flags.postman) {
    return { path: flags.postman, type: 'postman' }
  }

  if (flags.sitemap) {
    return { path: flags.sitemap, type: 'sitemap' }
  }

  if (flags.text) {
    return { path: flags.text, type: 'text' }
  }

  throw new Error('Unknown format')
}
