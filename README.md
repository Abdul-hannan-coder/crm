# LLG CRM (Next.js)

Modular Next.js CRM with TypeScript and Tailwind. All data and auth go through protected API routes; no Supabase credentials are exposed in the browser.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to your Supabase project values.
3. In Supabase Dashboard → Authentication → URL Configuration, add your app URL and redirect URL (e.g. `http://localhost:3000` and `http://localhost:3000/auth/callback` for local dev).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with email/password or Google (after configuring OAuth in Supabase).

## Structure

- **`src/app/api/`** – Protected API routes (auth, candidates, contacts, companies, tasks, deals, opportunities, pipelines, deleted-items, custom-fields, automations, smtp-settings, resumes). All require a valid session cookie.
- **`src/lib/`** – Server Supabase client (`supabase-server.ts`), auth helpers, and client API functions (`api/*.ts`). No Supabase client is used in the browser.
- **`src/types/`** – TypeScript types for entities.
- **`src/reducers/`** – Table, notification, delete-confirm, and opportunities state reducers.
- **`src/hooks/`** – `useAuth`, `useCandidates`, `useContacts`, etc., plus `useNotification`, `useTableState`, `useResumeParser`. Data hooks use the API client and optional polling.
- **`src/components/`** – Layout (Sidebar, AppLayout), auth (LoginPage), dashboard, tasks, deals, candidates, contacts, companies, opportunities, parser, settings, reports.

## Protected APIs

All table and resume APIs check the session cookie and return 401 if unauthenticated. Supabase URL and keys exist only in server environment variables, so they are not visible in the browser console or network tab.
