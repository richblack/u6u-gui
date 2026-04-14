/**
 * <u6u-nav-item> — 導覽列項目
 *
 * 點擊時發出原生 click event（不是 u6u:trigger）。
 *
 * Attributes:
 *   label          - 顯示文字
 *   active         - 是否為選中狀態（boolean attribute）
 *   color-active   - 選中時文字色（預設 #f4f4f5）
 *   color-inactive - 未選中時文字色（預設 #71717a）
 *   bg-active      - 選中時背景色（預設 #27272a）
 */
export class U6uNavItem extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'active', 'color-active', 'color-inactive', 'bg-active'];
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
    const active = this.hasAttribute('active');
    const colorActive = this.getAttribute('color-active') ?? '#f4f4f5';
    const colorInactive = this.getAttribute('color-inactive') ?? '#71717a';
    const bgActive = this.getAttribute('bg-active') ?? '#27272a';

    this._shadow.innerHTML = `
      <style>
        :host { display: inline-block; }
        button {
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          background: ${active ? bgActive : 'transparent'};
          color: ${active ? colorActive : colorInactive};
        }
        button:hover {
          background: ${active ? bgActive : 'rgba(255,255,255,0.06)'};
          color: ${colorActive};
        }
      </style>
      <button part="button">${label}</button>
    `;

    this._shadow.querySelector('button')?.addEventListener('click', () => {
      this.dispatchEvent(new Event('click', { bubbles: true, composed: true }));
    });
  }
}

customElements.define('u6u-nav-item', U6uNavItem);
