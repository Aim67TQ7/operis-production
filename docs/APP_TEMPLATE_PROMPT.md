# Ops App Template — Build Prompt

Paste this whole document as the first prompt of a new app built on this
template. It
describes the shell every app must ship with: layout, type, color, icons, auth,
legal, and the VIEWS | FILTERS | ACTIONS sidebar ontology. Only the nav items,
filters, actions, and page content change per app — the shell does not.

---

## 0. Prompt to paste

> Build an operations app called **{APP NAME}** that runs at
> `{APP HOST}`. It must follow the Ops App Template exactly:
> React 18 + Vite + TypeScript + Tailwind + shadcn, Supabase only (no TanStack
> unless already present), dark-first theme, desktop sidebar
> shell with VIEWS / FILTERS / ACTIONS, top breadcrumb bar on desktop only, and
> Supabase Auth. Mobile and tablet share one mobile-first
> layout. Sections 1–10 below are non-negotiable; sections 11–12 are the parts I
> fill in for this app.

---

## 1. Stack and rules

- React 18, Vite 5, Tailwind v3, TypeScript 5, shadcn/ui, lucide-react icons.
- Supabase is the only backend (DB, auth, storage, edge functions).
- `next-themes` with `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>`.
- No second font family. No purple/indigo-on-white gradients. No `text-white`,
  `bg-black`, or `bg-[#hex]` in components — semantic HSL tokens only.
- Every app is an independent app on its own host.

## 2. Layout blueprint

```text
┌──────────────────────────────────────────────────────────────┐
│ [mark] ORG NAME    HOME | APP | APP | …                     │  breadcrumb (desktop)
├───────────────┬──────────────────────────────────────────────┤
│ [mark] APP  « │ [icon] Page Title       Last Update 4h ago   │  in-content header
│ VIEWS         │ ┌────┐┌────┐┌────┐┌────┐                     │  KPI row
│ FILTERS       │ ┌──────────────────────────────────────────┐ │
│  [ALL][BMC]…  │ │ table / board / chart        [search 🔍]  │ │
│ ACTIONS       │ └──────────────────────────────────────────┘ │
│ ───────────── │                                              │
│ [«][⚙][☀][⇥]  │                                              │
│ user card     │                                              │
│ COOKIES|…|AI  │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

- Sidebar `collapsible="icon"`, full window height, desktop only.
- Breadcrumb bar sits in the main column, above content, desktop only.
- Provider wrapper uses `w-full min-h-screen`; iframe/Teams contexts use `100dvh`.
- Content order on every page: page header → KPI card row → detail table/board.
- Search lives in the table header, never in the sidebar.
- Mobile/tablet (< 1024px): identical mobile-first layout — off-canvas drawer
  (`<SidebarProvider defaultOpen={!isMobile}>`), floating `Menu` trigger
  `fixed left-3 top-3 z-50 h-9 w-9 rounded-md border border-border bg-card/90 backdrop-blur md:hidden`,
  compact sticky toolbar, card list instead of tables, independently scrolling
  content region, bottom-sheet detail views with a grab handle.

## 3. Typography

| Element | Size | Treatment |
| --- | --- | --- |
| Breadcrumb links | `0.75rem` | uppercase, `letter-spacing: 0.06em` |
| Sidebar app name | `text-sm` | `font-bold`, uppercase, `tracking-[0.18em]` |
| Group label (VIEWS/FILTERS/ACTIONS) | `text-xs` | uppercase |
| Nav item | `text-sm` | icon `h-5 w-5` |
| Table body | `text-xs`–`text-sm` | dense rows, tabular numerals for qty/dates |
| User name | `text-xs` | `font-semibold` |
| Role pill / email / legal row | `text-[10px]` | uppercase, `tracking-wide` |

Uppercase is done with CSS `text-transform`, never by mutating data strings.

## 4. Color and tokens

Brand colors are configuration, not code. Set them as CSS custom properties
in `src/styles/app-bar.css` (`--app-bar-bg`, `--app-bar-fg`,
`--app-bar-accent`) and drive the wordmark from `VITE_ORG_NAME`.

Sidebar rail baseline in `index.css`:

```css
--sidebar-background: 222 47% 11%;
--sidebar-foreground: 210 40% 96%;
--sidebar-primary: 355 82% 55%;
--sidebar-accent: 217 33% 17%;
--sidebar-border: 215 25% 27%;
```

Status semantics used everywhere: `--destructive` = late/red,
`--success` = due today/green, `--primary` = future/blue, `--warning` = at risk.
`@import "./styles/app-bar.css"` must be the FIRST line of `src/index.css`,
above the `@tailwind` directives.

## 5. Icons

lucide-react only, at fixed sizes: nav `h-5 w-5`, footer/actions `h-8 w-8`
buttons with `h-4 w-4` glyphs, inline row badges `h-3.5 w-3.5`.
Conventional set: `LayoutDashboard` dashboard, `Table`/`List` tables,
`Truck` shipping, `PackageSearch` shortages, `Kanban` boards, `Mail` email
activity, `Flag` flags, `Zap` AI actions, `RefreshCw` sync, `Download` export,
`Settings`, `Sun`/`Moon`/`Laptop`, `LogOut`/`LogIn`, `Menu`.

## 6. Breadcrumb bar

Links come from the Supabase `app_items` table where `is_new = true` — never
hardcoded. `HOME` first (case-insensitive), then alphabetical by `name`. No
current-app highlight; every link opens in a new tab
(`target="_blank" rel="noopener"`). Separator is a literal pipe `|`. Single
2.25rem sticky row, horizontally scrollable, uppercase. On error or empty
result render the brand block only — fail quietly.

## 7. Sidebar ontology — every control gets exactly one bucket

Group order is fixed: **VIEWS → FILTERS → ACTIONS**.

### VIEWS — destinations
A route that changes *what kind of object* you are looking at. First item is
always a **Dashboard** (KPI cards + at-a-glance summary). Then one item per
table/board page. A "view" that is only another view plus a filter is not a
view — collapse it into a filter.

```text
VIEWS
  ◦ Dashboard        KPI cards, counts, trend, alerts
  ◦ {Object} Table   dense table, resizable columns, header search, row detail sheet
  ◦ {Object} Board   kanban/lane view when work moves through stages
  ◦ History/Archive  server-side searched historical records
```

### FILTERS — lenses that work on EVERY page
Filters live only in the sidebar, never duplicated in a page toolbar, and are
held in ONE shared store (context / Zustand / URL params) that every view reads.
Persist the user's selection to `localStorage` plus an explicit
**Save My Filters** button that writes personal settings. Filters render as
pills/toggles, not buried dropdowns. Standard set:

```text
FILTERS
  Company / Plant   [ALL][BMC][BME][MAI]  pill toggles
  Site              pill toggles
  Segment / Type    pill toggles
  Date window       [1D][3D][30D] working-day aware, holidays excluded
  Status            e.g. Flagged only, On hold, Late
  Project/Customer  optional per-app selector
```

Every page must visibly respect the active filters; show them as removable
chips above the content.

### ACTIONS — verbs with backend calls
Each action calls Supabase (RPC, mutation, edge function, storage) and owns
loading / success / error state with a toast. Nothing that merely navigates
belongs here.

```text
ACTIONS
  ⟳ Refresh Data     invokes the sync edge function (trigger=MANUAL)
  ✉ Email Trail      builds and previews a grouped email draft
  ⬇ Export / PDF     renders a document, stores it in a bucket, records the row
  ⚡ Ask AI           edge function call (only if the app needs it)
  ✓ Approve / Push   writes back to the source system
```

## 8. Sidebar footer (identical in every app)

Fixed stacking order:
1. **Icon row** — one row of `h-8 w-8` ghost buttons:
   `SidebarTrigger` · `Settings` (omit if the app has none) · theme cycler
   `Sun`/`Moon`/`Laptop` · optional admin `Lock` · `LogOut`/`LogIn`.
   Centered when expanded, stacked when collapsed.
2. **User card** — `mx-1 rounded-md border border-sidebar-border bg-sidebar-accent/60 px-2 py-2`,
   `h-8 w-8` avatar with `ring-1 ring-sidebar-border`, name, role pill, email.
   Clicking it opens the app's own settings route.
   Profile resolution order: `public.user_settings` → Supabase `user_metadata`
   → `session.user.email`. Never stubbed.
3. **Divider** — `mx-2 mt-2 border-t border-sidebar-border`.
4. **App revision** — `01.[AI edit count].00`, from `src/lib/appVersion.ts`,
   kept in sync with `package.json`.

## 9. Legal

Legal row at the very bottom of the sidebar, `text-[10px]` uppercase
`tracking-wide`, pipes at `/40` opacity, hidden when collapsed:

```text
COOKIES | TERMS | PRIVACY | AI USAGE
```

- COOKIES fires `window.dispatchEvent(new Event("openCookiePreferences"))`.
- TERMS → in-app `/terms`; PRIVACY → in-app `/privacy`.
- AI USAGE → the deployment's AI-usage policy URL, omitted when unset.

## 10. Auth

- Standard Supabase Auth. One `/login` route with email/password and magic
  link; no app ships a bespoke identity protocol.
- `AuthGate` resolves the session before rendering and redirects only when the
  session is explicitly `null` — never while it is still unresolved.
- Optional cross-subdomain sessions: set `VITE_AUTH_COOKIE_DOMAIN` (e.g.
  `.example.com`) to store the session in chunked cookies instead of
  `localStorage`. Leave it blank for a single-host deployment.
- Sign-out clears queries, calls `signOut()`, then returns to `/login`.
- Data access: RLS on every table; `GRANT` statements in the same migration as
  every `CREATE TABLE` in `public`; roles in a separate `user_roles` table with
  a `has_role()` security-definer function — never a role column on profiles.


## 11. Fill in per app

```text
APP NAME:            {e.g. In Process}
APP HOST:            {host}
PRIMARY DATA SOURCE: {single source-of-truth table}
VIEWS:               Dashboard, {table pages}, {board}, {archive}
FILTERS:             {company/plant, site, segment, date window, status}
ACTIONS:             {refresh, email, export/pdf, push-back}
DOCUMENTS:           {PDFs generated, bucket, key format}
ROLES:               {who can edit what}
```

## 12. Definition of done

- Sidebar zones in fixed order; no filter duplicated in a page toolbar.
- Filters demonstrably apply on every view, persist across reloads, and can be
  saved to personal settings.
- Every action shows loading/success/error and touches the backend.
- Dashboard is the default view; every table page has header search, row detail
  sheet, and dense readable rows.
- Mobile and tablet render the same mobile-first layout with a bottom sheet.
- Breadcrumb, footer, legal row, and revision render exactly as specified.
- Preview/localhost bypass verified; production gate cascade verified.
- Head metadata: real app-specific `<title>` (<60 chars) and description
  (<160 chars) plus matching `og:`/`twitter:` tags.
