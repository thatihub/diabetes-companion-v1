const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const API_BASE_URL = rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`;

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

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
        return {} as T;
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
