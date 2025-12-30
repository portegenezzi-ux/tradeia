import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

async function getSetting(supabase: any, key: string): Promise<string | null> {
    const { data } = await supabase
        .from('freal_settings')
        .select('value')
        .eq('key', key)
        .single();
    return data?.value || null;
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { prompt } = await req.json();

        // Initialize Supabase on the Edge
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        // Fetch keys from DB
        const dbApiKey = await getSetting(supabase, 'GEMINI_API_KEY');
        const apiKey = dbApiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Gemini API Key not configured on server or database' }), { status: 500 });
        }

        const genAI = new GoogleGenAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;

        return new Response(JSON.stringify({ text: response.text() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Gemini Proxy Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
