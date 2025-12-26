require('dotenv').config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Checking Supabase Config...');
console.log('SUPABASE_URL:', url ? 'Present' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', key ? 'Present' : 'MISSING');

if (!url || !key) {
    console.error('CRITICAL: Missing credentials.');
    process.exit(1);
} else {
    console.log('Config looks good.');
}
