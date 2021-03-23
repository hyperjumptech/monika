/* eslint-disable complexity */
import fs from 'fs'
import path from 'path'
import pino, { LoggerOptions, LogDescriptor } from 'pino'

const project = path.join(__dirname, '../../tsconfig.json')
const dev = fs.existsSync(project)

interface BaseLogObject {
  time?: string
}

interface ProbeLogObject extends BaseLogObject {
  type: 'PROBE'
  checkOrder: number
  probeId: string
  url: string
  statusCode: number
  responseTime: number
}

interface AlertLogObject extends BaseLogObject {
  type: 'ALERT'
  alertType: string
  consecutiveTrue: number
  checkOrder: number
  probeId: string
  url: string
  statusCode: number
  responseTime: number
}

interface NotifyLogObject extends BaseLogObject {
  type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER'
  alertType: string
  notificationType: string
  notificationId: string
  probeId: string
  url: string
}

export type LogObject = ProbeLogObject | AlertLogObject | NotifyLogObject

const isProbeLogObject = (obj: any): obj is ProbeLogObject => {
  return obj?.type === 'PROBE'
}

const isAlertLogObject = (obj: any): obj is AlertLogObject => {
  return obj?.type === 'ALERT'
}

const isNotifyLogObject = (obj: any): obj is NotifyLogObject => {
  return obj?.type?.startsWith('NOTIFY')
}

const prettyPrint = {
  translateTime: true,
  ignore: 'pid,hostname,time,level',
  hideObject: true,
  messageFormat(log: LogDescriptor, messageKey: string) {
    const time = new Date(log.time).toISOString()
    const type: string | undefined = log.type?.toUpperCase()
    if (isProbeLogObject(log)) {
      return `${time},${type},${log.checkOrder || '-'},${log.probeId || '-'},${
        log.url || '-'
      },${log.statusCode || '-'},${log.responseTime || '-'}`
    }
    if (isAlertLogObject(log)) {
      return `${time},${type},${log.alertType || '-'},${
        log.consecutiveTrue || '-'
      },${log.checkOrder || '-'},${log.probeId || '-'},${log.url || '-'},${
        log.statusCode || '-'
      },${log.responseTime || '-'}`
    }
    if (isNotifyLogObject(log)) {
      return `${time},${type},${log.alertType || '-'},${
        log.notificationType || '-'
      },${log.notificationId || '-'},${log.probeId || '-'},${log.url || '-'}`
    }
    return `${time} ${log[messageKey]}`
  },
}

const transport: LoggerOptions = dev
  ? {
      prettyPrint: {
        ...prettyPrint,
        colorize: true,
      },
      level: 'debug',
    }
  : {
      prettyPrint,
      level: 'info',
    }

export const log = pino(transport)
