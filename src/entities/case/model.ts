import { createEffect, createEvent, createStore } from 'effector'
import { api, type TriageCase } from '@/shared/api'
import { readJson, writeJson } from '@/shared/lib/storage'
import { transitionCase } from './transition'

export const fetchCasesFx = createEffect(api.fetchCases)
export const caseCreated = createEvent<TriageCase>()
export const caseAccepted = createEvent<string>()
export const caseClosed = createEvent<{ id: string; conclusion: string }>()

// cases persist across sessions so a parent's escalated check reaches the doctor login
export const $cases = createStore<TriageCase[]>(readJson<TriageCase[]>('pedicare.cases') ?? [])
  .on(fetchCasesFx.doneData, (current, fixtures) => {
    const ids = new Set(current.map((c) => c.id))
    return [...current, ...fixtures.filter((c) => !ids.has(c.id))]
  })
  .on(caseCreated, (list, c) => [c, ...list])
  .on(caseAccepted, (list, id) => list.map((c) => (c.id === id ? transitionCase(c, { type: 'accept' }) : c)))
  .on(caseClosed, (list, { id, conclusion }) =>
    list.map((c) => (c.id === id ? transitionCase(c, { type: 'close', conclusion }) : c)),
  )

$cases.watch((v) => writeJson('pedicare.cases', v))

export const $casesLoaded = createStore(false).on(fetchCasesFx.done, () => true)
export const $casesLoading = fetchCasesFx.pending
