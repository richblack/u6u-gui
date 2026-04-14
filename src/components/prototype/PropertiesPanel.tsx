import type { CanvasElement } from '../../types/prototype';
import { COMPONENT_REGISTRY } from '../../constants/componentRegistry';
import type { WorkflowRecord } from '../../api';

interface Props {
  element: CanvasElement | null;
  workflows: WorkflowRecord[];
  onUpdateProps: (props: Record<string, string>) => void;
  onUpdateBindings: (bindings: Record<string, string>) => void;
}

export function PropertiesPanel({ element, workflows, onUpdateProps, onUpdateBindings }: Props) {
  if (!element) {
    return (
      <div style={{
        width: '280px',
        flexShrink: 0,
        background: '#18181b',
        borderLeft: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3f3f46',
        fontSize: '13px',
        textAlign: 'center',
        padding: '24px',
      }}>
        點選畫布上的元件<br />以編輯屬性
      </div>
    );
  }

  const def = COMPONENT_REGISTRY.find(c => c.type === element.type);
  if (!def) return null;

  return (
    <div style={{
      width: '280px',
      flexShrink: 0,
      background: '#18181b',
      borderLeft: '1px solid #27272a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 元件名稱 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #27272a',
        fontSize: '12px',
        color: '#a1a1aa',
      }}>
        <span style={{ fontSize: '16px', marginRight: '6px' }}>{def.icon}</span>
        <span style={{ fontWeight: 500, color: '#e4e4e7' }}>{def.label}</span>
        <span style={{ marginLeft: '6px', color: '#52525b', fontFamily: 'monospace', fontSize: '11px' }}>{element.type}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* UI 屬性 */}
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            UI 屬性
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {def.propsSchema.map(schema => (
              <PropField
                key={schema.key}
                schema={schema}
                value={element.props[schema.key] ?? ''}
                onChange={val => onUpdateProps({ [schema.key]: val })}
              />
            ))}
          </div>
        </div>

        {/* 分隔線 */}
        <div style={{ height: '1px', background: '#27272a', margin: '0 16px' }} />

        {/* 邏輯連接 */}
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            邏輯連接
          </p>
          {def.supportedEvents.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#3f3f46' }}>此元件無邏輯連接</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {def.supportedEvents.map(ev => {
                const currentBinding = element.bindings[ev.event] ?? '';
                const currentWfId = currentBinding.replace('workflow://', '');
                return (
                  <div key={ev.event}>
                    <p style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>
                      {ev.event} <span style={{ color: '#52525b' }}>— {ev.description}</span>
                    </p>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <select
                        value={currentWfId}
                        onChange={e => {
                          const val = e.target.value;
                          onUpdateBindings({ [ev.event]: val ? `workflow://${val}` : '' });
                        }}
                        style={{
                          flex: 1,
                          background: '#09090b',
                          border: '1px solid #27272a',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '12px',
                          color: '#e4e4e7',
                          outline: 'none',
                        }}
                      >
                        <option value="">— 未綁定 —</option>
                        {workflows.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                      {currentWfId && (
                        <button
                          onClick={() => onUpdateBindings({ [ev.event]: '' })}
                          style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                          title="清除"
                        >✕</button>
                      )}
                    </div>
                    {currentWfId && (
                      <p style={{ fontSize: '10px', color: '#52525b', fontFamily: 'monospace', marginTop: '3px' }}>
                        {element.id} &gt;&gt; {ev.event} &gt;&gt; workflow://{currentWfId}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// PropField 子元件
function PropField({
  schema,
  value,
  onChange,
}: {
  schema: { key: string; label: string; type: string; placeholder?: string; description?: string };
  value: string;
  onChange: (val: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '5px 8px',
    fontSize: '12px',
    color: '#e4e4e7',
    outline: 'none',
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#71717a', marginBottom: '3px' }}>
        {schema.label}
        {schema.description && (
          <span style={{ color: '#3f3f46', marginLeft: '4px' }}>({schema.description})</span>
        )}
      </label>
      {schema.type === 'color' ? (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
            style={{ width: '28px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none', padding: 0 }} />
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, flex: 1 }} placeholder="#000000" />
        </div>
      ) : schema.type === 'boolean' ? (
        <input type="checkbox" checked={value === 'true' || value === ''} onChange={e => onChange(e.target.checked ? 'true' : '')} />
      ) : schema.type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '11px' }}
          placeholder={schema.placeholder} />
      ) : (
        <input type={schema.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
          placeholder={schema.placeholder} />
      )}
    </div>
  );
}
