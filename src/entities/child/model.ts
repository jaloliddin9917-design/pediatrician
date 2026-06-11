import { combine, createEvent, createStore, sample } from 'effector'
import type { Child } from '@/shared/api'
import { readJson, writeJson } from '@/shared/lib/storage'

const DEFAULT_CHILDREN: Child[] = [
  { id: 'ch1', name: 'Alisher', birthDate: '2023-02-15', weightKg: 14.2, heightCm: 96, allergies: ['Strawberries'] },
]

export const childSaved = createEvent<Child>() // add or update by id
export const childRemoved = createEvent<string>()
export const activeChildSet = createEvent<string>()

export const $children = createStore<Child[]>(readJson<Child[]>('pedicare.children') ?? DEFAULT_CHILDREN)
  .on(childSaved, (list, child) =>
    list.some((c) => c.id === child.id) ? list.map((c) => (c.id === child.id ? child : c)) : [...list, child],
  )
  .on(childRemoved, (list, id) => list.filter((c) => c.id !== id))

export const $activeChildId = createStore<string>(readJson<string>('pedicare.activeChild') ?? 'ch1')
  .on(activeChildSet, (_, id) => id)

export const $activeChild = combine(
  $children,
  $activeChildId,
  (list, id) => list.find((c) => c.id === id) ?? list[0] ?? null,
)

// keep the active id pointing at an existing child after removal
sample({
  clock: childRemoved,
  source: { children: $children, active: $activeChildId },
  filter: ({ children, active }) => !children.some((c) => c.id === active),
  fn: ({ children }) => children[0]?.id ?? '',
  target: activeChildSet,
})

$children.watch((v) => writeJson('pedicare.children', v))
$activeChildId.watch((v) => writeJson('pedicare.activeChild', v))
