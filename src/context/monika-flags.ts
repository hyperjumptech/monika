import fs from 'fs'
import path from 'path'

export type MonikaFlags = {
  'auto-update'?: string
  config: string[]
  'config-filename': string
  'config-interval': number
  'create-config': boolean
  flush: boolean
  'follow-redirects': number
  force: boolean
  har?: string
  help: boolean
  id?: string
  insomnia?: string
  json?: boolean
  'keep-verbose-logs': boolean
  logs: boolean
  'max-start-delay': number
  'one-probe': boolean
  output?: string
  postman?: string
  prometheus?: number
  repeat: number
  sitemap?: string
  'status-notification'?: string
  stun: number
  summary: boolean
  symonKey?: string
  symonLocationId?: string
  symonMonikaId?: string
  symonReportInterval?: number
  symonReportLimit?: number
  symonUrl?: string
  text?: string
  verbose: boolean
  version: void
  symonExperimental: boolean
  symonCouchDbURL?: string
}

const seconds = 1000
const minutes = 60 * seconds
export const monikaFlagsDefaultValue: Pick<
  MonikaFlags,
  | 'config'
  | 'config-filename'
  | 'config-interval'
  | 'follow-redirects'
  | 'max-start-delay'
  | 'stun'
> = {
  config: getDefaultConfig(),
  'config-filename': 'monika.yml',
  'config-interval': 900,
  'follow-redirects': 1,
  'max-start-delay': 1 * Number(minutes),
  // default is 20s interval lookup
  stun: 20,
}

function getDefaultConfig(): Array<string> {
  const filesArray = fs.readdirSync(path.dirname('../'))
  const monikaDotJsonFile = filesArray.find((x) => x === 'monika.json')
  const monikaDotYamlFile = filesArray.find(
    (x) => x === 'monika.yml' || x === 'monika.yaml'
  )
  const defaultConfig = monikaDotYamlFile || monikaDotJsonFile

  return defaultConfig ? [defaultConfig] : []
}
