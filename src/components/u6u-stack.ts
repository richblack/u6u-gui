/**
 * <u6u-stack> — 垂直堆疊容器
 *
 * 等同 flex flex-col，最常用的版面容器。
 *
 * Attributes:
 *   gap    - 子元素間距（預設 16px）
 *   align  - align-items（預設 stretch）
 */
export class U6uStack extends HTMLElement {
  static get observedAttributes() {
    return ['gap', 'align'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const gap = this.getAttribute('gap') ?? '16px';
    const align = this.getAttribute('align') ?? 'stretch';
    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .stack {
          display: flex;
          flex-direction: column;
          gap: ${gap};
          align-items: ${align};
        }
      </style>
      <div class="stack" part="stack"><slot></slot></div>
    `;
  }
}

customElements.define('u6u-stack', U6uStack);
