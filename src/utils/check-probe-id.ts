import { Probe } from '../interfaces/probe'

export function checkProbeId(probes: Probe[], idsString: string): boolean {
  let found = false
  const ids = idsString.split(',').map((item) => item.trim())

  for (const probe of probes) {
    for (const id of ids) {
      if (probe.id === id) {
        found = true
        break
      }
    }
  }

  return found
}
