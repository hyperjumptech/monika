import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { type } from 'node:os'

import { ux } from '@oclif/core'
import yml from 'js-yaml'

import { getContext } from '../../context/index.js'
import { log } from '../../utils/pino.js'
import { addDefaultNotifications } from './get.js'
import { type ConfigType, parseByType } from './parser/parse.js'

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

  const { force, output } = flags

  if (existsSync(output) && !force) {
    const answer = await ux.ux.prompt(
      `\n${output} file is already exists. Overwrite (Y/n)?`
    )

    if (answer.toLowerCase() !== 'y') {
      log.warn(
        'Command cancelled. You can use the -o flag to specify an output file or --force to overwrite without prompting.'
      )
      return
    }
  }

  const parse = await parseByType(path, type)
  const data = yml.dump(addDefaultNotifications(parse))
  await writeFile(output, data, {
    encoding: 'utf8',
  })
  log.info(`${output} file has been created.`)
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
  type: ConfigType
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
