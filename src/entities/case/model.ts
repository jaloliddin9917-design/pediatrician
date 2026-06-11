import { createEffect, createEvent, createStore } from 'effector'
import { api, type TriageCase } from '@/shared/api'
import { transitionCase } from './transition'

export const fetchCasesFx = createEffect(api.fetchCases)
export const caseAccepted = createEvent<string>()
export const caseClosed = createEvent<{ id: string; conclusion: string }>()

export const $cases = createStore<TriageCase[]>([])
  .on(fetchCasesFx.doneData, (_, list) => list)
  .on(caseAccepted, (list, id) => list.map((c) => (c.id === id ? transitionCase(c, { type: 'accept' }) : c)))
  .on(caseClosed, (list, { id, conclusion }) =>
    list.map((c) => (c.id === id ? transitionCase(c, { type: 'close', conclusion }) : c)),
  )

export const $casesLoaded = createStore(false).on(fetchCasesFx.done, () => true)
export const $casesLoading = fetchCasesFx.pending
