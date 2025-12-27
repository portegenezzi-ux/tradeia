
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const PsychologistPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá. Eu sou sua psicóloga trader do Fluxo Real. Como está sua mente para o mercado hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Verifica se existe Assistente ID configurado
  const assistantId = localStorage.getItem('OPENAI_ASSISTANT_ID');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Como o foco é Gemini, usamos o Gemini como motor de IA
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `Você é um psicólogo especialista em trading de alta performance da plataforma Fluxo Real. 
          Seu objetivo é ajudar traders a lidar com ansiedade, FOMO, overtrading, e a manter a disciplina. 
          Use os conceitos de Mark Douglas e Jared Tendler.
          ${assistantId ? `Nota: Você está operando como o Assistente ID ${assistantId}.` : ''}
          Responda sempre em Português do Brasil de forma concisa e direta.`,
        },
      });

      const responseStream = await chat.sendMessageStream({ message: input });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullResponse += chunkText;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            const others = prev.slice(0, -1);
            return [...others, { ...last, text: fullResponse }];
          });
        }
      }
    } catch (error) {
      console.error("Erro no chat do Psicólogo IA:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive um problema na conexão. Verifique suas chaves no painel Admin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Sinto que estou operando por tédio",
    "Acabei de levar um stop e quero recuperar",
    "Estou com medo de entrar no trade",
    "Minha meta do dia foi batida, devo parar?"
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white font-display uppercase tracking-tight">Psicóloga <span className="text-primary italic">Trader IA</span></h1>
          <p className="text-text-dim mt-2 font-medium">Equilíbrio emocional para traders de elite.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
             <span className="size-2 rounded-full bg-primary animate-pulse"></span>
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">Psicóloga Online</span>
          </div>
          {assistantId && (
            <span className="text-[9px] font-black text-success uppercase tracking-widest flex items-center gap-1 bg-success/5 px-2 py-1 rounded-md border border-success/10">
              <span className="material-symbols-outlined text-[12px]">verified</span> Assistente Customizado Ativo
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] p-5 rounded-2xl relative ${
                  msg.role === 'user' 
                  ? 'bg-primary text-background-dark font-bold rounded-tr-none' 
                  : 'bg-surface-dark border border-white/10 text-white rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || (isLoading && i === messages.length - 1 ? 'Digitando...' : '')}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length-1].role === 'user' && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-surface-dark border border-white/10 p-5 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-background-dark/30 border-t border-white/5 space-y-4">
            <div className="flex gap-4">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Como está sua disciplina hoje? Vamos conversar..."
                className="flex-1 h-14 bg-surface-dark border border-white/10 rounded-2xl px-6 focus:border-primary focus:ring-primary transition-all text-white placeholder:text-white/20 font-medium"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="size-14 bg-primary text-background-dark rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
              >
                <span className="material-symbols-outlined font-black">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:w-80 space-y-6">
          <div className="p-8 rounded-[32px] bg-surface-dark border border-white/5 space-y-6">
            <h3 className="text-xs font-black text-white/50 uppercase tracking-[3px]">Gatilhos Rápidos</h3>
            <div className="space-y-3">
              {quickPrompts.map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-left text-xs font-bold text-text-dim hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all leading-tight"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
             <span className="material-symbols-outlined text-primary mb-4 text-3xl">lock</span>
             <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Sigilo Profissional</h4>
             <p className="text-[10px] text-text-dim font-bold leading-relaxed uppercase">Suas conversas emocionais são protegidas e usadas apenas para seu autoconhecimento.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologistPage;
