import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { appConfig } from '@/config/app.config';
import { useFilterPreferences } from '@/hooks/useFilterPreferences';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ActiveFilterChips } from '@/components/ActiveFilterChips';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Row = Record<string, unknown>;

/**
 * Example view. Reads whatever table `VITE_DATA_TABLE` names and renders its
 * columns generically, so the template runs against any schema on first clone.
 * Replace this with your own views — the shell around it stays as-is.
 */
export default function Dashboard() {
  const { preferences, updatePreference } = useFilterPreferences();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['records', appConfig.dataTable],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from(appConfig.dataTable)
        .select('*')
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = useMemo(() => {
    const all = data ?? [];
    const term = preferences.search.trim().toLowerCase();
    if (!term) return all;
    return all.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(term)),
    );
  }, [data, preferences.search]);

  const columns = useMemo(
    () => (rows.length > 0 ? Object.keys(rows[0]).slice(0, 8) : []),
    [rows],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({ title: 'Data refreshed' });
    } catch (err) {
      toast({
        title: 'Refresh failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const onExport = () => {
    if (rows.length === 0) {
      toast({ title: 'Nothing to export' });
      return;
    }
    const header = columns.join(',');
    const body = rows
      .map((r) =>
        columns
          .map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appConfig.dataTable}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          preferences={preferences}
          onFilterChange={updatePreference}
          onRefresh={onRefresh}
          onExport={onExport}
          refreshing={refreshing}
        />

        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <div className="hidden lg:block">
            <BreadcrumbNav />
          </div>

          <SidebarTrigger className="fixed left-3 top-3 z-50 h-9 w-9 rounded-md border border-border bg-card/90 backdrop-blur md:hidden" />

          <main className="min-w-0 flex-1 space-y-4 p-4 pt-14 md:pt-4">
            <header className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </header>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard label="Records" value={rows.length} />
              <KpiCard label="Columns" value={columns.length} />
              <KpiCard label="Source" value={appConfig.dataTable} />
              <KpiCard
                label="Status"
                value={isLoading ? 'Loading' : error ? 'Error' : 'Ready'}
              />
            </div>

            <ActiveFilterChips
              preferences={preferences}
              onClear={updatePreference}
            />

            <Card>
              <CardContent className="space-y-3 p-3">
                <Input
                  placeholder="Search…"
                  value={preferences.search}
                  onChange={(e) => updatePreference('search', e.target.value)}
                  className="h-8 max-w-xs"
                />

                {error ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Could not read <code>{appConfig.dataTable}</code>. Set
                    <code> VITE_DATA_TABLE</code> to a table in your project.
                  </p>
                ) : isLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </p>
                ) : rows.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No records.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map((c) => (
                            <TableHead key={c} className="text-xs uppercase">
                              {c}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r, i) => (
                          <TableRow key={i}>
                            {columns.map((c) => (
                              <TableCell key={c} className="text-xs">
                                {String(r[c] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
