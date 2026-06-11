import { combine, createEffect, createEvent, createStore, sample } from 'effector'
import { fakeRequest } from '@/shared/api'
import {
  AI_PROMPTS,
  INITIAL_STATE,
  nextState,
  QUICK_REPLIES,
  verdictOf,
  verdictPrompt,
  type TriageState,
} from './machine'

export interface UiMessage {
  id: number
  author: 'ai' | 'parent'
  key: string // i18n key, translated at render time
}

export const replySelected = createEvent<string>()
export const chatRestarted = createEvent()

const aiThinkFx = createEffect((state: TriageState) => fakeRequest(state, 700))

export const $state = createStore<TriageState>(INITIAL_STATE)
  .on(replySelected, nextState)
  .reset(chatRestarted)

// after every parent reply, the AI "thinks" then responds with the new step's prompt
sample({
  clock: $state.updates,
  filter: (s) => s.answers.length > 0,
  target: aiThinkFx,
})

export const $messages = createStore<UiMessage[]>([{ id: 0, author: 'ai', key: AI_PROMPTS.symptom }])
  .on(replySelected, (msgs, reply) => [...msgs, { id: msgs.length, author: 'parent', key: reply }])
  .on(aiThinkFx.doneData, (msgs, state) => [
    ...msgs,
    {
      id: msgs.length,
      author: 'ai',
      key: state.step === 'verdict' ? verdictPrompt(verdictOf(state.answers)) : AI_PROMPTS[state.step],
    },
  ])
  .reset(chatRestarted)

export const $typing = aiThinkFx.pending

export const $verdict = combine($state, $typing, (s, typing) =>
  s.step === 'verdict' && !typing ? verdictOf(s.answers) : null,
)

export const $quickReplies = combine($state, $typing, (s, typing) =>
  typing || s.step === 'verdict' ? [] : QUICK_REPLIES[s.step],
)
