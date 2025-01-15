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

import { resolve } from 'node:path'
import { stat } from 'node:fs/promises'
import { getValidatedConfig } from '../components/config/index.js'
import {
  deleteFromAlerts,
  deleteFromNotifications,
  deleteFromProbeRequests,
} from '../components/logger/history.js'
import type { ValidatedConfig } from '../interfaces/config.js'

const dbPath = resolve(process.cwd(), 'monika-logs.db')

export async function checkDBSize() {
  await deleteData(getValidatedConfig())
}

async function deleteData(config: ValidatedConfig) {
  const { db_limit: dbLimit } = config

  if (!dbLimit?.max_db_size || !dbLimit.deleted_data) {
    return
  }

  const { deleted_data: deletedData, max_db_size: maxDbSize } = dbLimit
  const { size } = await stat(dbPath)

  if (size > maxDbSize) {
    const { probeRequestIds, probeIds } = await deleteFromProbeRequests(
      deletedData
    )
    await deleteFromNotifications(probeIds)
    await deleteFromAlerts(probeRequestIds)

    deleteData(config) // recursive until reached expected file size
  }
}
