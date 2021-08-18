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

import axios from 'axios'
import { TeamsData } from './../../../interfaces/data'
import { AxiosResponseWithExtraData } from '../../../interfaces/request'
import getIp from '../../../utils/ip'
import { hostname } from 'os'
import { publicIpAddress } from '../../../utils/public-ip'

export const sendTeams = async (data: TeamsData) => {
  try {
    const notifType = data.body.probeState === 'UP' ? 'RECOVERY' : 'INCIDENT'
    const notifColor = data.body.probeState === 'UP' ? '8CC152' : 'DF202E'

    let res: AxiosResponseWithExtraData
    if (
      data.body.probeState === 'INIT' ||
      data.body.probeState === 'TERMINATE'
    ) {
      res = await axios({
        method: 'POST',
        url: data.url,
        data: {
          '@type': 'MessageCard',
          themeColor: '3BAFDA',
          summary: data.body.alert,
          sections: [
            {
              activityTitle: data.body.alert,
              markdown: true,
            },
          ],
        },
      })
    } else {
      res = await axios({
        method: 'POST',
        url: data.url,
        data: {
          '@type': 'MessageCard',
          themeColor: notifColor,
          summary: `New ${notifType} notification from Monika`,
          sections: [
            {
              activityTitle: `New ${notifType} notification from Monika`,
              activitySubtitle: `${data.body.alert} for URL [${data.body.url}](${data.body.url}) at ${data.body.time}`,
              facts: [
                {
                  name: 'Alert',
                  value: data.body.expected,
                },
                {
                  name: 'URL',
                  value: `[${data.body.url}](${data.body.url})`,
                },
                {
                  name: 'At',
                  value: data.body.time,
                },
                {
                  name: 'Monika',
                  value: `${getIp()} (local), ${
                    publicIpAddress ? `${publicIpAddress} (public)` : ''
                  } ${hostname} (hostname)`,
                },
              ],
              markdown: true,
            },
          ],
        },
      })
    }

    return res
  } catch (error) {
    throw error
  }
}
