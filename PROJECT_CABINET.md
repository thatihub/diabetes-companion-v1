# 🗄️ Project Cabinet: Diabetes Companion V1

**Application**: Diabetes Companion (AI-Powered Glucose Tracker)
**Version**: 1.1.0
**Status**: 🟢 Production Ready (Deployed on Render)
**Stable Commit**: `8834e71` (Jan 25, 2026)

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

### ✅ V1.1 Feature Update (Jan 25, 2026) - Trends & Analysis [`8834e71`]
- **New Trends Page**: Dedicated `/trends` view with stacked weekly graphs.
- **Weekly Comparison**:
  - Vertical/Grid layout for 7d, 14d, 30d, and 90d ranges.
  - Interactive charts (click to enlarge).
- **Advanced AI Insights**:
  - **Context-Aware**: Analyzes broad trends across multiple weeks.
  - **Drill-Down**: "Analyze This Week" button inside individual weekly popups for targeted advice.
- **Refactored Architecture**:
  - Created reusable `BaseGlucoseChart` component.
  - Env variable fix for reliable API key loading.

### ✅ V1.0 Release [`0bfc2a9`]
- **Core Logging**: Glucose entry (mg/dL) with timestamps.
- **Visuals**: 
  - Dynamic Line Chart (24h - 90d ranges).
  - Color-coded list view (Green/Orange/Red).
- **AI Insights**:
  - `Analyze Patterns` button generates summaries.
- **iOS Integration**:
  - "Hey Siri, Log Glucose" (Voice Shortcut).
  - "Sync Latest Glucose" (Automated HealthKit Sync).

---

## 📂 Key File Map
- **Docs**:
  - `docs/APPLE_HEALTH_SHORTCUT.md`: The "Bible" for iOS Sync.
  - `QUICK_LINKS.md`: Operational dashboard links.
- **App Code**:
  - `apps/web/app/trends/page.tsx`: **NEW** Trends dashboard.
  - `apps/web/components/BaseGlucoseChart.tsx`: **NEW** Shared reusable chart.
  - `apps/web/components/GlucoseChart.tsx`: Main dashboard chart.
  - `apps/web/components/InsightCard.tsx`: AI Analysis UI component.
  - `apps/api/src/routes/insights.js`: Enhanced AI Prompt logic (Context aware).
  - `apps/api/src/env.js`: Environment override fix.

## 🌿 Experimental Branches
- **`feature/dexcom-integration`**: Contains V2 OAuth code for direct Dexcom API connection.
  - To view/work on this: `git checkout feature/dexcom-integration`

---

*Last Updated: Jan 25, 2026*
