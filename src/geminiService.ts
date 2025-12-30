import { Trade } from "./types";

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
      Emoção Pré-trade: ${trade.emotion_pre}
      Estratégia (Setup): ${trade.setup}
      Notas: ${trade.notes || 'Nenhuma nota fornecida'}

      Forneça um "Insight do Coach de IA" curto, profissional e encorajador (máximo de 100 palavras).
      Foque em disciplina, precisão técnica e melhorias psicológicas. RESPONDA EM PORTUGUÊS BRASILEIRO.
    `;

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na comunicação com Gemini');
    }

    const data = await response.json();
    return data.text || "Continue focado em seu plano de trading. Disciplina é o caminho para a consistência.";
  } catch (error) {
    console.error("AI Insight Proxy Error:", error);
    return "Não foi possível gerar um insight de IA no momento. Revise seus parâmetros de risco.";
  }
}
