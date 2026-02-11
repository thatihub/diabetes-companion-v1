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
- **Sandbox**:
  - ⚠️ **WARNING**: Do NOT connect to a Sandbox user if you have "Individual Access".
  - **Reason**: You only get **one** connection allowed. If you use it on a Sandbox test user, you might lock yourself out of connecting your real account.
  - Only use Sandbox if you are awaiting access or purely testing for others.

- **Production (Individual Access)**:
  - **Status**: ✅ GRANTED (as of Jan 2026).
  - **Target**: Your real Dexcom account.
  - **Constraint**: Authenticate with your *personal* Dexcom credentials immediately.
  - **Endpoints**: Use the Production API URLs, not Sandbox.

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
