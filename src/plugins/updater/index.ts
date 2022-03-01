import { Config as IConfig } from '@oclif/core'
import { createWriteStream } from 'fs'
import { Stream } from 'stream'
import axios from 'axios'
import * as os from 'os'
import { setInterval } from 'timers'
import { log } from '../../utils/pino'
import { format } from 'date-fns'
import { exec, spawn } from 'child_process'

const DEFAULT_UPDATE_CHECK = 86_400 // 24 hours

export type UpdateMode = 'major' | 'minor' | 'patch'

export async function enableAutoUpdate(
  config: IConfig,
  mode: string
): Promise<void> {
  mode = mode.toLowerCase()
  if (mode === 'major' || mode === 'minor' || mode === 'patch') {
    const updateMode = <UpdateMode>mode
    await runUpdater(config, updateMode).catch((error): void =>
      log.error(error)
    )

    setInterval(() => {
      runUpdater(config, updateMode).catch((error): void => log.error(error))
    }, DEFAULT_UPDATE_CHECK * 1000)

    return
  }

  throw new TypeError(`Invalid auto-update ${mode}`)
}

/**
 * runUpdater compares current running version to recent released version from npm
 * @param config oclif config
 * @param updateMode major, minor, patch
 * @returns string of remote version to update
 * @returns undefined if no need to update
 */
async function runUpdater(config: IConfig, updateMode: UpdateMode) {
  // const currentVersion = config.version
  const currentVersion = '1.6.0'
  const { data } = await axios.get(
    'https://registry.npmjs.org/@hyperjumptech/monika'
  )

  const latestVersion = data['dist-tags'].latest
  if (latestVersion === currentVersion) {
    log.debug('Updater: already running latest version.')
    const nextCheck = new Date(Date.now() + DEFAULT_UPDATE_CHECK * 1000)
    const date = format(nextCheck, 'yyyy-MM-dd HH:mm:ss XXX')
    log.debug(`Updater: next check at ${date}.`)
    return
  }

  if (updateMode === 'major') {
    await updateMonika(config, latestVersion)
    return
  }

  const [currentMajor, currentMinor] = currentVersion.split('.')
  const { time } = data
  // versions: key-value data with semver as key and timestamp as value
  // sorted descending by timestamp
  const versions = Object.keys(time)
  const predicate = (remoteVersion: string) => {
    let regexp = ''
    switch (updateMode) {
      case 'patch':
        regexp = `(${currentMajor}\\.${currentMinor}\\.([0-9])+)`
        break
      case 'minor':
        regexp = `(${currentMajor}\\.([0-9])+\\.([0-9])+)`
        break
      default:
        return false
    }

    return remoteVersion.match(regexp) !== null
  }

  const compatibleVersion = versions.reverse().find((v) => predicate(v))
  if (compatibleVersion === currentVersion) {
    const nextCheck = new Date(Date.now() + DEFAULT_UPDATE_CHECK * 1000)
    const date = format(nextCheck, 'yyyy-MM-dd HH:mm:ss XXX')
    log.info(
      `Updater: already running latest ${updateMode.toLowerCase()} version: ${currentVersion}. Next check at ${date}.`
    )
    return
  }

  if (compatibleVersion !== undefined && compatibleVersion !== currentVersion) {
    await updateMonika(config, compatibleVersion)
  }
}

async function updateMonika(config: IConfig, remoteVersion: string) {
  // check for monika command and node if it is available
  exec('cat $(which monika) && which node', (error, stdout, _stderr) => {
    if (
      error === null &&
      stdout.includes('/env node') &&
      stdout.includes('/node')
    ) {
      // if monika is a text file and node exists in shell environment
      // assume current Monika is global npm package
      exec(`npm install -g @hyperjumptech@${remoteVersion}`, (installError) => {
        if (installError === null) {
          log.info(`Updater: successfully updated Monika to v${remoteVersion}.`)
          restartNodeProcess()
        }
      })
      return
    }

    // assume Monika is a binary installation here
    if (error === null) {
      downloadMonika(config, remoteVersion)
        .then((_) => {
          // process downloaded binary here
        })
        .catch((error) => log.error(`Updater: download error ${error}`))
      return
    }

    log.error(`Updater: error searching Monika command, ${error?.message}`)
  })
}

function restartNodeProcess() {
  spawn(process.argv[0], process.argv.slice(1), {
    env: { ...process.env },
    stdio: 'ignore',
  }).unref()
}

/**
 * downloadMonika downloads binary releases from github
 *
 * @param config oclif config instance
 * @param remoteVersion version to download
 * @returns downloaded file path
 */
async function downloadMonika(
  config: IConfig,
  remoteVersion: string
): Promise<string> {
  if (config.arch !== 'x64') {
    throw new TypeError('Monika update only supports x64 architecture.')
  }

  let osName: string = config.platform
  switch (osName) {
    case 'darwin':
      osName = 'macos'
      break
    case 'win32':
      osName = 'windows'
      break
    default:
      osName = 'linux'
  }

  const filename = `monika-v${remoteVersion}-${osName}-x64.zip`

  return axios
    .get(
      `https://github.com/hyperjumptech/monika/releases/download/v${remoteVersion}/${filename}`,
      { responseType: 'stream' }
    )
    .then((response) => {
      return new Promise<string>((resolve, reject) => {
        const targetPath = `${os.tmpdir()}/${filename}`
        const writer = createWriteStream(targetPath)
        const stream = response.data as Stream
        stream.pipe(writer)
        writer.on('error', (err) => {
          writer.close()
          reject(err)
        })
        writer.on('close', () => {
          resolve(targetPath)
        })
      })
    })
}
