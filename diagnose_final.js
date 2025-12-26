const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'server/.env' }); // Adjust path to ensure it picks up the right .env

async function testKey() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('Testing Key:', apiKey ? (apiKey.substring(0, 8) + '...') : 'None');

    if (!apiKey) {
        console.error('No API Key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
        console.log('Sending request to gemini-1.5-flash...');
        const result = await model.generateContent('Test');
        console.log('Success! Response:', result.response.text());
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testKey();
