// Refactored to use Backend Proxy for Security
export class OpenAIClient {
    private static instance: OpenAIClient;
    private threadId: string | null = null;
    private assistantId: string | null = null;

    private constructor() {
        this.threadId = localStorage.getItem('openai_thread_id');
        this.assistantId = localStorage.getItem('OPENAI_ASSISTANT_ID');
    }

    public static getInstance(): OpenAIClient {
        if (!OpenAIClient.instance) {
            OpenAIClient.instance = new OpenAIClient();
        }
        return OpenAIClient.instance;
    }

    public async getAssistantResponse(message: string): Promise<string> {
        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    threadId: this.threadId,
                    assistantId: this.assistantId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro na comunicação com o servidor');
            }

            const data = await response.json();

            if (data.threadId) {
                this.threadId = data.threadId;
                localStorage.setItem('openai_thread_id', data.threadId);
            }

            return data.response;
        } catch (error: any) {
            console.error('OpenAI Proxy Error:', error);
            throw error;
        }
    }

    // Compatibilidade com código legado
    public async generateAssistantInsight(prompt: string): Promise<string> {
        return this.getAssistantResponse(prompt);
    }
}

export const openaiService = OpenAIClient.getInstance();

// Exportações de funções para compatibilidade com código que não usa a instância
export const generateAssistantInsight = (prompt: string) => openaiService.getAssistantResponse(prompt);
export const sendMessage = (threadId: string, message: string) => openaiService.getAssistantResponse(message);
export const createThread = async () => ({ id: 'managed_by_proxy' });
