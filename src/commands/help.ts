import { loadHelpClass, toCached } from '@oclif/core'
import { Command, Config } from '@oclif/core/lib/interfaces'

export async function help(config: Config, ctor: Command.Class): Promise<void> {
  const Help = await loadHelpClass(config)
  const help = new Help(config)
  const cmd = await toCached(ctor)

  await help.showCommandHelp(cmd, [])
}
