import { supabase } from '@/integrations/supabase/client';
import type { Connector } from './types';

interface ConnectionRow {
  id: string;
  system_type: string;
  display_name: string;
  base_url: string;
  is_active: boolean;
  auth_secret_ref: string | null;
  metadata_json: Record<string, unknown> | null;
}

function fromRow(r: ConnectionRow): Connector {
  return {
    id: String(r.id),
    systemType: r.system_type,
    displayName: r.display_name,
    baseUrl: r.base_url,
    isActive: r.is_active,
    authSecretRef: r.auth_secret_ref,
    metadata: r.metadata_json ?? {},
  };
}

function fromEnv(): Connector[] {
  const raw = import.meta.env.VITE_CONNECTORS_JSON;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<Connector>[];
    return parsed.map((c) => ({
      id: String(c.id ?? ''),
      systemType: c.systemType ?? 'rest',
      displayName: c.displayName ?? String(c.id ?? 'Connector'),
      baseUrl: c.baseUrl ?? '',
      isActive: c.isActive ?? true,
      authSecretRef: c.authSecretRef ?? null,
      metadata: c.metadata ?? {},
    }));
  } catch {
    console.warn('[connectors] VITE_CONNECTORS_JSON is not valid JSON');
    return [];
  }
}

/**
 * Load active connectors, preferring the `connections` table and falling back
 * to `VITE_CONNECTORS_JSON`. Fails quietly to the env fallback so a fresh
 * install with no table still runs.
 */
export async function loadConnectors(): Promise<Connector[]> {
  const { data, error } = await supabase
    .from('connections')
    .select(
      'id, system_type, display_name, base_url, is_active, auth_secret_ref, metadata_json',
    )
    .eq('is_active', true);

  if (error || !data) return fromEnv();
  return (data as ConnectionRow[]).map(fromRow);
}
