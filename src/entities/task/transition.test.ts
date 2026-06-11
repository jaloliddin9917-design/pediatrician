import { describe, expect, it } from 'vitest'
import type { ClinicTask } from '@/shared/api'
import { moveTask } from './transition'

const base: ClinicTask = {
  id: 't1',
  title: 'Test task',
  assignee: 'Nurse',
  priority: 'medium',
  due: '2026-06-12',
  status: 'todo',
}

describe('moveTask', () => {
  it('starts a todo task', () => {
    expect(moveTask(base, 'start').status).toBe('inProgress')
  })

  it('completes an in-progress task', () => {
    const started = { ...base, status: 'inProgress' as const }
    expect(moveTask(started, 'complete').status).toBe('done')
  })

  it('reopens a done task back to todo', () => {
    const done = { ...base, status: 'done' as const }
    expect(moveTask(done, 'reopen').status).toBe('todo')
  })

  it('ignores invalid transitions', () => {
    expect(moveTask(base, 'complete')).toBe(base)
    expect(moveTask(base, 'reopen')).toBe(base)
    const done = { ...base, status: 'done' as const }
    expect(moveTask(done, 'start')).toBe(done)
  })
})
