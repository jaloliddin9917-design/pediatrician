# Aurora Glass Redesign — Implementation Plan (condensed)

Spec: `docs/superpowers/specs/2026-06-11-aurora-redesign-design.md`
Executed inline in-session; every step ends with `npm run build` green and a commit.

1. **Theme** — install `@fontsource-variable/bricolage-grotesque` + `onest`
   (drop baloo-2/nunito); rewrite theme block in `src/index.css`: aurora
   tokens, `@utility glass`, keyframes (fade-up, float, blob, marquee,
   wave, dots), scroll-reveal classes.
2. **i18n** — add `shell`, new `landing`, and 9 module sections to
   en/ru/uz via scripted JSON merge.
3. **Foundations** — `shared/api/ai-types.ts` + `ai-fixtures.ts` (+ export
   via `shared/api`), `shared/lib/use-reveal.ts`, `entities/task` store
   with pure `moveTask` transition (TDD).
4. **App shell** — `widgets/app-shell` (glass sidebar: groups, collapse,
   mobile Sheet; topbar: search, lang, bell, avatar); rewrite
   parent/doctor layouts on top; router: 9 new `/doctor/*` lazy routes.
5. **Landing** — full rebuild per spec section 3.
6. **Parent restyle** — 7 pages, same functionality, aurora styling.
7. **Doctor core restyle** — queue (urgency rails), case detail, schedule.
8. **Clinical AI pages** — scribe, receptionist, billing, evidentia.
9. **Operations AI pages** — nurse, comms, canvas, tasks, forms.
10. **Verify & ship** — tests, build, Playwright at 1440/800/390,
    i18n key check, commit, `git subtree push` → GitHub `main`.
