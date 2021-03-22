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
 * @param {object} probe contains all the probes
 * @param {array} notifications contains all the notifications
 */
async function doProbe(probe: Probe, notifications: Notification[]) {
  let probRes: AxiosResponseWithExtraData = {} as AxiosResponseWithExtraData

  try {
    probRes = await probing(probe)
    const validatedResp = validateResponse(probe.alerts, probRes)

    probeLog(probe, probRes, '')

    const defaultThreshold = 5

    const serverStatuses = processProbeStatus({
      probe,
      validatedResp,
      trueThreshold: probe.trueThreshold ?? defaultThreshold,
      falseThreshold: probe.falseThreshold ?? defaultThreshold,
    })

    serverStatuses.forEach(async (status, index) => {
      if (status.shouldSendNotification) {
        log.info(`Sending a "${probe.alerts[index]}" notification`)
        await sendAlerts({
          validation: validatedResp[index],
          notifications: notifications,
          url: probe.request.url ?? '',
          status: status.isDown ? 'DOWN' : 'UP',
        })
      }
    })
  } catch (error) {
    probeLog(probe, probRes, error)
  }
}

/**
 * looper does all the looping
 * @param {object} config is an object that contains all the configs
 */
export function looper(config: Config) {
  log.info('Probes:')
  config.probes.forEach(async (probe) => {
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
      return doProbe(probe, config.notifications)
    }, (probe.interval ?? 10) * MILLISECONDS)

    if (process.env.CI || process.env.NODE_ENV === 'test') {
      clearInterval(probeInterval)
    }
  })
}
