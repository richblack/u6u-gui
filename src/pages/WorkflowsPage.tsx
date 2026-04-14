/**
 * WorkflowsPage — Workflow 管理頁面
 * 列出所有 Workflow，支援編輯（跳至畫布）與執行
 */

import { useState, useEffect, useCallback } from 'react';
import { listWorkflows, executeWorkflow } from '../api';
import type { WorkflowRecord } from '../api';

interface WorkflowsPageProps {
  onEditWorkflow: (id: string) => void;
}

// ── 狀態標籤 ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const colors: Record<string, string> = {
    success: 'bg-emerald-900/50 text-emerald-400',
    running: 'bg-blue-900/50 text-blue-400 animate-pulse',
    failed: 'bg-red-900/50 text-red-400',
    pending: 'bg-zinc-800 text-zinc-400',
  };
  const cls = colors[status.toLowerCase()] ?? 'bg-zinc-800 text-zinc-400';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────

export default function WorkflowsPage({ onEditWorkflow }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleRun = useCallback(async (wf: WorkflowRecord) => {
    setRunningId(wf.id);
    try {
      // 從 slots 取出 triplets
      const tripletsRaw = (wf.slots?.triplets as string | undefined) ?? '';
      const triplets = tripletsRaw.split('\n').filter(Boolean);
      const result = await executeWorkflow({ triplets, context: {} });
      setRunResults(prev => ({
        ...prev,
        [wf.id]: result.success ? '✅ 執行成功' : `❌ ${result.error ?? '執行失敗'}`,
      }));
    } catch (e) {
      setRunResults(prev => ({
        ...prev,
        [wf.id]: `❌ ${e instanceof Error ? e.message : '執行失敗'}`,
      }));
    } finally {
      setRunningId(null);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          {loading ? '載入中…' : `共 ${workflows.length} 個 Workflow`}
        </p>
        <button
          onClick={() => void load()}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ↻ 重新整理
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>
      )}

      {!loading && !error && workflows.length === 0 && (
        <div className="text-center py-12 text-zinc-600">
          <p className="text-2xl mb-2">⚡</p>
          <p className="text-sm">尚無 Workflow</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {workflows.map(wf => (
          <div
            key={wf.id}
            className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-zinc-100 truncate">{wf.name}</span>
                <StatusBadge status={wf.status} />
              </div>
              <p className="text-xs text-zinc-500 font-mono truncate">{wf.id}</p>
              {wf.last_run && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  最後執行：{new Date(wf.last_run).toLocaleString('zh-TW')}
                </p>
              )}
              {runResults[wf.id] && (
                <p className="text-xs mt-1 text-zinc-400">{runResults[wf.id]}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEditWorkflow(wf.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
              >
                編輯
              </button>
              <button
                onClick={() => void handleRun(wf)}
                disabled={runningId === wf.id}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              >
                {runningId === wf.id ? '執行中…' : '▶ 執行'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
