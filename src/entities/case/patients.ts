import type { TriageCase, Urgency } from '@/shared/api'

export interface Patient {
  name: string
  age: string
  visits: number
  lastAt: string
  worstUrgency: Urgency
  cases: TriageCase[]
}

const RANK: Record<Urgency, number> = { green: 0, yellow: 1, red: 2 }

export function groupPatients(cases: TriageCase[]): Patient[] {
  const byName = new Map<string, TriageCase[]>()
  for (const c of cases) {
    const list = byName.get(c.childName) ?? []
    list.push(c)
    byName.set(c.childName, list)
  }
  return [...byName.entries()]
    .map(([name, list]) => {
      const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      return {
        name,
        age: sorted[0].childAge,
        visits: sorted.length,
        lastAt: sorted[0].createdAt,
        worstUrgency: sorted.reduce<Urgency>((w, c) => (RANK[c.urgency] > RANK[w] ? c.urgency : w), 'green'),
        cases: sorted,
      }
    })
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
}
