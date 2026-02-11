# ⚡️ Diabetes Companion - Quick Links & Ops

## 🌐 Production (Public)
These are live on the internet. Note that **Render Free Tier logs sleep after 15m** of inactivity.

- **Web App**: [https://diabetes-companion-web.onrender.com](https://diabetes-companion-web.onrender.com)
  - *If you see "Application Error", wait 60s and refresh.*
- **API Health Check**: [https://diabetes-companion-api.onrender.com](https://diabetes-companion-api.onrender.com)
  - *Click this to manually wake up the backend if Shortcuts are timing out.*
- **Raw Data (Last 7 Days)**: [https://diabetes-companion-api.onrender.com/api/glucose?hours=168](https://diabetes-companion-api.onrender.com/api/glucose?hours=168)

---

## 💻 Local Development (Reliable URLs)
Use `127.0.0.1` to avoid network timeouts on Mac.

- **Web Dashboard**: [http://127.0.0.1:3001](http://127.0.0.1:3001)
- **API Server Root**: [http://127.0.0.1:4000](http://127.0.0.1:4000)
- **Raw API JSON**: [http://127.0.0.1:4000/api/glucose?hours=168](http://127.0.0.1:4000/api/glucose?hours=168)

---

## 🩸 Dexcom G7 Integration

### 🔗 Connect / Re-Authenticate
Click this to start the OAuth flow with Dexcom:
👉 **[Authorize Dexcom (Production/Sandbox)](http://127.0.0.1:4000/api/dexcom/login)**

### ⚙️ Switching Environments
To switch between **Real Data** and **Test Data**:
1. Open `apps/api/.env`
2. Toggle the `DEXCOM_BASE_URL` lines:
   ```bash
   # FOR REAL DATA:
   DEXCOM_BASE_URL=https://api.dexcom.com

   # FOR TEST DATA (Use Username 'User7' / Password 'Password1'):
   # DEXCOM_BASE_URL=https://sandbox-api.dexcom.com
   ```
3. Restart API: `npm run start:api`

### ⚠️ Troubleshooting "0 Readings Fetched"
If you connect successfully but see **0 readings**:
1. **New App Provisioning**: It takes **24-48 hours** for Dexcom to enable data streaming for a newly created Client ID.
2. **Check Clarity**: Ensure your G7 app is uploading data to Dexcom Clarity.
3. **Ghost Login**: If stuck on "Sandbox" login screen, open the Auth Link in **Incognito Mode**.

---

## 🛠 Operations

### 🔄 Restart Local Servers
Run these commands in the project root:
- **API Only**: `npm run start:api`
- **Web Only**: `npm run dev:web`
- **Both**: `npm run dev` (Note: API may restart loop with --watch, use `start:api` for stability)

### 📂 Database
Data is stored in **Supabase**.
- To clear all simulated data: `node apps/api/clear-db.js`

---

## 📱 iOS Shortcuts Guide
- View the full setup guide here: [docs/APPLE_HEALTH_SHORTCUT.md](docs/APPLE_HEALTH_SHORTCUT.md)
