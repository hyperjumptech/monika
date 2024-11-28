import { createHash } from 'node:crypto'
import type {
  Certificate,
  Config,
  ValidatedConfig,
} from '../../interfaces/config.js'

const DEFAULT_TLS_EXPIRY_REMINDER_DAYS = 30
const DEFAULT_STATUS_NOTIFICATION = '0 6 * * *'

export function sanitizeConfig(config: Config): ValidatedConfig {
  const { certificate, notifications = [], version } = config
  const sanitizedConfigWithoutVersion = {
    ...config,
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
