import apiClient from '../api/client';

/**
 * Notifications Service
 * Handles fetching and managing user notifications via NestJS Backend
 */

export async function getNotifications() {
    try {
        const response = await apiClient.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
}

export async function markAllAsRead() {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
}

export const deleteNotification = async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
};

export async function getUnreadCount() {
    try {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data.count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}
