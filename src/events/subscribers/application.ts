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

import { hostname } from 'os'
import { getConfig } from '../../components/config'
import { sendNotifications } from '@hyperjumptech/monika-notification'
import { getMessageForTerminate } from '../../components/notification/alert-message'
import events from '../../events'
import { getEventEmitter } from '../../utils/events'
import getIp from '../../utils/ip'
import { log } from '../../utils/pino'

const eventEmitter = getEventEmitter()

eventEmitter.on(events.application.terminated, async () => {
  const isTestEnvironment = process.env.NODE_ENV === 'test'

  if (!isTestEnvironment) {
    const message = await getMessageForTerminate(hostname(), getIp())
    const config = getConfig()

    sendNotifications(config.notifications ?? [], message).catch((error) =>
      log.error(error)
    )
  }
})
