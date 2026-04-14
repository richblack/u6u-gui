import type { CanvasElement } from '../../types/prototype';
import { CanvasElementWrapper } from './CanvasElementWrapper';

interface Props {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CanvasEditor({ elements, selectedId, onSelect, onMoveUp, onMoveDown, onDelete }: Props) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: '100%',
        background: '#0f0f0f',
        padding: '24px',
        overflowY: 'auto',
      }}
      onClick={() => onSelect(null)}
    >
      {elements.length === 0 ? (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3f3f46',
          border: '2px dashed #27272a',
          borderRadius: '12px',
          minHeight: '300px',
          gap: '8px',
        }}>
          <span style={{ fontSize: '32px' }}>🎨</span>
          <p style={{ fontSize: '14px' }}>點擊左側元件插入畫布</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {elements.map(el => (
            <CanvasElementWrapper
              key={el.id}
              element={el}
              isSelected={selectedId === el.id}
              onSelect={() => onSelect(el.id)}
              onMoveUp={() => onMoveUp(el.id)}
              onMoveDown={() => onMoveDown(el.id)}
              onDelete={() => onDelete(el.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
