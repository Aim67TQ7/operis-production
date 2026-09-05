import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BreadcrumbApp {
  id: string;
  name: string;
  url: string | null;
}

function orderApps(rows: BreadcrumbApp[]): BreadcrumbApp[] {
  return [...rows].sort((a, b) => {
    const aHome = (a.name ?? "").trim().toUpperCase() === "HOME" ? 0 : 1;
    const bHome = (b.name ?? "").trim().toUpperCase() === "HOME" ? 0 : 1;
    if (aHome !== bHome) return aHome - bHome;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

/**
 * Cross-app breadcrumb source: app_items rows flagged is_new = true.
 * Fails quietly — an error yields an empty list so the bar simply disappears.
 */
export function useBreadcrumbApps() {
  const { data, isLoading } = useQuery({
    queryKey: ["breadcrumb-apps"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<BreadcrumbApp[]> => {
      const { data, error } = await (supabase as any)
        .from("app_items")
        .select("id, name, url, is_new")
        .eq("is_new", true);

      if (error || !data) return [];

      return orderApps(
        (data as any[])
          .filter((r) => r?.name)
          .map((r) => ({ id: String(r.id), name: r.name as string, url: r.url ?? null })),
      );
    },
  });

  return { apps: data ?? [], isLoading };
}
