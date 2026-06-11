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

## Docker

One container builds and serves the whole app (nginx + SPA fallback):

    docker build -t pedicare-ai .
    docker run -p 8080:80 pedicare-ai
    # open http://localhost:8080

## Demo

The landing page at `/` shows the platform and its Clinical AI /
Operations AI feature suite. Log in with any email/password. Pick
"I'm a parent" or "I'm a doctor" to enter the respective side.
