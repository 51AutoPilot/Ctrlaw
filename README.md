# Ctrlaw - AI Agent 控制台

Tauri 桌面應用，用於管理和監控遠端 OpenClaw AI Agent 集群。透過 SSH 隧道連接 EC2 上的 Gateway，即時取得 Agent 狀態、Session 資料與節點資訊。

## 功能

- **儀表板** - 系統總覽、Agent 在線狀態、快速統計
- **任務看板** - 依狀態分欄顯示 Session 任務（待處理 / 進行中 / 已完成 / 失敗）
- **行事曆** - 月曆視圖，顯示 Session 活動時間線
- **記憶庫** - 搜尋與瀏覽 Session 對話紀錄
- **內容管線** - 5 階段內容工作流程看板
- **團隊** - Agent 組織架構與角色
- **辦公室** - 即時 Agent 狀態視覺化
- **設定** - 新增/編輯/連線 Agent，管理 SSH 隧道

## 技術棧

- **桌面框架**: Tauri 2 (Rust + WebView2)
- **前端**: Next.js 16 + React 19 (靜態匯出)
- **樣式**: Tailwind CSS 4
- **語言**: TypeScript / Rust
- **連線**: SSH 隧道 + WebSocket (OpenClaw Gateway 協議 v3)

## 架構

```
┌─────────────────┐    SSH 隧道    ┌──────────────────┐
│  Tauri 桌面應用  │ ──────────── │  EC2 (OpenClaw)   │
│                 │  localhost:N   │                  │
│  Next.js UI     │ ◄──WebSocket──│  Gateway :18789  │
│  Tauri Shell    │               │  Agent Cluster   │
└─────────────────┘               └──────────────────┘
```

應用透過 Tauri Shell Plugin 建立 SSH 隧道，將遠端 Gateway 的 18789 port 轉發到本地，再透過 WebSocket 進行即時通訊。

## 開發

```bash
cd tasks-board
npm install
npm run dev           # 啟動 Next.js 開發伺服器
npx tauri dev         # 啟動 Tauri 開發模式（含熱更新）
```

## 建置

```bash
cd tasks-board
npx tauri build       # 建置 Tauri 桌面安裝包
```

產出位於 `src-tauri/target/release/bundle/`：
- `.msi` - Windows 安裝包
- `*-setup.exe` - NSIS 安裝程式

## 使用方式

1. 開啟應用，前往「設定」頁面
2. 點擊「新增 Agent」填入 EC2 IP、SSH 使用者、PEM 金鑰路徑
3. 點擊「連線」建立 SSH 隧道
4. 連線成功後，所有頁面會即時顯示該 Agent 的 Session、Node 與健康狀態

## 多語系

內建繁體中文 (zh-TW) 與英文 (en) 切換，點擊導航列右側的語言按鈕即可切換。

## 專案結構

```
tasks-board/
├── src/
│   ├── app/              # Next.js 頁面
│   │   ├── layout.tsx    # 根佈局（導航、Provider）
│   │   ├── page.tsx      # 首頁儀表板
│   │   ├── tasks/        # 任務看板
│   │   ├── calendar/     # 行事曆
│   │   ├── memory/       # 記憶庫
│   │   ├── content/      # 內容管線
│   │   ├── team/         # 團隊
│   │   ├── office/       # 辦公室
│   │   └── settings/     # 設定
│   ├── components/       # 共用元件
│   └── lib/
│       ├── agent-context.tsx   # Agent 狀態管理 (React Context)
│       ├── gateway-client.ts   # WebSocket 客戶端
│       ├── tunnel-manager.ts   # SSH 隧道管理
│       ├── config.ts           # 設定檔讀寫
│       ├── types.ts            # TypeScript 型別定義
│       └── i18n.tsx            # 多語系
└── src-tauri/            # Tauri Rust 後端
    ├── src/lib.rs        # 應用入口
    ├── tauri.conf.json   # Tauri 設定
    └── capabilities/     # 權限設定
```
