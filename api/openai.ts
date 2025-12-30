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
        const { message, threadId, assistantId } = await req.json();

        // Initialize Supabase on the Edge
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        // Fetch keys from DB
        const dbApiKey = await getSetting(supabase, 'OPENAI_API_KEY');
        const dbAssistantId = await getSetting(supabase, 'OPENAI_ASSISTANT_ID');

        const apiKey = dbApiKey || process.env.OPENAI_API_KEY;
        const finalAssistantId = assistantId || dbAssistantId || process.env.OPENAI_ASSISTANT_ID || '';

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'OpenAI API Key not configured on server or database' }), { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        // 1. Create thread if not exists
        let activeThreadId = threadId;
        if (!activeThreadId) {
            const thread = await openai.beta.threads.create();
            activeThreadId = thread.id;
        }

        // 2. Add message
        await openai.beta.threads.messages.create(activeThreadId, {
            role: 'user',
            content: message,
        });

        // 3. Run assistant
        const run = await openai.beta.threads.runs.create(activeThreadId, {
            assistant_id: finalAssistantId,
        });

        // 4. Poll for completion
        let runStatus = await (openai.beta.threads.runs.retrieve as any)(activeThreadId, run.id);
        while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await (openai.beta.threads.runs.retrieve as any)(activeThreadId, run.id);
        }

        if (runStatus.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(activeThreadId);
            const lastMessage = messages.data[0];
            const content = lastMessage.content[0];

            return new Response(JSON.stringify({
                response: content.type === 'text' ? content.text.value : 'Erro: Resposta não é texto.',
                threadId: activeThreadId
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: `Run failed with status: ${runStatus.status}` }), { status: 500 });

    } catch (error: any) {
        console.error('OpenAI Proxy Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
