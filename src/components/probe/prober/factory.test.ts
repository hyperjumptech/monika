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

import { expect } from 'chai'
import { Probe } from '../../../interfaces/probe.js'
import { createProber } from './factory.js'

describe('Prober factory', () => {
  describe('Prober verbose startup message', () => {
    it('should return MariaDB verbose startup message', () => {
      // arrange
      const probe = {
        id: '1',
        interval: 1,
        mariadb: [
          {
            host: 'localhost',
            port: 3306,
            username: 'mariadb_user',
            password: 'mariadb_password',
            database: '',
          },
        ],
      } as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes('localhost')
      expect(prober.generateVerboseStartupMessage()).includes('3306')
      expect(prober.generateVerboseStartupMessage()).includes('mariadb_user')
      expect(prober.generateVerboseStartupMessage()).not.includes(
        'mariadb_password'
      )
    })

    it('should return MongoDB verbose startup message', () => {
      // arrange
      const probe = {
        id: '1',
        interval: 1,
        mongo: [
          {
            host: 'localhost',
            password: 'mongo_password',
            port: '27017',
            username: 'mongo_user',
          },
        ],
      } as unknown as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes('localhost')
      expect(prober.generateVerboseStartupMessage()).includes('27017')
      expect(prober.generateVerboseStartupMessage()).includes('mongo_user')
      expect(prober.generateVerboseStartupMessage()).not.includes(
        'mongo_password'
      )
    })

    it('should return MongoDB verbose startup message (with uri)', () => {
      // arrange
      const probe = {
        id: '1',
        interval: 1,
        mongo: [{ uri: 'mongodb://mongo_user:mongo_password@localhost:27017' }],
      } as unknown as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes(
        'mongodb://mongo_user:mongo_password@localhost:27017'
      )
    })

    it('should return MySQL verbose startup message', () => {
      // arrange
      const probe = {
        id: '1',
        description: 'MySQL probe',
        interval: 1,
        mariadb: [
          {
            host: 'localhost',
            port: 3306,
            username: 'mysql_user',
            password: 'mysql_password',
            database: '',
          },
        ],
      } as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes('localhost')
      expect(prober.generateVerboseStartupMessage()).includes('3306')
      expect(prober.generateVerboseStartupMessage()).includes('mysql_user')
      expect(prober.generateVerboseStartupMessage()).not.includes(
        'mysql_password'
      )
    })

    it('should return PostgreSQL verbose startup message', () => {
      // arrange
      const probe = {
        id: '1',
        interval: 1,
        postgres: [
          {
            database: 'postgres_db',
            host: 'localhost',
            password: 'postgres_password',
            port: '5432',
            username: 'postgres_user',
          },
        ],
      } as unknown as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes('localhost')
      expect(prober.generateVerboseStartupMessage()).includes('5432')
      expect(prober.generateVerboseStartupMessage()).includes('postgres_user')
      expect(prober.generateVerboseStartupMessage()).includes('postgres_db')
      expect(prober.generateVerboseStartupMessage()).not.includes(
        'postgres_password'
      )
    })

    it('should return PostgreSQL verbose startup message (with uri)', () => {
      // arrange
      const probe = {
        id: '1',
        description: 'PostgreSQL probe',
        interval: 1,
        postgres: [
          {
            uri: 'postgres://postgres_user:postgres_password@localhost:5432/postgres_db',
          },
        ],
      } as unknown as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes(
        'postgres://postgres_user:postgres_password@localhost:5432/postgres_db'
      )
    })

    it('should return Redis verbose startup message', () => {
      // arrange
      const probe = {
        id: '1',
        interval: 1,
        redis: [
          {
            host: 'localhost',
            password: 'redis_password',
            port: '6379',
          },
        ],
      } as unknown as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes('localhost')
      expect(prober.generateVerboseStartupMessage()).includes('6379')
      expect(prober.generateVerboseStartupMessage()).not.includes(
        'redis_password'
      )
    })

    it('should return Redis verbose startup message (with uri)', () => {
      // arrange
      const probe = {
        id: '1',
        description: 'Redis probe',
        interval: 1,
        redis: [
          {
            uri: 'redis://:redis_password@localhost:6379',
          },
        ],
      } as unknown as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes(
        'redis://:redis_password@localhost:6379'
      )
    })

    it('should return socket verbose startup message', () => {
      // arrange
      const probe = {
        id: '1',
        interval: 1,
        socket: {
          host: 'localhost',
          port: '8080',
          data: 'some-data',
        },
      } as unknown as Probe

      // act
      const prober = createProber({
        counter: 0,
        notifications: [],
        probeConfig: probe,
      })

      // assert
      expect(prober.generateVerboseStartupMessage()).includes('localhost')
      expect(prober.generateVerboseStartupMessage()).includes('8080')
    })
  })
})
