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

import path from 'path'
import fs from 'fs'
import { getConfig } from '../components/config'
import {
  deleteFromAlerts,
  deleteFromNotifications,
  deleteFromProbeRequests,
} from '../components/logger/history'
import { Config } from '../interfaces/config'
const dbPath = path.resolve(process.cwd(), 'monika-logs.db')

export function check_db_size() {
  const config = getConfig()
  deleteData(config)
}

async function deleteData(config: Config) {
  const { db_limit } = config
  const stats = fs.statSync(dbPath)

  if (!db_limit?.max_db_size) {
    return
  }

  if (!db_limit.deleted_data) {
    return
  }

  if (stats.size > db_limit.max_db_size) {
    const probe_res = await deleteFromProbeRequests(db_limit.deleted_data)
    await deleteFromNotifications(probe_res.probe_ids)
    await deleteFromAlerts(probe_res.probe_request_ids)

    deleteData(config) // recursive until reached expected file size
  }
}
