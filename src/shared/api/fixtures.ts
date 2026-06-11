import type { Booking, Doctor, HistoryRecord, TriageCase, VaccineDose } from './types'

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Aziza Karimova', specialty: 'General pediatrics', experienceYears: 12, rating: 4.9, reviews: 214, price: '$25', slots: ['2026-06-12T09:00', '2026-06-12T11:30', '2026-06-13T10:00', '2026-06-13T15:30'] },
  { id: 'd2', name: 'Dr. Timur Rashidov', specialty: 'Pediatric allergology', experienceYears: 9, rating: 4.8, reviews: 156, price: '$30', slots: ['2026-06-12T14:00', '2026-06-13T09:30', '2026-06-14T10:00'] },
  { id: 'd3', name: 'Dr. Elena Sokolova', specialty: 'Pediatric pulmonology', experienceYears: 15, rating: 4.9, reviews: 301, price: '$35', slots: ['2026-06-12T10:00', '2026-06-12T16:00', '2026-06-13T11:00'] },
  { id: 'd4', name: 'Dr. Jasur Olimov', specialty: 'General pediatrics', experienceYears: 6, rating: 4.6, reviews: 87, price: '$18', slots: ['2026-06-12T08:30', '2026-06-13T13:00', '2026-06-14T09:00'] },
  { id: 'd5', name: 'Dr. Nilufar Yusupova', specialty: 'Pediatric gastroenterology', experienceYears: 11, rating: 4.7, reviews: 178, price: '$28', slots: ['2026-06-13T10:30', '2026-06-13T15:00', '2026-06-14T11:30'] },
  { id: 'd6', name: 'Dr. Sergey Kim', specialty: 'Pediatric neurology', experienceYears: 18, rating: 5, reviews: 412, price: '$40', slots: ['2026-06-14T09:30', '2026-06-14T14:00'] },
]

export const CASES: TriageCase[] = [
  {
    id: 'c1', childName: 'Malika', childAge: '2y 4m', urgency: 'red', status: 'new', createdAt: '2026-06-11T08:12',
    aiSummary: 'Fever 39.4°C for 2 days, refuses fluids, unusually drowsy. Recommended urgent consultation.',
    transcript: [
      { id: 'm1', author: 'parent', text: 'My daughter has a high fever and won\'t drink anything.', at: '2026-06-11T08:10' },
      { id: 'm2', author: 'ai', text: 'How high is the fever and how long has it lasted?', at: '2026-06-11T08:10' },
      { id: 'm3', author: 'parent', text: '39.4, since Tuesday. She is very sleepy.', at: '2026-06-11T08:11' },
      { id: 'm4', author: 'ai', text: 'Drowsiness with high fever and poor fluid intake needs urgent medical attention. I am connecting you to a pediatrician now.', at: '2026-06-11T08:12' },
    ],
  },
  {
    id: 'c2', childName: 'Otabek', childAge: '5y 1m', urgency: 'yellow', status: 'new', createdAt: '2026-06-11T07:40',
    aiSummary: 'Dry cough for 5 days, no fever, normal activity. Recommended consultation within 24h.',
    transcript: [
      { id: 'm1', author: 'parent', text: 'My son has been coughing for almost a week.', at: '2026-06-11T07:38' },
      { id: 'm2', author: 'ai', text: 'Is there fever, wheezing, or trouble breathing?', at: '2026-06-11T07:39' },
      { id: 'm3', author: 'parent', text: 'No fever, he plays as usual, just coughs at night.', at: '2026-06-11T07:39' },
      { id: 'm4', author: 'ai', text: 'A lingering night cough should be checked by a doctor soon, but it is not an emergency.', at: '2026-06-11T07:40' },
    ],
  },
  {
    id: 'c3', childName: 'Sofia', childAge: '8m', urgency: 'yellow', status: 'accepted', createdAt: '2026-06-10T19:05',
    aiSummary: 'Mild rash on cheeks after new formula, no breathing issues. Possible food allergy.',
    transcript: [
      { id: 'm1', author: 'parent', text: 'Red spots appeared on my baby\'s cheeks after we changed formula.', at: '2026-06-10T19:03' },
      { id: 'm2', author: 'ai', text: 'Any swelling of lips or trouble breathing?', at: '2026-06-10T19:04' },
      { id: 'm3', author: 'parent', text: 'No, just the spots.', at: '2026-06-10T19:04' },
    ],
  },
  {
    id: 'c4', childName: 'Amir', childAge: '3y 7m', urgency: 'green', status: 'closed', createdAt: '2026-06-09T12:30',
    aiSummary: 'Single episode of mild diarrhea, good hydration, no fever. Self-care guidance given.',
    conclusion: 'Viral gastroenteritis, resolved. Continue oral rehydration, normal diet as tolerated.',
    transcript: [
      { id: 'm1', author: 'parent', text: 'My son had loose stool this morning.', at: '2026-06-09T12:28' },
      { id: 'm2', author: 'ai', text: 'How many episodes, and is he drinking well?', at: '2026-06-09T12:29' },
      { id: 'm3', author: 'parent', text: 'Just once, and yes he drinks fine.', at: '2026-06-09T12:29' },
    ],
  },
]

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', doctorId: 'd1', doctorName: 'Dr. Aziza Karimova', childName: 'Alisher', slot: '2026-06-12T09:00', status: 'upcoming' },
  { id: 'b2', doctorId: 'd3', doctorName: 'Dr. Elena Sokolova', childName: 'Malika', slot: '2026-06-13T11:00', status: 'upcoming' },
  { id: 'b3', doctorId: 'd1', doctorName: 'Dr. Aziza Karimova', childName: 'Otabek', slot: '2026-06-05T10:00', status: 'done' },
]

export const HISTORY: HistoryRecord[] = [
  { id: 'h1', date: '2026-06-09', kind: 'ai-check', childName: 'Alisher', title: 'Mild diarrhea', urgency: 'green' },
  { id: 'h2', date: '2026-06-05', kind: 'consultation', childName: 'Alisher', title: 'Night cough — Dr. Aziza Karimova', conclusion: 'Post-viral cough. Humidify room, warm fluids. Re-check in 7 days if persists.' },
  { id: 'h3', date: '2026-05-28', kind: 'ai-check', childName: 'Alisher', title: 'Rash after strawberries', urgency: 'yellow' },
  { id: 'h4', date: '2026-05-20', kind: 'consultation', childName: 'Alisher', title: 'Routine check-up — Dr. Jasur Olimov', conclusion: 'Healthy. Growth and development on track.' },
]

export const VACCINES: VaccineDose[] = [
  { id: 'v1', name: 'BCG', dueAge: 'Birth', dueDate: '2023-02-15', status: 'done' },
  { id: 'v2', name: 'Hepatitis B (3rd dose)', dueAge: '6 months', dueDate: '2023-08-15', status: 'done' },
  { id: 'v3', name: 'DTP (3rd dose)', dueAge: '7 months', dueDate: '2023-09-15', status: 'done' },
  { id: 'v4', name: 'Measles/Mumps/Rubella', dueAge: '12 months', dueDate: '2024-02-15', status: 'done' },
  { id: 'v5', name: 'DTP booster', dueAge: '3 years', dueDate: '2026-02-15', status: 'overdue' },
  { id: 'v6', name: 'Polio booster', dueAge: '3.5 years', dueDate: '2026-08-15', status: 'upcoming' },
]
