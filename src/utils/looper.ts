import { processProbeStatus } from './process-server-status'
import { Config } from '../interfaces/config'
import { log } from 'console'
import { probing } from '../utils/probing'
import { validateResponse, sendAlerts } from './alert'
import { Probe } from '../interfaces/probe'
import { Notification } from '../interfaces/notification'
import { probeLog } from './logger'
import { AxiosResponseWithExtraData } from '../interfaces/request'

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

    const serverStatuses = processProbeStatus({
      probe,
      validatedResp,
      trueThreshold: probe.trueThreshold || 5,
      falseThreshold: probe.falseThreshold || 5,
    })

    serverStatuses.forEach(async (status, index) => {
      if (status.shouldSendNotification) {
        log(`Sending a "${probe.alerts[index]}" notification`)
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
  log('Probes:')
  config.probes.forEach(async (probe) => {
    log(`Probe ID: ${probe.id}`)
    log(`Probe Name: ${probe.name}`)
    log(`Probe Description: ${probe.description}`)
    log(`Probe Interval: ${probe.interval}`)
    log(`Probe Request Method: ${probe.request.method}`)
    log(`Probe Request URL: ${probe.request.url}`)
    log(`Probe Request Headers: ${JSON.stringify(probe.request.headers)}`)
    log(`Probe Request Body: ${JSON.stringify(probe.request.body)}`)
    log(`Probe Alerts: ${probe.alerts.toString()}\n`)

    if ((probe?.interval ?? 0) > 0) {
      setInterval(
        () => doProbe(probe, config.notifications),
        probe.interval! * MILLISECONDS,
        config
      )
    }
  })
}
