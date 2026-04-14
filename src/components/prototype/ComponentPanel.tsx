import { useState } from 'react';
import { COMPONENT_REGISTRY } from '../../constants/componentRegistry';

interface Props {
  onAdd: (type: string) => void;
}

export function ComponentPanel({ onAdd }: Props) {
  const [query, setQuery] = useState('');

  const filtered = COMPONENT_REGISTRY.filter(c =>
    c.label.includes(query) || c.type.includes(query.toLowerCase())
  );

  const categories = ['input', 'layout', 'display', 'feedback'] as const;
  const categoryLabel: Record<string, string> = {
    input: '輸入', layout: '佈局', display: '顯示', feedback: '回饋',
  };

  return (
    <div style={{
      width: '200px',
      flexShrink: 0,
      background: '#18181b',
      borderRight: '1px solid #27272a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 搜尋框 */}
      <div style={{ padding: '12px' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜尋元件…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            color: '#e4e4e7',
            outline: 'none',
          }}
        />
      </div>

      {/* 零件清單 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
        {categories.map(cat => {
          const items = filtered.filter(c => c.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '10px', color: '#52525b', padding: '4px 4px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {categoryLabel[cat]}
              </p>
              {items.map(def => (
                <button
                  key={def.type}
                  onClick={() => onAdd(def.type)}
                  title={def.type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#d4d4d8',
                    fontSize: '13px',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#27272a')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{def.icon}</span>
                  <span>{def.label}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
