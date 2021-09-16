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

import fs from 'fs'
import path from 'path'
import pino, { LoggerOptions, LogDescriptor } from 'pino'
import { ProbeRequestLogObject } from '../interfaces/logs'

const project = path.join(__dirname, '../../tsconfig.json')
const dev = fs.existsSync(project)

const isLogObject = (obj: any): obj is ProbeRequestLogObject => {
  return obj?.type === 'PROBE-REQUEST'
}

const prettyPrint = {
  translateTime: true,
  ignore: 'hostname,pid,time',
  hideObject: true,
  sync: false, // async mode for better performance
  messageFormat(log: LogDescriptor) {
    const time = new Date(log.time).toISOString()

    if (isLogObject(log)) {
      let alertMsg = ''
      let notifMsg = ''

      const probeMsg = `${log.iteration} id:${log.probeId} ${log.responseCode} ${log.method} ${log.url} ${log.responseTime}ms`

      if (log.notification?.flag) {
        notifMsg = `, NOTIF: ${log.notification.messages.join(', ')}`
      }
      if (log.alert?.flag) {
        alertMsg = `, ${log.alert.flag}: ${log.alert.messages.join(', ')}`
      }

      return `${time} ${probeMsg}${alertMsg}${notifMsg}`
    }

    return log.msg
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
