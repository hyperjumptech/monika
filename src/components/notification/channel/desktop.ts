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

import { execSync, spawnSync } from 'child_process'
import { type } from 'os'

interface NotifyData {
  title: string
  message: string
}

/**
 * Escape a string for PowerShell.
 * @param {string} str input string
 * @return {string} escape single quote with another
 */
export const psEscape = (str: string): string => {
  let result = ''
  for (const ch of str) {
    if (ch.charCodeAt(0) === 39) {
      // single quote, escape it with another single quote
      result += ch
    }

    result += ch
  }

  return result
}

/**
 * Send notification according to the operating system
 * @param {NotifyData} data notification data
 * @return {void}
 */
export const sendDesktop = (data: NotifyData): any => {
  const { title, message } = data
  const operatingSystem = type()

  // OSAScript for OS X
  const osascript = `display notification "${message}" with title "Monika" subtitle "${title}"`

  // Powershell Script for Windows
  const powershellScript = `
  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null;
  $templateType = [Windows.UI.Notifications.ToastTemplateType]::ToastText02;
  $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($templateType);
  $template.SelectSingleNode("//text[@id=1]").InnerText = '${psEscape(title)}';
  $template.SelectSingleNode("//text[@id=2]").InnerText = '${psEscape(
    message
  )}';
  $toast = [Windows.UI.Notifications.ToastNotification]::new($template);
  $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Monika');
  $notifier.Show($toast);
  `

  switch (operatingSystem) {
    case 'Linux':
      spawnSync('notify-send', ['-a', 'Monika', title, message])
      break
    case 'Darwin':
      spawnSync('osascript', ['-e', osascript])
      break
    case 'Windows_NT':
      execSync(powershellScript, { shell: 'powershell.exe' })
      break
    default:
      // TODO: New operating system?
      break
  }
}
