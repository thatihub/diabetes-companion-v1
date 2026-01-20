
# 🍏 Apple Health to Diabetes Companion (iOS Shortcut)

This guide helps you create an iOS Shortcut to automatically sync glucose readings from Apple Health (Dexcom/Libre/Manual) to your Diabetes Companion app.

## 1. Prerequisites
- **API URL**: `https://diabetes-companion-api.onrender.com/api/glucose` (Confirm this is your actual URL)
- **iPhone** with Apple Health data.

## 2. Create the Shortcut
Open the **Shortcuts** app on your iPhone and create a new shortcut named **"Sync Glucose"**.

### Step 1: Get Date
- **Action**: `Date` -> `Current Date`
- **Action**: `Adjust Date` -> Subtract `3` hours from `Date` (To avoid duplicates, we only sync recent)

### Step 2: Find Health Samples
- **Action**: `Find Health Samples`
- **Type**: `Blood Glucose`
- **Filters**: 
  - `Start Date` is after `Adjusted Date`
- **Sort by**: `Start Date` (Latest First)
- **Limit**: `20` (Safety limit)

### Step 3: Loop Through Samples
- **Action**: `Repeat with Each` item in `Health Samples`
  
  Inside the loop:
  - **Action**: `Get Details of Health Sample` -> Get `Value` from `Repeat Item` (Store as variable `GlucoseValue`)
  - **Action**: `Get Details of Health Sample` -> Get `Start Date` from `Repeat Item` (Store as variable `GlucoseDate`)
  
  - **Action**: `Get Contents of URL`
    - **URL**: `YOUR_RENDER_API_URL/api/glucose`
    - **Method**: `POST`
    - **Headers**:
      - `Content-Type`: `application/json`
    - **Request Body**: `JSON`
      - `glucose_mgdl`: (Number) `GlucoseValue`
      - `measured_at`: (Text) `GlucoseDate`
      - `notes`: "Synced from Apple Health"
  
- **End Repeat**

## 3. Automation (Optional)
To make it run automatically:
1. Go to **Automation** tab in Shortcuts.
2. Create **Personal Automation**.
3. Trigger: **"Time of Day"** (e.g., Every 4 hours) OR **"When I open App"** (Diabetes Companion).
4. Action: **Run Shortcut** -> "Sync Glucose".
5. Turn OFF "Ask Before Running".

## 4. Troubleshooting
- If it fails, check your Render logs.
- Ensure `measures_at` format from Apple Health matches your DB (ISO String). Usually Shortcuts handles this well.

---
**Note**: This simple sync might create duplicates if run too often. Your API should handle duplicates (e.g., `ON CONFLICT DO NOTHING`) or you can rely on the short time window (3h) and infrequent runs.
