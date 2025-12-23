import { supabase } from '../lib/supabase';

/**
 * Invokes the 'transform-document' Edge Function.
 * @param {string} text - The text to transform.
 * @param {string} instruction - The instruction for the AI.
 * @returns {Promise<string>} - The transformed text.
 */
export const transformDocument = async (text, instruction) => {
    const { data, error } = await supabase.functions.invoke('transform-document', {
        body: { text, instruction },
    });

    if (error) {
        throw new Error(error.message);
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data?.result || '';
};

/**
 * Specific function for the "Upgrade" feature.
 * Uses a predefined instruction for academic improvement and context expansion.
 * @param {string} text 
 * @returns {Promise<string>}
 */
export const upgradeDocument = async (text) => {
    // Instruction tailored for "Context Expansion/Elaboration" as requested
    const instruction = "Analyze the text and rewrite it to be more academically rigorous. Expand on the context, provide deeper elaboration on key points, and ensure the tone is scholarly. Do not change the fundamental meaning.";
    return transformDocument(text, instruction);
};

/**
 * Invokes the 'transform-document' function in 'analysis' mode.
 * @param {string} text 
 * @returns {Promise<Object>} JSON object with scores and improvements.
 */
export const analyzeDocument = async (text) => {
    const { data, error } = await supabase.functions.invoke('transform-document', {
        body: { text, mode: 'analysis' },
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);

    try {
        return JSON.parse(data.result);
    } catch (e) {
        console.error("Failed to parse analysis result", data.result);
        throw new Error("Invalid response format from AI");
    }
};
