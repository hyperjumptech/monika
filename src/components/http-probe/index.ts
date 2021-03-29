import { processProbeStatus } from '../../utils/process-server-status'
import { probing } from '../../utils/probing'
import { validateResponse } from '../../utils/alert'
import { Probe } from '../../interfaces/probe'
import { Notification } from '../../interfaces/notification'
import { probeLog } from '../../utils/logger'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { log } from '../../utils/log'
import { sendAlerts } from '../notification'

/**
 * doProbe sends out the http request
 * @param {number} checkOrder the order of probe being processed
 * @param {object} probe contains all the probes
 * @param {array} notifications contains all the notifications
 */
export async function doProbe(
  checkOrder: number,
  probe: Probe,
  notifications?: Notification[]
) {
  let probeRes: AxiosResponseWithExtraData = {} as AxiosResponseWithExtraData

  try {
    probeRes = await probing(probe)
    const validatedResp = validateResponse(probe.alerts, probeRes)

    probeLog(checkOrder, probe, probeRes, '')

    const defaultThreshold = 5

    const serverStatuses = processProbeStatus({
      checkOrder,
      probe,
      probeRes,
      validatedResp,
      incidentThreshold: probe.incidentThreshold ?? defaultThreshold,
      recoveryThreshold: probe.recoveryThreshold ?? defaultThreshold,
    })

    serverStatuses.forEach(async (status, index) => {
      if (
        status.shouldSendNotification &&
        notifications &&
        notifications.length > 0
      ) {
        notifications.forEach((notification) => {
          log.info({
            type:
              status.state === 'UP_TRUE_EQUALS_THRESHOLD'
                ? 'NOTIFY-INCIDENT'
                : 'NOTIFY-RECOVER',
            alertType: probe.alerts[index],
            notificationType: notification.type,
            notificationId: notification.id,
            probeId: probe.id,
            url: probe.request.url,
          })
        })
        await sendAlerts({
          validation: validatedResp[index],
          notifications: notifications,
          url: probe.request.url ?? '',
          status: status.isDown ? 'DOWN' : 'UP',
          incidentThreshold: probe.incidentThreshold ?? defaultThreshold,
        })
      }
    })
  } catch (error) {
    probeLog(checkOrder, probe, probeRes, error)
  }
}
