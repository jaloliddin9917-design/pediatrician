import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, nextState, verdictOf } from './machine'

describe('nextState', () => {
  it('walks symptom → duration → severity → verdict', () => {
    let s = nextState(INITIAL_STATE, 'script.fever')
    expect(s.step).toBe('duration')
    s = nextState(s, 'script.moreDays')
    expect(s.step).toBe('severity')
    s = nextState(s, 'script.none')
    expect(s.step).toBe('verdict')
    expect(s.answers).toEqual(['script.fever', 'script.moreDays', 'script.none'])
  })

  it('does not advance past verdict', () => {
    const s = { step: 'verdict' as const, answers: ['a', 'b', 'c'] }
    expect(nextState(s, 'x')).toBe(s)
  })
})

describe('verdictOf', () => {
  it('is red on trouble breathing or drowsiness', () => {
    expect(verdictOf(['script.fever', 'script.lessDay', 'script.breathing'])).toBe('red')
    expect(verdictOf(['script.cough', 'script.fewDays', 'script.drowsy'])).toBe('red')
  })

  it('is yellow on refusing fluids', () => {
    expect(verdictOf(['script.rash', 'script.lessDay', 'script.fluids'])).toBe('yellow')
  })

  it('is yellow on fever lasting more than 3 days', () => {
    expect(verdictOf(['script.fever', 'script.moreDays', 'script.none'])).toBe('yellow')
  })

  it('is green otherwise', () => {
    expect(verdictOf(['script.cough', 'script.lessDay', 'script.none'])).toBe('green')
  })
})
