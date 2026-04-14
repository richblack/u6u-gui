import { useEffect, useCallback, useState } from 'react';
import { usePrototypeEditor } from '../hooks/usePrototypeEditor';
import { ComponentPanel } from '../components/prototype/ComponentPanel';
import { CanvasEditor } from '../components/prototype/CanvasEditor';
import { PropertiesPanel } from '../components/prototype/PropertiesPanel';
import { listWorkflows, logAction } from '../api';
import type { WorkflowRecord } from '../api';

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

  useEffect(() => {
    listWorkflows().then(setWorkflows).catch(() => {});
  }, []);

  const handleSave = useCallback(async () => {
    dispatch({ type: 'SET_STATUS', status: 'saving' });
    try {
      // TODO A.5：呼叫 KBDB API 儲存 components_json
      const json = JSON.stringify(sortedElements);
      console.log('[PrototypeEditor] save:', json);
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
