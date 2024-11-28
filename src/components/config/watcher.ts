import { watch } from 'chokidar'
import isUrl from 'is-url'

import { getContext } from '../../context/index.js'
import { getErrorMessage } from '../../utils/catch-error-handler.js'
import { log } from '../../utils/pino.js'
import { getRawConfig } from './get.js'
import { parseByType } from './parser/parse.js'
import { updateConfig } from './index.js'

type WatcherCancellation = {
  cancel: () => void
}

export function watchConfigChanges() {
  const clearWatchers: WatcherCancellation[] = []

  for (const source of getContext().flags.config) {
    if (isUrl(source)) {
      clearWatchers.push(pollingRemoteConfig(source))
      continue
    }

    clearWatchers.push(watchConfigFile(source))
  }

  return clearWatchers
}

function pollingRemoteConfig(url: string) {
  const intervalId = setInterval(async () => {
    try {
      const config = await parseByType(url, 'monika')

      await updateConfig(config)
    } catch (error) {
      log.error(getErrorMessage(error))
    }
  }, getContext().flags['config-interval'] * 1000)

  return {
    cancel: () => clearInterval(intervalId),
  }
}

function watchConfigFile(path: string) {
  const watcher = watch(path).on('change', async () => {
    try {
      const config = await getRawConfig()

      await updateConfig(config)
    } catch (error) {
      log.error(getErrorMessage(error))
    }
  })

  return {
    cancel: () => watcher.close(),
  }
}
