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

/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2022 Hyperjump Technology                                        *
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

type PagerDutyConfig = {
  key: string
  probeID: string
}

export const validator = Joi.array()
  .items(
    Joi.object({
      key: Joi.string().required().label('Key'),
      probeID: Joi.alternatives()
        .try(Joi.number(), Joi.string())
        .required()
        .label('Probe ID'),
    }).required()
  )
  .required()

export async function send(
  configurations: PagerDutyConfig[],
  message: NotificationMessage
): Promise<void> {
  const { meta } = message
  const { type } = meta

  if (type === 'incident' || type === 'recovery') {
    const url = 'https://events.pagerduty.com/v2/enqueue'
    const { probeID } = meta
    const routingKey = configurations.find(
      (config) => config.probeID === probeID
    )?.key

    if (!routingKey) {
      return
    }

    const eventPayload = transformMessageToEventPayload(routingKey, message)

    if (!eventPayload) {
      throw new Error(
        `PagerDuty notification: failed to create event payload for probe ${probeID}`
      )
    }

    const options = {
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(eventPayload),
    }

    await sendHttpRequest(options)
  }
}

function transformMessageToEventPayload(
  routingKey: string,
  message: NotificationMessage
): Record<string, string | object> | null {
  // https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTgw-events-api-v2-overview#pagerduty-common-event-format-pd-cef
  const { meta, summary } = message
  const { probeID, url, alertQuery, type, publicIpAddress } = meta
  const dedupKey = `${probeID}:${url}:${alertQuery}`.replace(' ', '')
  /* eslint-disable camelcase */
  if (type === 'incident') {
    return {
      routing_key: routingKey,
      dedup_key: dedupKey,
      event_action: 'trigger',
      payload: {
        summary,
        source: publicIpAddress,
        severity: 'error',
        group: probeID,
      },
    }
  }

  if (type === 'recovery') {
    return {
      routing_key: routingKey,
      dedup_key: dedupKey,
      event_action: 'resolve',
    }
  }

  return null
}
