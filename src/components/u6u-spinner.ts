/**
 * <u6u-spinner> — 載入中指示器
 *
 * Attributes:
 *   size  - sm | md | lg（預設 md）
 *   color - 主題色（預設 #8b5cf6）
 */
const SIZE_MAP: Record<string, string> = {
  sm: '16px',
  md: '24px',
  lg: '36px',
};

export class U6uSpinner extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'color'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const sizeKey = this.getAttribute('size') ?? 'md';
    const size = SIZE_MAP[sizeKey] ?? SIZE_MAP['md'];
    const color = this.getAttribute('color') ?? '#8b5cf6';

    this._shadow.innerHTML = `
      <style>
        :host { display: inline-block; }
        .spinner {
          width: ${size};
          height: ${size};
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: ${color};
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="spinner" part="spinner" role="status" aria-label="載入中"></div>
    `;
  }
}

customElements.define('u6u-spinner', U6uSpinner);
