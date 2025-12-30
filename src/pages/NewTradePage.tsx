
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES, isSupabaseConfigured } from '../supabaseClient';
import { TradeResult } from '../types';

const NewTradePage: React.FC = () => {
  const navigate = useNavigate();
  const [asset, setAsset] = useState<'WIN' | 'WDO'>('WIN');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState('5m');
  const [emotion, setEmotion] = useState('calm');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [setup, setSetup] = useState('Pullback de Média');
  const [notes, setNotes] = useState('');

  const handleSaveTrade = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      alert('Supabase não configurado. Vá ao menu Admin para inserir suas chaves.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from(TABLES.TRADES).insert([{
        symbol: asset === 'WIN' ? 'WINJ24' : 'WDOJ24',
        type: tradeType === 'buy' ? 'Compra' : 'Venda',
        entryPrice: parseFloat(entryPrice),
        result: TradeResult.OPEN,
        netPL: 0,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timeframe,
        asset_class: 'FUT',
        emotion_pre: emotion,
        setup,
        notes
      }]);

      if (error) throw error;
      navigate('/journal');
    } catch (err) {
      console.error('Erro ao salvar trade:', err);
      alert('Erro ao salvar trade. Verifique os logs do console ou sua configuração do Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-dark pb-8">
        <div>
          <h1 className="text-4xl font-black text-white font-display uppercase tracking-tight">Registrar <span className="text-primary italic">Trade</span></h1>
          <p className="text-text-dim mt-1 font-medium">B3 Futuros: Mini Índice & Mini Dólar</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-xl bg-surface-dark border border-white/5 hover:bg-white/10 transition-all text-sm font-bold text-white">Cancelar</button>
          <button
            onClick={handleSaveTrade}
            disabled={isSaving}
            className={`px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-black text-sm transition-all shadow-lg shadow-primary/20 uppercase tracking-widest font-display flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Processando...' : 'Salvar Trade'}
            {!isSaving && <span className="material-symbols-outlined text-[18px]">database</span>}
          </button>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4 text-amber-500 text-xs font-bold">
          <span className="material-symbols-outlined">warning</span>
          Atenção: Banco de dados não configurado. Suas operações não serão salvas permanentemente. Configure em 'Admin'.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Ativo B3</label>
              <div className="h-14 flex p-1 bg-surface-dark border border-white/5 rounded-2xl">
                <button
                  onClick={() => setAsset('WIN')}
                  className={`flex-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${asset === 'WIN' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-text-dim hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  WIN (Índice)
                </button>
                <button
                  onClick={() => setAsset('WDO')}
                  className={`flex-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${asset === 'WDO' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-text-dim hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                  WDO (Dólar)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Tipo de Operação</label>
              <div className="h-14 flex p-1 bg-surface-dark border border-white/5 rounded-2xl">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 rounded-xl text-xs font-black transition-all ${tradeType === 'buy' ? 'bg-success/20 text-success border border-success/30' : 'text-text-dim hover:text-white'}`}
                >
                  Compra (Long)
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 rounded-xl text-xs font-black transition-all ${tradeType === 'sell' ? 'bg-danger/20 text-danger border border-danger/30' : 'text-text-dim hover:text-white'}`}
                >
                  Venda (Short)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Timeframe</label>
              <div className="flex gap-2">
                {['1m', '5m', '15m', '1H', '4H', 'D'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`size-12 rounded-xl border text-xs font-black transition-all ${timeframe === tf ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-dark border-white/5 text-text-dim hover:border-white/20'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Setup / Estratégia</label>
              <select
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                className="w-full h-14 bg-surface-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary text-white font-bold px-4"
              >
                <option>Pullback de Média</option>
                <option>Rompimento de Pivô</option>
                <option>Mean Reversion</option>
                <option>Trap de Exaustão</option>
              </select>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Preço de Entrada</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl text-xl font-black text-white focus:border-primary transition-all px-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-danger">Stop Loss</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl text-xl font-black text-white focus:border-danger transition-all px-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-success">Take Profit</label>
              <input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl text-xl font-black text-white focus:border-success transition-all px-4"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Psicologia: Emoção Pré-Trade</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'calm', label: 'Calmo', icon: 'sentiment_satisfied', color: 'primary' },
                { id: 'anxious', label: 'Ansioso', icon: 'sentiment_neutral', color: 'warning' },
                { id: 'fomo', label: 'FOMO', icon: 'bolt', color: 'danger' },
                { id: 'confident', label: 'Confiante', icon: 'verified', color: 'success' },
                { id: 'revenge', label: 'Revenge', icon: 'swords', color: 'danger' },
                { id: 'bored', label: 'Tédio', icon: 'bedtime', color: 'primary' },
              ].map(em => (
                <button
                  key={em.id}
                  onClick={() => setEmotion(em.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${emotion === em.id ? 'bg-primary/20 border-primary text-white shadow-xl shadow-primary/5' : 'bg-surface-dark border-white/5 text-text-dim hover:bg-white/10'}`}
                >
                  <span className={`material-symbols-outlined mb-2 text-[28px] ${emotion === em.id ? 'fill' : ''}`}>{em.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{em.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Notas de Operação</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Por que você entrou nesse trade? Qual o contexto do mercado?"
              className="w-full h-44 bg-surface-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary text-white text-sm p-6 resize-none font-medium leading-relaxed"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTradePage;
