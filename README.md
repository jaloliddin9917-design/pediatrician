# PediCare AI — frontend mockup

AI-powered pediatrician platform mockup. Two sides: parents (AI symptom
chat, voice check, AI advisor, doctor booking, child profiles, history,
vaccination calendar) and doctors (AI-triaged queue, case workspace,
schedule). A parent's escalated AI check creates a real case in the
doctor's triage queue (persisted in localStorage). Frontend-only: scripted
AI and mock data with fake latency. Specs and plans live in
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
