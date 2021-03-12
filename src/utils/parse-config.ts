import { readFileSync } from 'fs'
import { Config } from '../interfaces/config'

export const parseConfig = async (configPath: string) => {
  try {
    // Read file from configPath
    const config: string = readFileSync(configPath).toString()

    // Parse the content
    const output: Config = JSON.parse(config)

    // Return the output as string
    return output
  } catch (error) {
    throw new Error(
      'Config file not found! Copy example config from https://github.com/hyperjumptech/monika/blob/main/config.example.json'
    )
  }
}
