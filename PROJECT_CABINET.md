# 🗄️ Project Cabinet: Diabetes Companion V1

**Application**: Diabetes Companion (AI-Powered Glucose Tracker)
**Version**: 1.2.0
**Status**: 🟢 Feature Complete (Dexcom Mock / Production Ready)
**Stable Commit**: `3108777` (Feb 04, 2026)
**Last Updated**: Feb 04, 2026

---

## 🚀 Key Links
| Resource | URL |
| :--- | :--- |
| **Web App** | [https://diabetes-companion-web.onrender.com](https://diabetes-companion-web.onrender.com) |
| **API Endpoint** | [https://diabetes-companion-api.onrender.com](https://diabetes-companion-api.onrender.com) |
| **Repo** | GitHub (Private) |
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

### ✅ V1.0 Release (Jan 24, 2026)
- **Core Logging**: Glucose entry (mg/dL) with timestamps.
- **AI Insights**: Short-term (48h) pattern analysis.
- **iOS Integration**: Siri Shortcuts support.

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
