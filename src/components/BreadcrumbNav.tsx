import { Home } from 'lucide-react';
import { useBreadcrumbApps } from '@/hooks/useBreadcrumbApps';
import { appConfig } from '@/config/app.config';

/**
 * Cross-app bar. Links come from the `app_items` table, never hardcoded, and
 * the bar fails quietly to the brand block alone when that table is absent —
 * so a fresh install with no data still renders correctly.
 */
export function BreadcrumbNav() {
  const { apps } = useBreadcrumbApps();

  return (
    <nav aria-label={`${appConfig.orgName} apps`} className="app-bar">
      <span className="app-bar-brand">
        <img
          src={appConfig.logoUrl}
          alt=""
          aria-hidden="true"
          className="app-bar-logo"
        />
        <span className="app-bar-word">{appConfig.orgName}</span>
        <a href="/" aria-label="Home" className="app-bar-home">
          <Home className="h-3.5 w-3.5" />
        </a>
      </span>

      {apps.length > 0 && (
        <span className="app-bar-links">
          {apps.map((app, i) => (
            <span key={app.id} className="flex items-center gap-1">
              {i > 0 && <span className="app-bar-sep">|</span>}
              <a
                href={app.url ?? '#'}
                target="_blank"
                rel="noopener"
                className="app-bar-link"
              >
                {app.name}
              </a>
            </span>
          ))}
        </span>
      )}
    </nav>
  );
}
