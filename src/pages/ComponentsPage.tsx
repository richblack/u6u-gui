/**
 * ComponentsPage — 零件庫頁面
 * 列出所有已上架零件，支援即時搜尋，點擊顯示完整合約
 */

import { useState, useEffect, useCallback } from 'react';
import { searchComponents, logAction } from '../api';
import type { Component } from '../api';

// ── 穩定度標籤顏色 ────────────────────────────────────────────────────────────

function StabilityBadge({ stability }: { stability: string }) {
  const colors: Record<string, string> = {
    stable: 'bg-emerald-900/50 text-emerald-400',
    beta: 'bg-yellow-900/50 text-yellow-400',
    alpha: 'bg-orange-900/50 text-orange-400',
    experimental: 'bg-red-900/50 text-red-400',
  };
  const cls = colors[stability.toLowerCase()] ?? 'bg-zinc-800 text-zinc-400';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {stability}
    </span>
  );
}

// ── 合約 Modal ────────────────────────────────────────────────────────────────

function ContractModal({ component, onClose }: { component: Component; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{component.display_name}</h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{component.canonical_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400">
            {component.category}
          </span>
          <StabilityBadge stability={component.stability} />
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            v{component.version}
          </span>
          {component.success_rate !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              成功率 {(component.success_rate * 100).toFixed(0)}%
            </span>
          )}
        </div>

        {component.description && (
          <p className="text-sm text-zinc-300 mb-4">{component.description}</p>
        )}

        {component.contract && (
          <div>
            <p className="text-xs text-zinc-500 mb-2">完整合約</p>
            <pre className="bg-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(component.contract, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────

export default function ComponentsPage() {
  const [query, setQuery] = useState('');
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Component | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchComponents(q);
      setComponents(result.components ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始載入
  useEffect(() => { void load(''); }, [load]);

  // 即時搜尋（debounce 300ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      void load(query);
      if (query) logAction('FILTER_COMPONENTS', { query });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, load]);

  return (
    <div className="flex flex-col gap-4">
      {/* 搜尋框 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜尋零件…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* 狀態 */}
      {loading && (
        <div className="text-zinc-500 text-sm animate-pulse">載入中…</div>
      )}
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>
      )}

      {/* 零件列表 */}
      {!loading && !error && (
        <>
          <p className="text-xs text-zinc-600">共 {components.length} 個零件</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {components.map(c => (
              <button
                key={c.canonical_id}
                onClick={() => setSelected(c)}
                className="text-left bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors">
                    {c.display_name}
                  </span>
                  <StabilityBadge stability={c.stability} />
                </div>
                <p className="text-xs text-zinc-500 font-mono mb-2 truncate">{c.canonical_id}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                    {c.category}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                    v{c.version}
                  </span>
                  {c.success_rate !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                      {(c.success_rate * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2">{c.description}</p>
                )}
              </button>
            ))}
          </div>

          {components.length === 0 && (
            <div className="text-center py-12 text-zinc-600">
              <p className="text-2xl mb-2">📦</p>
              <p className="text-sm">找不到符合的零件</p>
            </div>
          )}
        </>
      )}

      {/* 合約 Modal */}
      {selected && (
        <ContractModal component={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
