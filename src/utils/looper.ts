import { Config } from '../interfaces/config'
import console, { log } from 'console'
import { probing } from '../utils/probing'
import { validateResponse, sendAlerts } from './alert'
import { getServerStatus } from './get-server-status'

const MILLISECONDS = 1000

async function doProbes(config: Config) {
  // probe each url
  log('\nProbing....')
  config.probes.forEach(async (item) => {
    try {
      const probRes = await probing(item)
      const validatedResp = validateResponse(item.alerts, probRes)

      log(
        `id: ${item.id} - status: ${probRes.status} for: ${item.request.url} -- ${probRes.config.extraData?.responseTime}`
      )
      const serverStatuses = getServerStatus({
        config,
        probe: item,
        validatedResp,
        threshold: item.triggerThreshold,
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
      log(
        'id:',
        item.id,
        '- status: ERROR for:',
        item.request.url,
        ':',
        error.message
      )
    }
  })
}

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

  doProbes(config).catch((error) => console.error(error.message))
  if (interval > 0) {
    setInterval(doProbes, interval * MILLISECONDS, config)
  }
}
