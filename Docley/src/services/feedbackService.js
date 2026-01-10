import apiClient from '../api/client';

/**
 * Feedback Service
 * Handles submitting user feedback to the database via NestJS Backend
 */

export async function submitFeedback(rating, message) {
    const response = await apiClient.post('/feedback', { rating, message });
    return response.data;
}

export async function getAllFeedback() {
    const response = await apiClient.get('/feedback');
    return response.data;
}