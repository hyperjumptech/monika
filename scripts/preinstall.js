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

const { execSync } = require('child_process')

const npmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim()
const [major] = npmVersion.split('.').map((n) => parseInt(n, 10))
if (major > 6) {
  console.error(
    `\x1b[31mYou are using npm version ${npmVersion}. Change to npm version 6 when working on monika!\x1b[0m`
  )
  process.exit(1)
}
