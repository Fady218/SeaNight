# SeaNight

Egypt's trust-first short-term rental platform for chalets, yachts, and hotel rooms — insurance-backed, ID-verified, and built for Egyptian domestic tourism.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- **DB schema**: `lib/db/src/schema/index.ts` — users, properties, bookings, reviews tables
- **OpenAPI contract**: `lib/api-spec/openapi.yaml` — source of truth for all API shapes
- **Generated hooks + Zod schemas**: `lib/api-client-react/` and `lib/api-zod/` — regenerate with `pnpm --filter @workspace/api-spec run codegen`
- **API routes**: `artifacts/api-server/src/routes/` — properties, bookings, users, reviews, admin
- **Demo seed data**: `artifacts/api-server/src/lib/seed.ts` — auto-runs on startup if DB is empty; also callable via `POST /api/admin/seed`
- **Frontend pages**: `artifacts/client-portal/src/pages/` — home, listings, property, dashboard, admin, broker

## Architecture decisions

- **Contract-first**: OpenAPI spec → Orval codegen → React Query hooks + Zod schemas. Never handwrite fetch calls.
- **Auto-seed on startup**: `seedIfEmpty()` runs in the Express `listen` callback. Safe to call repeatedly (idempotent guard).
- **Date serialization**: Drizzle returns `Date` objects; Zod expects `string`. All route handlers wrap DB results in `serializeDates()` (JSON round-trip) before calling `.parse()`.
- **Platform fee model**: 3% from tenant + 7% from owner = 10% gross. Broker gets 3% of owner's 7% share.
- **Proxy routing**: all traffic via shared proxy at `localhost:80`. API at `/api`, client at `/`. Never call service ports directly.

## Product

- **Landing page** (`/`): hero search, trust badges (GIS Insurance, National ID, Escrow, Fawry/InstaPay), featured properties, destinations
- **Listings** (`/listings`): filter by city, type, max price, guests; live property grid
- **Property detail** (`/property/:id`): gallery, amenities, booking widget with fee calculator, escrow message
- **My Bookings** (`/dashboard`): upcoming and past bookings for tenant (hardcoded to user ID 2 for demo)
- **Admin** (`/admin`): dark sidebar dashboard — stats, booking pipeline with status transitions, property table, live users; "Add Property" dialog
- **Broker program** (`/broker`): full broker acquisition page with earnings calculator, how-it-works, testimonials, and registration form

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`
- Drizzle Date → string: wrap all DB results in `serializeDates()` before Zod parse (see Architecture decisions)
- Express 5: wildcard routes use `/{*splat}`, async handlers typed `: Promise<void>`, returns need `return;` after `res.json()`
- `useSeedData` hook: call with `mutate(undefined, ...)` not `mutate({}, ...)`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
