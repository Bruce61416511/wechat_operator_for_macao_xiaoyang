# 小揚同學 — AI 會員管理助手

澳門直播協會的智能化會員管理系統，支援入會申請、AI 諮詢、活動管理、通知推送等功能。

## 技術棧

| 層級 | 技術 |
|------|------|
| 後端 | Python 3.11+ / FastAPI / SQLAlchemy / PostgreSQL |
| 前端 Web | React 19 + Vite + Tailwind CSS |
| 緩存 | Redis |
| AI | DeepSeek API + Chroma 向量庫 (RAG) |
| 認證 | JWT (python-jose) |

## 環境要求

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+（或用內建 SQLite 開發模式）
- Redis 7+（可選，開發模式不需要）

---

## 快速啟動（開發模式）

開發模式使用 SQLite，無需安裝 PostgreSQL 和 Redis，零依賴一鍵啟動。

### 1. 啟動後端

```bash
cd backend
python run.py
```

後端會在 `http://localhost:8000` 啟動，自動建立 SQLite 數據庫。

- API 文檔：http://localhost:8000/docs
- 首次啟動會自動初始化 `root` 理事帳號

### 2. 啟動前端

```bash
cd frontend-web
npm install
npm run dev
```

前端會在 `http://localhost:5173` 啟動，自動代理 `/v1` 請求到後端。

---

## 測試帳號

| 角色 | 用戶名 | 密碼 | 說明 |
|------|--------|------|------|
| root 理事 | `root` | `root` | 終審審批、繳費審核、會員管理 |
| 測試會員 | `440100198001011007` | `test` | 已入會會員，可體驗會員中心 |

新用戶可以通過入會申請流程（`/apply`）自行註冊。

---

## 頁面一覽

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | 首頁 | 小揚同學 AI 對話助手 |
| `/apply` | 入會申請 | 新用戶填表提交入會申請 |
| `/login` | 登錄 | 用戶名 + 密碼登錄 |
| `/member` | 會員中心 | 個人資料、近期動態、繳費、活動推薦 |
| `/track` | 進度查詢 | 輸入身份證號查詢申請進度、上傳繳費憑證 |
| `/events` | 活動中心 | 瀏覽和報名協會活動 |
| `/about` | 協會介紹 | 澳門直播協會介紹 |
| `/guide` | 入會指南 | 入會流程和章程說明 |
| `/calendar` | 活動日曆 | 活動時間表 |
| `/announcements` | 公告資訊 | 協會最新公告 |
| `/help` | 幫助中心 | 常見問題和幫助文檔 |
| `/resources` | 資源中心 | 協會資源下載 |
| `/admin/final-review` | 終審審批 | root 理事審批入會申請（需 root 登錄） |
| `/admin/payment-approval` | 繳費審核 | root 確認繳費憑證（需 root 登錄） |
| `/admin/members` | 會員管理 | 查看和管理所有會員（需 root 登錄） |
| `/admin/constitution` | 章程管理 | 管理入會章程規則（需 root 登錄） |

---

## 核心功能流程

### 入會流程
```
註冊/登錄 → 填寫申請表 → 自動初審 → root 終審 → 上傳繳費憑證 → root 確認 → 正式入會
```

### 會員中心
- **近期動態**：已報名活動 + 繳費提醒 + 最新公告
- **繳費**：點擊「續費」上傳繳費憑證
- **爲您推薦**：即將舉辦的活動
- **查看全部**：展開所有近期動態

### 進度查詢
- 輸入身份證號查詢申請狀態
- 待繳費狀態可直接上傳繳費憑證

---

## 項目結構

```
macao_yang/
├── backend/
│   ├── run.py              # 一鍵啟動腳本
│   ├── requirements.txt
│   ├── src/
│   │   ├── main.py         # FastAPI 入口
│   │   ├── api/            # API 路由 (auth, members, applications, events, chat...)
│   │   ├── services/       # 業務邏輯層
│   │   ├── models/         # SQLAlchemy 數據模型
│   │   ├── core/           # 配置、安全、數據庫連接
│   │   └── ai/             # DeepSeek 客戶端、RAG、知識庫
│   └── tests/              # pytest 測試
├── frontend-web/
│   ├── index.html
│   ├── vite.config.js      # Vite 配置 + API 代理
│   └── src/
│       ├── App.jsx         # 路由
│       ├── components/     # React 組件
│       ├── services/       # API 客戶端
│       └── contexts/       # Auth Context
├── frontend-miniprogram/   # 微信小程序
└── specs/                  # 需求文檔
    └── 001-xiao-yang-member/
        ├── spec.md
        ├── plan.md
        ├── tasks.md
        └── contracts/
```

---

## 常用命令

```bash
# 後端
cd backend
python run.py                          # 啟動開發服務器
pytest tests/ -v                       # 運行測試
python -m src.core.seed                # 初始化 root 帳號

# 前端
cd frontend-web
npm install                            # 安裝依賴
npm run dev                            # 啟動開發服務器
npm run build                          # 生產構建

# Git
git push                               # 推送代碼
```


