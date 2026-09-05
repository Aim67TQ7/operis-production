/**
 * A connector is one external system this deployment can read from or write to.
 *
 * Definitions are data, not code: they live in the `connections` table (or in
 * `VITE_CONNECTORS_JSON` for local development), so adopting a new source
 * system means inserting a row, not editing the app.
 */
export interface Connector {
  id: string;
  /** Free-form discriminator, e.g. "rest", "odata", "graphql", "soap". */
  systemType: string;
  displayName: string;
  baseUrl: string;
  isActive: boolean;
  /**
   * Name of the server-side secret holding this connector's credentials.
   * Credentials themselves never reach the browser — the edge function
   * resolves this reference from its own environment.
   */
  authSecretRef?: string | null;
  /** Per-connector settings: endpoint paths, field mappings, company codes. */
  metadata: Record<string, unknown>;
}

export interface ConnectorPushRequest {
  connectorId: string;
  /** Resource path appended to the connector's baseUrl. */
  resource: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT';
  payload?: Record<string, unknown>;
}
