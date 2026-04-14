/**
 * <u6u-empty-state> — 空狀態提示
 *
 * Attributes:
 *   icon        - emoji 或文字圖示（預設 "📭"）
 *   title       - 主標題
 *   description - 說明文字（可選）
 */
export class U6uEmptyState extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'title', 'description'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const icon = this.getAttribute('icon') ?? '📭';
    const title = this.getAttribute('title') ?? '';
    const description = this.getAttribute('description') ?? '';

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: #52525b;
        }
        .icon { font-size: 32px; margin-bottom: 12px; }
        .title { font-size: 14px; font-weight: 500; color: #71717a; }
        .desc { font-size: 12px; margin-top: 4px; color: #52525b; }
      </style>
      <div class="empty" part="empty">
        <div class="icon">${icon}</div>
        ${title ? `<div class="title">${title}</div>` : ''}
        ${description ? `<div class="desc">${description}</div>` : ''}
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('u6u-empty-state', U6uEmptyState);
