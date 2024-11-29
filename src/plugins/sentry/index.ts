import { init } from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

export function initSentry(dsn: string): void {
  init({
    dsn,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1,
  })
}
