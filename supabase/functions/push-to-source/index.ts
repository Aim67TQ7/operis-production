/**
 * Generic outbound connector.
 *
 * Reads a connector definition from the `connections` table, resolves its
 * credentials from this function's own environment (never from the client),
 * and forwards the request to the external system.
 *
 * Per-connector secrets are looked up by `auth_secret_ref`. For a connector
 * with auth_secret_ref = "ERP", set these in your function secrets:
 *
 *   ERP_AUTH_MODE   one of: basic | bearer | apikey   (default: basic)
 *   ERP_USERNAME    basic auth user
 *   ERP_PASSWORD    basic auth password
 *   ERP_TOKEN       bearer token
 *   ERP_API_KEY     api key
 *   ERP_API_KEY_HEADER  header name for the api key (default: x-api-key)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface PushRequest {
  connectorId: string;
  resource: string;
  method?: string;
  payload?: Record<string, unknown>;
}

function authHeaders(ref: string): Record<string, string> {
  const p = ref.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const mode = (Deno.env.get(`${p}_AUTH_MODE`) ?? 'basic').toLowerCase();

  if (mode === 'bearer') {
    const token = Deno.env.get(`${p}_TOKEN`);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  if (mode === 'apikey') {
    const key = Deno.env.get(`${p}_API_KEY`);
    const header = Deno.env.get(`${p}_API_KEY_HEADER`) ?? 'x-api-key';
    return key ? { [header]: key } : {};
  }

  const user = Deno.env.get(`${p}_USERNAME`);
  const pass = Deno.env.get(`${p}_PASSWORD`);
  if (!user || !pass) return {};
  return { Authorization: `Basic ${btoa(`${user}:${pass}`)}` };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = (await req.json()) as PushRequest;
    if (!body?.connectorId || !body?.resource) {
      return json({ ok: false, error: 'connectorId and resource are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: connector, error } = await supabase
      .from('connections')
      .select('base_url, auth_secret_ref, is_active, metadata_json')
      .eq('id', body.connectorId)
      .maybeSingle();

    if (error) return json({ ok: false, error: error.message }, 500);
    if (!connector) return json({ ok: false, error: 'Unknown connector' }, 404);
    if (!connector.is_active) {
      return json({ ok: false, error: 'Connector is inactive' }, 409);
    }

    const base = String(connector.base_url).replace(/\/+$/, '');
    const path = body.resource.replace(/^\/+/, '');
    const url = `${base}/${path}`;

    const extraHeaders =
      (connector.metadata_json?.headers as Record<string, string>) ?? {};

    const upstream = await fetch(url, {
      method: body.method ?? 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(connector.auth_secret_ref ?? body.connectorId),
        ...extraHeaders,
      },
      body: body.payload ? JSON.stringify(body.payload) : undefined,
    });

    const text = await upstream.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      // upstream returned non-JSON; pass the raw text through
    }

    return json({ ok: upstream.ok, status: upstream.status, body: parsed });
  } catch (err) {
    return json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});
