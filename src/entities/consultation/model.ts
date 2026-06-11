import { createEffect, createStore } from 'effector'
import { api, type HistoryRecord } from '@/shared/api'

export const fetchHistoryFx = createEffect(api.fetchHistory)

export const $history = createStore<HistoryRecord[]>([]).on(fetchHistoryFx.doneData, (_, list) => list)
export const $historyLoaded = createStore(false).on(fetchHistoryFx.done, () => true)
export const $historyLoading = fetchHistoryFx.pending
