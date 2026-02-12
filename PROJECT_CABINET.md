# 🗄️ Project Cabinet: Diabetes Companion V1

**Application**: Diabetes Companion (AI-Powered Glucose Tracker)
**Version**: 1.2.5
**Status**: 🔵 v3 Production Active (Live Dexcom Data Syncing)
**Stable Commit**: `2444b8b` (Feb 12, 2026)
**Last Updated**: Feb 12, 2026

---

## 🚀 Key Links
| Resource | URL |
| :--- | :--- |
| **Web App** | [https://diabetes-companion-web.onrender.com](https://diabetes-companion-web.onrender.com) |
| **API Endpoint** | [https://diabetes-companion-api.onrender.com](https://diabetes-companion-api.onrender.com) |
| **Repo** | [GitHub (Private)](https://github.com/thatihub/diabetes-companion-v1) |
| **Quick Links** | [QUICK_LINKS.md](./QUICK_LINKS.md) |
| **Data View** | [http://localhost:4000/data.html](http://localhost:4000/data.html) (Local) |

---

## 🏛 Architecture
- **Front End**: Next.js 14, Tailwind CSS, Recharts.
- **Back End**: Node.js/Express.
- **Database**: Supabase (PostgreSQL).
- **AI Engine**: OpenAI (GPT-4o) via API (Backend Proxy).
- **Integration**: Dexcom G7 (v3 OAuth2), Apple Health (Shortcuts).

---

## 📜 Recent Change Log / Features Enabled

### ✅ V1.2.5: The v3 Deep Sync & Metabolic Integration (Feb 12, 2026)
- **Dexcom v3 Migration**:
  - Switched production backend to Dexcom v3 API for G7 sensor compatibility.
  - Resolved the "0 records" redirect bug by adopting modern v3 parsing.
- **90-Day Deep History**:
  - **Chunked Syncing**: Automated logic to pull 90 days in three 30-day increments (bypassing Dexcom API limits).
  - **Background Migration**: Populated thousands of records from mid-November to present.
- **Full Metabolic Profile**:
  - Added parallel syncing of **Insulin Doses** and **Carb Entries** from Dexcom Cloud.
  - Updated database schema (`glucose_readings`) to support standalone metabolic events (glucose-null entries).
- **Data Viewer Pro (data.html)**:
  - **New Columns**: Integrated Insulin (Rose) and Carbs (Emerald) columns with high-contrast status tags.
  - **Navigation**: Added floating "Jump to Top/Bottom" buttons for ultra-fast history browsing.
  - **Capacity**: Increased viewer limit to 50,000 records to support full 90-day density.
- **Data Integrity**: Purged all mock "sine wave" data and simulations for a 100% verified "Real Data Only" environment.

### ✅ V1.2.4: The UI & Analysis Refinement (Feb 11, 2026)
- **Trends UI Overhaul**:
  - **Redesigned Page**: Cleaned up the Trends page for a premium, anti-clutter look.
  - **Navigation**: Added a prominent "Back to Dashboard" button for seamless flow.
  - **Enlarged Graph Popups**: Click any weekly chart to open a full-depth, 500px high analysis window.
- **High-Contrast Visualization**:
  - **Color Distinction**: Switched Carbs to **Emerald Green** (#10b981) and Insulin to **Rose Red** (#f43f5e) for instant recognition.
  - **Geometry Distinction**: Carbs use thick bars; Insulin uses thin "needle-like" pillars to prevent visual overlapping.
- **Detailed AI Intelligence**:
  - **Weekly Pattern Analysis**: New "Analyze Patterns" button inside the popup for specialized 7-day diagnostics.
  - **Backend Fixes**: Increased API JSON limit (1MB) to handle high-density weekly data transfers.

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
