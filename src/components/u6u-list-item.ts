/**
 * <u6u-list-item> — 通用列表項目
 *
 * Attributes:
 *   title    - 主標題
 *   subtitle - 副標題（小字灰色）
 *   item-id  - 點擊時 select event 的 id 值
 *
 * Slots:
 *   actions - 右側操作區（放 u6u-btn 等）
 *
 * Events:
 *   select - 點擊項目時發出，detail: { id: string }
 */
export class U6uListItem extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'item-id'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const title = this.getAttribute('title') ?? '';
    const subtitle = this.getAttribute('subtitle') ?? '';
    const itemId = this.getAttribute('item-id') ?? '';

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border: 1px solid rgba(63,63,70,0.5);
          border-radius: 12px;
          background: rgba(39,39,42,0.6);
          transition: background 0.15s;
        }
        .item:hover { background: rgba(63,63,70,0.5); }
        .info { flex: 1; min-width: 0; }
        .title {
          font-size: 14px;
          font-weight: 500;
          color: #f4f4f5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .subtitle {
          font-size: 12px;
          color: #71717a;
          font-family: monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
      </style>
      <div class="item" part="item">
        <div class="info" part="info">
          <div class="title">${title}</div>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
          <slot name="meta"></slot>
        </div>
        <div class="actions" part="actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;

    this._shadow.querySelector('.info')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('select', {
        bubbles: true,
        composed: true,
        detail: { id: itemId },
      }));
    });
  }
}

customElements.define('u6u-list-item', U6uListItem);
