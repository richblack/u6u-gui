// u6u-gui API client
// 直接呼叫後端服務（純前端，無 Pages Function proxy）

const REGISTRY_URL = import.meta.env.VITE_REGISTRY_URL ?? 'https://component-registry.finally.click';
const CYPHER_URL = import.meta.env.VITE_CYPHER_URL ?? 'http://localhost:8788';
const KBDB_URL = import.meta.env.VITE_KBDB_URL ?? 'http://localhost:8787';

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

export interface WorkflowListResult {
  records: { id: string; slots?: { display_name?: string; last_run?: string; status?: string } }[];
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

// ── 零件 Registry ─────────────────────────────────────────────────────────────

export async function searchComponents(q = ''): Promise<ComponentSearchResult> {
  const url = `${REGISTRY_URL}/components/search?q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Registry error ${res.status}`);
  return res.json() as Promise<ComponentSearchResult>;
}

export async function getComponent(canonicalId: string): Promise<Component> {
  const url = `${REGISTRY_URL}/components/${encodeURIComponent(canonicalId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Registry error ${res.status}`);
  return res.json() as Promise<Component>;
}

// ── Cypher Executor ───────────────────────────────────────────────────────────

export async function executeWorkflow(req: CypherExecuteRequest): Promise<CypherExecuteResult> {
  const res = await fetch(`${CYPHER_URL}/cypher/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Cypher error ${res.status}`);
  return res.json() as Promise<CypherExecuteResult>;
}

// ── KBDB ──────────────────────────────────────────────────────────────────────

export async function listWorkflows(): Promise<WorkflowRecord[]> {
  const res = await fetch(`${KBDB_URL}/records/search?template_id=tpl-workflow`);
  if (!res.ok) return [];
  const data = (await res.json()) as WorkflowListResult;
  return (data.records ?? []).map(r => ({
    id: r.id,
    name: r.slots?.display_name ?? r.id,
    last_run: r.slots?.last_run as string | undefined,
    status: r.slots?.status as string | undefined,
    slots: r.slots,
  }));
}

export async function getWorkflow(id: string): Promise<WorkflowRecord> {
  const res = await fetch(`${KBDB_URL}/records/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`KBDB error ${res.status}`);
  const data = (await res.json()) as { id: string; slots?: Record<string, unknown> };
  return {
    id: data.id,
    name: (data.slots?.display_name as string | undefined) ?? data.id,
    slots: data.slots,
  };
}

export async function updateWorkflow(id: string, slots: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${KBDB_URL}/records/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slots }),
  });
  if (!res.ok) throw new Error(`KBDB error ${res.status}`);
}
