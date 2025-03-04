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

import { rename } from 'fs/promises'
import { spawn } from 'node:child_process'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import * as os from 'node:os'
import { setInterval } from 'node:timers'

import { Config as IConfig } from '@oclif/core'
import { format } from 'date-fns'
import {
  createReadStream,
  createWriteStream,
  readdir,
  realpath,
  chmod,
  remove,
  mkdirs,
  move,
} from 'fs-extra'
import hasha from 'hasha'
import * as unzipper from 'unzipper'

import { log } from '../../utils/pino'
import { sendHttpRequest } from '../../utils/http'
import { open } from 'node:fs/promises'

const DEFAULT_UPDATE_CHECK = 86_400 // 24 hours
type UpdateMode = 'major' | 'minor' | 'patch'

export async function enableAutoUpdate(
  config: IConfig,
  mode: string
): Promise<void> {
  const installation = installationType(process.argv)
  if (
    process.env.NODE_ENV !== 'development' &&
    installation === 'binary' &&
    config.arch !== 'x64'
  ) {
    throw new TypeError(
      'Updater: Monika binary only supports x64 architecture.'
    )
  }

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

type NpmRegistryResponse = {
  'dist-tags': { latest: string }
  time: string
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
  const data = (await sendHttpRequest({
    url: 'https://registry.npmjs.org/@hyperjumptech/monika',
  }).then((resp) => resp.json())) as NpmRegistryResponse

  const latestVersion = data['dist-tags'].latest
  if (latestVersion === currentVersion || config.debug) {
    const nextCheck = new Date(Date.now() + DEFAULT_UPDATE_CHECK * 1000)
    const date = format(nextCheck, 'yyyy-MM-dd HH:mm:ss XXX')
    log.info(`Updater: already running latest version, next check at ${date}.`)
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
      case 'patch': {
        regexp = `(${currentMajor}\\.${currentMinor}\\.([0-9])+)`
        break
      }

      case 'minor': {
        regexp = `(${currentMajor}\\.([0-9])+\\.([0-9])+)`
        break
      }

      default: {
        return false
      }
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
  log.info(`Updater: updating monika to v${remoteVersion}`)
  const installation = installationType(process.argv)
  if (installation === 'npm') {
    try {
      await spawnAsync(
        `npm install -g @hyperjumptech/monika@${remoteVersion}`,
        true
      )
    } catch (error: unknown) {
      log.error(`Updater: npm install error, ${error}`)
    }

    log.warn(`Monika has been updated to v${remoteVersion}, quitting...`)
    process.kill(process.pid, 'SIGINT')

    return
  }

  // not npm installation, extract tarball release to monika installation path
  const downloadPath = await downloadMonika(config, remoteVersion)
  const extractPath = `${os.tmpdir()}/monika-${remoteVersion}`
  await remove(extractPath)
  await mkdirs(extractPath)
  await extractArchive(downloadPath, extractPath)
  await moveExtractedFiles(config, extractPath)
  await remove(downloadPath)
  log.warn(`Monika has been updated to v${remoteVersion}, quitting...`)
  process.kill(process.pid, 'SIGINT')
}

async function spawnAsync(command: string, detached: boolean): Promise<void> {
  return new Promise((resolve) => {
    const commands = command.split(' ')
    const cmd = spawn(commands[0], commands.slice(1), {
      detached,
      cwd: os.homedir(),
    })
    cmd.on('close', () => {
      resolve()
    })
  })
}

async function extractArchive(
  source: string,
  destination: string
): Promise<void> {
  const archiveEntries = createReadStream(source).pipe(
    // eslint-disable-next-line new-cap
    unzipper.Parse({ forceStream: true })
  )
  const extractPromises: Promise<string>[] = []
  for await (const entry of archiveEntries) {
    const promise = new Promise<string>((resolve, reject) => {
      const unzipperEntry = entry as unzipper.Entry
      const filename = unzipperEntry.path
      const filepath = `${destination}/${filename}`
      unzipperEntry
        .pipe(createWriteStream(filepath))
        .on('error', (err) => reject(err))
        .on('close', () => resolve(filepath))
    })

    extractPromises.push(promise)
  }

  await Promise.all(extractPromises)
}

/**
 * moves files under @param source directory to monika installation path
 * @param config oclif config
 * @param source source file path to move
 * @returns void
 */
async function moveExtractedFiles(config: IConfig, source: string) {
  const commandPath = process.argv[0]
  const commandRealPath = await realpath(commandPath)
  const commandsDirs = commandRealPath.split('/')
  let installationDirectory = commandsDirs.slice(0, -1).join('/')
  if (installationType(process.argv) === 'oclif-pack') {
    installationDirectory = commandsDirs.slice(0, -2).join('/')
  }

  const files = await readdir(source).then((filenames) =>
    filenames.map((filename) => `${source}/${filename}`)
  )
  for await (const filePath of files) {
    const source = filePath
    const filename = source.split('/').splice(-1)[0]
    const destFile = `${installationDirectory}/${filename}`
    try {
      await move(source, destFile, { overwrite: true })
      if (
        getPlatform(config) !== 'windows' &&
        destFile.match('/monika$') !== null
      ) {
        await chmod(destFile, 0o755)
      }
    } catch (error: unknown) {
      log.error(`Updater: move files error ${error}`)
    }
  }
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
  const filename = `monika-v${remoteVersion}-${getPlatform(config)}-x64`
  const url = `https://github.com/hyperjumptech/monika/releases/download/v${remoteVersion}/${filename}.zip`
  const actualChecksum = await getChecksumFromFile({ url })
  const expectedChecksum = await getChecksumFromText(
    `https://github.com/hyperjumptech/monika/releases/download/v${remoteVersion}/${filename}-CHECKSUM.txt`
  )
  if (actualChecksum !== expectedChecksum) {
    throw new Error(
      `Updater: checksum mismatch. Got ${actualChecksum}, expected ${expectedChecksum}.`
    )
  }

  log.info('Updater: checksum matches')
  const outputPath = `${os.tmpdir()}/${filename}`
  await downloadBinary({ outputPath, url })

  return outputPath
}

async function getChecksumFromText(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch checksum: ${response.statusText}`)
  }

  const parseResponse = await response.text()

  return parseResponse.split(/\s+/)[0]
}

type ChecksumFromFileOptions = {
  url: string
  algorithm?: string
}

async function getChecksumFromFile({
  url,
  algorithm = 'sha256',
}: ChecksumFromFileOptions): Promise<string> {
  const response = await fetch(url)
  if (!response.body) {
    throw new Error(`Failed to fetch ${url}: Response body is null`)
  }

  return hasha.fromStream(Readable.fromWeb(response.body), {
    algorithm,
  })
}

type DownloadOptions = { url: string; outputPath: string }

async function downloadBinary({
  url,
  outputPath,
}: DownloadOptions): Promise<void> {
  const response = await fetch(url)
  if (!response.body) {
    throw new Error(`Failed to fetch ${url}: Response body is null`)
  }

  const tempPath = `${outputPath}.tmp`
  const writeStream = await open(tempPath, 'w')

  await pipeline(
    Readable.fromWeb(response.body),
    writeStream.createWriteStream()
  )
  await writeStream.close()

  await rename(tempPath, outputPath)
}

function installationType(commands: string[]): 'npm' | 'oclif-pack' | 'binary' {
  if (commands.length < 2) {
    throw new TypeError('Updater: cannot determine installation type')
  }

  // npm install
  if (
    process.env.NODE_ENV === 'development' ||
    (commands[0].match('node$') !== null &&
      commands[1].match('monika$') !== null)
  ) {
    return 'npm'
  }

  // vercel/pkg
  if (commands[1] === '/snapshot/monika/bin/run.js') {
    return 'binary'
  }

  // npx oclif pack
  if (
    commands[0].match('node$') !== null &&
    commands[1].match('bin/run.js$') !== null
  ) {
    return 'oclif-pack'
  }

  throw new TypeError(
    `Updater: unknown installation type. Command: ${process.argv}`
  )
}

function getPlatform(config: IConfig): string {
  const { platform } = config
  switch (platform) {
    case 'darwin': {
      return 'macos'
    }

    case 'win32': {
      return 'windows'
    }

    default: {
      return 'linux'
    }
  }
}
