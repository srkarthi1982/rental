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
- Astro DB V1 foundation is in place for rental business workspaces, rental categories, generic rental items, car-specific item details, customers, bookings, service logs, and repair logs.
- Rental Actions V1 foundation is in place for owner-scoped business bootstrap, category reads, cars, customers, bookings, service logs, and repair logs.
- Rental Cars UI V1 is in place at `/app` with a cars list, empty state, validation, and Add Car drawer.
- Rental Customers UI V1 is in place at `/app` with a customers list, empty state, validation, and Add Customer drawer.

---

## 2. Product Direction

- Rental is not a mini-app.
- Rental is a full platform for rental activity.
- Users enter Rental first, then choose a rental category.
- V1 starts with car rental.
- Architecture must remain generic for homes, equipment, and later categories.

---

## 3. Current Boundaries

- Backend actions/helpers exist for the approved V1 foundation only.
- No booking, service log, repair log, dashboard, category selector, public listing, or public booking UI has been implemented yet.
- Cars Module V1 is frozen unless a real issue is found.
- Next phase is continuing V1 rental workflow on top of the approved DB foundation.

---

## 4. Task Log (Recent)

- 2026-05-03 Added Rental Customers UI V1 as the second `/app` module: the workspace now has simple Cars/Customers tabs, keeps Cars as the default view, lists current-business customers, shows the approved empty state, and provides an Add Customer drawer with required full-name validation, guarded submit behavior, safe action failure messaging, and list refresh through the existing owner-scoped customer actions. Cars business logic was left untouched, and no bookings, service logs, repair logs, dashboard, category selector, public routes, or landing page changes were added. Verification: `npm run typecheck` passed (0 errors, inherited redirect-page hints only), `npm run build` passed, and local smoke check on `127.0.0.1:4322` confirmed protected `/app` renders, `createRentalCustomer` returns 200, and reloading `/app` includes the created smoke-test customer.
- 2026-05-03 Applied focused Rental Cars UI V1 polish: Add Car drawer now has required-field validation with inline errors, guarded submit/double-click behavior, safe action failure messaging, silent list refresh after save, clearer empty state copy, and fallback list text for optional car details. Scope stayed limited to `/app`, the Add Car drawer, and the Cars Alpine store; no customers, bookings, service logs, repair logs, dashboard, category selector, public routes, or landing changes were added. Verification: `npm run typecheck` passed (0 errors, inherited redirect-page hints only), `npm run build` passed, and local smoke check on `127.0.0.1:4322` confirmed protected `/app` renders, `createRentalCar` returns 200, and reloading `/app` includes the created smoke-test car.
- 2026-05-03 Implemented Rental UI V1 for Cars module only: `/app` now shows the Cars workspace with current-user cars, empty state, Add Car button, and an Ansiversa drawer-standard Add Car form wired to `createRentalCar` and list refresh through a dedicated Alpine store. No customers, bookings, service logs, repair logs, dashboard, category selector, public routes, or landing changes were added. Verification: `npm run typecheck` passed (0 errors, inherited redirect-page hints only), `npm run build` passed, and local smoke check on `127.0.0.1:4322` confirmed protected `/app` renders, `createRentalCar` returns 200, and reloading `/app` includes the created smoke-test car; no server-side console errors appeared during the smoke.
- 2026-05-03 Added Rental Actions V1 foundation: backend-only Astro actions/helpers for owner-scoped rental business bootstrap (`User -> RentalBusiness -> Rental data`), category reads, car item/detail creation and reads, customer creation and reads, booking creation and reads, and service/repair log creation and listing. Ownership checks now validate all client-supplied item/customer/booking/log access through the current user's rental business. No UI, landing page changes, public listing, or public booking flow were added. Verification: `npm run typecheck` passed (0 errors, inherited redirect-page hints only) and `npm run build` passed.
- 2026-05-03 Added Rental DB V1 foundation: `RentalBusinesses`, `RentalCategories`, `RentalItems`, `RentalCarDetails`, `RentalCustomers`, `RentalBookings`, `RentalServiceLogs`, and `RentalRepairLogs`, wired schema through `db/config.ts`, and added safe category seed data for car/home/equipment with car active and future categories planned. No UI, actions, forms, or rental workflow were added. Verification: `npm run typecheck` passed (0 errors, inherited redirect-page hints only) and `npm run build` passed.
- 2026-05-03 Fixed local parent-app redirect behavior by adding a Rental local `.env` aligned with `car-pool` (`PARENT_APP_URL` and `PUBLIC_ROOT_APP_URL` set to `http://localhost:2000`), updating `.env.example` local defaults, and making middleware prefer `PARENT_APP_URL` during dev before production fallback. Verification: `npm run typecheck` passed (0 errors, inherited redirect-page hints only), `npm run build` passed; local curl to `127.0.0.1:4321` could not connect because the dev server was not reachable from this shell.
- 2026-05-03 Scaffolded the empty `rental` repo from latest `app-starter`, updated app identity and landing/workspace copy for the full Rental platform, preserved `/app` protection and shared Ansiversa auth/component standards, and kept rental business logic/database schema deferred for the next phase. Verification: `npm install` completed, `npm run typecheck` passed (0 errors, inherited redirect-page hints only), and `npm run build` passed.
