
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { Trade } from '../types';
import { MOCK_TRADES } from '../constants';

const TradeHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, []);

  const filteredTrades = trades.filter(trade => {
    // Assumindo que trade.date está no formato DD/MM
    const [day, month] = trade.date.split('/').map(Number);
    // Como o mock não tem ano, vamos assumir o ano selecionado se o mês bater
    return (month - 1) === selectedMonth;
  });

  const generateAIInsights = async () => {
    if (filteredTrades.length === 0) return;
    setIsGeneratingInsight(true);
    try {
      const tradesSummary = filteredTrades.map(t =>
        `Ativo: ${t.symbol}, Tipo: ${t.type}, PL: ${t.netPL}, Sentimento: ${t.emotionPre}`
      ).join('\n');

      const prompt = `Analise os seguintes trades do mês e forneça um resumo valioso sobre o desempenho e comportamento emocional do trader:\n${tradesSummary}`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setAiInsight(data.text);
    } catch (err) {
      console.error('Erro ao gerar insights:', err);
      setAiInsight('Não foi possível gerar insights no momento.');
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const fetchTrades = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        console.warn('Supabase não configurado. Utilizando dados locais (Mock).');
        setTrades(MOCK_TRADES);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from(TABLES.TRADES)
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setTrades(MOCK_TRADES);
      } else {
        setTrades(data);
      }
    } catch (err) {
      console.error('Erro ao buscar trades:', err);
      setTrades(MOCK_TRADES);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white">Histórico de Operações</h1>
          <p className="text-text-secondary mt-2">Gerencie suas operações persistidas no Supabase.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-surface-dark border border-border-dark rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-primary transition-all"
          >
            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <button
            onClick={generateAIInsights}
            disabled={isGeneratingInsight || filteredTrades.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-background-dark rounded-xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{isGeneratingInsight ? 'sync' : 'auto_awesome'}</span>
            {isGeneratingInsight ? 'Analisando...' : 'Gerar Insights'}
          </button>
          <button
            onClick={fetchTrades}
            className="flex items-center gap-2 px-6 py-2 bg-surface-dark border border-border-dark rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Atualizar
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-6xl text-primary">auto_awesome</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-primary font-black uppercase tracking-widest text-sm">Resumo do Mês & Insights IA</h3>
            <button onClick={() => setAiInsight(null)} className="ml-auto text-text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed italic text-sm font-medium">
            {aiInsight}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Lucro Líquido', value: `R$ ${filteredTrades.reduce((acc, t) => acc + (t.netPL || 0), 0).toFixed(2)}`, color: 'success', icon: 'payments' },
          { label: 'Taxa de Acerto', value: `${((filteredTrades.filter(t => (t.netPL || 0) > 0).length / Math.max(filteredTrades.length, 1)) * 100).toFixed(0)}%`, color: 'primary', icon: 'check_circle' },
          { label: 'Operações Realizadas', value: filteredTrades.length.toString(), color: 'white', icon: 'show_chart' },
          { label: 'Fator de Lucro', value: '1.8', color: 'success', icon: 'trending_up' },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl bg-surface-dark border border-border-dark shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</span>
              <span className={`material-symbols-outlined text-[18px] p-1.5 rounded-md bg-white/5 ${stat.color === 'success' ? 'text-success' : stat.color === 'primary' ? 'text-primary' : 'text-white'}`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-xl font-black text-white whitespace-nowrap">{stat.value}</p>
            <p className="text-[9px] text-success font-bold mt-2 bg-success/5 px-2 py-0.5 rounded w-fit">+12% vs. mês anterior</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-surface-dark border border-border-dark rounded-2xl">
            <div className="text-center space-y-4">
              <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-text-dim text-xs font-black uppercase tracking-widest">Sincronizando...</p>
            </div>
          </div>
        ) : (
          <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-border-dark text-[10px] text-text-secondary uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Ativo</th>
                  <th className="px-6 py-4">Sentimento</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Entrada</th>
                  <th className="px-6 py-4 text-right">Saída</th>
                  <th className="px-6 py-4 text-right">Resultado</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filteredTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    onClick={() => navigate(`/trade/${trade.id}`)}
                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className={`px-6 py-5 border-l-4 transition-all ${(trade.netPL || 0) > 0 ? 'border-success' : (trade.netPL || 0) < 0 ? 'border-danger' : 'border-primary'}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{trade.date}</span>
                        <span className="text-[10px] text-text-secondary">{trade.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded flex items-center justify-center font-black text-xs ${trade.assetClass === 'FUT' ? 'bg-primary/20 text-primary' : trade.assetClass === 'STK' ? 'bg-success/20 text-success' : 'bg-white/10'}`}>
                          {trade.symbol?.[0] || '?'}
                        </div>
                        <span className="text-sm font-black text-white">{trade.symbol || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">sentiment_satisfied</span>
                        <span className="text-xs font-bold text-white uppercase italic">{trade.emotionPre || 'Neutro'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${trade.type === 'Compra' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${trade.result === 'Aberto' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-text-secondary'
                        }`}>
                        {trade.result === 'Aberto' && <span className="size-1.5 rounded-full bg-primary animate-ping"></span>}
                        {trade.result === 'Aberto' ? 'Aberto' : 'Fechado'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm text-text-secondary">
                      {(trade.entryPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm text-text-secondary">
                      {trade.exitPrice ? trade.exitPrice.toLocaleString() : '---'}
                    </td>
                    <td className={`px-6 py-5 text-right font-black text-sm ${(trade.netPL || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                      {(trade.netPL || 0) >= 0 ? '+' : ''}{(trade.netPL || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button className="size-8 rounded-full hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-[20px] text-text-secondary">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistoryPage;
