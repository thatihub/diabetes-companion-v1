# Draft Email for Dexcom Developer Support

**To:** `developer.support@dexcom.com`  
**Subject:** Production V2 API: 'egvs' Endpoint Returning 0 Records despite DataRange Confirmation (Individual Access)

---

Hello Dexcom Developer Support,

I am building an "Individual Access" integration for my personal tracking app and encountering a specific issue with the Production V2 API.

**The Issue:**
Although I can successfully authenticate (OAuth2) and the `/dataRange` endpoint confirms that my account has recent data (up to today), requests to the `/egvs` endpoint specifically return an empty list (`[]`) with a `200 OK` status.

**Technical Details:**

*   **Client ID:** `xUxYwCNC8irLb9OP6GMg2C5PlinH58jI`
*   **Environment:** Production (`https://api.dexcom.com`)
*   **Scopes Granted:** `offline_access egv event calibration`

**Evidence of Discrepancy:**

1.  **Data Range Request** (`GET /v2/users/self/dataRange`):
    *   Response confirms data exists through **Feb 3, 2026**: 
        ```json
        "egvs": {
            "end": { "systemTime": "2026-02-03T06:45:49", "displayTime": "2026-02-02T22:45:49" }
        }
        ```

2.  **EGV Request** (`GET /v2/users/self/egvs`):
    *   I am querying the exact window returned above (using UTC systemTime formatted strings):
    *   **URL:** `https://api.dexcom.com/v2/users/self/egvs?startDate=2026-02-03T05:45:49&endDate=2026-02-03T06:45:49` (Tracing the last hour).
    *   **Response:** `200 OK`
    *   **Body:** `{"egvs": [], "unit": "mg/dL", ...}`

**Troubleshooting Steps Taken:**
*   Verified access token is valid and has `egv` scope.
*   Tried multiple time windows: "Display Time" local windows, "System Time" UTC windows, and narrow windows around the last known calibration time.
*   All requests return `200 OK` but `0` records.

Could you please verify if there is a permission flag or data-aging policy on this specific account/Client ID that is preventing the EGV stream from being served?

Thank you,
Prakash Thatikunta
