# 🍏 Apple Health & Voice Automation Guide

This guide enables two powerful workflows for **Diabetes Companion**:
1. **Sync Latest Glucose**: Automatically pull the most recent CGM/BGM reading from Apple Health.
2. **Voice Log**: Use Siri to log a number manually ("Hey Siri, Log Glucose... 120").

---

## 📋 Prerequisites
- **API URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
- **iPhone** with Apple Health data (Dexcom G7, Libre, or Manual entries).

---

## 🛠 Workflow A: "Sync Latest Glucose" (Automated)
*Best for: Pulling Dexcom data automatically.*

### 1. Create the Shortcut
Open **Shortcuts App** -> Tap **+** (Top Right) -> Name it **"Sync Latest Glucose"**.

### 2. Add Actions (Tap "Add Action" for each)

#### Step A: Find the Data
1.  **Search**: `Find Health Samples`.
2.  **Type**: Tap "Type" -> Select **Blood Glucose**.
3.  **Sort by**: Tap "Start Date" -> Select **Start Date**.
4.  **Order**: Tap "Oldest First" -> Change to **Latest First**.
5.  **Limit**: Turn ON "Limit" -> Set to **1 sample**.

#### Step B: Get Details (Variables)
1.  **Search**: `Get Details of Health Sample`.
    - *Input should auto-select "Health Samples".*
    - Tap "Value" (or whatever property is shown) -> Select **Value**.
2.  **Search**: `Get Details of Health Sample`.
    - *Input should auto-select "Health Samples".*
    - Tap "Value" -> Select **Start Date**.

#### Step C: Check if Data Exists (Safety)
1.  **Search**: `If`.
    - Logic: `If` [Health Samples] `does not have any value`.
2.  **Search**: `Show Notification`.
    - Message: "No glucose data found in 24h."
3.  **Search**: `Stop this shortcut`.
4.  **Search**: `End If`. (This closes the block).

#### Step D: Send to API
1.  **Search**: `Get Contents of URL`.
    - **URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
    - **Method**: Tap `GET` -> Change to **`POST`**.
    - **Headers**: Tap arrow -> Add new header:
        - Key: `Content-Type`
        - Value: `application/json`
    - **Request Body**: Tap `JSON`. Add 3 Fields:
        - **`glucose_mgdl`** (Number): Select variable from **Step B.1** (Value).
        - **`measured_at`** (Text): Select variable from **Step B.2** (Start Date).
            - *Critical*: Tap the variable "Start Date" inside the field -> Select Date Format: **ISO 8601**.
        - **`notes`** (Text): "Apple Health Sync"

#### Step E: Notify Success
1.  **Search**: `Show Notification`.
    - Message: "Synced Glucose!" (You can insert variables like "Value" here).

---

## 🎤 Workflow B: "Voice Log Glucose" (Manual)
*Best for: "Hey Siri, Log 120" when you are away from your CGM.*

### 1. Create the Shortcut
Open **Shortcuts App** -> Tap **+** -> Name it **"Log Glucose"**.

### 2. Add Actions
1.  **Action**: `Ask for Input`.
    - Prompt: "What is your glucose?"
    - Type: **Number**.
2.  **Action**: `Get Contents of URL`.
    - **URL**: `https://diabetes-companion-api.onrender.com/api/glucose`
    - **Method**: `POST`
    - **Headers**: `Content-Type: application/json`
    - **Body (JSON)**:
        - **`glucose_mgdl`** (Number): Select **Provided Input** (from Step 1).
        - **`notes`** (Text): "Voice Log"
3.  **Action**: `Show Notification`.
    - Message: "Logged!"

---

## ⚠️ Troubleshooting
- **"No data found"**:
  - Open Apple Health -> Browse -> Vitals -> Blood Glucose.
  - Scroll top bottom -> **Show All Data**. If empty, check Dexcom Permissions (iPhone Settings -> Privacy -> Health).
- **"Network Error"**:
  - Ensure your API is running (Render website is accessible).
- **Date Format Error**:
  - In the "Get Contents of URL" step, ensure `measured_at` variable is set to **ISO 8601** format (Tap on the variable to configure).
