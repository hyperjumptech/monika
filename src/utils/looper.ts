import { Config } from '../interfaces/config'
import { doProbe } from '../components/http-probe'

const MILLISECONDS = 1000

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
