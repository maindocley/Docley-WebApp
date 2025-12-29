import { supabase } from '../lib/supabase';

/**
 * Feedback Service
 * Handles submitting user feedback to the database
 */

/**
 * Submit user feedback
 * @param {number} rating - 1-5 star rating
 * @param {string} message - Feedback message
 * @returns {Promise<object>} - The inserted record
 */
export async function submitFeedback(rating, message) {
    const { data: { user } } = await supabase.auth.getUser();

    // We allow submission even if user is null (anonymous) 
    // but we capture user_id if they are logged in.
    const { data, error } = await supabase
        .from('feedback')
        .insert({
            user_id: user?.id || null,
            rating: rating || null,
            message: message,
        })
        .select()
        .single();

    if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
    }

    return data;
}

/**
 * Get all feedback (Admin only)
 * @returns {Promise<Array>} - Array of feedback records
 */
export async function getAllFeedback() {
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
    }

    return data || [];
}