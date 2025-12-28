/**
 * API Configuration Helper
 * Automatically switches between local and production URLs based on environment
 */

const getApiUrl = () => {
    // Priority 1: Environment variable from Vite (.env)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Priority 2: In development mode, always use localhost
    if (import.meta.env.DEV) {
        return 'http://localhost:3000';
    }

    // Priority 3: Fallback if no ENV is set in production
    // (Usually this shouldn't happen if Vercel is configured)
    return 'https://docley-backend.onrender.com'; // Replace with real production URL if known
};

export const API_BASE_URL = getApiUrl();
