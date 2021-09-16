import { Probe, ProbeAlert } from '../../interfaces/probe'
import { Notification } from '../../interfaces/notification'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { log } from '../../utils/pino'
import { saveProbeRequestLog, saveNotificationLog } from './history'

export default class RequestLogger {
  private iteration: number

  private probe: Probe

  private requestIndex: number

  private get request() {
    return this.probe.requests[this.requestIndex]
  }

  private response?: AxiosResponseWithExtraData

  private triggeredAlerts: ProbeAlert[] = []

  private sentNotifications: {
    notification: Notification
    alertQuery: string
    type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER'
  }[] = []

  private errors: string[] = []

  constructor(probe: Probe, requestIndex: number, iteration: number) {
    this.iteration = iteration
    this.probe = probe
    this.requestIndex = requestIndex
  }

  setResponse(response: AxiosResponseWithExtraData) {
    this.response = response
  }

  setAlerts(alerts: ProbeAlert[]) {
    this.triggeredAlerts = alerts
  }

  setNotifications(
    data: {
      notification: Notification
      type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER'
      alertQuery: string
    }[]
  ) {
    this.sentNotifications = data
  }

  addError(error: string) {
    this.errors.push(error)
  }

  print() {
    const reversedSentNotifications = this.sentNotifications.slice().reverse()
    const printedNotification =
      reversedSentNotifications.find(
        (notif) => notif.type === 'NOTIFY-INCIDENT'
      ) ||
      reversedSentNotifications.find((notif) => notif.type === 'NOTIFY-RECOVER')

    const logObject = {
      type: 'PROBE-REQUEST',
      iteration: this.iteration,
      probeId: this.probe.id,
      url: this.request.url,
      method: this.request.method,
      responseCode: this.response?.status,
      responseTime: this.response?.config.extraData?.responseTime,
      alert: {
        flag: this.triggeredAlerts.length > 0 ? 'ALERT' : '',
        messages: this.triggeredAlerts.map((alert) => alert.query),
      },
      notification: {
        flag: printedNotification ? printedNotification.type : '',
        messages: printedNotification
          ? [
              printedNotification.type === 'NOTIFY-INCIDENT'
                ? 'service probably down'
                : 'service is back up',
            ]
          : [],
      },
    }

    if (this.triggeredAlerts.length > 0) {
      log.warn(logObject)
    } else {
      log.info(logObject)
    }
  }

  async saveToDatabase() {
    await Promise.all([
      saveProbeRequestLog({
        probe: this.probe,
        requestIndex: this.requestIndex,
        probeRes: this.response!,
        alertQueries: this.triggeredAlerts.map((alert) => alert.query),
        error: this.errors.join(''),
      }),
      ...this.sentNotifications.map((sent) =>
        saveNotificationLog(
          this.probe,
          sent.notification,
          sent.type,
          sent.alertQuery
        )
      ),
    ])
  }
}
