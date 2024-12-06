import { init, setTags } from '@sentry/node'
import stun from 'stun'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { sendPing } from '../../utils/ping'
import { sendHttpRequest } from '../../utils/http'
import { hostname } from 'os'
import getIp from '../../utils/ip'
import { getContext } from '../../context'

export async function initSentry({
  dsn,
  monikaVersion,
}: {
  dsn?: string
  monikaVersion: string
}): Promise<void> {
  init({
    dsn,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1,
    debug: true,
  })

  // Get current public IP
  let publicIp
  const connection = await sendPing('stun.l.google.com')
  if (connection.alive) {
    const response = await stun.request('stun.l.google.com:19302')
    publicIp = response?.getXorAddress()?.address
  }

  const response = await sendHttpRequest({
    url: `http://ip-api.com/json/${publicIp}`,
  })
  const { country, city, isp } = response.data

  const tags: {
    country: string
    city: string
    hostname: string
    isp: string
    privateIp: string
    publicIp: string
    monikaVersion: string
    symonMonikaId?: string
  } = {
    country,
    city,
    hostname: hostname(),
    isp,
    privateIp: getIp(),
    publicIp,
    monikaVersion,
  }

  if (getContext().flags.symonMonikaId) {
    tags.symonMonikaId = getContext().flags.symonMonikaId
  }

  setTags(tags)
}
