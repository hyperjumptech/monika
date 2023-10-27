import type { Probe } from '../../interfaces/probe'

const probes: Map<string, Probe> = new Map()

export function getProbes() {
  const legacyProbes: Probe[] = []
  for (const probe of getProbes().values()) {
    legacyProbes.push(probe)
  }

  return legacyProbes
}

export function findProbe(id: string) {
  return probes.get(id)
}

export function addProbe(newProbe: Probe) {
  return probes.set(newProbe.id, newProbe)
}

export function updateProbe(id: string, data: Probe): boolean {
  const probe = probes.get(id)
  if (!probe) {
    return false
  }

  const updatedProbe = { ...probe, ...data }
  probes.set(id, updatedProbe)
  return true
}

export function deleteProbe(id: string) {
  return probes.delete(id)
}
