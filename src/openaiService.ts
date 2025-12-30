import { OpenAI } from 'openai';

// Singleton para o cliente OpenAI
let openaiInstance: OpenAI | null = null;
let currentKey: string | null = null;

const isValidKey = (val: any) => typeof val === 'string' && val.trim().length > 10 && val !== 'null' && val !== 'undefined';

function getOpenAI() {
    const apiKey = localStorage.getItem('OPENAI_API_KEY');

    // Se a chave mudou ou ainda não instanciamos, cria nova instância
    if (apiKey !== currentKey) {
        currentKey = apiKey;
        if (isValidKey(apiKey)) {
            openaiInstance = new OpenAI({
                apiKey: apiKey as string,
                dangerouslyAllowBrowser: true
            });
        } else {
            openaiInstance = null;
        }
    }

    return openaiInstance;
}

export async function createThread() {
    const openai = getOpenAI();
    if (!openai) throw new Error("OpenAI não configurada ou Chave API inválida.");
    return await openai.beta.threads.create();
}

export async function sendMessage(threadId: string, message: string) {
    const openai = getOpenAI();
    if (!openai) throw new Error("OpenAI não configurada ou Chave API inválida.");

    const assistantId = localStorage.getItem('OPENAI_ASSISTANT_ID');
    if (!assistantId) throw new Error("Assistant ID não configurado.");

    // Envia a mensagem do usuário
    await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message
    });

    if (!threadId || threadId === 'undefined') {
        throw new Error("ID da Thread inválido ou não inicializado.");
    }

    // Inicia o processamento (Run)
    const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId
    });

    // Aguarda a conclusão (Polling simples)
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    }

    if (runStatus.status === 'completed') {
        const messagesPage = await openai.beta.threads.messages.list(threadId);
        const lastMessage = messagesPage.data[0];
        const content = lastMessage.content[0];
        if (content && content.type === 'text') {
            return content.text.value;
        }
    }

    throw new Error(`Erro no processamento da OpenAI: ${runStatus.status}`);
}

export async function generateAssistantInsight(prompt: string) {
    try {
        // Cria uma thread temporária para esta análise específica
        const thread = await createThread();

        // Usa a função existente que já lida com o Assistant ID configurado
        const response = await sendMessage(thread.id, prompt);

        return response || "O suporte não retornou uma resposta válida.";
    } catch (error: any) {
        console.error("OpenAI Assistant Error:", error);
        throw new Error(`Erro Assistant: ${error.message || 'Falha ao consultar a Psicóloga Trader'}`);
    }
}
