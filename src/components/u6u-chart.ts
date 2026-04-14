/**
 * <u6u-chart> — 基礎圖表元件（折線圖）
 *
 * Attributes:
 *   data   - JSON 字串，格式：[{ label: string, value: number }]
 *   title  - 圖表標題
 *   height - 圖表高度（預設 200px）
 *
 * Requirements: 8.1
 */

interface DataPoint {
  label: string;
  value: number;
}

export class U6uChart extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'title', 'height'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  private _parseData(): DataPoint[] {
    try {
      const raw = this.getAttribute('data') ?? '[]';
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(d => typeof d.label === 'string' && typeof d.value === 'number');
    } catch {
      return [];
    }
  }

  private _render() {
    const data = this._parseData();
    const title = this.getAttribute('title') ?? '';
    const height = parseInt(this.getAttribute('height') ?? '200', 10);

    if (data.length === 0) {
      this._shadow.innerHTML = `
        <style>
          .empty { display: flex; align-items: center; justify-content: center;
            height: ${height}px; color: #9ca3af; font-size: 14px;
            border: 1px dashed #e5e7eb; border-radius: 8px; }
        </style>
        <div class="empty">暫無資料</div>
      `;
      return;
    }

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;
    const w = 400;
    const h = height - 40; // 留空間給標籤
    const padX = 30;
    const padY = 10;

    const points = data.map((d, i) => {
      const x = padX + (i / (data.length - 1 || 1)) * (w - padX * 2);
      const y = padY + (1 - (d.value - min) / range) * (h - padY * 2);
      return { x, y, ...d };
    });

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

    this._shadow.innerHTML = `
      <style>
        :host { display: block; }
        svg { width: 100%; height: ${height}px; }
        .title { font-size: 13px; font-weight: 600; fill: #374151; }
        polyline { fill: none; stroke: #3b82f6; stroke-width: 2; }
        circle { fill: #3b82f6; }
        text.label { font-size: 10px; fill: #9ca3af; text-anchor: middle; }
      </style>
      <svg viewBox="0 0 ${w} ${height}" part="chart">
        ${title ? `<text class="title" x="${w / 2}" y="16" text-anchor="middle">${title}</text>` : ''}
        <polyline points="${polyline}" />
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="3" />
          <text class="label" x="${p.x}" y="${h + 20}">${p.label}</text>
        `).join('')}
      </svg>
    `;
  }
}

customElements.define('u6u-chart', U6uChart);
