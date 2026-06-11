# PediCare AI — Frontend Mockup Design

**Date:** 2026-06-11
**Status:** Approved
**Scope:** Frontend-only mockup (no backend). Two sides: parents and doctors.

> "PediCare AI" is a working title; rename is a find-and-replace away.

## 1. Purpose

An AI-powered pediatrician platform mockup. A parent describes their child's
symptoms to an AI assistant; the AI assesses urgency and either suggests
self-care or routes the case to a real pediatrician. Doctors triage escalated
cases, consult, and write conclusions. The mockup demonstrates the full product
flow with scripted AI and mock data — suitable for stakeholder demos and as the
base for the real frontend.

## 2. Stack

| Concern | Choice |
|---|---|
| Build | Vite + React 18 + TypeScript (strict) |
| Architecture | Feature-Sliced Design (FSD) |
| UI kit | shadcn/ui + Tailwind CSS, lucide-react icons |
| Global store | Effector + effector-react |
| Routing | react-router (lazy-loaded pages, role guards) |
| i18n | i18next + react-i18next — EN (default), RU, UZ; persisted to localStorage |
| Backend | None — `shared/api/mock` fixtures with fake latency |

## 3. Visual style

Warm pediatric theme: mint/teal primary, coral accent, soft rounded corners,
friendly empty states. Light mode only at this stage. Parent side is
mobile-first; doctor side is a desktop dashboard; both fully responsive.

## 4. Roles & entry

Mock auth: `/auth/login` and `/auth/register` with an "I'm a parent / I'm a
doctor" role pick. Any credentials work. The chosen role is stored in the
`session` store (persisted) and drives route guards: parents cannot open
`/doctor/*` and vice versa; unauthenticated users are redirected to login.

## 5. Pages

### Auth
- `/auth/login` — email/password + role pick
- `/auth/register` — name, email, password + role pick

### Parent side (`/parent/*`)
- **Home `/parent`** — active child card, quick actions (Start AI check, Book
  a doctor), next appointment, next vaccine reminder
- **AI Chat `/parent/chat`** — scripted triage dialog: typing/streaming
  effect, quick-reply chips, urgency verdict banner
  (green = self-care, yellow = see a doctor soon, red = urgent) and a
  "Connect to a pediatrician" CTA leading to booking
- **Doctors `/parent/doctors`** — searchable list, specialty/rating filters
- **Doctor profile `/parent/doctors/:id`** — bio, rating, time-slot picker,
  booking confirmation
- **Children `/parent/children`** — add/edit child profiles (name, birth
  date, weight/height, allergies); active-child selector used by chat and
  vaccines
- **History `/parent/history`** — past AI checks and consultations with
  doctor conclusions
- **Vaccines `/parent/vaccines`** — standard vaccination schedule per child
  with done / upcoming / overdue statuses

### Doctor side (`/doctor/*`)
- **Triage queue `/doctor`** — AI-escalated cases: urgency badge, AI summary,
  child age, Accept action
- **Case detail `/doctor/cases/:id`** — AI chat transcript, child info panel,
  mock chat with the parent, conclusion form that closes the case
- **Schedule `/doctor/schedule`** — day/week list of booked appointments

### System
- 404 page; loading skeletons on all lists; friendly empty states (no
  children, no history, empty queue).

## 6. FSD structure

```
src/
  app/        # providers (router, i18n, effector), global styles, entry
  pages/
    auth/     # login, register
    parent/   # home, chat, doctors, doctor-profile, children, history, vaccines
    doctor/   # queue, case-detail, schedule
  widgets/    # app-header, parent-nav, doctor-sidebar, chat-window, triage-banner
  features/   # auth, ai-triage, book-doctor, manage-child, write-conclusion, lang-switch
  entities/   # child, doctor, consultation, case, vaccine, message, session
  shared/     # ui (shadcn), lib, i18n, api/mock, config
```

Role separation lives at pages + widgets; entities and shared are
role-agnostic. Path alias `@/*` → `src/*`. Standard FSD import rule applies
(a layer may import only from layers below it).

## 7. State (Effector stores)

- `session` — user, role; persisted; drives guards
- `children` — list + active child id; persisted
- `triageChat` — messages + scripted scenario state machine
  (greet → symptoms → follow-up questions → verdict)
- `bookings` — appointments; one shape serves parent "upcoming" and doctor
  "schedule"
- `cases` — doctor queue with status transitions (new → accepted → closed)
- `lang` — current language; persisted

## 8. Mock data layer

`shared/api/mock/` — typed fixtures (doctors, cases, vaccine schedule, chat
scripts) + `fakeRequest()` with 300–600 ms latency so skeletons are visible.
All Effector effects go through this layer; swapping in a real API later does
not touch UI code.

The AI chat is a scripted scenario (option chosen: mock now; the chat service
sits behind the mock layer, so a real LLM endpoint can replace it later).

## 9. Testing

Mockup-light: `tsc --noEmit` and `vite build` must pass. Vitest unit tests
only for real logic: the triage state machine and case status transitions.
No e2e at this stage.

## 10. Out of scope

Real backend/API, real AI calls, payments, push notifications, dark mode,
accessibility audit beyond shadcn defaults, native mobile apps.
