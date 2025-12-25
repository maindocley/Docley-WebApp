import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AppService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async processText(text: string, instruction: string, mode: string): Promise<any> {
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
             
             Return ONLY the JSON object, no markdown formatting.`;
    } else {
      prompt = `You are a helpful writing assistant.
    
            Original Text:
            "${text}"
            
            Instruction:
            ${instruction}
            
            Please provide ONLY the transformed text below as valid HTML fragments (e.g., using <p>, <strong>, <em>, <h2> tags), without <html>, <head>, or <body> tags. Do not include markdown or conversational filler.`;
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let generatedText = response.text();

      // Cleanup
      if (generatedText.startsWith('```json')) {
        generatedText = generatedText.replace(/```json\n?/, '').replace(/```$/, '');
      }

      return { result: generatedText };
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }
}
