import { describe, expect, it } from 'vitest'
import type { TriageCase } from '@/shared/api'
import { groupPatients } from './patients'

const mk = (over: Partial<TriageCase>): TriageCase => ({
  id: 'x',
  childName: 'Kid',
  childAge: '1y',
  urgency: 'green',
  aiSummary: 's',
  status: 'new',
  createdAt: '2026-06-10T08:00',
  transcript: [],
  ...over,
})

describe('groupPatients', () => {
  it('groups cases by child, newest first, with worst urgency', () => {
    const patients = groupPatients([
      mk({ id: 'a', childName: 'Malika', urgency: 'yellow', createdAt: '2026-06-10T08:00' }),
      mk({ id: 'b', childName: 'Otabek', urgency: 'green', createdAt: '2026-06-09T08:00' }),
      mk({ id: 'c', childName: 'Malika', urgency: 'red', createdAt: '2026-06-11T08:00', childAge: '2y 4m' }),
    ])
    expect(patients).toHaveLength(2)
    const malika = patients[0]
    expect(malika.name).toBe('Malika')
    expect(malika.visits).toBe(2)
    expect(malika.worstUrgency).toBe('red')
    expect(malika.lastAt).toBe('2026-06-11T08:00')
    expect(malika.age).toBe('2y 4m')
    expect(malika.cases[0].id).toBe('c')
  })

  it('sorts patients by most recent contact', () => {
    const patients = groupPatients([
      mk({ id: 'a', childName: 'Old', createdAt: '2026-06-01T08:00' }),
      mk({ id: 'b', childName: 'Fresh', createdAt: '2026-06-11T08:00' }),
    ])
    expect(patients.map((p) => p.name)).toEqual(['Fresh', 'Old'])
  })
})
