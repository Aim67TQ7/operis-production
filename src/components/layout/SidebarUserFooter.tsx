import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop, Settings, LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/context/CurrentUserContext';
import { APP_REV } from '@/lib/appVersion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarFooter, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

interface SidebarUserFooterProps {
  /** Set false when the app has no settings surface. */
  settingsEnabled?: boolean;
  settingsTo?: string;
  /** Optional AI-usage policy link. Omitted from the legal row when unset. */
  aiUsageHref?: string;
}

const initials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';

/**
 * Sidebar footer: icon row (collapse / settings / theme / auth) -> user card
 * -> divider -> app revision -> legal row.
 */
export function SidebarUserFooter({
  settingsEnabled = true,
  settingsTo = '/settings',
  aiUsageHref,
}: SidebarUserFooterProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { theme, setTheme } = useTheme();
  const user = useCurrentUser();
  const navigate = useNavigate();

  const cycleTheme = () =>
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark');

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <SidebarFooter className="gap-2">
      <div
        className={
          collapsed
            ? 'flex flex-col items-center gap-1'
            : 'flex items-center justify-center gap-1'
        }
      >
        <SidebarTrigger className="h-8 w-8" />

        {settingsEnabled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={settingsTo}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={cycleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent"
              aria-label="Change theme"
            >
              <ThemeIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Theme: {theme ?? 'system'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            {user.id ? (
              <button
                type="button"
                onClick={signOut}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent"
                aria-label="Sign in"
              >
                <LogIn className="h-4 w-4" />
              </Link>
            )}
          </TooltipTrigger>
          <TooltipContent>{user.id ? 'Sign out' : 'Sign in'}</TooltipContent>
        </Tooltip>
      </div>

      {!collapsed && user.isReady && (user.name || user.email) && (
        <div className="mx-1 flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/60 px-2 py-2">
          <Avatar className="h-8 w-8 ring-1 ring-sidebar-border">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="text-[10px]">
              {initials(user.name ?? user.email ?? 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {user.name ?? 'User'}
            </p>
            {user.role && (
              <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                {user.role}
              </p>
            )}
            {user.email && (
              <p className="truncate text-[10px] text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
      )}

      {!collapsed && (
        <>
          <div className="mx-2 mt-2 border-t border-sidebar-border" />
          <p className="px-2 text-[10px] uppercase tracking-wide text-muted-foreground/60">
            Rev {APP_REV}
          </p>
          <div className="flex flex-wrap gap-1 px-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <button
              type="button"
              className="hover:underline"
              onClick={() =>
                window.dispatchEvent(new Event('openCookiePreferences'))
              }
            >
              Cookies
            </button>
            <span className="opacity-40">|</span>
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
            <span className="opacity-40">|</span>
            <Link to="/privacy" className="hover:underline">
              Privacy
            </Link>
            {aiUsageHref && (
              <>
                <span className="opacity-40">|</span>
                <a
                  href={aiUsageHref}
                  target="_blank"
                  rel="noopener"
                  className="hover:underline"
                >
                  AI Usage
                </a>
              </>
            )}
          </div>
        </>
      )}
    </SidebarFooter>
  );
}
