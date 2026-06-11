import { CASES, DOCTORS, HISTORY, INITIAL_BOOKINGS, VACCINES } from './fixtures'
import type { Booking, Doctor, HistoryRecord, TriageCase, VaccineDose } from './types'

export function fakeRequest<T>(data: T, ms = 300 + Math.random() * 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms))
}

export const api = {
  fetchDoctors: () => fakeRequest<Doctor[]>(DOCTORS),
  fetchDoctor: (id: string) => fakeRequest<Doctor | undefined>(DOCTORS.find((d) => d.id === id)),
  fetchCases: () => fakeRequest<TriageCase[]>(CASES),
  fetchHistory: () => fakeRequest<HistoryRecord[]>(HISTORY),
  fetchVaccines: () => fakeRequest<VaccineDose[]>(VACCINES),
  fetchBookings: () => fakeRequest<Booking[]>(INITIAL_BOOKINGS),
}

export * from './types'
export * from './ai-types'
export * from './ai-fixtures'
