import { log } from './pino'
import fs from 'fs'

// Alternative of fs.readFileSync() API with type safety error NodeJS.ErrnoException
export async function readFile(path: string, encoding: BufferEncoding) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, { encoding }, (error, result) => {
      if (error && error?.code === 'ENOENT') {
        log.info(
          `Could not find the file: ${path}. Monika is probably not running or ran from a diffent directory`
        )
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}
