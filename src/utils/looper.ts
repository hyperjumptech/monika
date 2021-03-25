import { processProbeStatus } from './process-server-status'
import { Config } from '../interfaces/config'
import { probing } from '../utils/probing'
import { validateResponse, sendAlerts } from './alert'
import { Probe } from '../interfaces/probe'
import { Notification } from '../interfaces/notification'
import { probeLog } from './logger'
import { AxiosResponseWithExtraData } from '../interfaces/request'
import { log } from '../utils/log'

const MILLISECONDS = 1000

/**
 * doProbe sends out the http request
 * @param {number} checkOrder the order of probe being processed
 * @param {object} probe contains all the probes
 * @param {array} notifications contains all the notifications
 */
async function doProbe(
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
      if (status.shouldSendNotification) {
        notifications?.forEach((notification) => {
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
          incidentThreshold: probe.incidentThreshold,
        })
      }
    })
  } catch (error) {
    probeLog(checkOrder, probe, probeRes, error)
  }
}

/**
 * looper does all the looping
 * @param {object} config is an object that contains all the configs
 */
export function looper(config: Config) {
  config.probes.forEach((probe) => {
    const probeInterval = setInterval(
      (() => {
        let counter = 0
        return () => {
          return doProbe(++counter, probe, config.notifications)
        }
      })(),
      (probe.interval ?? 10) * MILLISECONDS
    )

    if (process.env.CI || process.env.NODE_ENV === 'test') {
      clearInterval(probeInterval)
    }
  })
}
