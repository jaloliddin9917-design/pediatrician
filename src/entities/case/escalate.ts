import type { TriageCase, Urgency } from '@/shared/api'

export interface EscalationInput {
  childName: string
  childAge: string
  urgency: Urgency
  summary: string
  lines: { author: 'parent' | 'ai'; text: string }[]
}

const isoMinutes = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function buildCase(input: EscalationInput, now = new Date()): TriageCase {
  const at = isoMinutes(now)
  return {
    id: crypto.randomUUID(),
    childName: input.childName,
    childAge: input.childAge,
    urgency: input.urgency,
    aiSummary: input.summary,
    status: 'new',
    createdAt: at,
    transcript: input.lines.map((line, i) => ({ id: `m${i + 1}`, author: line.author, text: line.text, at })),
  }
}
