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

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { register } from 'prom-client'
import { log } from '../../../utils/pino'

export function startPrometheusMetricsServer(port: number): void {
  const app = express()

  // security middleware
  app.use(helmet())
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return res.status(405).end()
    }

    next()
  })

  app.get('/metrics', async (_: Request, res: Response) => {
    try {
      const prometheusMetrics = await register.metrics()

      res.status(200).end(prometheusMetrics)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

  app.listen(port, () => {
    log.info(
      `You can scrape Prometheus metrics from http://localhost:${port}/metrics`
    )
  })
}
