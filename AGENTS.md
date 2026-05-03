⚠️ Mandatory: AI agents must read this file before writing or modifying any code in the rental repo.

MANDATORY: After completing each task, update this repo's AGENTS.md Task Log (newest-first) before marking the task done.
This file complements the workspace-level Ansiversa-workspace/AGENTS.md (source of truth). Read workspace first.

# AGENTS.md
## Rental Repo - Session Notes

This repo is the full Ansiversa Rental platform for `rental.ansiversa.com`.

---

## 1. Current Architecture

- Full product platform shell scaffolded from the approved `app-starter` baseline.
- Product identity:
  - app key: `rental`
  - app name/title: `Rental`
  - description: `A complete rental platform for cars, homes, equipment, and more.`
- Public landing page lives at `/`.
- Protected workspace entry lives at `/app`.
- Shared Ansiversa auth/session/middleware standards are preserved.
- Shared `@ansiversa/components` usage is preserved.
- One global Alpine store pattern is preserved.

---

## 2. Product Direction

- Rental is not a mini-app.
- Rental is a full platform for rental activity.
- Users enter Rental first, then choose a rental category.
- V1 starts with car rental.
- Architecture must remain generic for homes, equipment, and later categories.

---

## 3. Current Boundaries

- No rental business logic has been implemented yet.
- No rental database tables have been created yet.
- Next phase is Rental DB schema and V1 car rental product flow.

---

## 4. Task Log (Recent)

- 2026-05-03 Fixed local parent-app redirect behavior by adding a Rental local `.env` aligned with `car-pool` (`PARENT_APP_URL` and `PUBLIC_ROOT_APP_URL` set to `http://localhost:2000`), updating `.env.example` local defaults, and making middleware prefer `PARENT_APP_URL` during dev before production fallback. Verification: `npm run typecheck` passed (0 errors, inherited redirect-page hints only), `npm run build` passed; local curl to `127.0.0.1:4321` could not connect because the dev server was not reachable from this shell.
- 2026-05-03 Scaffolded the empty `rental` repo from latest `app-starter`, updated app identity and landing/workspace copy for the full Rental platform, preserved `/app` protection and shared Ansiversa auth/component standards, and kept rental business logic/database schema deferred for the next phase. Verification: `npm install` completed, `npm run typecheck` passed (0 errors, inherited redirect-page hints only), and `npm run build` passed.
