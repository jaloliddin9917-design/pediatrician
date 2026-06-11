import { describe, expect, it } from 'vitest'
import { assess } from './assess'

describe('assess', () => {
  it('detects fever in three languages and rates it yellow', () => {
    expect(assess('he has a high fever since morning')).toMatchObject({ urgency: 'yellow', symptoms: ['fever'] })
    expect(assess('у дочки температура 38.9')).toMatchObject({ urgency: 'yellow', symptoms: ['fever'] })
    expect(assess("qizimda isitma bor")).toMatchObject({ urgency: 'yellow', symptoms: ['fever'] })
  })

  it('rates breathing trouble and drowsiness red', () => {
    expect(assess('my baby has trouble breathing').urgency).toBe('red')
    expect(assess('ребёнок задыхается и хрипит').urgency).toBe('red')
    expect(assess('bola nafas ololmayapti').urgency).toBe('red')
    expect(assess('он очень сонливый, не просыпается').urgency).toBe('red')
  })

  it('rates an isolated cough green', () => {
    expect(assess('she coughs a little at night')).toMatchObject({ urgency: 'green', symptoms: ['cough'] })
  })

  it('collects multiple symptoms and escalates to the worst urgency', () => {
    const r = assess('fever 39, vomited twice and breathing fast')
    expect(r.symptoms).toEqual(expect.arrayContaining(['fever', 'vomit', 'breathing']))
    expect(r.urgency).toBe('red')
  })

  it('returns no symptoms for unrecognized text', () => {
    const r = assess('he is just a bit grumpy today')
    expect(r.symptoms).toEqual([])
  })
})
