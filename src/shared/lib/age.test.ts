import { describe, expect, it } from 'vitest'
import { formatAge } from './age'

describe('formatAge', () => {
  const now = new Date('2026-06-11')

  it('formats years and months', () => {
    expect(formatAge('2023-02-15', now)).toBe('3y 3m')
  })

  it('formats whole years', () => {
    expect(formatAge('2024-06-11', now)).toBe('2y')
  })

  it('formats infants in months', () => {
    expect(formatAge('2025-10-20', now)).toBe('7m')
  })
})
