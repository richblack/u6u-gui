/**
 * <u6u-card> — 智慧容器（Smart Container）
 *
 * 攔截子元件的 u6u:trigger 事件，自動收集同容器內所有
 * <u6u-text-input> 和 <u6u-text-field> 的 name-value 對，
 * 合併至 payload 後重新發出 u6u:trigger。
 *
 * 使用者不需要手動綁定表單值，拖拉組合即生效。
 *
 * Attributes:
 *   title   - 卡片標題（可選）
 *   padding - 內距（預設 16px）
 *
 * Requirements: 8.4
 */

export class U6uCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'padding'];
  }

  private _shadow: ShadowRoot;
  private _triggerHandler: ((e: Event) => void) | null = null;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._triggerHandler = this._handleTrigger.bind(this);
    this.addEventListener('u6u:trigger', this._triggerHandler);
  }

  disconnectedCallback() {
    if (this._triggerHandler) {
      this.removeEventListener('u6u:trigger', this._triggerHandler);
    }
  }

  attributeChangedCallback() {
    this._render();
  }

  private _handleTrigger(e: Event) {
    const trigger = e as CustomEvent<{ workflowId: string; payload: Record<string, unknown> }>;
    e.stopPropagation();

    // 收集同容器內所有具名輸入元件的值
    const collected: Record<string, unknown> = {};

    // 收集 Light DOM 中的輸入元件（slot 內容）
    const inputs = this.querySelectorAll('u6u-text-input, u6u-text-field');
    inputs.forEach(input => {
      const name = input.getAttribute('name');
      const value = (input as HTMLElement & { value?: string }).value;
      if (name && value !== undefined) {
        collected[name] = value;
      }
    });

    // 重新發出，合併收集到的值
    this.dispatchEvent(new CustomEvent('u6u:trigger', {
      bubbles: true,
      composed: true,
      detail: {
        workflowId: trigger.detail.workflowId,
        payload: { ...trigger.detail.payload, ...collected },
      },
    }));
  }

  private _render() {
    const title = this.getAttribute('title') ?? '';
    const padding = this.getAttribute('padding') ?? '16px';

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: ${padding};
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }
        ::slotted(*) { margin-bottom: 8px; }
        ::slotted(*:last-child) { margin-bottom: 0; }
      </style>
      <div class="card" part="card">
        ${title ? `<div class="card-title">${title}</div>` : ''}
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('u6u-card', U6uCard);
