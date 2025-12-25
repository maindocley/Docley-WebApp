const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const path = require('path');

// Load .env explicitly if needed, but dotenv.config() usually looks in current dir
// We are running from server/ so .env is there.

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error('❌ GOOGLE_API_KEY is not set');
    process.exit(1);
}

console.log('✅ GOOGLE_API_KEY found:', apiKey.substring(0, 10) + '...');

async function testGemini() {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.5-flash';

    console.log(`Testing model: ${modelName}...`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello World" if you assure me that you are working.');
        const response = await result.response;
        const text = response.text();
        console.log('✅ Success! Model Output:', text);
    } catch (error) {
        console.error('❌ Error testing', modelName);
        console.error('Error message:', error.message);

        console.log('\nTrying fallback model "gemini-1.5-flash"...');
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent('Say "Hello World" if you assure me that you are working.');
            const response = await result.response;
            const text = response.text();
            console.log('✅ Fallback Success! "gemini-1.5-flash" works:', text);
        } catch (fallbackError) {
            console.error('❌ Fallback failed too:', fallbackError.message);
        }
    }
}

testGemini();
