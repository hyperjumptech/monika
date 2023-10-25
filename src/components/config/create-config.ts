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

import fs from 'fs'
import type { MonikaFlags } from '../../flag'
import { log } from '../../utils/pino'
import { sendHttpRequest } from '../../utils/http'

export const createConfigFile = async (flags: MonikaFlags): Promise<string> => {
  const filename = flags['config-filename']

  try {
    const url =
      'https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml'
    await sendHttpRequest({ url: url }).then((resp) => {
      fs.writeFileSync(filename, resp.data, 'utf-8')
    })
    log.info(
      `${filename} file has been created in this directory. You can change the URL to probe and other configurations in that ${filename} file.`
    )
  } catch {
    const ymlConfig = `
    probes:
    - id: '1'
      requests:
        - url: http://github.com
    
    db_limit:
      max_db_size: 1000000000
      deleted_data: 1
      cron_schedule: '*/1 * * * *'
    `

    fs.writeFileSync(filename, ymlConfig, 'utf-8')
  }

  return filename
}
