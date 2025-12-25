const API_URL = 'http://localhost:3000/ai/transform';

export const transformDocument = async (text, instruction) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, instruction, mode: 'transform' }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        throw new Error('Failed to transform document: ' + error.message);
    }
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
 * Invokes the NestJS backend in 'analysis' mode.
 * @param {string} text 
 * @returns {Promise<Object>} JSON object with scores and improvements.
 */
export const analyzeDocument = async (text) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, mode: 'analysis' }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        try {
            if (typeof data.result === 'string') {
                return JSON.parse(data.result);
            }
            return data.result;
        } catch (e) {
            console.error("Failed to parse analysis result", data.result);
            throw new Error("Invalid response format from AI");
        }
    } catch (error) {
        throw new Error('Failed to analyze document: ' + error.message);
    }
};
