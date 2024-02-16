import type { Probe } from '../../interfaces/probe.js'

export function sortProbes(probes: Probe[], idFlag?: string): Probe[] {
  if (!idFlag) {
    return probes
  }

  const selectedProbeIDs = getProbeIDsFromFlag(idFlag)

  if (!validateProbeIds(probes, selectedProbeIDs)) {
    throw new Error('Input error')
  }

  // doing custom sequences if list of ids is declared
  const sortedProbes = getProbesByIds(probes, selectedProbeIDs)

  return sortedProbes
}

function getProbeIDsFromFlag(idFlag: string) {
  return idFlag.split(',').map((item: string) => item.trim())
}

function getProbesByIds(probes: Probe[], probeIDs: string[]) {
  const selectedProbes: Probe[] = []

  for (const probeID of probeIDs) {
    const probe = probes.find(({ id }) => id === probeID)

    if (probe) {
      selectedProbes.push(probe)
    }
  }

  return selectedProbes
}

function validateProbeIds(probes: Probe[], ids: string[]): boolean {
  let found = false

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
