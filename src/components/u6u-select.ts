/**
 * <u6u-select> — 下拉選單
 *
 * Attributes:
 *   options     - JSON array: [{ value: string, label: string }]
 *   value       - 當前選中值
 *   placeholder - 未選中時的提示文字（預設 "— 請選擇 —"）
 *   label       - 欄位標籤
 *
 * Properties:
 *   value - 當前選中值（可讀寫）
 *
 * Events:
 *   change - 選擇變更時發出，detail: { value: string }
 */
export class U6uSelect extends HTMLElement {
  static get observedAttributes() {
    return ['options', 'value', 'placeholder', 'label'];
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

  get value(): string { return this._value; }
  set value(v: string) {
    this._value = v;
    const sel = this._shadow.querySelector('select') as HTMLSelectElement | null;
    if (sel) sel.value = v;
  }

  private _parseOptions(): Array<{ value: string; label: string }> {
    try {
      return JSON.parse(this.getAttribute('options') ?? '[]');
    } catch {
      return [];
    }
  }

  private _handleChange(e: Event) {
    this._value = (e.target as HTMLSelectElement).value;
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: this._value },
    }));
  }

  private _render() {
    const options = this._parseOptions();
    const placeholder = this.getAttribute('placeholder') ?? '— 請選擇 —';
    const label = this.getAttribute('label') ?? '';

    const optionsHtml = options
      .map(o => `<option value="${o.value}"${this._value === o.value ? ' selected' : ''}>${o.label}</option>`)
      .join('');

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        label { display: block; font-size: 12px; color: #71717a; margin-bottom: 4px; }
        select {
          width: 100%;
          box-sizing: border-box;
          background: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #f4f4f5;
          cursor: pointer;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717a' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        select:focus { border-color: #8b5cf6; }
        option { background: #27272a; }
      </style>
      ${label ? `<label>${label}</label>` : ''}
      <select part="select">
        <option value="">${placeholder}</option>
        ${optionsHtml}
      </select>
    `;

    this._shadow.querySelector('select')?.addEventListener('change', this._handleChange.bind(this));
  }
}

customElements.define('u6u-select', U6uSelect);
