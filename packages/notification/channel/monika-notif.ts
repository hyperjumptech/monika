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

import Joi from 'joi'
import type { NotificationMessage } from '.'
import { sendHttpRequest } from '../utils/http'

type MonikaAlertNotifDataBody = {
  type: 'incident' | 'recovery'
  alert: string
  url: string
  time: string
  monika: string
}

type MonikaStartAndTerminationNotifDataBody = {
  type: 'start' | 'termination'
  // eslint-disable-next-line camelcase
  ip_address: string
}

type MonikaStatusUpdateNotifDataBody = {
  type: 'status-update'
  time: string
  monika: string
  numberOfProbes: string
  maxResponseTime: string
  minResponseTime: string
  averageResponseTime: string
  numberOfIncidents: string
  numberOfRecoveries: string
  numberOfSentNotifications: string
}

type MonikaNotifDataBody =
  | MonikaAlertNotifDataBody
  | MonikaStartAndTerminationNotifDataBody
  | MonikaStatusUpdateNotifDataBody

type NotificationData = {
  url: string
}

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Monika Notification URL'),
})

export const send = async (
  { url }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const content = getContent(message)

  if (!content) {
    throw new Error('Unknown notification type')
  }

  await sendHttpRequest({
    method: 'POST',
    url,
    data: content,
  })
}

function getContent({
  body,
  meta,
  summary,
}: NotificationMessage): MonikaNotifDataBody | undefined {
  const {
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    numberOfIncidents,
    numberOfProbes,
    numberOfRecoveries,
    numberOfSentNotifications,
    time,
    type,
    url,
    monikaInstance,
  } = meta

  switch (type) {
    case 'start':
    case 'termination': {
      return {
        type,
        // eslint-disable-next-line camelcase
        ip_address: body,
      }
    }

    case 'incident':
    case 'recovery': {
      return {
        type,
        alert: summary,
        url,
        time,
        monika: monikaInstance,
      }
    }

    case 'status-update': {
      return {
        type,
        time,
        monika: monikaInstance,
        numberOfProbes: String(numberOfProbes),
        maxResponseTime: String(maxResponseTime),
        minResponseTime: String(minResponseTime),
        averageResponseTime: String(averageResponseTime),
        numberOfIncidents: String(numberOfIncidents),
        numberOfRecoveries: String(numberOfRecoveries),
        numberOfSentNotifications: String(numberOfSentNotifications),
      }
    }

    default: {
      break
    }
  }
}
