import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/notifications`;

/**
 * Notifications Service
 * Handles all notification operations via the NestJS Backend
 */

// Helper to get authorization header
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

/**
 * Get all notifications
 */
export async function getNotifications() {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch notifications');
    }

    return await response.json();
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/unread-count`, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get unread count');
    }

    const data = await response.json();
    return data.count || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${notificationId}/read`, {
        method: 'PATCH',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark notification as read');
    }

    return await response.json();
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/read-all`, {
        method: 'PATCH',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark all as read');
    }

    return await response.json();
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${notificationId}`, {
        method: 'DELETE',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete notification');
    }

    return { success: true };
}

