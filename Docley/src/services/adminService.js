import { supabase } from '../lib/supabase';

const API_URL = 'http://localhost:3000';

// Helper to get auth headers
const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('User not authenticated');
    }
    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    };
};

// Check if current user is admin
export async function checkIsAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const role = user.user_metadata?.role || user.app_metadata?.role;
    return role === 'admin';
}

// Get Dashboard Stats from NestJS Backend
export async function getDashboardStats() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/stats`, { headers });

        if (!response.ok) {
            if (response.status === 403) throw new Error('Admin access required');
            throw new Error('Failed to fetch stats');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return { users: 0, documents: 0, aiUsage: 0 };
    }
}

// Get All Users from NestJS Backend
export async function getAdminUsers() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/users`, { headers });

        if (!response.ok) {
            if (response.status === 403) throw new Error('Admin access required');
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Update User Status (Ban/Unban)
export async function updateUserStatus(userId, status) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error('Failed to update user status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
}

// Delete User
export async function deleteUser(userId) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
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
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/posts`, { headers });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export async function getBlogPost(id) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/posts/${id}`, { headers });

        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
}

export async function createBlogPost(postData) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/posts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error('Failed to create post');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

export async function updateBlogPost(id, updates) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/posts/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error('Failed to update post');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

export async function deleteBlogPost(id) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/admin/posts/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to delete post');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}

