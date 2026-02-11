# 🗄️ Project Cabinet: Diabetes Companion V1

**Application**: Diabetes Companion (AI-Powered Glucose Tracker)
**Version**: 1.2.1
**Status**: 🟢 Production Ready (Dexcom Integration Merged)
**Stable Commit**: `64add38` (Feb 10, 2026)
**Last Updated**: Feb 10, 2026

---

## 🚀 Key Links
| Resource | URL |
| :--- | :--- |
| **Web App** | [https://diabetes-companion-web.onrender.com](https://diabetes-companion-web.onrender.com) |
| **API Endpoint** | [https://diabetes-companion-api.onrender.com](https://diabetes-companion-api.onrender.com) |
| **Repo** | [GitHub (Private)](https://github.com/thatihub/diabetes-companion-v1) |
| **Quick Links** | [QUICK_LINKS.md](./QUICK_LINKS.md) |

---

## 🏛 Architecture
- **Front End**: Next.js 14, Tailwind CSS, Recharts.
- **Back End**: Node.js/Express.
- **Database**: Supabase (PostgreSQL).
- **AI Engine**: OpenAI (GPT-4o) via API (Backend Proxy).
- **Integration**: Dexcom G7 (OAuth2), Apple Health (Shortcuts).

---

## 📜 Recent Change Log / Features Enabled

### ✅ V1.2.1 Hotfix (Feb 10, 2026) - "Production Stability"
- **Critical Fixes**:
  - **Render Deployment**: Resolved build failures by enforcing TypeScript/ESLint rules for production.
  - **API Proxy**: Configured Next.js rewrites to correctly route `/api/*` to the backend.
  - **Database Connection**: Hardened empty state handling; populated production database with seed data.
  - **Git Hygiene**: Merged `feature/dexcom-integration` into `main` and cleaned up repo.

### ✅ V1.2 Updates (Feb 04, 2026) - "The Analytics Upgrade"
- **Trends & Intelligence**:
  - **90-Day Analysis**: Full history visualization (26k+ points supported).
  - **Split View**: Break down history into weekly graphs for easy comparison.
  - **Auto-Stats**: Real-time calculation of Average Glucose and GMI (Est. A1C).
  - **AI Weekly Insights**: "Analyze Trends with AI" button compares weeks and highlights progress.
- **Backend Stability**:
  - **Axios Migration**: Replaced OpenAI Node SDK with direct Axios calls to fix stability.
  - **Limit Fix**: Increased API fetch limits (1000 -> 50,000) for deep learning.
  - **Secure Env**: Fixed .env loading priority.
- **Dexcom Integration**:
  - **Mock Fallback**: Robust fallback system when Dexcom API returns 0 records (due to pending permissions).

### ✅ V1.1 Updates (Jan 29, 2026)
- **Dexcom Production Integration**:
  - **Status**: Credentials updated, OAuth flow functional.
  - **Current State**: Waiting for Dexcom Developer Authorization (Mock data active).

---

## 📂 Key File Map
- **Docs**:
  - `docs/APPLE_HEALTH_SHORTCUT.md`: The "Bible" for iOS Sync.
  - `DEXCOM_SUPPORT_EMAIL_DRAFT.md`: Draft for Dexcom Ops.
- **App Code**:
  - `apps/web/app/trends/page.tsx`: New Trends Dashboard.
  - `apps/web/components/TrendsSplitView.tsx`: Multi-graph logic.
  - `apps/api/src/routes/insights.js`: AI Logic (Axios).
  - `apps/api/src/routes/dexcom.js`: Dexcom Sync logic.

---
