/**
 * <u6u-btn> — 意圖發射器按鈕
 *
 * Attributes:
 *   label    - 顯示文字
 *   color    - 主題色（CSS custom property 或顏色值）
 *   tooltip  - 滑鼠懸停提示（純靜態，不觸發 Webhook）
 *   workflow - 綁定的 Workflow URI（格式：workflow://id）
 *   disabled - 停用按鈕
 *
 * Events:
 *   u6u:trigger - 點擊且 workflow 已設定時發出
 *     detail: { workflowId: string, payload: Record<string, unknown> }
 *
 * Requirements: 8.2, 8.3
 */

export class U6uBtn extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'color', 'tooltip', 'workflow', 'disabled'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._shadow.querySelector('button')?.addEventListener('click', this._handleClick.bind(this));
  }

  disconnectedCallback() {
    this._shadow.querySelector('button')?.removeEventListener('click', this._handleClick.bind(this));
  }

  attributeChangedCallback() {
    this._render();
  }

  private _handleClick() {
    if (this.hasAttribute('disabled')) return;

    const workflow = this.getAttribute('workflow');
    if (workflow) {
      // Cypher binding 模式：發出 u6u:trigger
      const workflowId = workflow.replace('workflow://', '');
      this.dispatchEvent(new CustomEvent('u6u:trigger', {
        bubbles: true,
        composed: true,
        detail: { workflowId, payload: {} },
      }));
    } else {
      // 一般按鈕模式：re-dispatch 原生 click 讓外層 addEventListener 能收到
      this.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    }
  }

  private _render() {
    const label = this.getAttribute('label') ?? 'Button';
    const color = this.getAttribute('color') ?? '#3b82f6';
    const tooltip = this.getAttribute('tooltip') ?? '';
    const disabled = this.hasAttribute('disabled');

    this._shadow.innerHTML = `
      <style>
        button {
          background: ${color};
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? '0.5' : '1'};
          transition: opacity 0.2s;
        }
        button:hover:not(:disabled) {
          opacity: 0.85;
        }
      </style>
      <button
        ${disabled ? 'disabled' : ''}
        title="${tooltip}"
        part="button"
      >${label}</button>
    `;

    // 重新綁定事件（innerHTML 重建後需要重新綁定）
    this._shadow.querySelector('button')?.addEventListener('click', this._handleClick.bind(this));
  }
}

customElements.define('u6u-btn', U6uBtn);
