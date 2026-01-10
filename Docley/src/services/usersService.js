import apiClient from '../api/client';

export async function getUserUsage() {
    try {
        const response = await apiClient.get('/users/usage');
        return response.data;
    } catch (error) {
        console.error('Error fetching user usage:', error);
        return { used: 0, limit: 0, reset_date: null };
    }
}

/**
 * Manages user profile fetching and syncing
 */
export async function fetchUserProfile() {
    try {
        const response = await apiClient.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error; // Re-throw for AuthContext to handle login redirects
    }
}

/**
 * Syncs user profile with backend
 */
export async function syncUserProfile() {
    try {
        const response = await apiClient.post('/users/sync');
        return response.data;
    } catch (error) {
        console.error('Error syncing user profile:', error);
        return null;
    }
}
