# u6u-gui

> u6u 的人類操作介面。AI 透過 [u6u-mcp](../u6u-mcp) 操作，人類透過這個 GUI 操作——兩者共享同一個 KBDB 狀態，AI 改了什麼，畫布即時反映。

---

## 功能

- **畫布**：雙面翻轉介面。正面是 UI 視圖（Web Components 組裝），反面是 Cypher 邏輯視圖（三元組編輯）
- **零件庫**：瀏覽、搜尋所有已上架的 WASM 零件，查看合約與評分
- **Workflow 管理**：列出所有 Workflow，直接執行或跳至畫布編輯

## 快速開始

```bash
pnpm install
pnpm dev
```

預設連線至本地後端：
- KBDB：`http://localhost:8787`
- Cypher Executor：`http://localhost:8788`
- Component Registry：`https://component-registry.finally.click`

## 環境變數

在 `.env.local` 設定（覆蓋預設值）：

```env
VITE_KBDB_URL=http://localhost:8787
VITE_CYPHER_URL=http://localhost:8788
VITE_REGISTRY_URL=https://component-registry.finally.click
```

## 部署

```bash
pnpm deploy
```

即 `pnpm build && wrangler pages deploy dist`。

## 與 u6u-mcp 搭配壓測

1. 在此 IDE 開啟 u6u-gui，執行 `pnpm dev`
2. 在另一個 IDE 開啟 u6u-mcp，連接 Claude Desktop 或 Cursor
3. AI 透過 MCP 工具操作（搜尋零件、執行 Workflow）
4. 畫布每 5 秒 polling KBDB，AI 的操作結果即時顯示

## 技術棧

- React 19 + Vite + Tailwind CSS v4
- u6u Web Components（`<u6u-btn>`、`<u6u-card>`、`<u6u-text-input>` 等）
- Cloudflare Pages
