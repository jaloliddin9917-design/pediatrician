import { describe, expect, it } from 'vitest'
import { formatWaiting } from './waiting'

describe('formatWaiting', () => {
  const now = new Date('2026-06-12T10:00')

  it('formats minutes under an hour', () => {
    expect(formatWaiting('2026-06-12T09:35', now)).toBe('25m')
  })

  it('formats hours under a day', () => {
    expect(formatWaiting('2026-06-12T06:30', now)).toBe('3h')
  })

  it('formats days with remaining hours', () => {
    expect(formatWaiting('2026-06-11T04:00', now)).toBe('1d 6h')
  })

  it('clamps future or just-now to 0m', () => {
    expect(formatWaiting('2026-06-12T10:05', now)).toBe('0m')
  })
})
