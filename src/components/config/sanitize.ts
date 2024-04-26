import { createHash } from 'node:crypto'
import type { Config, ValidatedConfig } from '../../interfaces/config'

const DEFAULT_STATUS_NOTIFICATION = '0 6 * * *'

export function sanitizeConfig(config: Config): ValidatedConfig {
  const { notifications = [], version } = config
  const sanitizedConfigWithoutVersion = {
    ...config,
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
