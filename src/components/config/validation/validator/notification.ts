/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import { Notification } from '../../../../interfaces/notification'
import {
  slug as atlassianStatuspageSlug,
  validateConfig as atlassianStatuspageValidateConfig,
} from '../../../../plugins/visualization/atlassian-status-page'
import {
  slug as instatusPageSlug,
  validateConfig as instatusPageValidateConfig,
} from '../../../../plugins/visualization/instatus'
import { newPagerDuty } from '../../../notification/channel/pagerduty'
import { requiredFieldMessages } from '../notification-required-fields'

const checkRecipients = (notification: Notification): string | undefined => {
  // check one-by-one instead of using indexOf or includes so the type is correct without type assertion
  const notifData: any = notification.data
  if (
    (notifData?.recipients?.length ?? 0) === 0 &&
    (notification.type === 'mailgun' ||
      notification.type === 'smtp' ||
      notification.type === 'sendgrid' ||
      notification.type === 'whatsapp')
  ) {
    return 'Recipients does not exists or has length lower than 1!'
  }
}

const validateRequiredFields = (
  notification: Notification
): string | undefined => {
  const { data }: any = notification
  const reqFields = requiredFieldMessages[notification.type]
  if (!reqFields)
    return `Notifications type is not allowed (${(notification as any)?.type})`

  const keys = Object.keys(reqFields)
  for (const field of keys) {
    if (!data[field]) {
      return reqFields[field]
    }
  }
}

const checkByNotificationType = (
  notification: Notification
): string | undefined => {
  const pagerduty = newPagerDuty()
  if (
    notification.type === atlassianStatuspageSlug &&
    atlassianStatuspageValidateConfig(notification.data)
  ) {
    return atlassianStatuspageValidateConfig(notification.data)
  }

  if (
    notification.type === pagerduty.slug &&
    pagerduty.validateConfig(notification.data)
  ) {
    return pagerduty.validateConfig(notification.data)
  }

  if (
    notification.type === instatusPageSlug &&
    instatusPageValidateConfig(notification.data)
  ) {
    return instatusPageValidateConfig(notification.data)
  }

  const missingField = validateRequiredFields(notification)
  if (missingField) {
    return missingField
  }
}

export const validateNotification = (
  notifications: Notification[]
): string | undefined => {
  if (notifications.length === 0) return

  for (const notification of notifications) {
    const missingRecipient = checkRecipients(notification)
    if (missingRecipient) {
      return missingRecipient
    }

    const missingSlug = checkByNotificationType(notification)
    if (missingSlug) {
      return missingSlug
    }
  }
}
