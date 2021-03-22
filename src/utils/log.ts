import fs from 'fs'
import path from 'path'
import pino from 'pino'

const project = path.join(__dirname, '../../tsconfig.json')
const dev = fs.existsSync(project)

const transport = dev
  ? {
      prettyPrint: {
        colorize: true,
        translateTime: true,
        ignore: 'pid,hostname',
      },
    }
  : {}

export const log = pino(transport)
