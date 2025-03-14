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

import chalk from 'chalk'
import { log } from '../../utils/pino.js'
import { getAllLogs, openLogfile } from './history.js'

// printAllLogs dumps the content of monika-logs.db onto the screen
export async function printAllLogs(): Promise<void> {
  await openLogfile()
  const data = await getAllLogs()

  for (const {
    id,
    probeId,
    requestUrl,
    responseStatus,
    responseTime,
  } of data) {
    log.info(
      `${id} id: ${probeId} responseCode: ${chalk.keyword(
        getStatusColor(responseStatus)
      )(String(responseStatus))} - ${requestUrl}, ${responseTime || '- '}ms`
    )
  }
}

/**
 * getStatusColor colorizes different statusCode
 * @param {any} responseCode is the httpStatus to colorize
 * @returns {string} color code based on chalk: Chalk & { supportsColor: ColorSupport };
 */
function getStatusColor(responseCode: number): string {
  switch (Math.trunc(responseCode / 100)) {
    case 2: {
      return 'cyan'
    }

    case 4: {
      return 'orange'
    }

    case 5: // all 5xx errrors
    case 0: {
      // 0 is uri not found
      return 'red'
    }
  }

  return 'white'
}
