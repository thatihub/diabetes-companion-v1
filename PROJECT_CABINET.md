# 🗄️ Project Cabinet: Diabetes Companion V1

**Application**: Diabetes Companion (AI-Powered Glucose Tracker)
**Version**: 1.0.0
**Status**: 🟢 Production Ready (Deployed on Render)
**Stable Commit**: `0bfc2a9` (Jan 24, 2026)

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
- **AI Engine**: OpenAI (GPT-4o) via API.
- **Integration**: Apple Health via iOS Shortcuts.

---

## 📜 Recent Change Log / Features Enabled
 
### ✅ V1.1 Updates (Jan 29, 2026)
- **Dexcom Production Integration**:
  - **Status**: 🟡 Connected & Authenticated (Waiting for Data Propagation).
  - **Credentials**: Updated to Individual Access (Production) keys.
  - **OAuth Flow**: Fully functional (Redirects -> Token Exchange -> Sync).
  - **Environment**: Configured for `api.dexcom.com`.
  - **Current State**: API is syncing 0 records. Pending 24-48h Dexcom provisioning delay for new clients.
- **DevOps**:
  - Updated detailed `QUICK_LINKS.md` for local dev and troubleshooting.
 
### ✅ V1.0 Release (Jan 24, 2026)
- **Core Logging**: Glucose entry (mg/dL) with timestamps.
- **Visuals**: 
  - Dynamic Line Chart (24h - 90d ranges).
  - Color-coded list view (Green/Orange/Red).
- **AI Insights**:
  - `Analyze Patterns` button generates bullet-point summaries of last 48h.
- **iOS Integration**:
  - "Hey Siri, Log Glucose" (Voice Shortcut).
 
---
 
## 📂 Key File Map
- **Docs**:
  - `docs/APPLE_HEALTH_SHORTCUT.md`: The "Bible" for iOS Sync.
  - `QUICK_LINKS.md`: Operational dashboard links.
- **App Code**:
  - `apps/api/src/routes/dexcom.js`: Dexcom OAuth & Sync logic.
  - `apps/web/components/GlucoseChart.tsx`: Main viz logic.
  - `apps/web/components/GlucoseHistory.tsx`: List logic.
  - `apps/api/src/routes/glucose.js`: Core CRUD API.
 
---
 
*Last Updated: Jan 29, 2026*
