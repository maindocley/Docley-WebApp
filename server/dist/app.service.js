"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let AppService = class AppService {
    genAI;
    model;
    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error('GOOGLE_API_KEY is not set');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    async processText(text, instruction, mode) {
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
        }
        else {
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
            if (generatedText.startsWith('```json')) {
                generatedText = generatedText.replace(/```json\n?/, '').replace(/```$/, '');
            }
            return { result: generatedText };
        }
        catch (error) {
            console.error('Error generating content:', error);
            throw new Error('Failed to generate content');
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppService);
//# sourceMappingURL=app.service.js.map