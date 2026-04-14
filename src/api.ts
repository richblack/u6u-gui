// u6u-gui API client
// 所有請求統一走 u6u-mcp（單一後端、單一認證點）
// 直接呼叫 KBDB 僅保留於 fallback 相容路徑

const MCP_URL = import.meta.env.VITE_MCP_URL ?? 'http://localhost:8788';
const REGISTRY_URL = import.meta.env.VITE_REGISTRY_URL ?? 'https://component-registry.finally.click';
const CYPHER_URL = import.meta.env.VITE_CYPHER_URL ?? 'http://localhost:8789';

// ── 認證管理 ──────────────────────────────────────────────────────────────────

let _apiKey: string | null = null;

export function setApiKey(key: string): void {
  _apiKey = key;
}

function authHeaders(): Record<string, string> {
  return _apiKey ? { 'Authorization': `Bearer ${_apiKey}` } : {};
}

// ── 型別 ──────────────────────────────────────────────────────────────────────

export interface Component {
  canonical_id: string;
  display_name: string;
  category: string;
  version: string;
  stability: string;
  success_rate?: number;
  description?: string;
  contract?: Record<string, unknown>;
}

export interface ComponentSearchResult {
  components: Component[];
  total: number;
}

export interface WorkflowRecord {
  id: string;
  name: string;
  last_run?: string;
  status?: string;
  slots?: Record<string, unknown>;
}

export interface CypherExecuteRequest {
  triplets: string[];
  context: Record<string, unknown>;
}

export interface CypherExecuteResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

// ── 認證 ──────────────────────────────────────────────────────────────────────

export interface VerifyResult {
  valid: boolean;
  org_namespace?: string;
}

export async function verifyApiKey(key: string): Promise<VerifyResult> {
  const res = await fetch(`${MCP_URL}/auth/verify`, {
    headers: { 'Authorization': `Bearer ${key}` },
  });
  if (!res.ok) return { valid: false };
  return res.json() as Promise<VerifyResult>;
}

// ── Action Log（fire-and-forget，不 await，失敗靜默忽略） ─────────────────────

export function logAction(
  actionType: string,
  payload: Record<string, unknown> = {}
): void {
  if (!_apiKey) return;
  fetch(`${MCP_URL}/action-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      action_type: actionType,
      payload,
      occurred_at: new Date().toISOString(),
    }),
  }).catch(() => {}); // 靜默忽略任何錯誤
}

// ── 零件 Registry ─────────────────────────────────────────────────────────────

export async function searchComponents(q = ''): Promise<ComponentSearchResult> {
  const url = `${REGISTRY_URL}/components/search?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Registry error ${res.status}`);
  return res.json() as Promise<ComponentSearchResult>;
}

export async function getComponent(canonicalId: string): Promise<Component> {
  const url = `${REGISTRY_URL}/components/${encodeURIComponent(canonicalId)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Registry error ${res.status}`);
  return res.json() as Promise<Component>;
}

// ── Cypher Executor ───────────────────────────────────────────────────────────

export async function executeWorkflow(req: CypherExecuteRequest): Promise<CypherExecuteResult> {
  const res = await fetch(`${CYPHER_URL}/cypher/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Cypher error ${res.status}`);
  return res.json() as Promise<CypherExecuteResult>;
}

// ── Workflow（透過 u6u-mcp REST 端點） ───────────────────────────────────────

export async function listWorkflows(): Promise<WorkflowRecord[]> {
  const res = await fetch(`${MCP_URL}/workflows`, { headers: authHeaders() });
  if (!res.ok) return [];
  const data = (await res.json()) as { workflows: WorkflowRecord[] };
  return data.workflows ?? [];
}

export async function getWorkflow(id: string): Promise<WorkflowRecord> {
  const res = await fetch(`${MCP_URL}/workflows/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`MCP error ${res.status}`);
  return res.json() as Promise<WorkflowRecord>;
}

export async function updateWorkflow(id: string, slots: Record<string, unknown>): Promise<void> {
  // KBDB PUT via MCP proxy（暫時直接呼叫 KBDB，後續可移至 mcp endpoint）
  const KBDB_URL = import.meta.env.VITE_KBDB_URL ?? 'http://localhost:8787';
  const res = await fetch(`${KBDB_URL}/records/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ slots }),
  });
  if (!res.ok) throw new Error(`KBDB error ${res.status}`);
}

// ── Prototype Pages（透過 u6u-mcp REST 端點） ─────────────────────────────────

export interface PrototypePageRecord {
  id: string;
  page_name: string;
  components_json: string;
  last_edited_by: string;
  last_edited_at: string;
  status: string;
}

export async function listPrototypePages(): Promise<PrototypePageRecord[]> {
  const res = await fetch(`${MCP_URL}/prototype-pages`, { headers: authHeaders() });
  if (!res.ok) return [];
  const data = (await res.json()) as { pages: PrototypePageRecord[] };
  return data.pages ?? [];
}

export async function createPrototypePage(pageName: string): Promise<PrototypePageRecord> {
  const res = await fetch(`${MCP_URL}/prototype-pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ page_name: pageName }),
  });
  if (!res.ok) throw new Error(`MCP error ${res.status}`);
  return res.json() as Promise<PrototypePageRecord>;
}

export async function getPrototypePage(recordId: string): Promise<PrototypePageRecord> {
  const res = await fetch(`${MCP_URL}/prototype-pages/${encodeURIComponent(recordId)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`MCP error ${res.status}`);
  return res.json() as Promise<PrototypePageRecord>;
}

export async function savePrototypePage(
  recordId: string,
  elements: unknown[],
  pageName?: string
): Promise<void> {
  const res = await fetch(`${MCP_URL}/prototype-pages/${encodeURIComponent(recordId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      components_json: JSON.stringify(elements),
      ...(pageName !== undefined ? { page_name: pageName } : {}),
    }),
  });
  if (!res.ok) throw new Error(`MCP error ${res.status}`);
}
