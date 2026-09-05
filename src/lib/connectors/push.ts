import { supabase } from '@/integrations/supabase/client';
import type { ConnectorPushRequest } from './types';

export interface ConnectorPushResult {
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
}

/**
 * Write to an external system through the `push-to-source` edge function.
 * Credentials stay server-side; the browser only names the connector.
 */
export async function pushToSource(
  req: ConnectorPushRequest,
): Promise<ConnectorPushResult> {
  const { data, error } = await supabase.functions.invoke('push-to-source', {
    body: req,
  });

  if (error) return { ok: false, error: error.message };
  return (data as ConnectorPushResult) ?? { ok: true };
}
