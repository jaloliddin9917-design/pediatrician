# PediCare AI Frontend Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only mockup of an AI pediatrician platform with a parent side (AI triage chat, doctor booking, child profiles, history, vaccines) and a doctor side (triage queue, case detail, schedule).

**Architecture:** Single Vite SPA with two role-guarded route trees (`/parent/*`, `/doctor/*`) plus mock auth. Feature-Sliced Design layers shared across roles; all data comes from a typed mock layer (`shared/api`) with fake latency. AI chat is a scripted state machine (pure, unit-tested).

**Tech Stack:** Vite, React 18, TypeScript (strict), Tailwind CSS v4, shadcn/ui, Effector + effector-react, react-router v7 (library mode), i18next + react-i18next (EN default / RU / UZ), lucide-react, Vitest.

**Working directory for ALL tasks:** `temp/pediatrician-solution` (repo root is two levels up; commit paths are relative to this directory).

**Spec:** `docs/superpowers/specs/2026-06-11-pediatrician-mockup-design.md`

---

## File Structure

```
pediatrician-solution/
  package.json, vite.config.ts, tsconfig*.json, components.json, index.html
  src/
    main.tsx                      # entry: i18n import, router provider
    index.css                     # tailwind + shadcn tokens + theme overrides
    app/
      router.tsx                  # createBrowserRouter, lazy pages, guards
      guards.tsx                  # RoleGuard component
    pages/
      auth/login.tsx, auth/register.tsx
      parent/home.tsx, parent/chat.tsx, parent/doctors.tsx,
      parent/doctor-profile.tsx, parent/children.tsx,
      parent/history.tsx, parent/vaccines.tsx
      doctor/queue.tsx, doctor/case-detail.tsx, doctor/schedule.tsx
      not-found.tsx
    widgets/
      parent-layout/index.tsx     # header + nav for parent side
      doctor-layout/index.tsx     # sidebar layout for doctor side
    features/
      auth/model.ts               # loginFx/registerFx + session wiring
      lang-switch/index.tsx       # language Select
      ai-triage/model/script.ts   # scripted scenario data
      ai-triage/model/machine.ts  # pure reducer + effector stores
      ai-triage/model/machine.test.ts
    entities/
      session/model.ts            # $session, persisted
      child/model.ts              # $children, $activeChildId, persisted
      booking/model.ts            # $bookings
      case/model.ts               # $cases + transition fn
      case/model.test.ts
      i18n/model.ts               # $lang, persisted, syncs i18next
    shared/
      ui/                         # shadcn components (button, card, ...)
      lib/utils.ts                # cn() from shadcn
      lib/storage.ts              # readJson/writeJson localStorage helpers
      ui/page-header.tsx, ui/empty-state.tsx, ui/urgency-badge.tsx
      api/types.ts                # all domain types
      api/fixtures.ts             # doctors, cases, vaccines, history, bookings
      api/index.ts                # fakeRequest + api functions
      i18n/index.ts               # i18next init
      i18n/locales/en.json, ru.json, uz.json
```

FSD import rule: a layer imports only from layers below it (app → pages → widgets → features → entities → shared).

---

### Task 1: Scaffold Vite app, pin React 18, install all dependencies

**Files:**
- Create: entire Vite template, then modify `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `package.json`

- [ ] **Step 1: Scaffold into a temp dir and move into place** (the directory already contains `docs/`, so scaffold cannot run in place)

```bash
cd temp/pediatrician-solution
npm create vite@latest app-tmp -- --template react-ts
mv app-tmp/src app-tmp/public app-tmp/index.html app-tmp/package.json \
   app-tmp/tsconfig.json app-tmp/tsconfig.app.json app-tmp/tsconfig.node.json \
   app-tmp/vite.config.ts app-tmp/eslint.config.js app-tmp/.gitignore .
rm -rf app-tmp
```

- [ ] **Step 2: Pin React 18 and install all dependencies**

```bash
npm install
npm install react@18.3.1 react-dom@18.3.1
npm install -D @types/react@^18.3 @types/react-dom@^18.3
npm install effector effector-react react-router i18next react-i18next lucide-react
npm install -D tailwindcss @tailwindcss/vite vitest
```

- [ ] **Step 3: Replace `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
```

- [ ] **Step 4: Add the `@/*` path alias to TypeScript configs**

In `tsconfig.app.json`, add inside `compilerOptions`:

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

In `tsconfig.json` (root, used by the shadcn CLI), add a top-level key:

```json
"compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }
```

- [ ] **Step 5: Add test script to `package.json`** — in `"scripts"` add:

```json
"test": "vitest run"
```

- [ ] **Step 6: Verify build passes**

Run: `npm run build`
Expected: `tsc -b` then `vite build` complete with no errors (template app builds).

- [ ] **Step 7: Commit**

```bash
git add -A . && git commit -m "chore(pedicare): scaffold vite react-ts app with deps"
```

---

### Task 2: Tailwind v4 + shadcn/ui + warm pediatric theme

**Files:**
- Modify: `src/index.css`, `src/App.tsx`
- Create: `components.json`, `src/shared/ui/*` (via CLI), `src/shared/lib/utils.ts`
- Delete: `src/App.css`, `src/assets/react.svg`

- [ ] **Step 1: Replace `src/index.css` entirely with:**

```css
@import "tailwindcss";
```

- [ ] **Step 2: Initialize shadcn**

Run: `npx shadcn@latest init -y -b neutral`
Expected: creates `components.json`, rewrites `src/index.css` with theme tokens, creates `src/lib/utils.ts`.

- [ ] **Step 3: Move utils to FSD location and point aliases at `shared/`**

```bash
mkdir -p src/shared/lib && mv src/lib/utils.ts src/shared/lib/utils.ts && rmdir src/lib
```

Replace the `"aliases"` object in `components.json` with:

```json
"aliases": {
  "components": "@/shared/ui",
  "utils": "@/shared/lib/utils",
  "ui": "@/shared/ui",
  "lib": "@/shared/lib",
  "hooks": "@/shared/hooks"
}
```

- [ ] **Step 4: Add the shadcn components used by the app**

Run: `npx shadcn@latest add -y button card input label badge avatar dialog select tabs skeleton textarea separator sheet`
Expected: `.tsx` files appear under `src/shared/ui/`, importing `cn` from `@/shared/lib/utils`.

- [ ] **Step 5: Apply the warm pediatric theme** — append to the END of `src/index.css` (later rules win over the generated `:root` block):

```css
:root {
  --radius: 1rem;
  --background: oklch(0.99 0.005 180);
  --primary: oklch(0.6 0.1 185);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.95 0.02 180);
  --accent: oklch(0.93 0.05 40);
  --accent-foreground: oklch(0.45 0.15 35);
  --muted: oklch(0.955 0.015 180);
  --ring: oklch(0.6 0.1 185);
}
```

- [ ] **Step 6: Replace `src/App.tsx` with a smoke-test placeholder and remove template cruft**

```tsx
import { Button } from '@/shared/ui/button'

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button>PediCare AI</Button>
    </div>
  )
}
```

```bash
rm src/App.css src/assets/react.svg
```

- [ ] **Step 7: Verify** — Run: `npm run build` → passes. Run `npm run dev`, open the page: a teal rounded button on a near-white background.

- [ ] **Step 8: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): tailwind v4 + shadcn ui kit with pediatric theme"
```

---

### Task 3: Shared foundations — storage helpers, domain types, fixtures, mock API

**Files:**
- Create: `src/shared/lib/storage.ts`, `src/shared/api/types.ts`, `src/shared/api/fixtures.ts`, `src/shared/api/index.ts`

- [ ] **Step 1: Create `src/shared/lib/storage.ts`**

```ts
export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}
```

- [ ] **Step 2: Create `src/shared/api/types.ts`**

```ts
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
```

- [ ] **Step 3: Create `src/shared/api/fixtures.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/shared/api/index.ts`**

```ts
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
```

- [ ] **Step 5: Verify** — Run: `npm run build` → passes.

- [ ] **Step 6: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): domain types, fixtures and mock api layer"
```

---

### Task 4: i18n — dictionaries (EN/RU/UZ), i18next init, lang store, switcher

**Files:**
- Create: `src/shared/i18n/locales/en.json`, `ru.json`, `uz.json`, `src/shared/i18n/index.ts`, `src/entities/i18n/model.ts`, `src/features/lang-switch/index.tsx`
- Modify: `src/main.tsx`, `tsconfig.app.json`

- [ ] **Step 1: Ensure JSON imports work** — in `tsconfig.app.json` `compilerOptions` add (if absent):

```json
"resolveJsonModule": true
```

- [ ] **Step 2: Create `src/shared/i18n/locales/en.json`**

```json
{
  "common": { "appName": "PediCare AI", "logout": "Log out", "loading": "Loading...", "cancel": "Cancel", "save": "Save", "back": "Back", "search": "Search", "send": "Send" },
  "nav": { "home": "Home", "aiChat": "AI Check", "doctors": "Doctors", "children": "Children", "history": "History", "vaccines": "Vaccines", "queue": "Triage queue", "schedule": "Schedule" },
  "auth": { "loginTitle": "Welcome back", "registerTitle": "Create an account", "email": "Email", "password": "Password", "name": "Full name", "iAmParent": "I'm a parent", "iAmDoctor": "I'm a doctor", "loginBtn": "Log in", "registerBtn": "Sign up", "noAccount": "No account? Sign up", "haveAccount": "Have an account? Log in" },
  "home": { "greeting": "Hello, {{name}}!", "quickActions": "Quick actions", "startAiCheck": "Start AI check", "bookDoctor": "Book a doctor", "nextAppointment": "Next appointment", "noAppointments": "No upcoming appointments", "nextVaccine": "Next vaccine" },
  "chat": { "title": "AI Symptom Check", "checkingFor": "Checking for", "typing": "AI is typing...", "restart": "Start over", "connectDoctor": "Connect to a pediatrician", "verdictGreen": "Looks manageable at home", "verdictYellow": "See a doctor soon", "verdictRed": "Urgent — needs a doctor now", "disclaimer": "This is not a medical diagnosis. When in doubt, see a doctor." },
  "doctors": { "title": "Pediatricians", "searchPlaceholder": "Search by name or specialty", "experience": "{{years}} yrs experience", "reviews": "{{count}} reviews", "chooseSlot": "Choose a time", "book": "Book", "confirmTitle": "Confirm booking", "confirmed": "Booking confirmed!", "forChild": "For child" },
  "children": { "title": "My children", "addChild": "Add child", "editChild": "Edit child", "name": "Name", "birthDate": "Birth date", "weight": "Weight, kg", "height": "Height, cm", "allergies": "Allergies (comma-separated)", "active": "Active", "makeActive": "Make active", "empty": "No children yet. Add your first child to start." },
  "history": { "title": "History", "empty": "No consultations yet", "aiCheck": "AI check", "consultation": "Consultation", "conclusion": "Doctor's conclusion" },
  "vaccines": { "title": "Vaccination calendar", "done": "Done", "upcoming": "Upcoming", "overdue": "Overdue", "dueAge": "Recommended age" },
  "doctor": { "queueTitle": "Triage queue", "emptyQueue": "No cases waiting — great job!", "accept": "Accept case", "open": "Open", "caseTitle": "Case", "transcript": "AI chat transcript", "childInfo": "Child info", "age": "Age", "chatWithParent": "Chat with parent", "writeConclusion": "Conclusion", "conclusionPlaceholder": "Diagnosis, recommendations, follow-up...", "closeCase": "Close case", "statusNew": "New", "statusAccepted": "In progress", "statusClosed": "Closed", "scheduleTitle": "My schedule", "noVisits": "No visits booked" },
  "urgency": { "green": "Low", "yellow": "Medium", "red": "Urgent" },
  "notFound": { "title": "Page not found", "goHome": "Go home" }
}
```

- [ ] **Step 3: Create `src/shared/i18n/locales/ru.json`**

```json
{
  "common": { "appName": "PediCare AI", "logout": "Выйти", "loading": "Загрузка...", "cancel": "Отмена", "save": "Сохранить", "back": "Назад", "search": "Поиск", "send": "Отправить" },
  "nav": { "home": "Главная", "aiChat": "ИИ-проверка", "doctors": "Врачи", "children": "Дети", "history": "История", "vaccines": "Прививки", "queue": "Очередь триажа", "schedule": "Расписание" },
  "auth": { "loginTitle": "С возвращением", "registerTitle": "Создать аккаунт", "email": "Эл. почта", "password": "Пароль", "name": "Полное имя", "iAmParent": "Я родитель", "iAmDoctor": "Я врач", "loginBtn": "Войти", "registerBtn": "Зарегистрироваться", "noAccount": "Нет аккаунта? Регистрация", "haveAccount": "Есть аккаунт? Войти" },
  "home": { "greeting": "Здравствуйте, {{name}}!", "quickActions": "Быстрые действия", "startAiCheck": "Начать ИИ-проверку", "bookDoctor": "Записаться к врачу", "nextAppointment": "Ближайший приём", "noAppointments": "Нет предстоящих приёмов", "nextVaccine": "Следующая прививка" },
  "chat": { "title": "ИИ-проверка симптомов", "checkingFor": "Проверяем для", "typing": "ИИ печатает...", "restart": "Начать заново", "connectDoctor": "Связаться с педиатром", "verdictGreen": "Можно справиться дома", "verdictYellow": "Покажитесь врачу в ближайшее время", "verdictRed": "Срочно — нужен врач сейчас", "disclaimer": "Это не медицинский диагноз. Если сомневаетесь — обратитесь к врачу." },
  "doctors": { "title": "Педиатры", "searchPlaceholder": "Поиск по имени или специальности", "experience": "Опыт {{years}} лет", "reviews": "{{count}} отзывов", "chooseSlot": "Выберите время", "book": "Записаться", "confirmTitle": "Подтвердите запись", "confirmed": "Запись подтверждена!", "forChild": "Для ребёнка" },
  "children": { "title": "Мои дети", "addChild": "Добавить ребёнка", "editChild": "Изменить данные", "name": "Имя", "birthDate": "Дата рождения", "weight": "Вес, кг", "height": "Рост, см", "allergies": "Аллергии (через запятую)", "active": "Активный", "makeActive": "Сделать активным", "empty": "Пока нет детей. Добавьте первого ребёнка, чтобы начать." },
  "history": { "title": "История", "empty": "Пока нет консультаций", "aiCheck": "ИИ-проверка", "consultation": "Консультация", "conclusion": "Заключение врача" },
  "vaccines": { "title": "Календарь прививок", "done": "Сделано", "upcoming": "Предстоит", "overdue": "Просрочено", "dueAge": "Рекомендуемый возраст" },
  "doctor": { "queueTitle": "Очередь триажа", "emptyQueue": "Нет ожидающих случаев — отличная работа!", "accept": "Принять случай", "open": "Открыть", "caseTitle": "Случай", "transcript": "Стенограмма ИИ-чата", "childInfo": "О ребёнке", "age": "Возраст", "chatWithParent": "Чат с родителем", "writeConclusion": "Заключение", "conclusionPlaceholder": "Диагноз, рекомендации, наблюдение...", "closeCase": "Закрыть случай", "statusNew": "Новый", "statusAccepted": "В работе", "statusClosed": "Закрыт", "scheduleTitle": "Моё расписание", "noVisits": "Нет записей" },
  "urgency": { "green": "Низкая", "yellow": "Средняя", "red": "Срочно" },
  "notFound": { "title": "Страница не найдена", "goHome": "На главную" }
}
```

- [ ] **Step 4: Create `src/shared/i18n/locales/uz.json`**

```json
{
  "common": { "appName": "PediCare AI", "logout": "Chiqish", "loading": "Yuklanmoqda...", "cancel": "Bekor qilish", "save": "Saqlash", "back": "Orqaga", "search": "Qidirish", "send": "Yuborish" },
  "nav": { "home": "Bosh sahifa", "aiChat": "AI tekshiruv", "doctors": "Shifokorlar", "children": "Bolalar", "history": "Tarix", "vaccines": "Emlashlar", "queue": "Triaj navbati", "schedule": "Jadval" },
  "auth": { "loginTitle": "Xush kelibsiz", "registerTitle": "Hisob yaratish", "email": "Email", "password": "Parol", "name": "To'liq ism", "iAmParent": "Men ota-onaman", "iAmDoctor": "Men shifokorman", "loginBtn": "Kirish", "registerBtn": "Ro'yxatdan o'tish", "noAccount": "Hisob yo'qmi? Ro'yxatdan o'ting", "haveAccount": "Hisob bormi? Kirish" },
  "home": { "greeting": "Salom, {{name}}!", "quickActions": "Tezkor amallar", "startAiCheck": "AI tekshiruvni boshlash", "bookDoctor": "Shifokorga yozilish", "nextAppointment": "Keyingi qabul", "noAppointments": "Rejalashtirilgan qabullar yo'q", "nextVaccine": "Keyingi emlash" },
  "chat": { "title": "AI simptom tekshiruvi", "checkingFor": "Kim uchun", "typing": "AI yozmoqda...", "restart": "Qaytadan boshlash", "connectDoctor": "Pediatr bilan bog'lanish", "verdictGreen": "Uyda nazorat qilsa bo'ladi", "verdictYellow": "Yaqin orada shifokorga ko'rining", "verdictRed": "Shoshilinch — hozir shifokor kerak", "disclaimer": "Bu tibbiy tashxis emas. Shubhalansangiz, shifokorga murojaat qiling." },
  "doctors": { "title": "Pediatrlar", "searchPlaceholder": "Ism yoki mutaxassislik bo'yicha qidirish", "experience": "{{years}} yil tajriba", "reviews": "{{count}} ta sharh", "chooseSlot": "Vaqtni tanlang", "book": "Yozilish", "confirmTitle": "Yozilishni tasdiqlang", "confirmed": "Yozilish tasdiqlandi!", "forChild": "Bola uchun" },
  "children": { "title": "Bolalarim", "addChild": "Bola qo'shish", "editChild": "Tahrirlash", "name": "Ism", "birthDate": "Tug'ilgan sana", "weight": "Vazn, kg", "height": "Bo'y, sm", "allergies": "Allergiyalar (vergul bilan)", "active": "Faol", "makeActive": "Faol qilish", "empty": "Hozircha bolalar yo'q. Boshlash uchun birinchi bolani qo'shing." },
  "history": { "title": "Tarix", "empty": "Hozircha konsultatsiyalar yo'q", "aiCheck": "AI tekshiruv", "consultation": "Konsultatsiya", "conclusion": "Shifokor xulosasi" },
  "vaccines": { "title": "Emlash kalendari", "done": "Bajarildi", "upcoming": "Kutilmoqda", "overdue": "Muddati o'tgan", "dueAge": "Tavsiya etilgan yosh" },
  "doctor": { "queueTitle": "Triaj navbati", "emptyQueue": "Kutilayotgan holatlar yo'q — ajoyib!", "accept": "Holatni qabul qilish", "open": "Ochish", "caseTitle": "Holat", "transcript": "AI chat stenogrammasi", "childInfo": "Bola haqida", "age": "Yosh", "chatWithParent": "Ota-ona bilan chat", "writeConclusion": "Xulosa", "conclusionPlaceholder": "Tashxis, tavsiyalar, kuzatuv...", "closeCase": "Holatni yopish", "statusNew": "Yangi", "statusAccepted": "Jarayonda", "statusClosed": "Yopilgan", "scheduleTitle": "Mening jadvalim", "noVisits": "Yozilishlar yo'q" },
  "urgency": { "green": "Past", "yellow": "O'rtacha", "red": "Shoshilinch" },
  "notFound": { "title": "Sahifa topilmadi", "goHome": "Bosh sahifaga" }
}
```

- [ ] **Step 5: Create `src/shared/i18n/index.ts`**

```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { readJson } from '@/shared/lib/storage'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz from './locales/uz.json'

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru }, uz: { translation: uz } },
  lng: readJson<string>('pedicare.lang') ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
```

- [ ] **Step 6: Create `src/entities/i18n/model.ts`**

```ts
import { createEvent, createStore } from 'effector'
import i18n from '@/shared/i18n'
import { readJson, writeJson } from '@/shared/lib/storage'

export type Lang = 'en' | 'ru' | 'uz'

export const langChanged = createEvent<Lang>()

export const $lang = createStore<Lang>(readJson<Lang>('pedicare.lang') ?? 'en')
  .on(langChanged, (_, lang) => lang)

$lang.watch((lang) => {
  writeJson('pedicare.lang', lang)
  if (i18n.language !== lang) void i18n.changeLanguage(lang)
})
```

- [ ] **Step 7: Create `src/features/lang-switch/index.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { $lang, langChanged, type Lang } from '@/entities/i18n/model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'РУ' },
  { value: 'uz', label: 'UZ' },
]

export function LangSwitcher() {
  const [lang, onChange] = useUnit([$lang, langChanged])
  return (
    <Select value={lang} onValueChange={(v) => onChange(v as Lang)}>
      <SelectTrigger className="w-20" aria-label="Language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 8: Wire i18n into the entry — replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Verify** — Run: `npm run build` → passes.

- [ ] **Step 10: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): i18n en/ru/uz with effector lang store and switcher"
```

---

### Task 5: Session store, mock auth, router skeleton, auth pages, 404

**Files:**
- Create: `src/entities/session/model.ts`, `src/features/auth/model.ts`, `src/app/guards.tsx`, `src/app/router.tsx`, `src/pages/auth/login.tsx`, `src/pages/auth/register.tsx`, `src/pages/not-found.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/entities/session/model.ts`**

```ts
import { createEvent, createStore } from 'effector'
import type { User } from '@/shared/api'
import { readJson, writeJson } from '@/shared/lib/storage'

export const sessionSet = createEvent<User>()
export const sessionCleared = createEvent()

export const $session = createStore<User | null>(readJson<User>('pedicare.session'))
  .on(sessionSet, (_, user) => user)
  .reset(sessionCleared)

$session.watch((s) => writeJson('pedicare.session', s))
```

- [ ] **Step 2: Create `src/features/auth/model.ts`** (register reuses the same effect — any credentials work in the mockup)

```ts
import { createEffect, sample } from 'effector'
import { fakeRequest, type User, type UserRole } from '@/shared/api'
import { sessionSet } from '@/entities/session/model'

export interface Credentials {
  name?: string
  email: string
  role: UserRole
}

export const loginFx = createEffect(({ name, email, role }: Credentials) =>
  fakeRequest<User>({
    id: 'u1',
    name: name || (role === 'doctor' ? 'Dr. Aziza Karimova' : 'Dilnoza'),
    email,
    role,
  }),
)

sample({ clock: loginFx.doneData, target: sessionSet })
```

- [ ] **Step 3: Create `src/app/guards.tsx`**

```tsx
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { $session } from '@/entities/session/model'
import type { UserRole } from '@/shared/api'

export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const session = useUnit($session)
  if (!session) return <Navigate to="/auth/login" replace />
  if (session.role !== role) {
    return <Navigate to={session.role === 'doctor' ? '/doctor' : '/parent'} replace />
  }
  return <>{children}</>
}
```

- [ ] **Step 4: Create `src/pages/auth/login.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { Baby, Stethoscope } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { loginFx } from '@/features/auth/model'
import { LangSwitcher } from '@/features/lang-switch'
import type { UserRole } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [login, pending] = useUnit([loginFx, loginFx.pending])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('parent')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const user = await login({ email, role })
    navigate(user.role === 'doctor' ? '/doctor' : '/parent', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="absolute top-4 right-4">
        <LangSwitcher />
      </div>
      <div className="flex items-center gap-2 text-2xl font-bold text-primary">
        <Baby className="size-8" /> {t('common.appName')}
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <TabsList className="w-full">
                <TabsTrigger value="parent" className="flex-1">
                  <Baby className="size-4" /> {t('auth.iAmParent')}
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex-1">
                  <Stethoscope className="size-4" /> {t('auth.iAmDoctor')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" disabled={pending}>
              {t('auth.loginBtn')}
            </Button>
            <Button variant="link" asChild>
              <Link to="/auth/register">{t('auth.noAccount')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/pages/auth/register.tsx`** (same shape + name field)

```tsx
import { useUnit } from 'effector-react'
import { Baby, Stethoscope } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { loginFx } from '@/features/auth/model'
import { LangSwitcher } from '@/features/lang-switch'
import type { UserRole } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [register, pending] = useUnit([loginFx, loginFx.pending])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('parent')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const user = await register({ name, email, role })
    navigate(user.role === 'doctor' ? '/doctor' : '/parent', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="absolute top-4 right-4">
        <LangSwitcher />
      </div>
      <div className="flex items-center gap-2 text-2xl font-bold text-primary">
        <Baby className="size-8" /> {t('common.appName')}
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.registerTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <TabsList className="w-full">
                <TabsTrigger value="parent" className="flex-1">
                  <Baby className="size-4" /> {t('auth.iAmParent')}
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex-1">
                  <Stethoscope className="size-4" /> {t('auth.iAmDoctor')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid gap-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" disabled={pending}>
              {t('auth.registerBtn')}
            </Button>
            <Button variant="link" asChild>
              <Link to="/auth/login">{t('auth.haveAccount')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/pages/not-found.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <span className="text-6xl">🩺</span>
      <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
      <Button asChild>
        <Link to="/">{t('notFound.goHome')}</Link>
      </Button>
    </div>
  )
}
```

- [ ] **Step 7: Create `src/app/router.tsx`** (v1 — parent/doctor trees are added in Task 6)

```tsx
import { useUnit } from 'effector-react'
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { $session } from '@/entities/session/model'

const LoginPage = lazy(() => import('@/pages/auth/login'))
const RegisterPage = lazy(() => import('@/pages/auth/register'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

function IndexRedirect() {
  const session = useUnit($session)
  if (!session) return <Navigate to="/auth/login" replace />
  return <Navigate to={session.role === 'doctor' ? '/doctor' : '/parent'} replace />
}

const s = (node: ReactNode) => <Suspense fallback={null}>{node}</Suspense>

export const router = createBrowserRouter([
  { path: '/', element: <IndexRedirect /> },
  { path: '/auth/login', element: s(<LoginPage />) },
  { path: '/auth/register', element: s(<RegisterPage />) },
  { path: '*', element: s(<NotFoundPage />) },
])
```

- [ ] **Step 8: Replace `src/App.tsx`**

```tsx
import { RouterProvider } from 'react-router'
import { router } from '@/app/router'

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 9: Verify** — Run: `npm run build` → passes. Run `npm run dev`: `/` redirects to `/auth/login`; logging in as parent lands on `/parent` which shows the 404 page for now (expected until Task 6); switching language on the login screen translates labels instantly.

- [ ] **Step 10: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): mock auth, session store, router skeleton, auth pages"
```

---

### Task 6: Layout widgets, shared UI primitives, page stubs, full router

**Files:**
- Create: `src/shared/ui/page-header.tsx`, `src/shared/ui/empty-state.tsx`, `src/shared/ui/urgency-badge.tsx`, `src/widgets/parent-layout/index.tsx`, `src/widgets/doctor-layout/index.tsx`, all 10 page stubs (listed in Step 5)
- Modify: `src/app/router.tsx`

- [ ] **Step 1: Create `src/shared/ui/page-header.tsx`**

```tsx
import type { ReactNode } from 'react'

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
      {action}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/shared/ui/empty-state.tsx`**

```tsx
import type { ReactNode } from 'react'

export function EmptyState({ icon, text, action }: { icon: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-10 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-muted-foreground">{text}</p>
      {action}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/shared/ui/urgency-badge.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'
import type { Urgency } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge'

const STYLES: Record<Urgency, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const { t } = useTranslation()
  return <Badge className={cn('border-transparent', STYLES[urgency])}>{t(`urgency.${urgency}`)}</Badge>
}
```

- [ ] **Step 4: Create the layout widgets**

`src/widgets/parent-layout/index.tsx` — top nav on desktop, fixed bottom tab bar on mobile:

```tsx
import { useUnit } from 'effector-react'
import { Baby, History, Home, LogOut, MessageCircle, Stethoscope, Syringe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { sessionCleared } from '@/entities/session/model'
import { LangSwitcher } from '@/features/lang-switch'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const NAV = [
  { to: '/parent', end: true, icon: Home, key: 'nav.home' },
  { to: '/parent/chat', end: false, icon: MessageCircle, key: 'nav.aiChat' },
  { to: '/parent/doctors', end: false, icon: Stethoscope, key: 'nav.doctors' },
  { to: '/parent/children', end: false, icon: Baby, key: 'nav.children' },
  { to: '/parent/history', end: false, icon: History, key: 'nav.history' },
  { to: '/parent/vaccines', end: false, icon: Syringe, key: 'nav.vaccines' },
]

export function ParentLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useUnit(sessionCleared)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Baby className="size-6" /> {t('common.appName')}
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, end, icon: Icon, key }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground',
                    isActive && 'bg-secondary text-foreground',
                  )
                }
              >
                <Icon className="size-4" /> {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('common.logout')}
              onClick={() => {
                logout()
                navigate('/auth/login')
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-6 border-t bg-background py-1 md:hidden">
        {NAV.map(({ to, end, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 py-1 text-[10px] text-muted-foreground', isActive && 'text-primary')
            }
          >
            <Icon className="size-5" /> {t(key)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
```

`src/widgets/doctor-layout/index.tsx` — sidebar on desktop, top bar on mobile:

```tsx
import { useUnit } from 'effector-react'
import { CalendarDays, ClipboardList, LogOut, Stethoscope } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { $session, sessionCleared } from '@/entities/session/model'
import { LangSwitcher } from '@/features/lang-switch'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const NAV = [
  { to: '/doctor', end: true, icon: ClipboardList, key: 'nav.queue' },
  { to: '/doctor/schedule', end: false, icon: CalendarDays, key: 'nav.schedule' },
]

export function DoctorLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [session, logout] = useUnit([$session, sessionCleared])

  const navLinks = (compact: boolean) =>
    NAV.map(({ to, end, icon: Icon, key }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground',
            isActive && 'bg-secondary text-foreground',
            compact && 'px-2 py-1.5',
          )
        }
      >
        <Icon className="size-4" /> {t(key)}
      </NavLink>
    ))

  const logoutBtn = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('common.logout')}
      onClick={() => {
        logout()
        navigate('/auth/login')
      }}
    >
      <LogOut className="size-4" />
    </Button>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 flex-col border-r p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 font-bold text-primary">
          <Stethoscope className="size-6" /> {t('common.appName')}
        </div>
        <nav className="grid gap-1">{navLinks(false)}</nav>
        <div className="mt-auto grid gap-2">
          <p className="truncate text-sm text-muted-foreground">{session?.name}</p>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {logoutBtn}
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4 md:hidden">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Stethoscope className="size-5" /> {t('common.appName')}
          </div>
          <div className="flex items-center gap-1">
            {navLinks(true)}
            <LangSwitcher />
            {logoutBtn}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create all 10 page stubs** — each file uses this exact template, substituting the component name and title key from the table:

```tsx
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/page-header'

export default function COMPONENT_NAME() {
  const { t } = useTranslation()
  return <PageHeader title={t('TITLE_KEY')} />
}
```

| File | COMPONENT_NAME | TITLE_KEY |
|---|---|---|
| `src/pages/parent/home.tsx` | `ParentHomePage` | `nav.home` |
| `src/pages/parent/chat.tsx` | `ChatPage` | `chat.title` |
| `src/pages/parent/doctors.tsx` | `DoctorsPage` | `doctors.title` |
| `src/pages/parent/doctor-profile.tsx` | `DoctorProfilePage` | `doctors.title` |
| `src/pages/parent/children.tsx` | `ChildrenPage` | `children.title` |
| `src/pages/parent/history.tsx` | `HistoryPage` | `history.title` |
| `src/pages/parent/vaccines.tsx` | `VaccinesPage` | `vaccines.title` |
| `src/pages/doctor/queue.tsx` | `QueuePage` | `doctor.queueTitle` |
| `src/pages/doctor/case-detail.tsx` | `CaseDetailPage` | `doctor.caseTitle` |
| `src/pages/doctor/schedule.tsx` | `SchedulePage` | `doctor.scheduleTitle` |

- [ ] **Step 6: Replace `src/app/router.tsx` with the full route tree**

```tsx
import { useUnit } from 'effector-react'
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { RoleGuard } from '@/app/guards'
import { $session } from '@/entities/session/model'
import { DoctorLayout } from '@/widgets/doctor-layout'
import { ParentLayout } from '@/widgets/parent-layout'

const LoginPage = lazy(() => import('@/pages/auth/login'))
const RegisterPage = lazy(() => import('@/pages/auth/register'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))
const ParentHomePage = lazy(() => import('@/pages/parent/home'))
const ChatPage = lazy(() => import('@/pages/parent/chat'))
const DoctorsPage = lazy(() => import('@/pages/parent/doctors'))
const DoctorProfilePage = lazy(() => import('@/pages/parent/doctor-profile'))
const ChildrenPage = lazy(() => import('@/pages/parent/children'))
const HistoryPage = lazy(() => import('@/pages/parent/history'))
const VaccinesPage = lazy(() => import('@/pages/parent/vaccines'))
const QueuePage = lazy(() => import('@/pages/doctor/queue'))
const CaseDetailPage = lazy(() => import('@/pages/doctor/case-detail'))
const SchedulePage = lazy(() => import('@/pages/doctor/schedule'))

function IndexRedirect() {
  const session = useUnit($session)
  if (!session) return <Navigate to="/auth/login" replace />
  return <Navigate to={session.role === 'doctor' ? '/doctor' : '/parent'} replace />
}

const s = (node: ReactNode) => <Suspense fallback={null}>{node}</Suspense>

export const router = createBrowserRouter([
  { path: '/', element: <IndexRedirect /> },
  { path: '/auth/login', element: s(<LoginPage />) },
  { path: '/auth/register', element: s(<RegisterPage />) },
  {
    path: '/parent',
    element: (
      <RoleGuard role="parent">
        <ParentLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: s(<ParentHomePage />) },
      { path: 'chat', element: s(<ChatPage />) },
      { path: 'doctors', element: s(<DoctorsPage />) },
      { path: 'doctors/:id', element: s(<DoctorProfilePage />) },
      { path: 'children', element: s(<ChildrenPage />) },
      { path: 'history', element: s(<HistoryPage />) },
      { path: 'vaccines', element: s(<VaccinesPage />) },
    ],
  },
  {
    path: '/doctor',
    element: (
      <RoleGuard role="doctor">
        <DoctorLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: s(<QueuePage />) },
      { path: 'cases/:id', element: s(<CaseDetailPage />) },
      { path: 'schedule', element: s(<SchedulePage />) },
    ],
  },
  { path: '*', element: s(<NotFoundPage />) },
])
```

- [ ] **Step 7: Verify** — Run: `npm run build` → passes. In `npm run dev`: login as parent → header/nav with 6 items and stub pages; login as doctor → sidebar layout with queue/schedule stubs; visiting `/doctor` as a parent redirects back to `/parent`; logout returns to login. Narrow the window: parent nav collapses into the bottom tab bar.

- [ ] **Step 8: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): role layouts, shared ui primitives, full routing with stubs"
```

---

### Task 7: Child entity (TDD on age formatting) + children page

**Files:**
- Create: `src/shared/lib/age.ts`, `src/shared/lib/age.test.ts`, `src/entities/child/model.ts`
- Modify: `src/pages/parent/children.tsx`

- [ ] **Step 1: Write the failing test `src/shared/lib/age.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { formatAge } from './age'

describe('formatAge', () => {
  const now = new Date('2026-06-11')

  it('formats years and months', () => {
    expect(formatAge('2023-02-15', now)).toBe('3y 3m')
  })

  it('formats whole years', () => {
    expect(formatAge('2024-06-11', now)).toBe('2y')
  })

  it('formats infants in months', () => {
    expect(formatAge('2025-10-20', now)).toBe('7m')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./age`.

- [ ] **Step 3: Create `src/shared/lib/age.ts`**

```ts
export function formatAge(birthDate: string, now = new Date()): string {
  const birth = new Date(birthDate)
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years <= 0) return `${Math.max(months, 0)}m`
  return rest === 0 ? `${years}y` : `${years}y ${rest}m`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: 3 passing.

- [ ] **Step 5: Create `src/entities/child/model.ts`**

```ts
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
```

- [ ] **Step 6: Replace `src/pages/parent/children.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { $activeChildId, $children, activeChildSet, childRemoved, childSaved } from '@/entities/child/model'
import type { Child } from '@/shared/api'
import { formatAge } from '@/shared/lib/age'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PageHeader } from '@/shared/ui/page-header'

function ChildDialog({ child }: { child?: Child }) {
  const { t } = useTranslation()
  const save = useUnit(childSaved)
  const [open, setOpen] = useState(false)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    save({
      id: child?.id ?? crypto.randomUUID(),
      name: String(f.get('name')),
      birthDate: String(f.get('birthDate')),
      weightKg: f.get('weightKg') ? Number(f.get('weightKg')) : undefined,
      heightCm: f.get('heightCm') ? Number(f.get('heightCm')) : undefined,
      allergies: String(f.get('allergies') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {child ? (
          <Button variant="ghost" size="icon" aria-label={t('children.editChild')}>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> {t('children.addChild')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{child ? t('children.editChild') : t('children.addChild')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="name">{t('children.name')}</Label>
            <Input id="name" name="name" required defaultValue={child?.name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="birthDate">{t('children.birthDate')}</Label>
            <Input id="birthDate" name="birthDate" type="date" required defaultValue={child?.birthDate} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="weightKg">{t('children.weight')}</Label>
              <Input id="weightKg" name="weightKg" type="number" step="0.1" min="0" defaultValue={child?.weightKg} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="heightCm">{t('children.height')}</Label>
              <Input id="heightCm" name="heightCm" type="number" min="0" defaultValue={child?.heightCm} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="allergies">{t('children.allergies')}</Label>
            <Input id="allergies" name="allergies" defaultValue={child?.allergies.join(', ')} />
          </div>
          <Button type="submit">{t('common.save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ChildrenPage() {
  const { t } = useTranslation()
  const [children, activeId, setActive, remove] = useUnit([$children, $activeChildId, activeChildSet, childRemoved])

  return (
    <div>
      <PageHeader title={t('children.title')} action={<ChildDialog />} />
      {children.length === 0 ? (
        <EmptyState icon="👶" text={t('children.empty')} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-secondary text-lg">{child.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{child.name}</p>
                    {child.id === activeId && <Badge>{t('children.active')}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatAge(child.birthDate)}
                    {child.weightKg ? ` · ${child.weightKg} kg` : ''}
                    {child.heightCm ? ` · ${child.heightCm} cm` : ''}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {child.allergies.map((a) => (
                      <Badge key={a} variant="outline">
                        {a}
                      </Badge>
                    ))}
                  </div>
                  {child.id !== activeId && (
                    <Button variant="link" className="h-auto p-0 text-sm" onClick={() => setActive(child.id)}>
                      {t('children.makeActive')}
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  <ChildDialog child={child} />
                  <Button variant="ghost" size="icon" aria-label="delete" onClick={() => remove(child.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Verify** — Run: `npm test` (passes), `npm run build` (passes). In dev: add a child, edit it, switch active child, delete a child — list and Active badge update; reload the page — data persists.

- [ ] **Step 8: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): child profiles with persistence and age formatting"
```

---

### Task 8: AI triage machine (TDD) + chat page

**Files:**
- Create: `src/features/ai-triage/model/machine.ts`, `src/features/ai-triage/model/machine.test.ts`, `src/features/ai-triage/model/store.ts`
- Modify: `src/shared/i18n/locales/en.json`, `ru.json`, `uz.json` (add `script` section), `src/pages/parent/chat.tsx`

- [ ] **Step 1: Add the `script` section to each locale** (top-level key, sibling of `chat`)

In `en.json`:

```json
"script": {
  "greeting": "Hi! I'm your PediCare assistant. What's bothering your child today?",
  "askDuration": "Got it. How long has it been going on?",
  "askSeverity": "Is your child unusually drowsy, refusing fluids, or having trouble breathing?",
  "fever": "Fever", "cough": "Cough", "rash": "Rash", "stomach": "Stomach ache",
  "lessDay": "Less than a day", "fewDays": "1-3 days", "moreDays": "More than 3 days",
  "none": "None of these", "fluids": "Refusing fluids", "drowsy": "Unusually drowsy", "breathing": "Trouble breathing",
  "verdictGreen": "Based on your answers this looks manageable at home: rest, fluids and monitoring. If anything changes, run the check again.",
  "verdictYellow": "I recommend showing your child to a pediatrician within 24 hours. I can connect you now.",
  "verdictRed": "These signs need urgent attention. Please connect to a pediatrician right now or call emergency services."
}
```

In `ru.json`:

```json
"script": {
  "greeting": "Здравствуйте! Я ассистент PediCare. Что беспокоит вашего ребёнка?",
  "askDuration": "Понятно. Как давно это продолжается?",
  "askSeverity": "Ребёнок необычно сонлив, отказывается пить или ему трудно дышать?",
  "fever": "Температура", "cough": "Кашель", "rash": "Сыпь", "stomach": "Болит живот",
  "lessDay": "Меньше суток", "fewDays": "1-3 дня", "moreDays": "Больше 3 дней",
  "none": "Ничего из этого", "fluids": "Отказывается пить", "drowsy": "Необычно сонлив", "breathing": "Трудно дышать",
  "verdictGreen": "Судя по ответам, можно справиться дома: покой, питьё и наблюдение. Если что-то изменится — пройдите проверку снова.",
  "verdictYellow": "Рекомендую показать ребёнка педиатру в течение 24 часов. Могу связать вас прямо сейчас.",
  "verdictRed": "Эти признаки требуют срочного внимания. Свяжитесь с педиатром прямо сейчас или вызовите скорую помощь."
}
```

In `uz.json`:

```json
"script": {
  "greeting": "Salom! Men PediCare yordamchisiman. Bolangizni nima bezovta qilmoqda?",
  "askDuration": "Tushunarli. Bu qachondan beri davom etmoqda?",
  "askSeverity": "Bola g'ayrioddiy uyquchanmi, suyuqlik ichishdan bosh tortyaptimi yoki nafas olishi qiyinmi?",
  "fever": "Isitma", "cough": "Yo'tal", "rash": "Toshma", "stomach": "Qorin og'rig'i",
  "lessDay": "Bir kundan kam", "fewDays": "1-3 kun", "moreDays": "3 kundan ko'p",
  "none": "Bularning hech biri", "fluids": "Ichishdan bosh tortyapti", "drowsy": "G'ayrioddiy uyquchan", "breathing": "Nafas olishi qiyin",
  "verdictGreen": "Javoblaringizga ko'ra, uyda nazorat qilsa bo'ladi: dam olish, suyuqlik va kuzatuv. Biror narsa o'zgarsa, tekshiruvni qayta o'tkazing.",
  "verdictYellow": "Bolani 24 soat ichida pediatrga ko'rsatishni tavsiya qilaman. Hozir bog'lab beraman.",
  "verdictRed": "Bu belgilar shoshilinch e'tibor talab qiladi. Hozir pediatr bilan bog'laning yoki tez yordam chaqiring."
}
```

- [ ] **Step 2: Write the failing test `src/features/ai-triage/model/machine.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, nextState, verdictOf } from './machine'

describe('nextState', () => {
  it('walks symptom → duration → severity → verdict', () => {
    let s = nextState(INITIAL_STATE, 'script.fever')
    expect(s.step).toBe('duration')
    s = nextState(s, 'script.moreDays')
    expect(s.step).toBe('severity')
    s = nextState(s, 'script.none')
    expect(s.step).toBe('verdict')
    expect(s.answers).toEqual(['script.fever', 'script.moreDays', 'script.none'])
  })

  it('does not advance past verdict', () => {
    const s = { step: 'verdict' as const, answers: ['a', 'b', 'c'] }
    expect(nextState(s, 'x')).toBe(s)
  })
})

describe('verdictOf', () => {
  it('is red on trouble breathing or drowsiness', () => {
    expect(verdictOf(['script.fever', 'script.lessDay', 'script.breathing'])).toBe('red')
    expect(verdictOf(['script.cough', 'script.fewDays', 'script.drowsy'])).toBe('red')
  })

  it('is yellow on refusing fluids', () => {
    expect(verdictOf(['script.rash', 'script.lessDay', 'script.fluids'])).toBe('yellow')
  })

  it('is yellow on fever lasting more than 3 days', () => {
    expect(verdictOf(['script.fever', 'script.moreDays', 'script.none'])).toBe('yellow')
  })

  it('is green otherwise', () => {
    expect(verdictOf(['script.cough', 'script.lessDay', 'script.none'])).toBe('green')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./machine`.

- [ ] **Step 4: Create `src/features/ai-triage/model/machine.ts`** (pure logic, no effector)

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass (age + machine).

- [ ] **Step 6: Create `src/features/ai-triage/model/store.ts`** (effector wiring)

```ts
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
```

- [ ] **Step 7: Replace `src/pages/parent/chat.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { $activeChild } from '@/entities/child/model'
import {
  $messages,
  $quickReplies,
  $typing,
  $verdict,
  chatRestarted,
  replySelected,
} from '@/features/ai-triage/model/store'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

const VERDICT_STYLES = {
  green: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  yellow: 'border-amber-300 bg-amber-50 text-amber-800',
  red: 'border-red-300 bg-red-50 text-red-800',
} as const

const VERDICT_LABEL = {
  green: 'chat.verdictGreen',
  yellow: 'chat.verdictYellow',
  red: 'chat.verdictRed',
} as const

export default function ChatPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [messages, replies, typing, verdict, child] = useUnit([$messages, $quickReplies, $typing, $verdict, $activeChild])
  const [reply, restart] = useUnit([replySelected, chatRestarted])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typing, verdict])

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col md:h-[calc(100vh-7rem)]">
      <PageHeader
        title={t('chat.title')}
        action={
          <div className="flex items-center gap-2">
            {child && (
              <Badge variant="secondary">
                {t('chat.checkingFor')}: {child.name}
              </Badge>
            )}
            <Button variant="ghost" size="icon" aria-label={t('chat.restart')} onClick={() => restart()}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        }
      />
      <Card className="min-h-0 flex-1">
        <CardContent className="flex h-full flex-col gap-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                m.author === 'ai' ? 'self-start bg-secondary' : 'self-end bg-primary text-primary-foreground',
              )}
            >
              {t(m.key)}
            </div>
          ))}
          {typing && (
            <div className="animate-pulse self-start rounded-2xl bg-secondary px-4 py-2 text-sm text-muted-foreground">
              {t('chat.typing')}
            </div>
          )}
          {verdict && (
            <div className={cn('rounded-2xl border p-4 text-sm font-medium', VERDICT_STYLES[verdict])}>
              <p>{t(VERDICT_LABEL[verdict])}</p>
              {verdict !== 'green' && (
                <Button className="mt-3" onClick={() => navigate('/parent/doctors')}>
                  {t('chat.connectDoctor')}
                </Button>
              )}
            </div>
          )}
          <div ref={endRef} />
        </CardContent>
      </Card>
      {replies.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3">
          {replies.map((key) => (
            <Button key={key} variant="outline" className="rounded-full" onClick={() => reply(key)}>
              {t(key)}
            </Button>
          ))}
        </div>
      )}
      <p className="pt-2 text-center text-xs text-muted-foreground">{t('chat.disclaimer')}</p>
    </div>
  )
}
```

- [ ] **Step 8: Verify** — Run: `npm test` and `npm run build` → pass. In dev: open AI Check; walk Fever → More than 3 days → None of these → yellow verdict with "Connect to a pediatrician" → click lands on `/parent/doctors`. Restart and pick Trouble breathing → red verdict. Chips hide while "AI is typing...". Switch language mid-chat — the whole transcript re-translates.

- [ ] **Step 9: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): scripted ai triage machine with chat ui"
```

---

### Task 9: Doctor & booking entities, doctors list, profile + slot booking

**Files:**
- Create: `src/entities/doctor/model.ts`, `src/entities/booking/model.ts`
- Modify: `src/pages/parent/doctors.tsx`, `src/pages/parent/doctor-profile.tsx`

- [ ] **Step 1: Create `src/entities/doctor/model.ts`**

```ts
import { createEffect, createStore } from 'effector'
import { api, type Doctor } from '@/shared/api'

export const fetchDoctorsFx = createEffect(api.fetchDoctors)

export const $doctors = createStore<Doctor[]>([]).on(fetchDoctorsFx.doneData, (_, list) => list)
export const $doctorsLoaded = createStore(false).on(fetchDoctorsFx.done, () => true)
export const $doctorsLoading = fetchDoctorsFx.pending
```

- [ ] **Step 2: Create `src/entities/booking/model.ts`**

```ts
import { createEffect, createEvent, createStore } from 'effector'
import { api, type Booking } from '@/shared/api'

export const fetchBookingsFx = createEffect(api.fetchBookings)
export const bookingCreated = createEvent<Booking>()

export const $bookings = createStore<Booking[]>([])
  .on(fetchBookingsFx.doneData, (_, list) => list)
  .on(bookingCreated, (list, b) => [b, ...list])

export const $bookingsLoaded = createStore(false).on(fetchBookingsFx.done, () => true)
export const $bookingsLoading = fetchBookingsFx.pending
```

- [ ] **Step 3: Replace `src/pages/parent/doctors.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { Search, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $doctors, $doctorsLoaded, $doctorsLoading, fetchDoctorsFx } from '@/entities/doctor/model'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

export default function DoctorsPage() {
  const { t } = useTranslation()
  const [doctors, loaded, loading] = useUnit([$doctors, $doctorsLoaded, $doctorsLoading])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!loaded) void fetchDoctorsFx()
  }, [loaded])

  const q = query.toLowerCase()
  const filtered = doctors.filter(
    (d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q),
  )

  return (
    <div>
      <PageHeader title={t('doctors.title')} />
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t('doctors.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : filtered.map((d) => (
              <Link key={d.id} to={`/parent/doctors/${d.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-secondary">{d.name.split(' ').at(-1)?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{d.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{d.specialty}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('doctors.experience', { years: d.experienceYears })} · {d.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="size-4 fill-amber-400 text-amber-400" /> {d.rating}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/pages/parent/doctor-profile.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { ArrowLeft, CheckCircle2, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { bookingCreated } from '@/entities/booking/model'
import { $activeChild } from '@/entities/child/model'
import { $doctors, $doctorsLoaded, fetchDoctorsFx } from '@/entities/doctor/model'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

const fmtSlot = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function DoctorProfilePage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [doctors, loaded, child, book] = useUnit([$doctors, $doctorsLoaded, $activeChild, bookingCreated])
  const [slot, setSlot] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!loaded) void fetchDoctorsFx()
  }, [loaded])

  if (!loaded) return <Skeleton className="h-60 rounded-xl" />
  const doctor = doctors.find((d) => d.id === id)
  if (!doctor) return <PageHeader title="404" />

  const onBook = () => {
    if (!slot) return
    book({
      id: crypto.randomUUID(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      childName: child?.name ?? '—',
      slot,
      status: 'upcoming',
    })
    setConfirmed(true)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-2">
        <Link to="/parent/doctors">
          <ArrowLeft className="size-4" /> {t('common.back')}
        </Link>
      </Button>
      <Card>
        <CardContent className="grid gap-4 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-secondary text-xl">{doctor.name.split(' ').at(-1)?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold">{doctor.name}</h1>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              <p className="flex items-center gap-1 text-sm">
                <Star className="size-4 fill-amber-400 text-amber-400" /> {doctor.rating} ·{' '}
                {t('doctors.reviews', { count: doctor.reviews })} ·{' '}
                {t('doctors.experience', { years: doctor.experienceYears })}
              </p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              {doctor.price}
            </Badge>
          </div>
          {confirmed ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 p-6 text-emerald-800">
              <CheckCircle2 className="size-8" />
              <p className="font-semibold">{t('doctors.confirmed')}</p>
              <p className="text-sm">
                {slot && fmtSlot(slot, i18n.language)} · {t('doctors.forChild')}: {child?.name ?? '—'}
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 font-medium">{t('doctors.chooseSlot')}</p>
                <div className="flex flex-wrap gap-2">
                  {doctor.slots.map((s) => (
                    <Button
                      key={s}
                      variant={slot === s ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSlot(s)}
                    >
                      {fmtSlot(s, i18n.language)}
                    </Button>
                  ))}
                </div>
              </div>
              {child && (
                <p className="text-sm text-muted-foreground">
                  {t('doctors.forChild')}: {child.name}
                </p>
              )}
              <Button disabled={!slot} onClick={onBook}>
                {t('doctors.book')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Verify** — `npm run build` passes. In dev: doctors list shows skeletons then 6 cards; search filters by name/specialty; open a profile, pick a slot, book → green confirmation with the active child's name.

- [ ] **Step 6: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): doctors list, profile and slot booking"
```

---

### Task 10: History and vaccines pages

**Files:**
- Create: `src/entities/consultation/model.ts`, `src/entities/vaccine/model.ts`
- Modify: `src/pages/parent/history.tsx`, `src/pages/parent/vaccines.tsx`

- [ ] **Step 1: Create `src/entities/consultation/model.ts`**

```ts
import { createEffect, createStore } from 'effector'
import { api, type HistoryRecord } from '@/shared/api'

export const fetchHistoryFx = createEffect(api.fetchHistory)

export const $history = createStore<HistoryRecord[]>([]).on(fetchHistoryFx.doneData, (_, list) => list)
export const $historyLoaded = createStore(false).on(fetchHistoryFx.done, () => true)
export const $historyLoading = fetchHistoryFx.pending
```

- [ ] **Step 2: Create `src/entities/vaccine/model.ts`**

```ts
import { createEffect, createStore } from 'effector'
import { api, type VaccineDose } from '@/shared/api'

export const fetchVaccinesFx = createEffect(api.fetchVaccines)

export const $vaccines = createStore<VaccineDose[]>([]).on(fetchVaccinesFx.doneData, (_, list) => list)
export const $vaccinesLoaded = createStore(false).on(fetchVaccinesFx.done, () => true)
export const $vaccinesLoading = fetchVaccinesFx.pending
```

- [ ] **Step 3: Replace `src/pages/parent/history.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { Bot, Stethoscope } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { $history, $historyLoaded, $historyLoading, fetchHistoryFx } from '@/entities/consultation/model'
import { Card, CardContent } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

export default function HistoryPage() {
  const { t, i18n } = useTranslation()
  const [history, loaded, loading] = useUnit([$history, $historyLoaded, $historyLoading])

  useEffect(() => {
    if (!loaded) void fetchHistoryFx()
  }, [loaded])

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('history.title')} />
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <EmptyState icon="📋" text={t('history.empty')} />
      ) : (
        <div className="grid gap-3">
          {history.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  {r.kind === 'ai-check' ? <Bot className="size-5" /> : <Stethoscope className="size-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{r.title}</p>
                    {r.urgency && <UrgencyBadge urgency={r.urgency} />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(r.kind === 'ai-check' ? 'history.aiCheck' : 'history.consultation')} · {r.childName} ·{' '}
                    {new Date(r.date).toLocaleDateString(i18n.language)}
                  </p>
                  {r.conclusion && (
                    <p className="mt-1 rounded-lg bg-muted p-2 text-sm">
                      <span className="font-medium">{t('history.conclusion')}:</span> {r.conclusion}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/pages/parent/vaccines.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { CheckCircle2, CircleAlert, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { $activeChild } from '@/entities/child/model'
import { $vaccines, $vaccinesLoaded, $vaccinesLoading, fetchVaccinesFx } from '@/entities/vaccine/model'
import type { VaccineDose } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

const STATUS: Record<VaccineDose['status'], { icon: typeof CheckCircle2; cls: string; key: string }> = {
  done: { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700', key: 'vaccines.done' },
  upcoming: { icon: Clock, cls: 'bg-sky-100 text-sky-700', key: 'vaccines.upcoming' },
  overdue: { icon: CircleAlert, cls: 'bg-red-100 text-red-700', key: 'vaccines.overdue' },
}

export default function VaccinesPage() {
  const { t, i18n } = useTranslation()
  const [vaccines, loaded, loading, child] = useUnit([$vaccines, $vaccinesLoaded, $vaccinesLoading, $activeChild])

  useEffect(() => {
    if (!loaded) void fetchVaccinesFx()
  }, [loaded])

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('vaccines.title')} action={child && <Badge variant="secondary">{child.name}</Badge>} />
      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {vaccines.map((v) => {
            const s = STATUS[v.status]
            const Icon = s.icon
            return (
              <Card key={v.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('vaccines.dueAge')}: {v.dueAge} · {new Date(v.dueDate).toLocaleDateString(i18n.language)}
                    </p>
                  </div>
                  <Badge className={cn('border-transparent', s.cls)}>
                    <Icon className="size-3.5" /> {t(s.key)}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify** — `npm run build` passes. In dev: History shows 4 mixed records (AI checks with urgency badges, consultations with conclusions); Vaccines shows the schedule with one overdue (red) and one upcoming (blue) dose and the active child's name in the header.

- [ ] **Step 6: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): history and vaccination calendar pages"
```

---

### Task 11: Doctor side — case transitions (TDD), triage queue, case detail, schedule

**Files:**
- Create: `src/entities/case/transition.ts`, `src/entities/case/transition.test.ts`, `src/entities/case/model.ts`, `src/shared/ui/case-status-badge.tsx`
- Modify: `src/pages/doctor/queue.tsx`, `src/pages/doctor/case-detail.tsx`, `src/pages/doctor/schedule.tsx`

- [ ] **Step 1: Write the failing test `src/entities/case/transition.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type { TriageCase } from '@/shared/api'
import { transitionCase } from './transition'

const base: TriageCase = {
  id: 'c1',
  childName: 'Test',
  childAge: '1y',
  urgency: 'yellow',
  aiSummary: 'summary',
  status: 'new',
  createdAt: '2026-06-11T08:00',
  transcript: [],
}

describe('transitionCase', () => {
  it('accepts a new case', () => {
    expect(transitionCase(base, { type: 'accept' }).status).toBe('accepted')
  })

  it('does not re-accept or accept closed cases', () => {
    const accepted = { ...base, status: 'accepted' as const }
    const closed = { ...base, status: 'closed' as const }
    expect(transitionCase(accepted, { type: 'accept' })).toBe(accepted)
    expect(transitionCase(closed, { type: 'accept' })).toBe(closed)
  })

  it('closes an accepted case with a conclusion', () => {
    const accepted = { ...base, status: 'accepted' as const }
    const closed = transitionCase(accepted, { type: 'close', conclusion: 'All good' })
    expect(closed.status).toBe('closed')
    expect(closed.conclusion).toBe('All good')
  })

  it('does not close a case that was never accepted', () => {
    expect(transitionCase(base, { type: 'close', conclusion: 'x' })).toBe(base)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./transition`.

- [ ] **Step 3: Create `src/entities/case/transition.ts`**

```ts
import type { TriageCase } from '@/shared/api'

export type CaseAction = { type: 'accept' } | { type: 'close'; conclusion: string }

export function transitionCase(c: TriageCase, action: CaseAction): TriageCase {
  if (action.type === 'accept') {
    return c.status === 'new' ? { ...c, status: 'accepted' } : c
  }
  return c.status === 'accepted' ? { ...c, status: 'closed', conclusion: action.conclusion } : c
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Create `src/entities/case/model.ts`**

```ts
import { createEffect, createEvent, createStore } from 'effector'
import { api, type TriageCase } from '@/shared/api'
import { transitionCase } from './transition'

export const fetchCasesFx = createEffect(api.fetchCases)
export const caseAccepted = createEvent<string>()
export const caseClosed = createEvent<{ id: string; conclusion: string }>()

export const $cases = createStore<TriageCase[]>([])
  .on(fetchCasesFx.doneData, (_, list) => list)
  .on(caseAccepted, (list, id) => list.map((c) => (c.id === id ? transitionCase(c, { type: 'accept' }) : c)))
  .on(caseClosed, (list, { id, conclusion }) =>
    list.map((c) => (c.id === id ? transitionCase(c, { type: 'close', conclusion }) : c)),
  )

export const $casesLoaded = createStore(false).on(fetchCasesFx.done, () => true)
export const $casesLoading = fetchCasesFx.pending
```

- [ ] **Step 6: Create `src/shared/ui/case-status-badge.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'
import type { CaseStatus } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge'

const MAP: Record<CaseStatus, { key: string; cls: string }> = {
  new: { key: 'doctor.statusNew', cls: 'bg-sky-100 text-sky-700' },
  accepted: { key: 'doctor.statusAccepted', cls: 'bg-amber-100 text-amber-700' },
  closed: { key: 'doctor.statusClosed', cls: 'bg-muted text-muted-foreground' },
}

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const { t } = useTranslation()
  return <Badge className={cn('border-transparent', MAP[status].cls)}>{t(MAP[status].key)}</Badge>
}
```

- [ ] **Step 7: Replace `src/pages/doctor/queue.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $cases, $casesLoaded, $casesLoading, caseAccepted, fetchCasesFx } from '@/entities/case/model'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { CaseStatusBadge } from '@/shared/ui/case-status-badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

const URGENCY_ORDER = { red: 0, yellow: 1, green: 2 } as const

export default function QueuePage() {
  const { t, i18n } = useTranslation()
  const [cases, loaded, loading, accept] = useUnit([$cases, $casesLoaded, $casesLoading, caseAccepted])

  useEffect(() => {
    if (!loaded) void fetchCasesFx()
  }, [loaded])

  const queue = [...cases].sort(
    (a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || b.createdAt.localeCompare(a.createdAt),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('doctor.queueTitle')} />
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <EmptyState icon="🎉" text={t('doctor.emptyQueue')} />
      ) : (
        <div className="grid gap-3">
          {queue.map((c) => (
            <Card key={c.id}>
              <CardContent className="grid gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{c.childName}</p>
                  <span className="text-sm text-muted-foreground">{c.childAge}</span>
                  <UrgencyBadge urgency={c.urgency} />
                  <CaseStatusBadge status={c.status} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString(i18n.language, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.aiSummary}</p>
                <div className="flex gap-2">
                  {c.status === 'new' && (
                    <Button size="sm" onClick={() => accept(c.id)}>
                      {t('doctor.accept')}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/doctor/cases/${c.id}`}>{t('doctor.open')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Replace `src/pages/doctor/case-detail.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { ArrowLeft, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { $cases, $casesLoaded, caseAccepted, caseClosed, fetchCasesFx } from '@/entities/case/model'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { CaseStatusBadge } from '@/shared/ui/case-status-badge'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

interface MockMsg {
  id: number
  author: 'doctor' | 'parent'
  text: string
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [cases, loaded, accept, close] = useUnit([$cases, $casesLoaded, caseAccepted, caseClosed])
  const [conclusion, setConclusion] = useState('')
  const [chat, setChat] = useState<MockMsg[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!loaded) void fetchCasesFx()
  }, [loaded])

  if (!loaded) return <Skeleton className="h-60 rounded-xl" />
  const c = cases.find((x) => x.id === id)
  if (!c) return <PageHeader title="404" />

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setChat((m) => [...m, { id: m.length, author: 'doctor', text }])
    setDraft('')
    setTimeout(() => {
      setChat((m) => [...m, { id: m.length, author: 'parent', text: '👍 Thank you, doctor!' }])
    }, 900)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" asChild className="mb-2">
        <Link to="/doctor">
          <ArrowLeft className="size-4" /> {t('common.back')}
        </Link>
      </Button>
      <PageHeader
        title={`${t('doctor.caseTitle')} · ${c.childName}`}
        action={
          <div className="flex gap-2">
            <UrgencyBadge urgency={c.urgency} />
            <CaseStatusBadge status={c.status} />
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <p className="font-medium">{t('doctor.transcript')}</p>
              {c.transcript.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.author === 'ai' ? 'self-start bg-secondary' : 'self-end bg-primary/10',
                  )}
                >
                  {m.text}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <p className="font-medium">{t('doctor.chatWithParent')}</p>
              {chat.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.author === 'doctor' ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-secondary',
                  )}
                >
                  {m.text}
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  disabled={c.status === 'closed'}
                />
                <Button size="icon" aria-label={t('common.send')} onClick={send} disabled={c.status === 'closed'}>
                  <Send className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="grid gap-1 p-4 text-sm">
              <p className="font-medium">{t('doctor.childInfo')}</p>
              <p>{c.childName}</p>
              <p className="text-muted-foreground">
                {t('doctor.age')}: {c.childAge}
              </p>
              <p className="text-muted-foreground">{new Date(c.createdAt).toLocaleString(i18n.language)}</p>
              <p className="mt-1 rounded-lg bg-muted p-2">{c.aiSummary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2 p-4">
              <p className="font-medium">{t('doctor.writeConclusion')}</p>
              {c.status === 'closed' ? (
                <p className="rounded-lg bg-muted p-2 text-sm">{c.conclusion}</p>
              ) : c.status === 'new' ? (
                <Button onClick={() => accept(c.id)}>{t('doctor.accept')}</Button>
              ) : (
                <>
                  <Textarea
                    rows={4}
                    placeholder={t('doctor.conclusionPlaceholder')}
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                  />
                  <Button
                    disabled={!conclusion.trim()}
                    onClick={() => close({ id: c.id, conclusion: conclusion.trim() })}
                  >
                    {t('doctor.closeCase')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Replace `src/pages/doctor/schedule.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { $bookings, $bookingsLoaded, $bookingsLoading, fetchBookingsFx } from '@/entities/booking/model'
import type { Booking } from '@/shared/api'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

export default function SchedulePage() {
  const { t, i18n } = useTranslation()
  const [bookings, loaded, loading] = useUnit([$bookings, $bookingsLoaded, $bookingsLoading])

  useEffect(() => {
    if (!loaded) void fetchBookingsFx()
  }, [loaded])

  const upcoming = bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.slot.localeCompare(b.slot))
  const byDay = upcoming.reduce<Record<string, Booking[]>>((acc, b) => {
    const day = b.slot.slice(0, 10)
    ;(acc[day] ??= []).push(b)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('doctor.scheduleTitle')} />
      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <EmptyState icon="🗓️" text={t('doctor.noVisits')} />
      ) : (
        <div className="grid gap-4">
          {Object.entries(byDay).map(([day, items]) => (
            <div key={day}>
              <p className="mb-2 text-sm font-semibold text-muted-foreground">
                {new Date(day).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="grid gap-2">
                {items.map((b) => (
                  <Card key={b.id}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Badge variant="secondary" className="text-base">
                        {b.slot.slice(11, 16)}
                      </Badge>
                      <div>
                        <p className="font-medium">{b.childName}</p>
                        <p className="text-sm text-muted-foreground">{b.doctorName}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 10: Verify** — `npm test` and `npm run build` pass. In dev as doctor: queue shows 4 cases sorted red→yellow→green; Accept turns a New badge into In progress; open the red case → transcript bubbles, child info, conclusion textarea after accepting; closing with a conclusion shows it read-only and disables parent chat; Schedule groups visits by day.

- [ ] **Step 11: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): doctor triage queue, case detail and schedule"
```

---

### Task 12: Parent home dashboard, README, final verification

**Files:**
- Modify: `src/pages/parent/home.tsx`
- Create: `README.md`

- [ ] **Step 1: Replace `src/pages/parent/home.tsx`**

```tsx
import { useUnit } from 'effector-react'
import { CalendarClock, MessageCircle, Stethoscope, Syringe } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $bookings, $bookingsLoaded, fetchBookingsFx } from '@/entities/booking/model'
import { $activeChild } from '@/entities/child/model'
import { $session } from '@/entities/session/model'
import { $vaccines, $vaccinesLoaded, fetchVaccinesFx } from '@/entities/vaccine/model'
import { formatAge } from '@/shared/lib/age'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'

export default function ParentHomePage() {
  const { t, i18n } = useTranslation()
  const [session, child, bookings, bookingsLoaded, vaccines, vaccinesLoaded] = useUnit([
    $session,
    $activeChild,
    $bookings,
    $bookingsLoaded,
    $vaccines,
    $vaccinesLoaded,
  ])

  useEffect(() => {
    if (!bookingsLoaded) void fetchBookingsFx()
    if (!vaccinesLoaded) void fetchVaccinesFx()
  }, [bookingsLoaded, vaccinesLoaded])

  const next = bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.slot.localeCompare(b.slot))[0]
  const nextVaccine = vaccines.find((v) => v.status !== 'done')

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <h1 className="text-xl font-bold sm:text-2xl">{t('home.greeting', { name: session?.name ?? '' })}</h1>

      {child && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-secondary text-lg">{child.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{child.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatAge(child.birthDate)}
                {child.weightKg ? ` · ${child.weightKg} kg` : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <p className="mb-2 font-medium">{t('home.quickActions')}</p>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/parent/chat">
            <Card className="h-full bg-primary text-primary-foreground transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-start gap-2 p-4">
                <MessageCircle className="size-6" />
                <p className="font-semibold">{t('home.startAiCheck')}</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/parent/doctors">
            <Card className="h-full bg-accent text-accent-foreground transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-start gap-2 p-4">
                <Stethoscope className="size-6" />
                <p className="font-semibold">{t('home.bookDoctor')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <CalendarClock className="size-5 text-primary" />
          <div>
            <p className="text-sm font-medium">{t('home.nextAppointment')}</p>
            {next ? (
              <p className="text-sm text-muted-foreground">
                {next.doctorName} ·{' '}
                {new Date(next.slot).toLocaleString(i18n.language, {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{t('home.noAppointments')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {nextVaccine && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Syringe className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{t('home.nextVaccine')}</p>
              <p className="text-sm text-muted-foreground">
                {nextVaccine.name} · {new Date(nextVaccine.dueDate).toLocaleDateString(i18n.language)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `README.md`**

```markdown
# PediCare AI — frontend mockup

AI-powered pediatrician platform mockup. Two sides: parents (AI symptom
triage, doctor booking, child profiles, history, vaccination calendar) and
doctors (triage queue, case detail, schedule). Frontend-only: scripted AI
dialog and mock data with fake latency. Spec and plan live in
`docs/superpowers/`.

## Stack

Vite · React 18 · TypeScript · Feature-Sliced Design · shadcn/ui +
Tailwind CSS v4 · Effector · react-router v7 · i18next (EN/RU/UZ)

## Run

    npm install
    npm run dev    # dev server
    npm test       # vitest unit tests
    npm run build  # typecheck + production build

## Demo

Log in with any email/password. Pick "I'm a parent" or "I'm a doctor" to
enter the respective side.
```

- [ ] **Step 3: Final verification**

Run: `npm test` → all unit tests pass (formatAge, triage machine, case transitions).
Run: `npm run build` → typecheck + production build pass.

Full demo walk in `npm run dev`:
1. Login as parent → home shows greeting, child card, quick actions, next appointment and vaccine.
2. AI check: Fever → More than 3 days → None of these → yellow verdict → Connect → doctors list → book a slot → confirmation; the new booking shows on parent home and in the doctor's schedule (log out, log in as doctor).
3. Children: add/edit/switch active/delete; persists across reload.
4. History and Vaccines render fixtures with badges.
5. Doctor: accept the red case, write a conclusion, close it; statuses update in the queue.
6. Switch language EN → РУ → UZ on any screen — everything translates and the choice survives reload.

- [ ] **Step 4: Commit**

```bash
git add -A . && git commit -m "feat(pedicare): parent home dashboard and readme"
```

---

## Execution notes

- Tasks are strictly ordered; each leaves `npm run build` green.
- All work happens inside `temp/pediatrician-solution`; the repo root is two levels up — `git add -A .` from the working directory only stages this project's files. Do not touch unrelated pending deletions elsewhere in the repo.
- localStorage keys used: `pedicare.session`, `pedicare.children`, `pedicare.activeChild`, `pedicare.lang`. Clear them when testing first-run behavior.
