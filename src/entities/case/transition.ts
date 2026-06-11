import type { TriageCase } from '@/shared/api'

export type CaseAction = { type: 'accept' } | { type: 'close'; conclusion: string }

export function transitionCase(c: TriageCase, action: CaseAction): TriageCase {
  if (action.type === 'accept') {
    return c.status === 'new' ? { ...c, status: 'accepted' } : c
  }
  return c.status === 'accepted' ? { ...c, status: 'closed', conclusion: action.conclusion } : c
}
