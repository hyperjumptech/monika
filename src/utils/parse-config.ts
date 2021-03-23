import { Config } from './../interfaces/config'
import { readFile } from 'fs'
import { promisify } from 'util'

export const parseConfig = async (configPath: string) => {
  // Read file from configPath
  try {
    // Read file from configPath
    const readFileAsync = promisify(readFile)
    const config: Buffer = await readFileAsync(configPath)

    // Parse the content
    const configString: string = await config.toString()
    const output: Config = await JSON.parse(configString)

    // Return the output as string
    return output
  } catch (error) {
    if (error.code === 'ENOENT' && error.path === configPath) {
      throw new Error(
        'JSON configuration file not found! Copy example config from https://raw.githubusercontent.com/hyperjumptech/monika/main/config.example.json'
      )
    }

    if (error.name === 'SyntaxError') {
      throw new Error('JSON configuration file is in invalid JSON format!')
    }

    throw new Error(error.message)
  }
}
