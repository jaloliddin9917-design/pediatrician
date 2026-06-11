import { createEvent, createStore } from 'effector'
import { INITIAL_TASKS, type ClinicTask } from '@/shared/api'
import { moveTask, type TaskAction } from './transition'

export const taskCreated = createEvent<ClinicTask>()
export const taskMoved = createEvent<{ id: string; action: TaskAction }>()

export const $tasks = createStore<ClinicTask[]>(INITIAL_TASKS)
  .on(taskCreated, (list, task) => [task, ...list])
  .on(taskMoved, (list, { id, action }) => list.map((t) => (t.id === id ? moveTask(t, action) : t)))
