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

import { Config } from '../../interfaces/config'
import { readFileSync } from 'fs'
import { parseConfigFromPostman } from './parse-postman'
import { parseHarFile } from './parse-har'
import path from 'path'
import yml from 'js-yaml'
import { Notification } from '../../interfaces/notification'

export const parseConfig = (
  configPath: string,
  type: string,
  omitNotifications: boolean
): Config => {
  // Read file from configPath
  try {
    // Read file from configPath
    const configString = readFileSync(configPath, 'utf-8')
    const ext = path.extname(configPath)

    if (type === 'har') {
      return parseHarFile(configString)
    }
    if (type === 'postman') {
      return parseConfigFromPostman(configString)
    }

    if (ext === '.yml' || ext === '.yaml') {
      const cfg = yml.load(configString, { json: true })
      return (cfg as unknown) as Config
    }

    if (omitNotifications) {
      return JSON.parse(configString) as Omit<Config, 'notifications'>
    }

    return JSON.parse(configString) as Config
  } catch (error) {
    if (error.code === 'ENOENT' && error.path === configPath) {
      throw new Error(
        'Configuration file not found. By default, Monika looks for monika.json or monika.yml configuration file in the current directory.\n\nOtherwise, you can also specify a configuration file using -c flag as follows:\n\nmonika -c <path_to_configuration_file>\n\nYou can create a configuration file via web interface by opening this web app: https://hyperjumptech.github.io/monika-config-generator/'
      )
    }

    if (error.name === 'SyntaxError') {
      throw new Error('JSON configuration file is in invalid JSON format!')
    }

    throw new Error(error.message)
  }
}

export const parseNotificationFile = (path: string): Notification[] => {
  try {
    const configString = readFileSync(path, 'utf-8')
    return JSON.parse(configString) as Notification[]
  } catch (error) {
    if (error.code === 'ENOENT' && error.path === path) {
      throw new Error('--notification: error, file not found.')
    }

    if (error.name === 'SyntaxError') {
      throw new Error('--notification: error, invalid JSON')
    }
    throw new Error(error.message)
  }
}
