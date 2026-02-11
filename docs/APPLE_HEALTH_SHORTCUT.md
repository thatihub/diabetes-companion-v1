# 🍏 Apple Health + Voice Shortcuts Guide (Golden Master)

This guide enables two powerful workflows for **Diabetes Companion**:
1. **Sync Latest Glucose**: Automatically pull the most recent reading from Apple Health/Dexcom.
2. **Voice Log**: Use Siri to log a number manually ("Hey Siri, Log Glucose... 120").

---

## 📋 Prerequisites
- **API URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
- **Verification**: Ensure you can sync data and see it at `http://localhost:3001/data.html`.

---

## 🔄 Workflow A: "Sync Latest Glucose" (Automated)
*Best for: Pulling Dexcom data automatically.*

### 1. Create the Shortcut
Open **Shortcuts App** -> Tap **+** (Top Right) -> Name it **"Sync Latest Glucose"**.

### 2. Add Actions (Step-by-Step)

#### Step A: Find the Data
1.  **Search**: `Find Health Samples`.
2.  **Type**: Blood Glucose.
3.  **Sort by**: Start Date.
4.  **Order**: Latest First.
5.  **Limit**: ✅ **ON -> Get 1 sample**. (Crucial: Just 1).

#### Step B: Safety Check
1.  **Search**: `If`.
    - Condition: `If [Health Samples] does not have any value`.
2.  Inside "If":
    - **Search**: `Show Notification` ("No glucose data found").
    - **Search**: `Stop this shortcut`.
3.  **End If**. (Close the block).

#### Step C: Extract & Clean Data
1.  **Search**: `Get Details of Health Sample`.
    - Detail: **Value**. (Assign to variable `Value`).
2.  **Search**: `Get Numbers from Input`.
    - Input: **Value**. (This strips "mg/dL" text to ensure it's just a number).
    - Result: This creates a variable called `Numbers`.

#### Step D: Send to API
1.  **Search**: `Get Contents of URL`.
    - **URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
    - **Method**: POST.
    - **Headers**:
        - `Content-Type`: `application/json`
    - **Request Body**: Tap `JSON`. Add **2 Fields ONLY**:
        - **`glucose_mgdl`** (Number): Select variable **Numbers** (from Step C.2).
        - **`notes`** (Text): "Apple Health Sync".
        - *(Note: We deliberately omit `measured_at` so the server timestamps it as "Now", avoiding date format errors).*

#### Step E: Notify Success
1.  **Search**: `Show Notification`.
    - Message: "Synced Glucose!"

---

## ⏰ Set Up Daily Automation
*Once the shortcut works manually, make it run automatically.*

1.  Open **Shortcuts App** -> Tap **Automation** (Bottom Tab).
2.  Tap **New Automation** (or +).
3.  Select **Time of Day**.
4.  Pick a time (e.g., **8:00 PM**).
5.  Select **Daily**.
6.  Select **Run Immediately** (Toggle ON, so it doesn't ask you).
7.  Tap **Next**.
8.  Search/Select Action: **Run Shortcut**.
9.  Tap the placeholder "Shortcut" and select **"Sync Latest Glucose"**.
10. Done!

---

## 🎤 Workflow B: "Voice Log Glucose" (Manual)
*Best for: "Hey Siri, Log Glucose".*

1.  **Create New Shortcut** -> Name **"Log Glucose"**.
2.  **Action**: `Ask for Input`.
    - Prompt: "Reading?"
    - Type: **Number**.
3.  **Action**: `Get Contents of URL`.
    - **URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
    - **Method**: POST.
    - **Headers**: `Content-Type: application/json`
    - **Body (JSON)**:
        - `glucose_mgdl` (Number): **Provided Input** (from Step 2).
        - `notes` (Text): "Voice Log".
4.  **Action**: `Show Notification` ("Logged!").

---

## 🛠 Troubleshooting
- **"Missing fields: glucose_mgdl"**: You probably forgot the **"Get Numbers from Input"** step, so it sent text like "120 mg/dL".
- **Empty Graph?**: Check `http://localhost:3001/data.html` to see raw data.
Local Host:  http://localhost:3001
