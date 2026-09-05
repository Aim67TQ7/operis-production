/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_ORG_NAME?: string;
  readonly VITE_APP_DESCRIPTION?: string;
  readonly VITE_LOGO_URL?: string;
  readonly VITE_THEME_COLOR?: string;
  readonly VITE_AUTH_COOKIE_DOMAIN?: string;
  readonly VITE_DATA_TABLE?: string;
  readonly VITE_CONNECTORS_JSON?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
