import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/ai/transform`;

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
 * Generic function to call the AI endpoint.
 * @param {string} text - The input text
 * @param {string} instruction - Specific instructions for the AI
 * @param {string} mode - 'diagnostic' or 'upgrade'
 */
export const transformDocument = async (text, instruction, mode = 'upgrade') => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text, instruction, mode }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Unauthorized: Please log in again.");
            }
            throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();

        // If mode is upgrade/transform, we return the result string.
        // If mode is diagnostic, we return the whole object, but the caller might expect just the result?
        // Let's keep the legacy return style for transform/upgrade.
        if (mode === 'upgrade' || mode === 'transform') {
            return data.result;
        }

        // For diagnostic, return the full object
        return data;

    } catch (error) {
        throw new Error('Failed to process AI request: ' + error.message);
    }
};

/**
 * FEATURE: Upgrade
 * Improves the text academically.
 */
export const upgradeDocument = async (text) => {
    const instruction = "Analyze the text and rewrite it to be more academically rigorous. Expand on the context, provide deeper elaboration on key points, and ensure the tone is scholarly.";
    return transformDocument(text, instruction, 'upgrade');
};

/**
 * FEATURE: Diagnostic
 * Returns scores and insights.
 */
export const analyzeDocument = async (text) => {
    // Re-uses transformDocument but with diagnostic mode and no instruction (service handles prompt)
    return transformDocument(text, '', 'diagnostic');
};
