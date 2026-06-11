import { describe, expect, it } from 'vitest'
import type { TriageCase } from '@/shared/api'
import { transitionCase } from './transition'

const base: TriageCase = {
  id: 'c1',
  childName: 'Test',
  childAge: '1y',
  urgency: 'yellow',
  aiSummary: 'summary',
  status: 'new',
  createdAt: '2026-06-11T08:00',
  transcript: [],
}

describe('transitionCase', () => {
  it('accepts a new case', () => {
    expect(transitionCase(base, { type: 'accept' }).status).toBe('accepted')
  })

  it('does not re-accept or accept closed cases', () => {
    const accepted = { ...base, status: 'accepted' as const }
    const closed = { ...base, status: 'closed' as const }
    expect(transitionCase(accepted, { type: 'accept' })).toBe(accepted)
    expect(transitionCase(closed, { type: 'accept' })).toBe(closed)
  })

  it('closes an accepted case with a conclusion', () => {
    const accepted = { ...base, status: 'accepted' as const }
    const closed = transitionCase(accepted, { type: 'close', conclusion: 'All good' })
    expect(closed.status).toBe('closed')
    expect(closed.conclusion).toBe('All good')
  })

  it('does not close a case that was never accepted', () => {
    expect(transitionCase(base, { type: 'close', conclusion: 'x' })).toBe(base)
  })
})
