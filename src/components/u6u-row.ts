/**
 * <u6u-row> — 水平排列容器
 *
 * 等同 flex flex-row。
 *
 * Attributes:
 *   gap     - 子元素間距（預設 8px）
 *   align   - align-items（預設 center）
 *   justify - justify-content（預設 flex-start）
 */
export class U6uRow extends HTMLElement {
  static get observedAttributes() {
    return ['gap', 'align', 'justify'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const gap = this.getAttribute('gap') ?? '8px';
    const align = this.getAttribute('align') ?? 'center';
    const justify = this.getAttribute('justify') ?? 'flex-start';
    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .row {
          display: flex;
          flex-direction: row;
          gap: ${gap};
          align-items: ${align};
          justify-content: ${justify};
        }
      </style>
      <div class="row" part="row"><slot></slot></div>
    `;
  }
}

customElements.define('u6u-row', U6uRow);
