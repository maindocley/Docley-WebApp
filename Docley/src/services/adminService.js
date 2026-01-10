import apiClient from '../api/client';

/**
 * Admin Service
 * Handles admin-specific operations via NestJS Backend
 */

// Check if current user is admin via NestJS Backend
export async function checkIsAdmin() {
    try {
        const response = await apiClient.get('/users/check-admin');
        return response.data.isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Get Dashboard Stats from NestJS Backend
export async function getDashboardStats() {
    try {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return { users: 0, documents: 0, aiTokens: 0 };
    }
}

// Get Recent Admin Activity
export async function getAdminActivity() {
    try {
        const response = await apiClient.get('/admin/activity');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin activity:', error);
        return [];
    }
}

// Get All Users from NestJS Backend
export async function getAdminUsers() {
    try {
        const response = await apiClient.get('/admin/users');
        return response.data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Update User Status (Ban/Unban)
export async function updateUserStatus(userId, status) {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
}

// Delete User
export async function deleteUser(userId) {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
}

// Get User Growth Data (Chart) - Mock for now
export async function getUserGrowthData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map(month => ({
        name: month,
        users: Math.floor(Math.random() * 500) + 100,
        documents: Math.floor(Math.random() * 1000) + 200,
    }));
}

// Get Revenue Data (Chart) - Mock for now
export async function getRevenueData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map(month => ({
        name: month,
        amount: Math.floor(Math.random() * 5000) + 1000,
    }));
}

// --- Blog Management via NestJS API ---

export async function getBlogPosts() {
    try {
        const response = await apiClient.get('/admin/posts');
        return response.data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export async function getBlogPost(id) {
    const response = await apiClient.get(`/admin/posts/${id}`);
    return response.data;
}

export async function createBlogPost(postData) {
    const response = await apiClient.post('/admin/posts', postData);
    return response.data;
}

export async function updateBlogPost(id, updates) {
    const response = await apiClient.patch(`/admin/posts/${id}`, updates);
    return response.data;
}

export async function deleteBlogPost(id) {
    const response = await apiClient.delete(`/admin/posts/${id}`);
    return response.data;
}

// Upload Image to Supabase Storage via NestJS Backend Proxy
export async function uploadBlogImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/admin/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.publicUrl;
}

// --- System Settings via NestJS API ---

export async function getGlobalSettings() {
    try {
        const response = await apiClient.get('/admin/settings');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { maintenance_active: false };
    }
}

export async function updateGlobalSettings(settings) {
    const response = await apiClient.patch('/admin/settings', settings);
    return response.data;
}
