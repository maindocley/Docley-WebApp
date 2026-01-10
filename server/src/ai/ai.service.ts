import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { DIAGNOSTIC_PROMPT } from './prompts/diagnostic';
import { CITATION_PROMPT } from './prompts/citation';

dotenv.config();

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('CRITICAL CONFIG ERROR: GOOGLE_API_KEY is missing. AI features will not function. Please add it to your server .env file.');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });
    }

    async processText(text: string, instruction: string, mode: string): Promise<any> {
        console.log(`[AiService] Received request: Mode=${mode}, TextLength=${text?.length}`);

        if (!text) {
            throw new BadRequestException('Input text is missing.');
        }

        // mode: 'diagnostic' | 'upgrade' | 'analysis' (legacy)
        let prompt;

        if (mode === 'diagnostic' || mode === 'analysis') {
            prompt = DIAGNOSTIC_PROMPT.replace('{{TEXT}}', text);
        } else if (mode === 'upgrade' || mode === 'transform') {
            // Upgrade / Transform mode
            prompt = `You are an Expert Academic Editor.
            
            Original Text:
            "${text}"
            
            Instruction:
            ${instruction || "Improve the academic tone, clarity, and flow of this text. Keep the meaning but make it professional."}
            
            Return a JSON object with a single key "result" containing the improved text as valid HTML fragments (paragraphs, bold, etc).
            Example: { "result": "<p>Improved text...</p>" }
            `;
        } else if (mode === 'citation') {
            prompt = CITATION_PROMPT
                .replace('{{TEXT}}', text)
                .replace('{{STYLE}}', instruction || 'APA 7th Edition');
        } else {
            throw new BadRequestException('Invalid mode. Supported modes: diagnostic, upgrade, citation');
        }

        try {
            console.log('[AiService] Sending prompt to Gemini...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const generatedText = response.text();
            console.log('[AiService] Received response from Gemini.');

            // Parse the JSON string on the server side
            try {
                const parsedData = JSON.parse(generatedText);
                return parsedData; // Return the clean object directly
            } catch (parseError) {
                console.error('[AiService] JSON Parse Error:', parseError);
                console.error('[AiService] Raw Text:', generatedText);
                throw new InternalServerErrorException('Failed to parse AI response');
            }

        } catch (error) {
            console.error('[AiService] Error generating content:', error);
            console.error('[AiService] Error Details:', JSON.stringify(error, null, 2));
            throw new InternalServerErrorException(`Failed to generate content: ${error.message} `);
        }
    }
}
