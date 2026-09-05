/**
 * Single source of truth for everything company-specific.
 *
 * Nothing in this template hardcodes a brand, a domain, or a backend. Adopters
 * set these in `.env` (copy `.env.example`) and never touch application code.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill it in — see README.md.`,
    );
  }
  return value;
}

export const appConfig = {
  /** Shown in the sidebar, breadcrumb, document title and PWA manifest. */
  name: import.meta.env.VITE_APP_NAME ?? 'Ops Daily',
  /** Organisation that owns this deployment. */
  orgName: import.meta.env.VITE_ORG_NAME ?? 'Your Company',
  description:
    import.meta.env.VITE_APP_DESCRIPTION ?? 'Operations tracking dashboard',
  /** Served from `public/`, or an absolute URL. */
  logoUrl: import.meta.env.VITE_LOGO_URL ?? '/logo.svg',
  themeColor: import.meta.env.VITE_THEME_COLOR ?? '#1a1a2e',

  supabase: {
    get url() {
      return required(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL');
    },
    get anonKey() {
      return required(
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'VITE_SUPABASE_PUBLISHABLE_KEY',
      );
    },
  },

  /**
   * Optional cookie domain for sharing a session across subdomains
   * (e.g. ".example.com"). Leave unset to use localStorage only.
   */
  authCookieDomain: import.meta.env.VITE_AUTH_COOKIE_DOMAIN ?? '',

  /** Table backing the generic example view. */
  dataTable: import.meta.env.VITE_DATA_TABLE ?? 'records',
} as const;
