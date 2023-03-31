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

import events from '../../events'
import type { Notification } from '../../components/notification/channel'
import type { StatuspageNotification } from '../../plugins/visualization/atlassian-status-page'
import { AtlassianStatusPageAPI } from '../../plugins/visualization/atlassian-status-page'
import type { InstatusPageNotification } from '../../plugins/visualization/instatus'
import { InstatusPageAPI } from '../../plugins/visualization/instatus'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'

const eventEmitter = getEventEmitter()

eventEmitter.on(
  events.probe.notification.willSend,
  async ({ notifications, probeID, probeState, url }) => {
    const isNotificationEmpty = (notifications?.length ?? 0) === 0
    const isAtlassianStatuspageEnable: StatuspageNotification | undefined =
      notifications.find(
        (notification: Notification) => notification.type === 'statuspage'
      )

    if (!isNotificationEmpty && isAtlassianStatuspageEnable) {
      const { apiKey, pageID } = isAtlassianStatuspageEnable.data
      const atlassianStatusPageAPI = new AtlassianStatusPageAPI(apiKey, pageID)
      const type = getNotificationType(probeState)

      try {
        if (!type) {
          throw new Error(`probeState ${probeState} is unknown`)
        }

        const incidentID = await atlassianStatusPageAPI.notify({
          probeID,
          type,
          url,
        })
        log.info(
          `Atlassian status page (${type}). id: ${incidentID}, probeID: ${probeID}, url: ${url}`
        )
      } catch (error: any) {
        log.error(
          `Atlassian status page (Error). probeID: ${probeID}, url: ${url}, probeState: ${probeState} error: ${error}`
        )
      }
    }

    const isInstatuspageEnable: InstatusPageNotification | undefined =
      notifications.find(
        (notification: Notification) => notification.type === 'instatus'
      )

    if (!isNotificationEmpty && isInstatuspageEnable) {
      const { apiKey, pageID } = isInstatuspageEnable.data
      const instatusPageAPI = new InstatusPageAPI(apiKey, pageID)
      const type = getNotificationType(probeState)

      try {
        if (!type) {
          throw new Error(`probeState ${probeState} is unknown`)
        }

        const incidentID = await instatusPageAPI.notify({
          probeID,
          type,
          url,
        })
        log.info(
          `Instatus page (${type}). id: ${incidentID}, probeID: ${probeID}, url: ${url}`
        )
      } catch (error: any) {
        log.error(
          `Instatus page (Error). probeID: ${probeID}, url: ${url}, probeState: ${probeState} error: ${error}`
        )
      }
    }
  }
)

function getNotificationType(probeState: string): 'incident' | 'recovery' | '' {
  switch (probeState) {
    case 'UP':
      return 'recovery'
    case 'DOWN':
      return 'incident'

    default:
      return ''
  }
}
