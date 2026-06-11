import type { Urgency } from '@/shared/api'

export type StepId = 'symptom' | 'duration' | 'severity' | 'verdict'

export interface TriageState {
  step: StepId
  answers: string[] // selected option keys in order: [symptom, duration, severity]
}

export const INITIAL_STATE: TriageState = { step: 'symptom', answers: [] }

export const QUICK_REPLIES: Record<Exclude<StepId, 'verdict'>, string[]> = {
  symptom: ['script.fever', 'script.cough', 'script.rash', 'script.stomach'],
  duration: ['script.lessDay', 'script.fewDays', 'script.moreDays'],
  severity: ['script.none', 'script.fluids', 'script.drowsy', 'script.breathing'],
}

export const AI_PROMPTS: Record<Exclude<StepId, 'verdict'>, string> = {
  symptom: 'script.greeting',
  duration: 'script.askDuration',
  severity: 'script.askSeverity',
}

export function nextState(state: TriageState, reply: string): TriageState {
  if (state.step === 'verdict') return state
  const answers = [...state.answers, reply]
  const next: Record<Exclude<StepId, 'verdict'>, StepId> = {
    symptom: 'duration',
    duration: 'severity',
    severity: 'verdict',
  }
  return { step: next[state.step], answers }
}

export function verdictOf(answers: string[]): Urgency {
  const [symptom, duration, severity] = answers
  if (severity === 'script.breathing' || severity === 'script.drowsy') return 'red'
  if (severity === 'script.fluids') return 'yellow'
  if (symptom === 'script.fever' && duration === 'script.moreDays') return 'yellow'
  return 'green'
}

export function verdictPrompt(urgency: Urgency): string {
  if (urgency === 'red') return 'script.verdictRed'
  if (urgency === 'yellow') return 'script.verdictYellow'
  return 'script.verdictGreen'
}
