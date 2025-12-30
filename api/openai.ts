import { OpenAI } from 'openai';
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
        const body = await req.json();
        const { message, threadId, assistantId } = body;

        console.log('[Proxy] Request received:', { threadId, hasAssistant: !!assistantId });

        // Initialize Supabase
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: 'Faltam chaves do Supabase na Vercel.' }), { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch settings
        const dbApiKey = await getSetting(supabase, 'OPENAI_API_KEY');
        const dbAssistantId = await getSetting(supabase, 'OPENAI_ASSISTANT_ID');

        const apiKey = dbApiKey || process.env.OPENAI_API_KEY;
        const finalAssistantId = assistantId || dbAssistantId || process.env.OPENAI_ASSISTANT_ID;

        if (!apiKey) return new Response(JSON.stringify({ error: 'OpenAI API Key não configurada.' }), { status: 500 });
        if (!finalAssistantId) return new Response(JSON.stringify({ error: 'Assistant ID não configurado.' }), { status: 500 });

        const openai = new OpenAI({ apiKey });

        // 1. Thread Logic - Strict Protection
        let activeThreadId: string;

        try {
            if (threadId && threadId !== "undefined" && threadId !== "null" && typeof threadId === 'string' && threadId.startsWith('thread_')) {
                activeThreadId = threadId;
                console.log('[Proxy] Using existing thread:', activeThreadId);
            } else {
                console.log('[Proxy] Creating new thread (invalid/missing ID)');
                const thread = await openai.beta.threads.create();
                activeThreadId = thread.id;
            }
        } catch (err) {
            console.log('[Proxy] Error with thread, creating fresh one...');
            const thread = await openai.beta.threads.create();
            activeThreadId = thread.id;
        }

        // 2. Add Message
        await openai.beta.threads.messages.create(activeThreadId, {
            role: 'user',
            content: message || "Olá",
        });

        // 3. Run Assistant
        console.log('[Proxy] Starting run for assistant:', finalAssistantId);
        const run = await openai.beta.threads.runs.create(activeThreadId, {
            assistant_id: finalAssistantId,
        });

        if (!run || !run.id) throw new Error('Run creation failed');

        // 4. Polling Loop
        let runStatus = await openai.beta.threads.runs.retrieve(activeThreadId, run.id);
        let attempts = 0;
        while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < 40) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(activeThreadId, run.id);
            attempts++;
        }

        if (runStatus.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(activeThreadId);
            const lastMessage = messages.data[0];
            const content = lastMessage.content[0];

            return new Response(JSON.stringify({
                response: content.type === 'text' ? content.text.value : 'Resposta não textual.',
                threadId: activeThreadId
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: `IA excedeu tempo ou status inválido: ${runStatus.status}` }), { status: 500 });

    } catch (error: any) {
        console.error('[Proxy] Global Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
