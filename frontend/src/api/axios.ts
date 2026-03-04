/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://product-management-system-ux66.onrender.com'
        : 'http://localhost:5000',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});


// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // You can attach auth tokens here in the future
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ error?: string; message?: string; action_required?: string }>) => {
        if (!error.response) {
            // Network error / server unreachable
            return Promise.reject({
                ...error,
                userMessage:
                    'Unable to reach the server. Please check your internet connection and try again.',
                isNetworkError: true,
            });
        }

        const { status, data } = error.response;

        let userMessage = data?.error || data?.message || 'An unexpected error occurred.';

        if (data?.action_required) {
            userMessage += ` • ${data.action_required}`;
        }

        switch (status) {
            case 400:
                userMessage = data?.error || 'Invalid request. Please check your inputs.';
                break;
            case 404:
                userMessage = data?.error || 'The requested resource was not found.';
                break;
            case 409:
                userMessage = data?.error || 'A conflict occurred with the current state of the resource.';
                break;
            case 500:
                userMessage = data?.error || 'Internal server error. Our team has been notified.';
                break;
            case 503:
                userMessage = 'The service is temporarily unavailable. Please try again shortly.';
                break;
        }

        return Promise.reject({ ...error, userMessage, httpStatus: status });
    }
);

export default api;
