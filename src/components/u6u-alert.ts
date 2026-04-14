/**
 * <u6u-alert> — 訊息提示框
 *
 * Attributes:
 *   variant  - error | success | warning | info（預設 info）
 *   message  - 顯示訊息
 *   dismiss  - 是否顯示關閉按鈕（boolean attribute，預設無）
 *
 * Events:
 *   dismiss - 用戶點擊關閉時發出
 */
const ALERT_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  error:   { color: '#fca5a5', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
  success: { color: '#86efac', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)' },
  warning: { color: '#fde68a', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
  info:    { color: '#93c5fd', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)' },
};

export class U6uAlert extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'message', 'dismiss'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const variant = this.getAttribute('variant') ?? 'info';
    const message = this.getAttribute('message') ?? '';
    const canDismiss = this.hasAttribute('dismiss');
    const s = ALERT_STYLES[variant] ?? ALERT_STYLES['info'];

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .alert {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid ${s.border};
          background: ${s.bg};
          color: ${s.color};
          font-size: 13px;
          line-height: 1.5;
        }
        .message { flex: 1; }
        .close {
          background: none;
          border: none;
          color: ${s.color};
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          opacity: 0.7;
          flex-shrink: 0;
        }
        .close:hover { opacity: 1; }
      </style>
      <div class="alert" part="alert" role="alert">
        <span class="message">${message}</span>
        ${canDismiss ? `<button class="close" aria-label="關閉">✕</button>` : ''}
      </div>
    `;

    if (canDismiss) {
      this._shadow.querySelector('.close')?.addEventListener('click', () => {
        this.dispatchEvent(new Event('dismiss', { bubbles: true, composed: true }));
      });
    }
  }
}

customElements.define('u6u-alert', U6uAlert);
