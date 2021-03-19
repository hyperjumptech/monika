import { processProbeStatus } from './process-server-status'
import { Config } from '../interfaces/config'
import console, { log } from 'console'
import { probing } from './probing'
import { validateResponse, sendAlerts } from './alert'
import { probeLog } from './logger'
import { AxiosResponseWithExtraData } from '../interfaces/request'

const MILLISECONDS = 1000

/**
 * doProbe sends out the http request
 * @param {object} config contains all the configs
 */
async function doProbe(config: Config) {
  // probe each url
  log('\nProbing....')

  config.probes.forEach(async (item) => {
    let probRes: AxiosResponseWithExtraData = {} as AxiosResponseWithExtraData

    try {
      probRes = await probing(item)
      const validatedResp = validateResponse(item.alerts, probRes)

      probeLog(item, probRes, '')

      if (!item.trueThreshold)
        log(`No success threshold defined. Using the default threshold: 5`)
      if (!item.falseThreshold)
        log(`No failed threshold defined. Using the default threshold: 5`)

      const serverStatuses = processProbeStatus({
        probe: item,
        validatedResp,
        trueThreshold: item.trueThreshold || 5,
        falseThreshold: item.falseThreshold || 5,
      })

      serverStatuses.forEach(async (status, index) => {
        if (status.shouldSendNotification) {
          log(`Sending a "${item.alerts[index]}" notification`)
          await sendAlerts({
            validation: validatedResp[index],
            notifications: config.notifications,
            url: item.request.url ?? '',
            status: status.isDown ? 'DOWN' : 'UP',
          })
        }
      })
    } catch (error) {
      probeLog(item, probRes, error)
    }
  })
}

/**
 * looper does all the looping
 * @param {object} config is an object that contains all the configs
 */
export function looper(config: Config) {
  const interval = config.interval ?? 0

  log('Probes:')
  config.probes.forEach(async (item) => {
    log(`Probe ID: ${item.id}`)
    log(`Probe Name: ${item.name}`)
    log(`Probe Description: ${item.description}`)
    log(`Probe Request Method: ${item.request.method}`)
    log(`Probe Request URL: ${item.request.url}`)
    log(`Probe Request Headers: ${JSON.stringify(item.request.headers)}`)
    log(`Probe Request Body: ${JSON.stringify(item.request.body)}`)
    log(`Probe Alerts: ${item.alerts.toString()}\n`)
  })

  doProbe(config).catch((error) => console.error(error.message))
  if (interval > 0) {
    setInterval(doProbe, interval * MILLISECONDS, config)
  }
}
