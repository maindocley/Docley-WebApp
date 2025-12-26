const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

async function testKey() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('diagnostic_result.txt', msg + '\n');
    };

    fs.writeFileSync('diagnostic_result.txt', 'Starting diagnostic...\n');

    if (!apiKey) {
        log('Error: No API Key found within server/.env');
        return;
    }

    log(`Testing Key: ${apiKey.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    try {
        log('Sending request to gemini-1.5-flash...');
        const result = await model.generateContent('Test');
        log('Success! Response: ' + result.response.text());
    } catch (e) {
        log('Error: ' + e.message);
    }
}

testKey();
