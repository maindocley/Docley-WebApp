import axios from 'axios';
import { supabase } from '../lib/supabase';

// 1. Base URL Resolution & Safety Check
const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
        console.error('FATAL: VITE_API_URL is missing from .env');
        return import.meta.env.DEV ? 'http://localhost:3000' : '';
    }
    return url;
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * 3. Request Interceptor: Module Intelligence
 * Automatically injects Supabase JWT into every request.
 */
apiClient.interceptors.request.use(
    async (config) => {
        // Smoke Test Indicator
        console.log('🚀 API Request:', config.method.toUpperCase(), config.url);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        } catch (error) {
            console.error('[API Client] Request Interceptor Error:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 4. Response Interceptor: Quality Control
 * Handles global error states (401, 500) and prevents zombie sessions.
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401) {
            console.warn('[API Client] 401 Unauthorized - Clearing zombie session');
            await supabase.auth.signOut();
            // No reload - let AuthContext handle the state change via onAuthStateChange
        }

        if (status >= 500) {
            console.error('[API Client] Backend Error:', error.response?.data?.message || error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
