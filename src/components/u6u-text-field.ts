/**
 * <u6u-text-field> — 多行文字輸入
 *
 * Attributes:
 *   name        - 欄位名稱（u6u-card 收集時使用）
 *   placeholder - 提示文字
 *   value       - 初始值
 *   label       - 標籤文字
 *   rows        - 行數（預設 3）
 *
 * Properties:
 *   value - 當前輸入值（可讀寫）
 *
 * Requirements: 8.1
 */

export class U6uTextField extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'placeholder', 'value', 'label', 'rows'];
  }

  private _shadow: ShadowRoot;
  private _value: string = '';

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._value = this.getAttribute('value') ?? '';
    this._render();
  }

  attributeChangedCallback(name: string, _old: string, newVal: string) {
    if (name === 'value') this._value = newVal ?? '';
    this._render();
  }

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    this._value = v;
    const ta = this._shadow.querySelector('textarea') as HTMLTextAreaElement | null;
    if (ta) ta.value = v;
  }

  private _handleInput(e: Event) {
    this._value = (e.target as HTMLTextAreaElement).value;
  }

  private _render() {
    const label = this.getAttribute('label') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? '';
    const rows = this.getAttribute('rows') ?? '3';

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          resize: vertical;
          transition: border-color 0.2s;
        }
        textarea:focus { border-color: #3b82f6; }
      </style>
      ${label ? `<label>${label}</label>` : ''}
      <textarea
        placeholder="${placeholder}"
        rows="${rows}"
        part="textarea"
      >${this._value}</textarea>
    `;

    this._shadow.querySelector('textarea')?.addEventListener('input', this._handleInput.bind(this));
  }
}

customElements.define('u6u-text-field', U6uTextField);
