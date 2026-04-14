import { useEffect, useCallback, useState, useRef } from 'react';
import { usePrototypeEditor } from '../hooks/usePrototypeEditor';
import { ComponentPanel } from '../components/prototype/ComponentPanel';
import { CanvasEditor } from '../components/prototype/CanvasEditor';
import { PropertiesPanel } from '../components/prototype/PropertiesPanel';
import {
  listWorkflows, logAction,
  listPrototypePages, createPrototypePage, savePrototypePage,
} from '../api';
import type { WorkflowRecord } from '../api';
import type { CanvasElement } from '../types/prototype';

const toolbarBtnStyle: React.CSSProperties = {
  background: '#27272a',
  border: 'none',
  color: '#d4d4d8',
  fontSize: '13px',
  padding: '5px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
};

export default function PrototypeEditorPage() {
  const {
    state, sortedElements, selectedElement,
    addElement, selectElement, updateProps, updateBindings,
    moveElement, deleteElement, clear, dispatch,
  } = usePrototypeEditor();

  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [pageName, setPageName] = useState('未命名頁面');
  const recordIdRef = useRef<string | null>(null);

  // 初始化：載入第一個 prototype page 或建立新的
  useEffect(() => {
    listWorkflows().then(setWorkflows).catch(() => {});
    listPrototypePages().then(async pages => {
      if (pages.length > 0) {
        const page = pages[0];
        recordIdRef.current = page.id;
        setPageName(page.page_name);
        try {
          const elements = JSON.parse(page.components_json) as unknown[];
          if (Array.isArray(elements) && elements.length > 0) {
            dispatch({ type: 'SYNC_FROM_REMOTE', elements: elements as CanvasElement[] });
          }
        } catch { /* 忽略解析錯誤 */ }
      }
    }).catch(() => {});
  }, [dispatch]);

  const handleSave = useCallback(async () => {
    dispatch({ type: 'SET_STATUS', status: 'saving' });
    try {
      if (!recordIdRef.current) {
        // 建立新紀錄
        const page = await createPrototypePage(pageName);
        recordIdRef.current = page.id;
      }
      await savePrototypePage(recordIdRef.current, sortedElements, pageName);
      logAction('SAVE_PROTOTYPE', { page_name: pageName, element_count: sortedElements.length });
      dispatch({ type: 'SET_STATUS', status: 'saved', message: '已儲存' });
      setTimeout(() => dispatch({ type: 'SET_STATUS', status: 'idle' }), 2000);
    } catch {
      dispatch({ type: 'SET_STATUS', status: 'error', message: '儲存失敗' });
    }
  }, [sortedElements, pageName, dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 工具列 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        borderBottom: '1px solid #27272a',
        background: '#18181b',
        flexShrink: 0,
      }}>
        <input
          type="text"
          value={pageName}
          onChange={e => setPageName(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #3f3f46',
            color: '#e4e4e7',
            fontSize: '14px',
            outline: 'none',
            padding: '2px 4px',
            width: '200px',
          }}
        />

        {state.aiUpdateBadge && (
          <span style={{
            fontSize: '11px',
            background: '#1e3a5f',
            color: '#60a5fa',
            padding: '2px 8px',
            borderRadius: '999px',
          }}>
            AI 已更新
          </span>
        )}

        <div style={{ flex: 1 }} />

        {state.statusMessage && (
          <span style={{ fontSize: '12px', color: state.status === 'error' ? '#f87171' : '#4ade80' }}>
            {state.statusMessage}
          </span>
        )}

        <button
          onClick={clear}
          style={toolbarBtnStyle}
        >
          清空
        </button>

        <button
          onClick={() => void handleSave()}
          disabled={state.status === 'saving'}
          style={{ ...toolbarBtnStyle, background: '#059669', color: 'white', opacity: state.status === 'saving' ? 0.6 : 1 }}
        >
          {state.status === 'saving' ? '儲存中…' : '儲存'}
        </button>
      </div>

      {/* 三欄主體 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ComponentPanel onAdd={addElement} />
        <CanvasEditor
          elements={sortedElements}
          selectedId={state.selectedId}
          onSelect={selectElement}
          onMoveUp={id => moveElement(id, 'up')}
          onMoveDown={id => moveElement(id, 'down')}
          onDelete={deleteElement}
        />
        <PropertiesPanel
          element={selectedElement}
          workflows={workflows}
          onUpdateProps={props => { if (state.selectedId) updateProps(state.selectedId, props); }}
          onUpdateBindings={bindings => { if (state.selectedId) updateBindings(state.selectedId, bindings); }}
        />
      </div>
    </div>
  );
}
