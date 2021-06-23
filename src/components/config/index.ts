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

import chokidar from 'chokidar'
import {
  fromEvent,
  merge,
  Observable,
  BehaviorSubject,
  from,
  timer,
  of,
} from 'rxjs'
import {
  distinctUntilKeyChanged,
  first,
  map,
  share,
  switchMap,
  tap,
} from 'rxjs/operators'
import { Config } from '../../interfaces/config'
import { fetchConfig } from './fetch'
import { parseConfig } from './parse'
import { validateConfig } from './validate'
import { handshake } from '../reporter'
import { log } from '../../utils/pino'
import { md5Hash } from '../../utils/hash'

const configSubject$ = new BehaviorSubject<Config | null>(null)

export let config$: Observable<Config | null>

export const getConfig = () => {
  const config = configSubject$.getValue()
  if (!config) throw new Error('Configuration setup has not been run yet')
  return config
}

const handshakeAndValidate = async (config: Config) => {
  if (config.symon?.url && config.symon?.key) {
    try {
      await handshake(config)
    } catch (error) {
      log.warn(` ›   Warning: Can't do handshake with Symon.`)
    }
  }

  const validated = validateConfig(config)

  if (!validated.valid) {
    throw new Error(validated.message)
  }
}

const processConfig = () => (source: Observable<Config>) =>
  source.pipe(
    tap(handshakeAndValidate),
    map((config) => {
      return Object.assign(config, {
        version: config.version || md5Hash(config),
      })
    }),
    distinctUntilKeyChanged('version'),
    share({ connector: () => configSubject$ })
  )

export const setupConfigFromFile = (path: string, watch: boolean) => {
  let file$ = of(path)

  if (watch) {
    const fileWatcher = chokidar.watch(path)
    file$ = merge(
      fromEvent<string>(fileWatcher, 'add', (...args) => args[0]).pipe(first()),
      fromEvent<string>(fileWatcher, 'change')
    )
  }

  config$ = file$.pipe(map(parseConfig), processConfig())
}

export const setupConfigFromUrl = (url: string, checkingInterval: number) => {
  timer(0, checkingInterval * 1000)
    .pipe(
      switchMap(() => from(fetchConfig(url))),
      processConfig()
    )
    .subscribe((value) => {
      if (value) {
        configSubject$.next(value)
      }
    })
}
