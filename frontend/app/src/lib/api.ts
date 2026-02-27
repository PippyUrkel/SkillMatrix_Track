const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Returns the stored JWT token from localStorage, if any.
 */
function getAuthToken(): string | null {
    return localStorage.getItem('sm_access_token');
}

/**
 * Store JWT token after login.
 */
export function setAuthToken(token: string): void {
    localStorage.setItem('sm_access_token', token);
}

/**
 * Clear stored JWT token on logout.
 */
export function clearAuthToken(): void {
    localStorage.removeItem('sm_access_token');
}

/**
 * Core request function. Attaches JSON content-type and Bearer token if available.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    // Attach auth token if available
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};
