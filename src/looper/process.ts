import Piscina from 'piscina'
import path from 'path'
import type { Probe } from '../interfaces/probe'
import type { Notification } from '@hyperjumptech/monika-notification'
import { AbortSignal } from 'node-abort-controller'
import { isConnectedToSTUNServer } from 'src/utils/public-ip'

const DISABLE_STUN = -1 // -1 is disable stun checking

type TaskData = {
  probe: Probe
  notifications: Notification[]
  retryInitialDelayMs: number
  retryMaxDelayMs: number
}
type Task = {
  data: TaskData
  interval: number
  nextRun?: number
  cycle: number
}

const taskMap: Map<string, Task> = new Map()

const piscina = new Piscina.Piscina({
  concurrentTasksPerWorker: 1,
  // eslint-disable-next-line unicorn/prefer-module
  filename: path.join(__dirname, '../../lib/workers/probing2.js'),
  idleTimeout: 1000,
  maxThreads: 1,
})

export const addTask = (id: string, data: TaskData, interval: number) => {
  taskMap.set(id, { data, interval, nextRun: Date.now(), cycle: 0 })
}

export const updateTask = (id: string, newValues: Partial<Task>) => {
  const task = taskMap.get(id)
  if (!task) return false
  const updatedTask = { ...task, ...newValues }
  taskMap.set(id, updatedTask)
  return true
}

export const deleteTask = (id: string) => taskMap.delete(id)

export const processQueue = async (
  signal: AbortSignal,
  stun: number,
  repeat: number
) => {
  if (signal?.aborted) {
    return
  }

  const currentTime = Date.now()

  for (const [id, task] of taskMap) {
    if (signal?.aborted) {
      return
    }

    if (!isStunOK(stun)) {
      break
    }

    if (task.nextRun && task.nextRun <= currentTime) {
      task.nextRun = undefined
      piscina
        .run({ ...task.data })
        .then(() => {
          // no need to do anything
        })
        .catch((_error: unknown) => {
          // no need to do anything
        })
        .finally(() => {
          if (repeat === 0 || (repeat > 0 && repeat !== task.cycle)) {
            const updatedTask = {
              ...task,
              cycle: task.cycle + 1,
              nextRun: Date.now() + task.interval * 1000,
            }
            taskMap.set(id, updatedTask)
          }
        })
    }
  }

  if (signal?.aborted) {
    return
  }

  setTimeout(processQueue, 1000)
}

function isStunOK(stunFlag: number) {
  return stunFlag === DISABLE_STUN || isConnectedToSTUNServer
}
