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

## 📜 recent Change Log / Features Enabled

### ✅ V1.0 Release (Current)
- **Core Logging**: Glucose entry (mg/dL) with timestamps.
- **Visuals**: 
  - Dynamic Line Chart (24h - 90d ranges).
  - Color-coded list view (Green/Orange/Red).
- **AI Insights**:
  - `Analyze Patterns` button generates bullet-point summaries of last 48h.
  - Smart rendering of "Voice Logs".
- **iOS Integration**:
  - "Hey Siri, Log Glucose" (Voice Shortcut).
  - "Sync Latest Glucose" (Automated HealthKit Sync).
- **Resilience**:
  - Crash prevention for missing meal tags.
  - Server auto-wake documentation.

---

## 📂 Key File Map
- **Docs**:
  - `docs/APPLE_HEALTH_SHORTCUT.md`: The "Bible" for iOS Sync.
  - `QUICK_LINKS.md`: Operational dashboard links.
- **App Code**:
  - `apps/web/components/GlucoseChart.tsx`: Main viz logic.
  - `apps/web/components/GlucoseHistory.tsx`: List logic (Fixed crash).
  - `apps/api/src/routes/glucose.js`: Core CRUD API.
  - `apps/api/src/routes/insights.js`: AI Prompt logic.

## 🌿 Experimental Branches
- **`feature/dexcom-integration`**: Contains V2 OAuth code for direct Dexcom API connection.
  - To view/work on this: `git checkout feature/dexcom-integration`

---

*Last Updated: Jan 24, 2026*
