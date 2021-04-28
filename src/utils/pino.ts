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
  responseLength: number
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

interface PlainLogObject {
  type: 'PLAIN' | ''
  msg?: string
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

const isPlainLog = (obj: any): obj is PlainLogObject => {
  return obj?.type?.startsWith('PLAIN')
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
      },${log.statusCode || '-'},${log.responseTime || '-'},${
        log.responseLength || '-'
      }`
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
    if (isPlainLog(log)) {
      return `${log.msg}`
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
