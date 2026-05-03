# Ansiversa Rental

Rental is the full Ansiversa platform for rental activity at `rental.ansiversa.com`.
It starts with car rental in V1, while keeping the foundation generic for homes,
equipment, and future rental categories.

## Current status

Platform shell scaffolded from the approved Ansiversa app baseline, with the
Rental DB V1 foundation in place.

No rental UI forms, public listing, public booking flow, or operator workspace
screens are implemented yet. The next approved phase is the V1 car rental
product flow.

## Architecture

- Public landing page at `/`
- Protected workspace entry at `/app`
- Shared Ansiversa JWT session and middleware standards
- Shared `@ansiversa/components` UI system
- One global Alpine store pattern
- Astro Actions ready for SSR-first product workflows
- Astro DB foundation for business workspaces, rental categories, generic rental
  items, car details, customers, bookings, service logs, and repair logs
- Backend action foundation for owner-scoped business, car, customer, booking,
  service, and repair workflows

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

- `ANSIVERSA_AUTH_SECRET`
- `ANSIVERSA_SESSION_SECRET`
- `ANSIVERSA_COOKIE_DOMAIN`
- `PUBLIC_ROOT_APP_URL` (optional)
- `PARENT_APP_URL` (optional)
- `ANSIVERSA_WEBHOOK_SECRET` (optional)
- `PARENT_NOTIFICATION_WEBHOOK_URL` (optional)
- `PARENT_ACTIVITY_WEBHOOK_URL` (optional)

3. Run the app

```bash
npm run dev
```

For local development without the parent app session cookie:

```bash
DEV_BYPASS_AUTH=true npm run dev:local
```

## Commands

- `npm run dev`
- `npm run dev:local`
- `npm run typecheck`
- `npm run build`
- `npm run db:push`

## Product direction

Users enter Rental first, then choose what they want to rent:

- Car
- Home
- Equipment
- Other categories later

V1 starts with car rental, but the platform must not become car-only.

## Standards

Keep these shared Ansiversa standards intact:

- `src/layouts/AppShell.astro`
- `src/middleware.ts`
- `src/lib/middlewareConfig.ts`
- `src/app.meta.ts` as identity source of truth
- Protected `/app` workspace entry
- Shared `@ansiversa/components` usage
- Repo task notes in `AGENTS.md`

Ansiversa motto: Make it simple - but not simpler.
