/**
 * Auth session storage.
 *
 * Defaults to `localStorage`. If `VITE_AUTH_COOKIE_DOMAIN` is set (e.g.
 * ".example.com") and cookies are actually writable on that domain, the session
 * is stored in chunked cookies instead so it is shared across subdomains.
 */
import { appConfig } from '@/config/app.config';

const COOKIE_MAX_AGE = 2592000; // 30 days
const CHUNK_SIZE = 3500;
const PROBE_KEY = '__cookie_probe__';

function domainAttr(): string {
  return appConfig.authCookieDomain
    ? `; domain=${appConfig.authCookieDomain}`
    : '';
}

export const cookieStorage = {
  getItem: (key: string): string | null => {
    try {
      const cookies = document.cookie.split(';');
      const chunks: string[] = [];
      let hasChunks = false;

      for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.trim().split('=');
        const value = valueParts.join('=');
        if (name.startsWith(`${key}.chunks.`)) {
          const idx = parseInt(name.split('.chunks.')[1]);
          chunks[idx] = value;
          hasChunks = true;
        }
      }

      if (hasChunks) return decodeURIComponent(chunks.filter(Boolean).join(''));

      const match = cookies.find((c) => c.trim().startsWith(`${key}=`));
      if (match) {
        const val = match.trim().split('=').slice(1).join('=');
        return val ? decodeURIComponent(val) : null;
      }
      return null;
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      cookieStorage.removeItem(key);
      const encoded = encodeURIComponent(value);
      const numChunks = Math.ceil(encoded.length / CHUNK_SIZE);
      for (let i = 0; i < numChunks; i++) {
        const chunk = encoded.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        document.cookie = `${key}.chunks.${i}=${chunk}; path=/${domainAttr()}; max-age=${COOKIE_MAX_AGE}; SameSite=None; Secure`;
      }
    } catch {
      // silently fail
    }
  },

  removeItem: (key: string): void => {
    try {
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (name === key || name.startsWith(`${key}.chunks.`)) {
          document.cookie = `${name}=; path=/${domainAttr()}; max-age=0; SameSite=None; Secure`;
        }
      }
    } catch {
      // silently fail
    }
  },
};

function canWriteCookie(): boolean {
  try {
    document.cookie = `${PROBE_KEY}=1; path=/${domainAttr()}; max-age=60; SameSite=None; Secure`;
    const ok = document.cookie
      .split(';')
      .some((c) => c.trim().startsWith(`${PROBE_KEY}=`));
    if (ok) {
      document.cookie = `${PROBE_KEY}=; path=/${domainAttr()}; max-age=0; SameSite=None; Secure`;
    }
    return ok;
  } catch {
    return false;
  }
}

export function getAuthStorage() {
  if (typeof window === 'undefined') return undefined;
  const domain = appConfig.authCookieDomain;
  if (!domain) return window.localStorage;

  const host = window.location.hostname;
  const bare = domain.replace(/^\./, '');
  const onDomain = host === bare || host.endsWith(`.${bare}`);
  if (onDomain && canWriteCookie()) return cookieStorage;

  return window.localStorage;
}
