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
  notifications: Notification[]
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
      trueThreshold: probe.trueThreshold ?? defaultThreshold,
      falseThreshold: probe.falseThreshold ?? defaultThreshold,
    })

    serverStatuses.forEach(async (status, index) => {
      if (status.shouldSendNotification) {
        notifications.forEach((notification) => {
          log.info({
            type: 'NOTIFY-INCIDENT',
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
  log.info('Probes:')
  config.probes.forEach(async (probe, index) => {
    log.info(`Probe ID: ${probe.id}`)
    log.info(`Probe Name: ${probe.name}`)
    log.info(`Probe Description: ${probe.description}`)
    log.info(`Probe Interval: ${probe.interval}`)
    log.info(`Probe Request Method: ${probe.request.method}`)
    log.info(`Probe Request URL: ${probe.request.url}`)
    log.info(`Probe Request Headers: ${JSON.stringify(probe.request.headers)}`)
    log.info(`Probe Request Body: ${JSON.stringify(probe.request.body)}`)
    log.info(`Probe Alerts: ${probe.alerts.toString()}\n`)

    const probeInterval = setInterval(async () => {
      return doProbe(index + 1, probe, config.notifications)
    }, (probe.interval ?? 10) * MILLISECONDS)

    if (process.env.CI || process.env.NODE_ENV === 'test') {
      clearInterval(probeInterval)
    }
  })
}
