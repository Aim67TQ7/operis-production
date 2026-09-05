# Ops Daily — operations app template

A re-brandable React + Supabase operations dashboard. Nothing in this template
hardcodes a company, a domain, or a backend: point it at your own Supabase
project, describe your external systems as connector rows, and it runs.

## Quick start

```sh
npm install
cp .env.example .env      # fill in your Supabase URL + publishable key
npm run dev               # http://localhost:8080
```

The app fails fast with a clear message if `VITE_SUPABASE_URL` or
`VITE_SUPABASE_PUBLISHABLE_KEY` is missing, rather than silently pointing at
the wrong project.

## Configure

Everything company-specific lives in `.env` and is read through
[`src/config/app.config.ts`](src/config/app.config.ts). No application code
needs editing to re-brand.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | **Required.** Your project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Required.** Your anon/publishable key |
| `VITE_APP_NAME` | Sidebar title, page title, PWA name |
| `VITE_ORG_NAME` | Organisation shown in the app bar |
| `VITE_APP_DESCRIPTION` | Meta description and PWA description |
| `VITE_LOGO_URL` | Logo path or absolute URL |
| `VITE_THEME_COLOR` | Browser chrome / PWA theme colour |
| `VITE_AUTH_COOKIE_DOMAIN` | Optional. Share a session across subdomains, e.g. `.example.com`. Blank uses `localStorage` |
| `VITE_DATA_TABLE` | Table backing the example dashboard view |
| `VITE_CONNECTORS_JSON` | Optional local fallback for connector definitions |

## Database

Apply the starter schema:

```sh
npx supabase link --project-ref <your-ref>
npx supabase db push
```

`supabase/migrations/0001_init.sql` creates `user_roles`, `user_settings`,
`connections` and `app_items` — each with RLS enabled and its `GRANT`s in the
same migration. Roles live in their own table behind a `has_role()`
security-definer function, never as a column on a profile.

Generate types for your own schema:

```sh
npx supabase gen types typescript --project-id <your-ref> > src/integrations/supabase/types.ts
```

The template ships a permissive stub so it compiles against any project. Do not
commit types generated from a database holding production data — the generated
file names every table, column and enum in the schema.

## Connectors

External systems are **data, not code**. Insert a row into `connections`:

| Column | Meaning |
| --- | --- |
| `system_type` | `rest`, `odata`, `graphql`, … |
| `display_name` | Shown in the UI |
| `base_url` | Root URL of the external API |
| `auth_secret_ref` | Names a server-side secret; credentials never reach the browser |
| `metadata_json` | Endpoint paths, field mappings, extra headers |

Writes go through the `push-to-source` edge function, which resolves
credentials from its own environment. For a connector with
`auth_secret_ref = "ERP"`, set function secrets `ERP_AUTH_MODE`
(`basic` | `bearer` | `apikey`), plus `ERP_USERNAME`/`ERP_PASSWORD`,
`ERP_TOKEN`, or `ERP_API_KEY` as appropriate.

```sh
npx supabase functions deploy push-to-source
npx supabase secrets set ERP_AUTH_MODE=basic ERP_USERNAME=… ERP_PASSWORD=…
```

From the client:

```ts
import { pushToSource } from '@/lib/connectors/push';

await pushToSource({
  connectorId: '<connections.id>',
  resource: 'SalesOrders(123)',
  method: 'PATCH',
  payload: { Note: 'Updated from Ops Daily' },
});
```

## Auth

Standard Supabase Auth — email/password or magic link, at `/login`.
[`AuthGate`](src/components/AuthGate.tsx) resolves the session before rendering
and only redirects when the session is explicitly absent, never while it is
still unknown.

## Shell conventions

The sidebar uses a fixed ontology, and every control gets exactly one bucket:

- **VIEWS** — destinations. A route that changes what kind of object you see.
- **FILTERS** — lenses that apply on *every* page, held in one shared store
  ([`useFilterPreferences`](src/hooks/useFilterPreferences.ts)), persisted to
  `localStorage`, and surfaced as removable chips above content.
- **ACTIONS** — verbs that call the backend, each owning its loading, success
  and error state.

Search lives in the table header, never in the sidebar. See
[`docs/APP_TEMPLATE_PROMPT.md`](docs/APP_TEMPLATE_PROMPT.md) for the full spec.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Tech stack

React 18, Vite 5, TypeScript, Tailwind 3, shadcn/ui, lucide-react,
TanStack Query, Supabase, vite-plugin-pwa.
