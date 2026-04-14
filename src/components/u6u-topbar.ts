/**
 * <u6u-topbar> — 頂部導覽列容器
 *
 * 固定 48px 高度，水平 flex，含三個具名 slot。
 *
 * Attributes:
 *   bg           - 背景色（預設 transparent）
 *   border-color - 下邊框色（預設 #27272a）
 *   height       - 高度（預設 48px）
 *
 * Slots:
 *   left  - Logo 區（靠左）
 *   nav   - 導覽項目區（flex-1）
 *   right - 工具區（靠右）
 */
export class U6uTopbar extends HTMLElement {
  static get observedAttributes() {
    return ['bg', 'border-color', 'height'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const bg = this.getAttribute('bg') ?? 'transparent';
    const borderColor = this.getAttribute('border-color') ?? '#27272a';
    const height = this.getAttribute('height') ?? '48px';
    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        .topbar {
          height: ${height};
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 24px;
          background: ${bg};
          border-bottom: 1px solid ${borderColor};
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .left { display: flex; align-items: center; }
        .nav { display: flex; align-items: center; gap: 4px; flex: 1; }
        .right { display: flex; align-items: center; gap: 8px; }
      </style>
      <div class="topbar" part="topbar">
        <div class="left" part="left"><slot name="left"></slot></div>
        <div class="nav" part="nav"><slot name="nav"></slot></div>
        <div class="right" part="right"><slot name="right"></slot></div>
      </div>
    `;
  }
}

customElements.define('u6u-topbar', U6uTopbar);
