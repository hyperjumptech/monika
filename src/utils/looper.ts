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
  let probRes: AxiosResponseWithExtraData

  config.probes.forEach(async (item) => {
    try {
      probRes = await probing(item)
      const validatedResp = validateResponse(item.alerts, probRes)

      probeLog(item, probRes, '')

      await sendAlerts({
        validations: validatedResp,
        notifications: config.notifications,
        url: item.request.url ?? '',
      })
    } catch (error) {
      if (error) {
        probeLog(item, probRes, error)
      }
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
