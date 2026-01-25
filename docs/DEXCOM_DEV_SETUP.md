# 📟 Dexcom Developer API Setup Guide

> **Note**: This is for **V2 Integration** (Direct API connection).
> Currently, we use Apple Health Sync (V1), which is easier and doesn't require approval.

To pull data directly from Dexcom servers (bypassing Apple Health), you need to register as a developer.

---

## 1. Register for an Account
1.  Go to the **[Dexcom Developer Portal](https://developer.dexcom.com/)**.
2.  Click **"Sign Up"** (top right) or "Get Started".
    - *Note: This is separate from your G7 User Account.* use a developer email.
3.  Complete the registration and verify your email.

## 2. Create an App (Get Keys)
1.  Log in to the Developer Portal.
2.  Go to **"My Apps"** -> **"+ New App"**.
3.  Fill in the details:
    - **App Name**: Diabetes Companion (Dev)
    - **User Region**: US (or your specific region)
    - **Supported Devices**: Web / Mobile
    - **Redirect URI**: `http://localhost:4000/api/dexcom/callback` (We will need this later for OAuth).
4.  Click **Create**.

## 3. Copy Your Credentials
Once created, you will see:
- **Client ID**: (e.g., `ded09d...`)
- **Client Secret**: (e.g., `38dj...`) -> *Click "Show" to see it.*

> 🔒 **Security Warning**: NEVER share these keys or commit them to GitHub.
> Save them in your `.env` file immediately.

## 4. Sandbox vs. Production
- **Sandbox (Default)**:
  - Immediately available.
  - Returns **Fake/Simulated Data** only.
  - Good for testing if your code works.
- **Production (Your Real Data)**:
  - Requires "Guest Access" or "Partner Access".
  - You must apply for **"Limited Production Access"** if you just want your own data.
  - **Steps**:
    1. Go to "My Apps".
    2. Select your App.
    3. Look for "Apply for Production Access" or "Request Limited Access".
    4. Explain this is a "Personal Project for my own data analysis".

---

## 5. Alternative: "Unofficial" Share API
If Dexcom denies production access for a personal app, many developers use the **Dexcom Share Private API** (pseudo-authenticated).
- This uses your **Dexcom Username & Password** directly.
- No API Key required.
- **We can explore this route in V2 if the official API proves too difficult.**

---

### ✅ Next Steps
1.  Register and get your **Client ID** / **Secret**.
2.  Save them in `.env`.
3.  Let me know if you want to write the OAuth code!
