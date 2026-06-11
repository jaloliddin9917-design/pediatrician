import { describe, expect, it } from 'vitest'
import { buildCase } from './escalate'

describe('buildCase', () => {
  it('builds a new triage case from a parent AI check', () => {
    const c = buildCase(
      {
        childName: 'Alisher',
        childAge: '3y 3m',
        urgency: 'yellow',
        summary: 'Fever · 1-3 days — AI recommends a visit within 24h',
        lines: [
          { author: 'parent', text: 'My son has a fever' },
          { author: 'ai', text: 'How long has it lasted?' },
        ],
      },
      new Date('2026-06-11T12:00'),
    )
    expect(c.status).toBe('new')
    expect(c.childName).toBe('Alisher')
    expect(c.urgency).toBe('yellow')
    expect(c.createdAt).toBe('2026-06-11T12:00')
    expect(c.transcript).toHaveLength(2)
    expect(c.transcript[0]).toMatchObject({ author: 'parent', text: 'My son has a fever', at: '2026-06-11T12:00' })
    expect(c.id).toBeTruthy()
  })
})
