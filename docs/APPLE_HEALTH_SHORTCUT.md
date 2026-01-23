# � Apple Health + Voice Shortcuts Guide (Master Spec)

This guide provides precise, step-by-step instructions for setting up two reliable iOS Shortcuts to sync glucose data to your Diabetes Companion.

---

## 🏗️ 0. Prerequisites
- **API URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
- **Verification**: Ensure you can open this URL in Safari (it might say "Cannot GET" but should load, proving connection).
- **Apple Health Data**: Ensure "Browse > Blood Glucose" has data.

---

## � Workflow A: "Sync Latest Glucose" (Dexcom/Health → App)
*Use this to automatically pull the most recent CGM reading.*

### Step 1: Create Shortcut
1. Open **Shortcuts** app > Tap **+** > Name it **"Sync Latest Glucose"**.

### Step 2: Find Data
2.  Add Action: **Find Health Samples**.
    - **Type**: Blood Glucose.
    - **Sort by**: Start Date.
    - **Order**: Latest First.
    - **Limit**: ON -> **1 sample**.

### Step 3: Safety Check (Critical)
3.  Add Action: **If**.
    - Condition: `If [Health Samples] does not have any value`.
4.  Inside "If":
    - Add Action: **Show Notification** ("No glucose data found in Apple Health").
    - Add Action: **Stop this shortcut**.
5.  **End If**.

### Step 4: Get Details (Variables)
6.  Add Action: **Get Details of Health Sample**.
    - Detail: **Value**. (Assign to variable `healthValue`).
7.  Add Action: **Get Details of Health Sample**.
    - Detail: **Start Date**. (Assign to variable `healthStartDate`).

### Step 5: Send to API
8.  Add Action: **Get Contents of URL**.
    - **URL**: `https://diabetes-companion-api.onrender.com/api/glucose` (Plain Text!).
    - **Method**: POST.
    - **Headers**:
        - `Content-Type`: `application/json`
    - **Request Body**: JSON. Add 3 fields:
        - `glucose_mgdl` (Number): `healthValue`.
        - `measured_at` (Text): `healthStartDate`.
           - *Tip: Tap the `healthStartDate` variable and set Date Format to **ISO 8601**.*
        - `notes` (Text): "Apple Health Sync".
        - `source` (Text): "apple_health" (Optional).

### Step 6: Success
9.  Add Action: **Show Notification**.
    - Message: "Synced Glucose!"

---

## 🎤 Workflow B: "Log Glucose" (Voice Command)
*Use this for manual entry: "Hey Siri, Log Glucose".*

### Step 1: Create Shortcut
1. Open **Shortcuts** > Tap **+** > Name it **"Log Glucose"**.

### Step 2: Ask for Input
2.  Add Action: **Ask for Input**.
    - Prompt: "What is your glucose?"
    - Type: **Number**.

### Step 3: Send to API
3.  Add Action: **Get Contents of URL**.
    - **URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
    - **Method**: POST.
    - **Headers**: `Content-Type: application/json`
    - **Request Body**: JSON.
        - `glucose_mgdl` (Number): **Provided Input** (Variable from Step 2).
        - `measured_at` (Text): **Current Date**.
        - `notes` (Text): "Voice Log".
        - `source` (Text): "voice_shortcut".

### Step 4: Success
4.  Add Action: **Show Notification**.
    - Message: "Logged `Provided Input` mg/dL".

---

## ⚠️ Troubleshooting Tips

1. **"Rich Text to URL" Error**:
   - Delete the URL field completely and **type it manually**. Do not paste formatted text. It must be a plain, single-line string.

2. **"No Data Found"**:
   - Shortcuts says "No data" but you see it in Health? Check permissions: **iPhone Settings > Privacy > Health > Shortcuts**. Ensure Shortcuts has Read access to Blood Glucose.

3. **Date Format**:
   - If the API rejects the date, verify you set the variable to **ISO 8601**. If that option is missing in your iOS version, sending it as default text usually works (Backend will fallback to "Now").

4. **Duplicates**:
   - Automation might send the same "Latest" sample multiple times. The Backend should handle this (or you can ignore it as harmless redundancy).
