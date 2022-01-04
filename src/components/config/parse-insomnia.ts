import { Config } from '../../interfaces/config'
import yml from 'js-yaml'

interface InsomniaData {
  url?: string
  method?: string
  body?: string
}

export default function parseInsomnia(
  configString: string,
  format?: string
): Config {
  let data: InsomniaData[] = []
  if (format === 'yaml') {
    data = yml.load(configString, { json: true }) as InsomniaData[]
  } else {
    data = JSON.parse(configString)
  }

  return mapInsomniaToConfig(data)
}

function mapInsomniaToConfig(data: InsomniaData[]): Config {
  return { probes: [] }
}
