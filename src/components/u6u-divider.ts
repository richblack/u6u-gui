/**
 * <u6u-divider> — 水平分隔線
 *
 * Attributes:
 *   color   - 線條色（預設 #27272a）
 *   spacing - 上下 margin（預設 0px）
 */
export class U6uDivider extends HTMLElement {
  static get observedAttributes() {
    return ['color', 'spacing'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const color = this.getAttribute('color') ?? '#27272a';
    const spacing = this.getAttribute('spacing') ?? '0px';
    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        hr {
          border: none;
          border-top: 1px solid ${color};
          margin: ${spacing} 0;
        }
      </style>
      <hr part="divider" />
    `;
  }
}

customElements.define('u6u-divider', U6uDivider);
