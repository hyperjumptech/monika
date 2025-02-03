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

// format is: SCOPE_ITEM_STATE
// scope : is where it came from ie: probe, or config or maybe timer
// item  : is the "item" that the listener will be processing/handling
// state : is the state of that item, is it ready? is it received?
export default {
  application: {
    terminated: 'APPLICATION_TERMINATED',
  },
  config: {
    sanitized: 'CONFIG_SANITIZED',
    updated: 'CONFIG_UPDATED',
  },
  notifications: {
    sent: 'NOTIFICATIONS_SENT',
  },
  probe: {
    alert: {
      triggered: 'PROBE_ALERT_TRIGGERED',
    },
    response: {
      received: 'PROBE_RESPONSE_RECEIVED',
    },
    ran: 'PROBE_RAN',
    finished: 'PROBE_FINISHED',
    notification: {
      willSend: 'PROBE_NOTIFICATION_WILL_SEND',
    },
    status: {
      changed: 'PROBE_STATUS_CHANGED',
    },
  },
}
