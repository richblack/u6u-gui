import { useEffect, useRef } from 'react';

const importedTypes = new Set<string>();

function ensureImported(type: string) {
  if (importedTypes.has(type)) return;
  importedTypes.add(type);
  void import(/* @vite-ignore */ `@u6u-wc/${type}`).catch(() => {});
}

interface WebComponentRendererProps {
  type: string;
  props: Record<string, string>;
  onSelect?: () => void;
}

export function WebComponentRenderer({ type, props, onSelect }: WebComponentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLElement | null>(null);

  ensureImported(type);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 第一次建立 element，或 type 改變時重建
    if (!elRef.current || elRef.current.tagName.toLowerCase() !== type) {
      container.innerHTML = '';
      const el = document.createElement(type);
      elRef.current = el;
      container.appendChild(el);
    }

    // 同步 attributes
    const el = elRef.current;
    Object.entries(props).forEach(([key, value]) => {
      if (value === '') el.removeAttribute(key);
      else el.setAttribute(key, value);
    });
  }, [type, props]);

  return (
    <div
      ref={containerRef}
      onClick={onSelect}
      style={{ cursor: 'pointer', pointerEvents: 'all' }}
    />
  );
}
