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

/* eslint-disable no-process-exit */
/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-console */
/* eslint-disable unicorn/no-hex-escape */
/* eslint-disable unicorn/escape-case */

/**
 * Using npm version 7 will create lockfile version 2.
 * This version is not widely used yet and most developers are on LTS version of node
 * which come with npm version 6.
 *
 * This script will exit `npm install` when the major npm version being used is greater than 6
 *
 * */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const project = path.join(__dirname, '../tsconfig.json')
const dev = fs.existsSync(project)

// this will only run in development
if (dev) {
  const npmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim()
  const [major] = npmVersion.split('.').map((n) => parseInt(n, 10))
  if (major > 6) {
    console.error(
      `\x1b[31mYou are using npm version ${npmVersion}. Change to npm version 6 when working on monika!\x1b[0m`
    )
    process.exit(1)
  }
}
