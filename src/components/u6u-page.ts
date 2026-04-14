/**
 * <u6u-page> — 頁面容器
 *
 * 全高 flex column 背景容器，作為頁面最外層基底。
 *
 * Attributes:
 *   background - 背景色（預設 #0f0f0f）
 *   padding    - 內距（預設 0）
 */
export class U6uPage extends HTMLElement {
  static get observedAttributes() {
    return ['background', 'padding'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const bg = this.getAttribute('background') ?? '#0f0f0f';
    const padding = this.getAttribute('padding') ?? '0';
    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: ${bg};
          color: #e4e4e7;
          padding: ${padding};
          box-sizing: border-box;
        }
      </style>
      <div class="page" part="page"><slot></slot></div>
    `;
  }
}

customElements.define('u6u-page', U6uPage);
