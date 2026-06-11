export interface ReceptionCall {
  id: string
  caller: string
  phone: string
  time: string // ISO
  intent: string
  outcome: 'booked' | 'routed' | 'voicemail' | 'info'
  durationSec: number
  transcript: string[]
}

export interface BillingCode {
  code: string
  label: string
  confidence: number // 0..1
  kind: 'icd' | 'cpt'
}

export interface BillingVisit {
  id: string
  patient: string
  age: string
  date: string
  summary: string
  emLevel: string
  emReasoning: string
  total: string
  codes: BillingCode[]
}

export interface EvidentiaAnswer {
  model: string
  latencyMs: number
  rank: 1 | 2 | 3 | 4
  score: number
  text: string
}

export interface EvidentiaQuestion {
  id: string
  question: string
  judgeRationale: string
  answers: EvidentiaAnswer[]
}

export interface IntakeQA {
  q: string
  a: string
  flag?: boolean
}

export interface IntakeForm {
  id: string
  child: string
  age: string
  visitReason: string
  status: 'completed' | 'pending'
  qa: IntakeQA[]
  summary: string
}

export interface CommMessage {
  author: 'them' | 'clinic'
  text: string
  at: string
}

export type CommChannel = 'fax' | 'email' | 'sms' | 'phone'

export interface CommThread {
  id: string
  channel: CommChannel
  from: string
  subject: string
  time: string
  unread: boolean
  handled: boolean
  messages: CommMessage[]
  aiDraft: string
}

export type TaskStatus = 'todo' | 'inProgress' | 'done'

export interface ClinicTask {
  id: string
  title: string
  assignee: string
  priority: 'high' | 'medium' | 'low'
  due: string
  status: TaskStatus
}

export interface AiFormField {
  label: string
  value: string
  fromContext: boolean
}

export interface AiForm {
  id: string
  name: string
  pages: number
  source: string
  fields: AiFormField[]
}

export interface ScribeLine {
  speaker: 'doctor' | 'parent'
  text: string
}

export interface SoapNote {
  s: string
  o: string
  a: string
  p: string
}

export interface CanvasDifferential {
  dx: string
  likelihood: number // 0..1
  supports: string
  against: string
}
