const dotenv = require('dotenv');
const path = require('path');
const fetch = require('node-fetch'); // Assuming node-fetch is available or using global fetch if node 18+

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.WHOP_API_KEY;
const planId = process.env.WHOP_PRICE_ID;

console.log('Testing Whop API Auth...');
console.log('API Key starts with:', apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING');
console.log('Plan ID:', planId);

async function testAuth() {
    const requestUrl = 'https://api.whop.com/api/v2/checkout_sessions';
    const requestBody = {
        plan_id: planId,
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        metadata: {
            test: 'true'
        }
    };

    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Status Code:', response.status);
        console.log('Status Text:', response.statusText);

        const responseBody = await response.text();
        console.log('Response Body:', responseBody);

        if (response.ok) {
            console.log('SUCCESS: API Key and Plan ID are valid.');
        } else if (response.status === 401) {
            console.log('FAILURE: Unauthorized. Your WHOP_API_KEY might be invalid or a client-side key.');
        } else if (response.status === 422) {
            console.log('FAILURE: Unprocessable Entity. Check if plan_id/product_id is correct.');
        }
    } catch (error) {
        console.error('ERROR during fetch:', error.message);
    }
}

testAuth();
