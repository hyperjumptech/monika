import { Config as IConfig } from '@oclif/core'
import {
  createReadStream,
  createWriteStream,
  readdirSync,
  realpathSync,
  unlinkSync,
} from 'fs'
import { Stream } from 'stream'
import axios from 'axios'
import * as os from 'os'
import { setInterval } from 'timers'
import { log } from '../../utils/pino'
import { format } from 'date-fns'
import { exec, spawn } from 'child_process'
import * as unzipper from 'unzipper'
import mv from 'mv'
import hashFiles from 'hash-files'

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
  log.info('Updater: starting')
  const currentVersion = config.version
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

function installationType(commands: string[]): 'npm' | 'oclif-pack' | 'binary' {
  if (commands.length < 2) {
    throw new TypeError('Updater: cannot determine installation type')
  }

  if (commands[0].includes('/node') && commands[1].match('/monika$')) {
    return 'npm'
  }

  if (
    process.env.NODE_ENV !== 'development' &&
    commands[0].includes('/node') &&
    commands[1].includes('/bin/run')
  ) {
    return 'oclif-pack'
  }

  return 'binary'
}

async function updateMonika(config: IConfig, remoteVersion: string) {
  const installation = installationType(process.argv)
  if (installation === 'npm') {
    log.debug(
      `Updater: found npm installation, updating monika to v${remoteVersion}`
    )
    exec(`npm install -g @hyperjumptech@${remoteVersion}`, (installError) => {
      if (installError === null) {
        log.info(`Updater: successfully updated Monika to v${remoteVersion}.`)
        restartNodeProcess()
      }
    })

    return
  }

  // not npm installation, extract tarball release to monika installation path
  log.debug(
    `Updater: Found binary installation, updating monika to v${remoteVersion}`
  )
  const downloadPath = await downloadMonika(config, remoteVersion)
  log.debug(`Updater: download tarball to ${downloadPath}`)
  const extractPath = `${os.tmpdir()}/monika-${remoteVersion}`
  createReadStream(downloadPath).pipe(
    // eslint-disable-next-line new-cap
    unzipper.Extract({ path: extractPath })
  )

  const commandPath = process.argv[0]
  // get real path even if it is symlink
  const commandRealPath = realpathSync(commandPath)
  const commandsDirs = commandRealPath.split('/')
  const monikaDirectory = commandsDirs.slice(0, -1).join('/')
  const files = readdirSync(extractPath)
  log.debug(`Updater: overwriting ${monikaDirectory}`)
  moveFiles(
    files,
    monikaDirectory,
    () => {
      unlinkSync(downloadPath)
      restartNodeProcess()
    },
    (error) => {
      log.error(error)
    }
  )
}

// moveFiles moves files recursively and invoke callback after done
function moveFiles(
  path: string[],
  destination: string,
  onComplete: () => void,
  onError: (error: any) => void
) {
  if (path.length === 0) {
    onComplete()
    return
  }

  mv(path[0], destination, { mkdirp: true, clobber: true }, (error) => {
    if (error) onError(error)
    moveFiles(path.slice(1, -1), destination, onComplete, onError)
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
    log.error('Updater: Monika binary only supports x64 architecture.')
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

  const filename = `monika-v${remoteVersion}-${osName}-x64`
  const downloadUri = `https://github.com/hyperjumptech/monika/releases/download/v${remoteVersion}/${filename}.zip`
  log.debug('Updater: downloading Monika from ')
  const { data: downloadStream } = await axios.get(downloadUri, {
    responseType: 'stream',
  })

  const { data: checksum }: { data: string } = await axios.get(
    `https://github.com/hyperjumptech/monika/releases/download/v${remoteVersion}/${filename}-CHECKSUM.txt`
  )

  return new Promise((resolve, reject) => {
    const targetPath = `${os.tmpdir()}/${filename}`
    const writer = createWriteStream(targetPath)
    const stream = downloadStream as Stream
    stream.pipe(writer)
    writer.on('error', (err) => {
      writer.close()
      reject(err)
    })

    writer.on('close', () => {
      log.debug(`Updater: verifying download`)
      const hashRemote = checksum.slice(0, checksum.indexOf(' '))
      const hashTarball = hashFiles.sync({
        files: targetPath,
        algorithm: 'sha256',
      })

      if (hashRemote !== hashTarball) {
        reject(
          new TypeError(
            `Updater: checksum mismatch\nremote: ${hashRemote}\nlocal: ${hashTarball}`
          )
        )
        return
      }

      log.debug(`Updater: checksum matches`)
      resolve(targetPath)
    })
  })
}
