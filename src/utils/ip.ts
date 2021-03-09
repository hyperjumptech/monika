import { networkInterfaces } from 'os'

export default function getIp(): string {
  let address = ''

  const ifaces = networkInterfaces()
  for (const dev in ifaces) {
    if (dev) {
      const iface = ifaces[dev].filter(function (details) {
        return details.family === 'IPv4' && details.internal === false
      })

      if (iface.length > 0) address = iface[0].address
    }
  }

  return address
}
