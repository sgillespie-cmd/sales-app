# Wedding Venue Planner

This repository contains a starter Next.js application and schema scaffolding for a wedding venue planning tool.

## What is included

- Next.js App Router project with TypeScript and Tailwind CSS
- Landing page for venues (`/venues`)
- Venue profile page template (`/venues/[venueId]`)
- Starter API routes under `src/app/api/*`
- Validation and API contract types under `src/lib/validation` and `src/lib/types`
- Supabase SQL migrations under `supabase/migrations`

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`

## Environment variables

To wire real Supabase data, define:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only needed for service-role operations)

Without these variables, the app uses demo in-memory data for initial UI and API scaffolding.

## Database setup

Run the SQL files in order:

1. `supabase/migrations/0001_init_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_bootstrap_account.sql`

## Notes

- This is a starter implementation spec in code form.
- Several API handlers are intentionally scaffolded and return placeholder/demo responses.
- Next iteration should connect all handlers to Supabase queries and auth-aware account resolution.
