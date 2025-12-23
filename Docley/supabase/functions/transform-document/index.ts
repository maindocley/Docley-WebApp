// @ts-ignore
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore: Deno global is available in the runtime
Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { text, instruction, mode } = await req.json()
        // @ts-ignore
        const apiKey = Deno.env.get('GOOGLE_API_KEY')

        if (!apiKey) {
            throw new Error('GOOGLE_API_KEY is not set')
        }

        const genAI = new GoogleGenerativeAI(apiKey)

        // Use gemini-pro for text tasks
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        let prompt;
        if (mode === 'analysis') {
            prompt = `You are an academic writing expert. Analyze the following text and return a JSON object with the following structure:
             {
                "scores": [
                    {"label": "Structure Quality", "score": number (0-100)},
                    {"label": "Academic Tone", "score": number (0-100)},
                    {"label": "Clarity & Coherence", "score": number (0-100)},
                    {"label": "Plagiarism Risk", "score": number (0-100)}
                ],
                "improvements": [
                    {
                        "type": "warning" | "info" | "success",
                        "title": "Short title",
                        "description": "Specific feedback based on the text."
                    }
                ],
                "overallGrade": "A/B/C letter grade",
                "overallGradeText": "Excellent/Good/Average",
                "citationQuality": "Brief evaluation of citations."
             }
             
             Text to analyze:
             "${text}"
             
             Return ONLY the JSON object, no markdown formatting.`
        } else {
            prompt = `You are a helpful writing assistant.
    
            Original Text:
            "${text}"
            
            Instruction:
            ${instruction}
            
            Please provide ONLY the transformed text below as valid HTML fragments (e.g., using <p>, <strong>, <em>, <h2> tags), without <html>, <head>, or <body> tags. Do not include markdown or conversational filler.`
        }

        const result = await model.generateContent(prompt)
        const response = await result.response
        let generatedText = response.text()

        // Cleanup if model adds markdown blocks
        if (generatedText.startsWith('```json')) {
            generatedText = generatedText.replace(/```json\n?/, '').replace(/```$/, '');
        }

        return new Response(
            JSON.stringify({ result: generatedText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
