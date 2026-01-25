# ⚡️ Diabetes Companion - Quick Links & Ops

## 🌐 Production (Public)
These are live on the internet. Note that **Render Free Tier logs sleep after 15m** of inactivity.

- **Web App**: [https://diabetes-companion-web.onrender.com](https://diabetes-companion-web.onrender.com)
  - *If you see "Application Error", wait 60s and refresh.*
- **API Health Check**: [https://diabetes-companion-api.onrender.com](https://diabetes-companion-api.onrender.com)
  - *Click this to manually wake up the backend if Shortcuts are timing out.*
- **Raw Data (Last 7 Days)**: [https://diabetes-companion-api.onrender.com/api/glucose?hours=168](https://diabetes-companion-api.onrender.com/api/glucose?hours=168)

---

## 💻 Local Development
These only work when running `start_dc_web` and `start_dc_api` on your Mac.

- **Web Dashboard**: [http://localhost:3001](http://localhost:3001)
- **Data Table Viewer**: [http://localhost:3001/data.html](http://localhost:3001/data.html)
- **Raw API JSON**: [http://localhost:4000/api/glucose?hours=168](http://localhost:4000/api/glucose?hours=168)

---

## 🛠 Troubleshooting & Operations

### 💤 "Network Connection Lost" / Server Sleeping
If your Shortcut fails after a few hours of no use:
1. Click the **[API Health Check](https://diabetes-companion-api.onrender.com)** link.
2. Wait until it loads "Diabetes Companion API is running."
3. Run the Shortcut again.

### 🔄 Restart Local Servers
If localhost is broken, run these aliases in your terminal:
- `start_dc_api` (Restarts API on port 4000)
- `start_dc_web` (Restarts Web on port 3001)

### 📂 Database
Data is stored in **Supabase**.
- Use the **[Data Table Viewer](http://localhost:3001/data.html)** to verify entries.
- To delete an entry, hover over it in the Web Dashboard list and click **(×)**.

---

## 📱 iOS Shortcuts Guide
- View the full setup guide here: [docs/APPLE_HEALTH_SHORTCUT.md](docs/APPLE_HEALTH_SHORTCUT.md)
