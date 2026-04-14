/**
 * <u6u-badge> — 狀態標籤
 *
 * Attributes:
 *   label   - 顯示文字
 *   variant - success | warning | error | info | default
 *   color   - 手動覆寫文字色
 *   bg      - 手動覆寫背景色
 */

const VARIANT_STYLES: Record<string, { color: string; bg: string }> = {
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
  warning: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  error:   { color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  info:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  default: { color: '#a1a1aa', bg: '#27272a' },
  running: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
};

export class U6uBadge extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'variant', 'color', 'bg'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const variant = this.getAttribute('variant') ?? 'default';
    const style = VARIANT_STYLES[variant] ?? VARIANT_STYLES['default'];
    const color = this.getAttribute('color') ?? style.color;
    const bg = this.getAttribute('bg') ?? style.bg;
    const isRunning = variant === 'running';

    this._shadow.innerHTML = `
      <style>
        :host { display: inline-block; }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          color: ${color};
          background: ${bg};
          ${isRunning ? 'animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;' : ''}
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
      <span class="badge" part="badge">${label}</span>
    `;
  }
}

customElements.define('u6u-badge', U6uBadge);
