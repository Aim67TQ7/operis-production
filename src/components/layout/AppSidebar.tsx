import { LayoutDashboard, Table as TableIcon, RefreshCw, Download } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { appConfig } from '@/config/app.config';
import { SidebarUserFooter } from '@/components/layout/SidebarUserFooter';
import {
  DATE_WINDOW_LABELS,
  type DateWindow,
  type FilterPreferences,
} from '@/hooks/useFilterPreferences';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  preferences: FilterPreferences;
  onFilterChange: <K extends keyof FilterPreferences>(
    key: K,
    value: FilterPreferences[K],
  ) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  refreshing?: boolean;
}

/**
 * The shell's fixed ontology: VIEWS (destinations) -> FILTERS (lenses that
 * apply on every page) -> ACTIONS (verbs that call the backend).
 */
export function AppSidebar({
  preferences,
  onFilterChange,
  onRefresh,
  onExport,
  refreshing = false,
}: AppSidebarProps) {
  const windows = Object.keys(DATE_WINDOW_LABELS) as DateWindow[];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <span className="text-sm font-bold uppercase tracking-[0.18em]">
          {appConfig.name}
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase">
            Views
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/records">
                    <TableIcon className="h-5 w-5" />
                    <span>Records</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase">
            Filters
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-2">
            <div className="flex flex-wrap gap-1">
              {windows.map((w) => (
                <Button
                  key={w}
                  size="sm"
                  variant={preferences.dateWindow === w ? 'default' : 'outline'}
                  className="h-6 px-2 text-[10px] uppercase tracking-wide"
                  onClick={() => onFilterChange('dateWindow', w)}
                >
                  {DATE_WINDOW_LABELS[w]}
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase">
            Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onRefresh} disabled={refreshing}>
                  <RefreshCw
                    className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
                  />
                  <span>{refreshing ? 'Refreshing…' : 'Refresh Data'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onExport}>
                  <Download className="h-5 w-5" />
                  <span>Export CSV</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter settingsEnabled={false} />
    </Sidebar>
  );
}
