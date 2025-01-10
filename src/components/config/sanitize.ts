import { createHash } from 'node:crypto'
import type {
  Certificate,
  Config,
  ValidatedConfig,
} from '../../interfaces/config'
import { sanitizeProbe } from '../../looper'
import { isSymonModeFrom } from '.'
import { getContext } from '../../context'

const DEFAULT_TLS_EXPIRY_REMINDER_DAYS = 30
const DEFAULT_STATUS_NOTIFICATION = '0 6 * * *'

export function sanitizeConfig(config: Config): ValidatedConfig {
  const isSymonMode = isSymonModeFrom(getContext().flags)
  const { certificate, notifications = [], version, probes } = config
  const sanitizedConfigWithoutVersion: Omit<ValidatedConfig, 'version'> = {
    ...config,
    probes: probes.map((probe) => sanitizeProbe(isSymonMode, probe)),
    certificate: sanitizeCertificate(certificate),
    notifications,
    'status-notification':
      config['status-notification'] || DEFAULT_STATUS_NOTIFICATION,
  }

  return {
    ...sanitizedConfigWithoutVersion,
    version: version || md5Hash(sanitizedConfigWithoutVersion),
  }
}

function md5Hash(data: Config): string {
  return createHash('md5').update(JSON.stringify(data)).digest('hex')
}

function sanitizeCertificate(
  certificate?: Certificate
): Required<Certificate> | undefined {
  if (!certificate) {
    return certificate
  }

  return {
    ...certificate,
    reminder: certificate.reminder || DEFAULT_TLS_EXPIRY_REMINDER_DAYS,
  }
}
