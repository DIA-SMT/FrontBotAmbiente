import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env.local:', result.error);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');

    if (!supabaseKey) {
        console.error('Missing Supabase Key');
        return;
    }

    // Mask the key for logging
    const maskedKey = supabaseKey.substring(0, 5) + '...' + supabaseKey.substring(supabaseKey.length - 5);
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Key: ${maskedKey}`);

    try {
        // Try to select just one item to verify access
        const { count, error } = await supabase.from('tickets').select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            console.error('Details:', error);
        } else {
            console.log('Success! Connection established.');
            console.log(`Tickets table accessible. Total tickets: ${count}`);
        }
    } catch (err: any) {
        console.error('Unexpected error:', err.message);
    }
}

testConnection();
