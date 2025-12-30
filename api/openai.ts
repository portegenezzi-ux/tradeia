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

        console.log('OpenAI Proxy Request:', {
            hasMessage: !!message,
            threadId,
            hasAssistantId: !!assistantId
        });

        // Initialize Supabase on the Edge
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({
                error: 'Faltam chaves do Supabase na Vercel (SUPABASE_URL e SUPABASE_ANON_KEY).'
            }), { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch keys from DB
        const dbApiKey = await getSetting(supabase, 'OPENAI_API_KEY');
        const dbAssistantId = await getSetting(supabase, 'OPENAI_ASSISTANT_ID');

        const apiKey = dbApiKey || process.env.OPENAI_API_KEY;
        const finalAssistantId = assistantId || dbAssistantId || process.env.OPENAI_ASSISTANT_ID || '';

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'OpenAI API Key não configurada (Database ou Vercel).' }), { status: 500 });
        }

        if (!finalAssistantId) {
            return new Response(JSON.stringify({ error: 'OpenAI Assistant ID não configurado. Adicione no Painel Admin.' }), { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        // 1. Validar e Criar thread se necessário
        let activeThreadId = (threadId && threadId !== "undefined" && threadId !== "null") ? threadId : null;

        if (!activeThreadId) {
            console.log('Criando nova Thread OpenAI...');
            const thread = await openai.beta.threads.create();
            activeThreadId = thread.id;
        }

        console.log('Usando Thread:', activeThreadId);

        // 2. Add message
        await openai.beta.threads.messages.create(activeThreadId, {
            role: 'user',
            content: message,
        });

        // 3. Run assistant
        console.log('Iniciando Run para Assistant:', finalAssistantId);
        const run = await openai.beta.threads.runs.create(activeThreadId, {
            assistant_id: finalAssistantId,
        });

        if (!run || !run.id) {
            throw new Error('Falha ao criar Run no OpenAI.');
        }

        // 4. Poll for completion
        let runStatus = await (openai.beta.threads.runs.retrieve as any)(activeThreadId, run.id);
        let attempts = 0;

        while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await (openai.beta.threads.runs.retrieve as any)(activeThreadId, run.id);
            attempts++;
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

        return new Response(JSON.stringify({ error: `IA falhou ou demorou muito. Status: ${runStatus.status}` }), { status: 500 });

    } catch (error: any) {
        console.error('OpenAI Proxy Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
