export type UserRole = 'parent' | 'doctor'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export type Urgency = 'green' | 'yellow' | 'red'

export interface Child {
  id: string
  name: string
  birthDate: string // ISO date
  weightKg?: number
  heightCm?: number
  allergies: string[]
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  experienceYears: number
  rating: number
  reviews: number
  price: string
  slots: string[] // ISO datetimes
}

export interface ChatMessage {
  id: string
  author: 'ai' | 'parent' | 'doctor'
  text: string
  at: string
}

export type CaseStatus = 'new' | 'accepted' | 'closed'

export interface TriageCase {
  id: string
  childName: string
  childAge: string
  urgency: Urgency
  aiSummary: string
  status: CaseStatus
  createdAt: string
  transcript: ChatMessage[]
  conclusion?: string
}

export interface Booking {
  id: string
  doctorId: string
  doctorName: string
  childName: string
  slot: string // ISO datetime
  status: 'upcoming' | 'done'
}

export interface HistoryRecord {
  id: string
  date: string
  kind: 'ai-check' | 'consultation'
  childName: string
  title: string
  urgency?: Urgency
  conclusion?: string
}

export interface VaccineDose {
  id: string
  name: string
  dueAge: string
  dueDate: string
  status: 'done' | 'upcoming' | 'overdue'
}
