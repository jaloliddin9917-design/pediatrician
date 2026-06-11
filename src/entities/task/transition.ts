import type { ClinicTask, TaskStatus } from '@/shared/api'

export type TaskAction = 'start' | 'complete' | 'reopen'

const TRANSITIONS: Record<TaskAction, { from: TaskStatus; to: TaskStatus }> = {
  start: { from: 'todo', to: 'inProgress' },
  complete: { from: 'inProgress', to: 'done' },
  reopen: { from: 'done', to: 'todo' },
}

export function moveTask(task: ClinicTask, action: TaskAction): ClinicTask {
  const t = TRANSITIONS[action]
  return task.status === t.from ? { ...task, status: t.to } : task
}
