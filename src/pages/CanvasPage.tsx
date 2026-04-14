/**
 * CanvasPage — 畫布頁面
 * 整合 Canvas 元件，連接 KBDB 與 Cypher Executor
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { U6uTriggerDetail } from '../types/web-components';
import { listWorkflows, updateWorkflow, executeWorkflow, getWorkflow, logAction } from '../api';
import { usePoll } from '../hooks/usePoll';

// 動態載入 Web Components
if (typeof window !== 'undefined' && !customElements.get('u6u-btn')) {
  void import(/* @vite-ignore */ '@u6u-wc/u6u-btn').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-card').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-text-input').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-text-field').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-badge').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-alert').catch(() => {});
  void import(/* @vite-ignore */ '@u6u-wc/u6u-select').catch(() => {});
}

// ── 型別 ──────────────────────────────────────────────────────────────────────

type CanvasState = 'UIView' | 'LogicView' | 'Editing' | 'Saving';

interface Triplet {
  id: string;
  subject: string;
  predicate: string;
  object: string;
}

interface WorkflowRecord {
  id: string;
  name: string;
}

// ── 工具函數 ──────────────────────────────────────────────────────────────────

function parseTripletLine(line: string, index: number): Triplet | null {
  const parts = line.split('>>').map(s => s.trim());
  if (parts.length !== 3) return null;
  return { id: `t-${index}`, subject: parts[0], predicate: parts[1], object: parts[2] };
}

function formatTriplet(t: Triplet): string {
  return `${t.subject} >> ${t.predicate} >> ${t.object}`;
}

function parseTriplets(raw: string): Triplet[] {
  return raw
    .split('\n')
    .map((line, i) => parseTripletLine(line, i))
    .filter((t): t is Triplet => t !== null);
}

// ── 子元件：UI 視圖 ───────────────────────────────────────────────────────────

function UIViewPanel({ onTrigger }: { onTrigger: (detail: U6uTriggerDetail) => void }) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<U6uTriggerDetail>;
      onTrigger(ce.detail);
    };
    el.addEventListener('u6u:trigger', handler);
    return () => el.removeEventListener('u6u:trigger', handler);
  }, [onTrigger]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500">示範：以下元件用 u6u Web Components 組裝（Dogfooding）</p>
      <u6u-card ref={cardRef} title="示範表單">
        <u6u-text-input name="query" label="搜尋關鍵字" placeholder="輸入關鍵字…" />
        <u6u-btn label="送出" workflow="workflow://demo-search" color="#3b82f6" />
      </u6u-card>
      <div className="text-xs text-zinc-600 bg-zinc-800 rounded p-3">
        <span className="text-zinc-400 font-medium">Smart Container：</span>
        點擊「送出」時，<code className="text-blue-400">u6u-card</code> 自動收集
        <code className="text-green-400"> u6u-text-input[name=query]</code> 的值，合併至 payload 後觸發 Workflow。
      </div>
    </div>
  );
}

// ── 子元件：邏輯視圖 ──────────────────────────────────────────────────────────

interface LogicViewPanelProps {
  triplets: Triplet[];
  editingText: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditChange: (text: string) => void;
  selectedWorkflow: string;
  workflows: WorkflowRecord[];
  onWorkflowChange: (id: string) => void;
}

function LogicViewPanel({
  triplets, editingText, isEditing, onEditStart, onEditChange,
  selectedWorkflow, workflows, onWorkflowChange,
}: LogicViewPanelProps) {
  const textFieldRef = useRef<HTMLElement & { value?: string }>(null);
  const selectRef = useRef<HTMLElement & { value?: string }>(null);

  useEffect(() => {
    const el = textFieldRef.current;
    if (!el) return;
    const handler = () => { if (el.value !== undefined) onEditChange(el.value); };
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [onEditChange]);

  // u6u-select change event
  useEffect(() => {
    const el = selectRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ value: string }>;
      onWorkflowChange(ce.detail?.value ?? '');
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onWorkflowChange]);

  const options = JSON.stringify(workflows.map(w => ({ value: w.id, label: w.name })));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <u6u-select
          ref={selectRef}
          label="綁定 Workflow（ON_CLICK）"
          options={options}
          value={selectedWorkflow}
          placeholder="— 未綁定 —"
        />
        {selectedWorkflow && (
          <p className="text-xs text-zinc-600 font-mono">
            ON_CLICK &gt;&gt; workflow://{selectedWorkflow}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Cypher 三元組</span>
          {!isEditing && (
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors" onClick={onEditStart}>
              修改
            </button>
          )}
        </div>
        {isEditing ? (
          <u6u-text-field
            ref={textFieldRef}
            name="triplets"
            rows="8"
            placeholder={'A >> 關係 >> B\nC >> 關係 >> D'}
            value={editingText}
          />
        ) : (
          <div className="bg-zinc-800 rounded-lg p-3 space-y-1 min-h-20">
            {triplets.length === 0 ? (
              <p className="text-zinc-600 text-xs">尚無三元組，點擊「修改」新增</p>
            ) : (
              triplets.map(t => (
                <div key={t.id} className="font-mono text-xs text-zinc-300">
                  <span className="text-blue-400">{t.subject}</span>
                  <span className="text-zinc-500"> &gt;&gt; </span>
                  <span className="text-yellow-400">{t.predicate}</span>
                  <span className="text-zinc-500"> &gt;&gt; </span>
                  <span className="text-green-400">{t.object}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 輔助元件：監聽 Web Components 按鈕事件 ───────────────────────────────────

interface FlipButtonListenerProps {
  state: CanvasState;
  onFlip: () => void;
  onSave: () => void;
  onCancel: () => void;
}

function FlipButtonListener({ state, onFlip, onSave, onCancel }: FlipButtonListenerProps) {
  useEffect(() => {
    const flipBtn = document.getElementById('canvas-flip-btn');
    const saveBtn = document.getElementById('canvas-save-btn');
    const cancelBtn = document.getElementById('canvas-cancel-btn');

    const handleFlip = (e: Event) => { e.stopPropagation(); onFlip(); };
    const handleSave = (e: Event) => { e.stopPropagation(); onSave(); };
    const handleCancel = (e: Event) => { e.stopPropagation(); onCancel(); };

    flipBtn?.addEventListener('click', handleFlip);
    saveBtn?.addEventListener('click', handleSave);
    cancelBtn?.addEventListener('click', handleCancel);

    return () => {
      flipBtn?.removeEventListener('click', handleFlip);
      saveBtn?.removeEventListener('click', handleSave);
      cancelBtn?.removeEventListener('click', handleCancel);
    };
  }, [state, onFlip, onSave, onCancel]);

  return null;
}

// ── 主元件：CanvasPage ────────────────────────────────────────────────────────

interface CanvasPageProps {
  initialWorkflowId?: string;
}

export default function CanvasPage({ initialWorkflowId }: CanvasPageProps) {
  const [state, setState] = useState<CanvasState>('UIView');
  const [triplets, setTriplets] = useState<Triplet[]>([
    { id: 't-0', subject: '搜尋按鈕', predicate: 'ON_CLICK', object: 'workflow://demo-search' },
    { id: 't-1', subject: '搜尋按鈕', predicate: 'IS_A', object: 'component://u6u-btn' },
    { id: 't-2', subject: '示範表單', predicate: 'CONTAINS', object: '搜尋按鈕' },
  ]);
  const [editingText, setEditingText] = useState('');
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(initialWorkflowId ?? '');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastTrigger, setLastTrigger] = useState<U6uTriggerDetail | null>(null);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [aiUpdateBadge, setAiUpdateBadge] = useState(false);
  // 暫存 AI 在 Editing 期間的遠端更新
  const pendingRemoteTripletsRef = useRef<Triplet[] | null>(null);

  const isEditing = state === 'Editing' || state === 'Saving';
  const isLogicSide = state === 'LogicView' || isEditing;

  useEffect(() => {
    listWorkflows().then(setWorkflows).catch(() => {});
  }, []);

  // 打開 Workflow 時記錄 action log
  useEffect(() => {
    if (initialWorkflowId) {
      logAction('OPEN_WORKFLOW', { workflow_id: initialWorkflowId });
    }
  }, [initialWorkflowId]);

  // Poll 當前 Workflow（3 秒），偵測 AI 更新
  const pollWorkflow = useCallback(async () => {
    if (!selectedWorkflow) return;
    try {
      const wf = await getWorkflow(selectedWorkflow);
      const remoteTriplets = parseTriplets((wf.slots?.triplets as string | undefined) ?? '');
      const remoteStr = remoteTriplets.map(formatTriplet).join('\n');
      const localStr = triplets.map(formatTriplet).join('\n');
      if (remoteStr !== localStr) {
        if (isEditing) {
          // 用戶正在編輯，暫存遠端狀態
          pendingRemoteTripletsRef.current = remoteTriplets;
        } else {
          setTriplets(remoteTriplets);
          setAiUpdateBadge(true);
          setTimeout(() => setAiUpdateBadge(false), 3000);
        }
      }
    } catch { /* 靜默忽略 */ }
  }, [selectedWorkflow, triplets, isEditing]);

  usePoll(pollWorkflow, 3000, !!selectedWorkflow);

  // Workflow 清單 poll（5 秒）
  const pollWorkflows = useCallback(() => {
    listWorkflows().then(setWorkflows).catch(() => {});
  }, []);
  usePoll(pollWorkflows, 5000, true);

  const handleFlip = useCallback(() => {
    if (state === 'UIView') {
      setState('LogicView');
      logAction('FLIP_CANVAS', { to: 'LogicView' });
    } else if (state === 'LogicView') {
      setState('UIView');
      logAction('FLIP_CANVAS', { to: 'UIView' });
    }
  }, [state]);

  const handleEditStart = useCallback(() => {
    setEditingText(triplets.map(formatTriplet).join('\n'));
    setState('Editing');
  }, [triplets]);

  const handleSave = useCallback(async () => {
    setState('Saving');
    setSaveError(null);
    const parsed = parseTriplets(editingText);
    try {
      if (selectedWorkflow) {
        await updateWorkflow(selectedWorkflow, {
          triplets: parsed.map(formatTriplet).join('\n'),
        });
        logAction('SAVE_TRIPLETS', {
          workflow_id: selectedWorkflow,
          triplet_count: parsed.length,
        });
      }
      setTriplets(parsed);
      setState('LogicView');
      // 儲存後套用期間的 AI 更新
      if (pendingRemoteTripletsRef.current) {
        setTriplets(pendingRemoteTripletsRef.current);
        pendingRemoteTripletsRef.current = null;
        setAiUpdateBadge(true);
        setTimeout(() => setAiUpdateBadge(false), 3000);
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '儲存失敗');
      setState('LogicView');
    }
  }, [editingText, selectedWorkflow]);

  const handleCancelEdit = useCallback(() => {
    setState('LogicView');
    setEditingText('');
    // 取消後套用 AI 更新
    if (pendingRemoteTripletsRef.current) {
      setTriplets(pendingRemoteTripletsRef.current);
      pendingRemoteTripletsRef.current = null;
    }
  }, []);

  const handleRunWorkflow = useCallback(async () => {
    if (!selectedWorkflow) return;
    setRunResult('執行中…');
    try {
      const result = await executeWorkflow({
        triplets: triplets.map(formatTriplet),
        context: {},
      });
      const resultText = result.success ? '✅ 執行成功' : `❌ ${result.error ?? '執行失敗'}`;
      setRunResult(resultText);
      logAction('RUN_WORKFLOW', {
        workflow_id: selectedWorkflow,
        success: result.success,
        error: result.error,
      });
    } catch (e) {
      const errText = `❌ ${e instanceof Error ? e.message : '執行失敗'}`;
      setRunResult(errText);
      logAction('RUN_WORKFLOW', {
        workflow_id: selectedWorkflow,
        success: false,
        error: errText,
      });
    }
  }, [selectedWorkflow, triplets]);

  const handleWorkflowChange = useCallback((id: string) => {
    setSelectedWorkflow(id);
    if (id) logAction('BIND_WORKFLOW', { workflow_id: id });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* 工具列 */}
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
        <span className="text-sm font-medium text-zinc-300 flex-1">
          {isLogicSide ? '邏輯視圖' : 'UI 視圖'}
          {state === 'Saving' && <span className="ml-2 text-xs text-zinc-500 animate-pulse">儲存中…</span>}
        </span>

        {/* AI 更新 badge */}
        {aiUpdateBadge && (
          <u6u-badge label="AI 已更新" variant="info" />
        )}

        {selectedWorkflow && state !== 'Editing' && state !== 'Saving' && (
          <button
            onClick={() => void handleRunWorkflow()}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
          >
            ▶ 執行
          </button>
        )}

        <u6u-btn
          id="canvas-flip-btn"
          label={isLogicSide ? '⬅ UI 視圖' : '邏輯視圖 ➡'}
          color={isLogicSide ? '#6b7280' : '#8b5cf6'}
          tooltip="切換 UI / 邏輯視圖"
          disabled={isEditing ? '' : undefined}
        />

        {state === 'Editing' && (
          <>
            <u6u-btn label="取消" color="#6b7280" id="canvas-cancel-btn" />
            <u6u-btn label="儲存" color="#10b981" id="canvas-save-btn" />
          </>
        )}
      </div>

      <FlipButtonListener
        state={state}
        onFlip={handleFlip}
        onSave={() => void handleSave()}
        onCancel={handleCancelEdit}
      />

      {saveError && (
        <u6u-alert variant="error" message={saveError} />
      )}

      {runResult && (
        <div className="text-xs bg-zinc-800 rounded p-2 text-zinc-300">{runResult}</div>
      )}

      {lastTrigger && (
        <div className="text-xs text-zinc-600 bg-zinc-800 rounded p-2 font-mono">
          最後觸發：workflow://{lastTrigger.workflowId}
          {Object.keys(lastTrigger.payload).length > 0 && (
            <span className="ml-2 text-zinc-500">payload: {JSON.stringify(lastTrigger.payload)}</span>
          )}
        </div>
      )}

      <div className="min-h-64">
        {!isLogicSide ? (
          <UIViewPanel onTrigger={setLastTrigger} />
        ) : (
          <LogicViewPanel
            triplets={triplets}
            editingText={editingText}
            isEditing={state === 'Editing'}
            onEditStart={handleEditStart}
            onEditChange={setEditingText}
            selectedWorkflow={selectedWorkflow}
            workflows={workflows}
            onWorkflowChange={handleWorkflowChange}
          />
        )}
      </div>
    </div>
  );
}
