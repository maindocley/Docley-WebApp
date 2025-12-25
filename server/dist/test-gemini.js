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
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error('❌ GOOGLE_API_KEY is not set');
    process.exit(1);
}
console.log('✅ GOOGLE_API_KEY found:', apiKey.substring(0, 10) + '...');
async function testGemini() {
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.5-flash';
    console.log(`Testing model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello World" if you assure me that you are working.');
        const response = await result.response;
        const text = response.text();
        console.log('✅ Success! Model Output:', text);
    }
    catch (error) {
        console.error('❌ Error details:', error);
        if (error.response) {
            console.error('Response data:', error.response);
        }
        console.log('\nTrying fallback model "gemini-1.5-flash"...');
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent('Say "Hello World" if you assure me that you are working.');
            const response = await result.response;
            const text = response.text();
            console.log('✅ Fallback Success! "gemini-1.5-flash" works:', text);
        }
        catch (fallbackError) {
            console.error('❌ Fallback failed too:', fallbackError);
        }
    }
}
testGemini();
//# sourceMappingURL=test-gemini.js.map