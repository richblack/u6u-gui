import { useState } from 'react';
import type { CanvasElement } from '../../types/prototype';
import { WebComponentRenderer } from './WebComponentRenderer';

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

const actionBtnStyle: React.CSSProperties = {
  background: '#27272a',
  border: 'none',
  color: '#a1a1aa',
  fontSize: '11px',
  padding: '1px 5px',
  borderRadius: '3px',
  cursor: 'pointer',
  lineHeight: 1.4,
};

export function CanvasElementWrapper({ element, isSelected, onSelect, onMoveUp, onMoveDown, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #8b5cf6' : hovered ? '1px solid #52525b' : '1px solid transparent',
        outlineOffset: '2px',
        borderRadius: '6px',
        transition: 'outline 0.1s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* 元件標籤（hover 或 selected 時顯示） */}
      {(hovered || isSelected) && (
        <div style={{
          position: 'absolute',
          top: -20,
          left: 0,
          fontSize: '10px',
          color: '#8b5cf6',
          background: '#18181b',
          padding: '1px 6px',
          borderRadius: '3px',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          {element.type}
        </div>
      )}

      {/* 操作按鈕（hover 或 selected 時顯示） */}
      {(hovered || isSelected) && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: 0,
            display: 'flex',
            gap: '4px',
            zIndex: 10,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onMoveUp} style={actionBtnStyle} title="上移">↑</button>
          <button onClick={onMoveDown} style={actionBtnStyle} title="下移">↓</button>
          <button onClick={onDelete} style={{ ...actionBtnStyle, color: '#f87171' }} title="刪除">✕</button>
        </div>
      )}

      <WebComponentRenderer type={element.type} props={element.props} onSelect={onSelect} />
    </div>
  );
}
