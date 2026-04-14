/**
 * WorkflowsPage — Workflow 管理頁面（Dogfooding：全用 Web Components）
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { listWorkflows, executeWorkflow, logAction } from '../api';
import type { WorkflowRecord } from '../api';
import { usePoll } from '../hooks/usePoll';

// 動態載入 Web Components
if (typeof window !== 'undefined') {
  void import(/* @vite-ignore */ '@u6u-wc/u6u-list-item').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-btn').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-badge').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-empty-state').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-spinner').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-alert').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-stack').catch(() => {});
}

interface WorkflowsPageProps {
  onEditWorkflow: (id: string) => void;
}

// status → u6u-badge variant
function statusToVariant(status?: string): string {
  const map: Record<string, string> = {
    success: 'success',
    running: 'running',
    failed: 'error',
    pending: 'default',
  };
  return map[status?.toLowerCase() ?? ''] ?? 'default';
}

// ── 單一 Workflow 項目 ────────────────────────────────────────────────────────

interface WorkflowItemProps {
  wf: WorkflowRecord;
  isRunning: boolean;
  runResult?: string;
  onEdit: () => void;
  onRun: () => void;
}

function WorkflowItem({ wf, isRunning, runResult, onEdit, onRun }: WorkflowItemProps) {
  const editBtnRef = useRef<HTMLElement>(null);
  const runBtnRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const editEl = editBtnRef.current;
    if (editEl) {
      const h = (e: Event) => { e.stopPropagation(); onEdit(); };
      editEl.addEventListener('click', h);
      return () => editEl.removeEventListener('click', h);
    }
  }, [onEdit]);

  useEffect(() => {
    const runEl = runBtnRef.current;
    if (runEl) {
      const h = (e: Event) => { e.stopPropagation(); onRun(); };
      runEl.addEventListener('click', h);
      return () => runEl.removeEventListener('click', h);
    }
  }, [onRun]);

  return (
    <u6u-list-item
      title={wf.name}
      subtitle={wf.id}
      item-id={wf.id}
    >
      {/* meta slot：狀態 badge + 最後執行時間 + run result */}
      <div slot="meta" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
        {wf.status && (
          <u6u-badge label={wf.status} variant={statusToVariant(wf.status)} />
        )}
        {wf.last_run && (
          <span style={{ fontSize: '11px', color: '#52525b' }}>
            最後執行：{new Date(wf.last_run).toLocaleString('zh-TW')}
          </span>
        )}
        {runResult && (
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{runResult}</span>
        )}
      </div>

      {/* actions slot */}
      <div slot="actions" style={{ display: 'flex', gap: '8px' }}>
        <u6u-btn
          ref={editBtnRef}
          label="編輯"
          color="#3f3f46"
        />
        <u6u-btn
          ref={runBtnRef}
          label={isRunning ? '執行中…' : '▶ 執行'}
          color="#059669"
          disabled={isRunning ? '' : undefined}
        />
      </div>
    </u6u-list-item>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────

export default function WorkflowsPage({ onEditWorkflow }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<Record<string, string>>({});
  const refreshBtnRef = useRef<HTMLElement>(null);

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

  // 重新整理按鈕
  useEffect(() => {
    const el = refreshBtnRef.current;
    if (!el) return;
    const h = () => { void load(); };
    el.addEventListener('click', h);
    return () => el.removeEventListener('click', h);
  }, [load]);

  // Poll（5 秒）
  usePoll(load, 5000, true);

  const handleRun = useCallback(async (wf: WorkflowRecord) => {
    setRunningId(wf.id);
    try {
      const tripletsRaw = (wf.slots?.triplets as string | undefined) ?? '';
      const triplets = tripletsRaw.split('\n').filter(Boolean);
      const result = await executeWorkflow({ triplets, context: {} });
      const resultText = result.success ? '✅ 執行成功' : `❌ ${result.error ?? '執行失敗'}`;
      setRunResults(prev => ({ ...prev, [wf.id]: resultText }));
      logAction('RUN_WORKFLOW', {
        workflow_id: wf.id,
        success: result.success,
        error: result.error,
      });
    } catch (e) {
      const errText = `❌ ${e instanceof Error ? e.message : '執行失敗'}`;
      setRunResults(prev => ({ ...prev, [wf.id]: errText }));
      logAction('RUN_WORKFLOW', { workflow_id: wf.id, success: false, error: errText });
    } finally {
      setRunningId(null);
    }
  }, []);

  return (
    <u6u-stack gap="16px">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#52525b' }}>
          {loading ? '載入中…' : `共 ${workflows.length} 個 Workflow`}
        </p>
        <u6u-btn
          ref={refreshBtnRef}
          label="↻ 重新整理"
          color="#3f3f46"
        />
      </div>

      {/* 錯誤 */}
      {error && <u6u-alert variant="error" message={error} />}

      {/* 載入中 */}
      {loading && (
        <div className="flex justify-center py-8">
          <u6u-spinner size="md" />
        </div>
      )}

      {/* 空狀態 */}
      {!loading && !error && workflows.length === 0 && (
        <u6u-empty-state icon="⚡" title="尚無 Workflow" description="透過畫布建立第一個 Workflow" />
      )}

      {/* Workflow 清單 */}
      {!loading && workflows.map(wf => (
        <WorkflowItem
          key={wf.id}
          wf={wf}
          isRunning={runningId === wf.id}
          runResult={runResults[wf.id]}
          onEdit={() => {
            logAction('OPEN_WORKFLOW', { workflow_id: wf.id, name: wf.name });
            onEditWorkflow(wf.id);
          }}
          onRun={() => void handleRun(wf)}
        />
      ))}
    </u6u-stack>
  );
}
