import { ux } from '@oclif/core'
import { flushAllLogs } from './history'
import { log } from '../../utils/pino'

export async function flush(isForce: boolean): Promise<void> {
  if (isForce) {
    await flushAllLogs()
    log.info('Records flushed, thank you.')

    return
  }

  const ans = await ux.ux.prompt(
    'Are you sure you want to flush all logs in monika-logs.db (Y/n)?'
  )

  if (ans === 'Y') {
    await flushAllLogs()
    log.info('Records flushed, thank you.')

    return
  }

  log.info('Cancelled. Thank you.')
}
