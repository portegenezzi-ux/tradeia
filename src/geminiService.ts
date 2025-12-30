
import { GoogleGenAI } from "@google/genai";
import { Trade } from "./types";

let aiInstance: any = null;

function getAI() {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.API_KEY || (process.env as any).GEMINI_API_KEY || '';
  if (!apiKey) return null;
  try {
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (e) {
    console.error("Erro ao inicializar GoogleGenAI:", e);
    return null;
  }
}

export async function getTradeInsight(trade: Trade) {
  try {
    const prompt = `
      Analise esta execução de trading:
      Ativo: ${trade.symbol}
      Tipo: ${trade.type}
      Preço de Entrada: ${trade.entryPrice}
      Preço de Saída: ${trade.exitPrice || 'N/A'}
      Resultado: ${trade.result}
      Lucro/Prejuízo: R$ ${trade.netPL}
      Emoção Pré-trade: ${trade.emotionPre}
      Estratégia (Setup): ${trade.setup}
      Notas: ${trade.notes || 'Nenhuma nota fornecida'}

      Forneça um "Insight do Coach de IA" curto, profissional e encorajador (máximo de 100 palavras).
      Foque em disciplina, precisão técnica e melhorias psicológicas. RESPONDA EM PORTUGUÊS BRASILEIRO.
    `;

    const ai = getAI();
    if (!ai) {
      return "Configuração de IA (Gemini) indisponível. Verifique suas chaves.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Continue focado em seu plano de trading. Disciplina é o caminho para a consistência.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Não foi possível gerar um insight de IA no momento. Revise seus parâmetros de risco.";
  }
}
