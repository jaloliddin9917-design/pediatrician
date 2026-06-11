# PediCare AI — Aurora Glass Full Redesign

**Date:** 2026-06-11
**Status:** Approved (user picked "Aurora Glass" direction and approved the plan)
**Supersedes the visual layer of:** `2026-06-11-pediatrician-mockup-design.md` (functionality and FSD architecture stay)

## 1. Why

The first mint/teal design did not land with the user. Full visual redesign of
all three surfaces — landing, parent app, doctor app — plus real interactive
mock implementations of the nine AI features shown in the reference screenshot
(Clinical AI / Operations AI grid).

## 2. Visual language — "Aurora Glass"

- **Background:** white washed with soft aurora gradients (sky → lavender →
  rose radial meshes), fixed subtle, never noisy.
- **Surfaces:** frosted glass cards — `bg-white/70`, `backdrop-blur`, hairline
  `border-white/60`, soft glow shadows. Utility class `glass` (Tailwind v4
  `@utility`).
- **Text:** deep navy ink. **Primary:** indigo-blue. Pastel icon tiles
  (sky/violet/emerald/indigo/orange/rose/red/amber) exactly like the
  reference image.
- **Type:** Bricolage Grotesque Variable (display, h1–h4) + Onest Variable
  (body) via fontsource. Uppercase letter-spaced section labels
  ("CLINICAL AI") as in the reference.
- **Radius:** 1.25rem base. **Motion:** staggered fade-up on load,
  IntersectionObserver scroll reveals (`useReveal`), float/blob drift,
  marquee, hover lifts. CSS-only keyframes.

## 3. Landing (rebuilt from zero)

Glass navbar (pill CTA) → hero: display headline with gradient-highlight word,
sub, dual CTAs (parent/doctor), trust row; right side a glass "app window"
playing the scripted triage chat with floating pastel feature tiles →
specialty marquee strip → **bento feature grid: the exact 9 features** from
the reference image grouped Clinical AI / Operations AI, each card with an
animated CSS vignette (waveform, call timeline, code chips, ranked bars,
checklist, channel hub, table/timeline, kanban chips, autofilling fields) →
parent/doctor product-tour panels → 3-step how-it-works → testimonials →
aurora CTA band → footer. All i18n EN/RU/UZ.

## 4. App shell (both roles — user requirement: sidebars)

`widgets/app-shell` shared by parent and doctor layouts:

- Fixed left **glass sidebar**: logo, grouped nav sections with uppercase
  labels, active item = indigo pill, collapse-to-icons toggle (desktop),
  Sheet drawer behind hamburger (mobile), user card + logout at bottom.
- **Topbar:** mock global search, language switcher, notification bell
  (badge), avatar.
- Content area on aurora-tinted background.

Parent nav: Home, AI Check, Doctors, Children, History, Vaccines.
Doctor nav groups: CARE (Triage queue, Schedule) · CLINICAL AI (AI Scribe,
AI Receptionist, AI Billing, DeepEvidentia) · OPERATIONS AI (AI Nurse
Copilot, AI Comms, Clinical Canvas, AI Tasks, AI Forms).

## 5. Nine AI modules — interactive mocks (doctor side)

All frontend-only, fixtures in `shared/api` (`ai-types.ts`, `ai-fixtures.ts`),
routes `/doctor/<module>`:

| Route | Module | Mock behavior |
|---|---|---|
| `scribe` | AI Scribe | Record button → scripted transcript lines appear live with waveform → "Generate note" → SOAP card (S/O/A/P) |
| `receptionist` | AI Receptionist | Call log (caller, time, intent, outcome badge: booked/routed/voicemail), stats chips, expandable transcript |
| `billing` | AI Billing | Pick visit → suggested ICD-10 + E&M codes with confidence bars → approve toggles → status |
| `evidentia` | DeepEvidentia | Pick question → 4 model answers appear in parallel columns → judge ranking reveal (1st–4th medals + rationale) |
| `nurse` | AI Nurse Copilot | Pre-visit questionnaire responses, red-flag highlights, AI summary block |
| `comms` | AI Comms | Unified inbox with channel tabs (fax/email/SMS/phone), thread view, AI-drafted reply, mark handled |
| `canvas` | Clinical Canvas | Pick case → tabs: SOAP table · timeline · differential diagnosis with likelihood bars |
| `tasks` | AI Tasks | Board (To do / In progress / Done), create+assign dialog, move/complete; effector store, transition fn unit-tested |
| `forms` | AI Forms | Form list → detected PDF fields panel auto-fills one-by-one (animation), voice-fill mock |

Stateful modules (tasks, comms handled-state, billing approvals) use Effector;
purely visual flows (scribe, forms animation) use local state.

## 6. Out of scope / unchanged

FSD layering, mock auth, Effector entities for care flows, i18n mechanism,
Docker setup, tests for existing logic (stay green). No backend, no real AI.

## 7. Verification

`npm test` (existing 13 + new task-transition tests), `npm run build`,
Playwright visual pass at 1440/800/390 on landing + representative app pages,
i18n key-usage check, then commit and subtree-push to GitHub `main`.
