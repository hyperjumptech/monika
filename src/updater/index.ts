import { IConfig } from '@oclif/config'
import { createWriteStream } from 'fs'
import { Stream } from 'stream'
import axios from 'axios'
import * as os from 'os'

async function updateMonika(iconfig: IConfig) {
  const currentVersion = Number(iconfig.version.replace('.', ''))
  if (Number.isNaN(currentVersion)) {
    throw new TypeError('Failed to get local version.')
  }

  const { data } = await axios.get(
    'https://raw.githubusercontent.com/hyperjumptech/monika/main/package.json'
  )

  const remoteVersion = Number(data.version.replace('.', ''))
  if (Number.isNaN(remoteVersion)) {
    throw new TypeError('Failed to get remote version.')
  }

  if (iconfig.arch !== 'x64') {
    throw new TypeError('Monika update only supports x64 architecture.')
  }

  let osName: string = iconfig.platform
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

  const downloadPath = await axios
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

    // checksum validation, unzip, and extract to install path
}
