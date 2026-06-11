import { createEvent, createStore } from 'effector'
import type { User } from '@/shared/api'
import { readJson, writeJson } from '@/shared/lib/storage'

export const sessionSet = createEvent<User>()
export const sessionCleared = createEvent()

export const $session = createStore<User | null>(readJson<User>('pedicare.session'))
  .on(sessionSet, (_, user) => user)
  .reset(sessionCleared)

$session.watch((s) => writeJson('pedicare.session', s))
