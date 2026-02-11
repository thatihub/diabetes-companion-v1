// Use relative URLs to leverage Next.js API proxy (configured in next.config.ts)
// This avoids CORS issues and uses the server-side API_URL environment variable
const API_BASE_URL = '';

type ApiOptions = RequestInit & {
    data?: any;
};

async function fetcher<T>(endpoint: string, { data, ...customConfig }: ApiOptions = {}): Promise<T> {
    const config: RequestInit = {
        ...customConfig,
        headers: {
            'Content-Type': 'application/json',
            ...customConfig.headers,
        },
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    // Ensure endpoint starts with a slash if not provided
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const response = await fetch(`${path}`, config);

    if (!response.ok) {
        // Special case for 429 (Rate Limit / WAF)
        if (response.status === 429) {
            throw new Error('Too many requests (Rate Limited). Please wait a moment.');
        }

        // Check if response is JSON before trying to parse it
        const contentType = response.headers.get('content-type');
        let errorBody = '';

        if (contentType && contentType.includes('application/json')) {
            try {
                const errorJson = await response.json();
                errorBody = JSON.stringify(errorJson);
            } catch {
                errorBody = await response.text();
            }
        } else {
            errorBody = await response.text();
        }

        // HTML Response (Cloudflare/Proxy Error) - Don't show raw HTML
        if (errorBody.trim().startsWith('<')) {
            console.error("API returned HTML Error:", errorBody.substring(0, 500)); // Log it for dev
            throw new Error(`API Connection Error: ${response.status} ${response.statusText} (Service Protected)`);
        }

        // Provide user-friendly error messages for common issues
        if (response.status === 502) {
            throw new Error('Backend service is starting up. Please wait a moment and try again.');
        }

        // Try to extract a clean message from JSON
        let finalMessage = `API Error: ${response.status}`;
        if (contentType && contentType.includes('application/json')) {
            try {
                const errorJson = JSON.parse(errorBody);
                finalMessage = errorJson.message || errorJson.error || finalMessage;
                if (errorJson.hint) {
                    finalMessage += ` (${errorJson.hint})`;
                }
            } catch {
                finalMessage = `${finalMessage} (Parse Error) - ${errorBody.substring(0, 200)}`;
            }
        } else {
            // Include a snippet of the HTML/Text body for debugging
            const snippet = errorBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200);
            finalMessage = `${finalMessage} ${response.statusText} - ${snippet}`;
        }

        throw new Error(finalMessage);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
        return {} as T;
    }

    // Check content type before parsing as JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        // If it's not JSON but OK, likely an issue with the rewrite or endpoint
        throw new Error('API returned invalid format (not JSON).');
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: ApiOptions) =>
        fetcher<T>(endpoint, { method: 'GET', ...options }),

    post: <T>(endpoint: string, data: any, options?: ApiOptions) =>
        fetcher<T>(endpoint, { method: 'POST', data, ...options }),

    put: <T>(endpoint: string, data: any, options?: ApiOptions) =>
        fetcher<T>(endpoint, { method: 'PUT', data, ...options }),

    delete: <T>(endpoint: string, options?: ApiOptions) =>
        fetcher<T>(endpoint, { method: 'DELETE', ...options }),
};
