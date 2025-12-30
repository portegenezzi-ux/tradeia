
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { Trade, TradeResult } from '../types';
import { getTradeInsight } from '../geminiService';
import { MOCK_TRADES } from '../constants';

const TradeDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<Trade | undefined>();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Estados de edição
  const [isEditing, setIsEditing] = useState(false);
  const [editExitPrice, setEditExitPrice] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTradeDetail();
  }, [id]);

  const fetchTradeDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      if (!supabase) {
        const mockTrade = MOCK_TRADES.find(t => t.id === id);
        if (mockTrade) {
          setTrade(mockTrade);
          setEditExitPrice(mockTrade.exitPrice?.toString() || '');
        }
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from(TABLES.TRADES)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        const mockTrade = MOCK_TRADES.find(t => t.id === id);
        if (mockTrade) {
          setTrade(mockTrade);
          setEditExitPrice(mockTrade.exitPrice?.toString() || '');
        }
      } else {
        setTrade(data);
        setEditExitPrice(data.exitPrice?.toString() || '');
      }
    } catch (err) {
      console.error('Erro ao buscar detalhe do trade:', err);
      const mockTrade = MOCK_TRADES.find(t => t.id === id);
      if (mockTrade) {
        setTrade(mockTrade);
        setEditExitPrice(mockTrade.exitPrice?.toString() || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trade) {
      setIsLoadingInsight(true);
      getTradeInsight(trade).then(res => {
        setInsight(res);
        setIsLoadingInsight(false);
      });
    }
  }, [trade]);

  // Função central de cálculo (B3 Multipliers)
  const calculatePL = (exit: number, entry: number, symbol: string, type: string) => {
    const multiplier = symbol.startsWith('WIN') ? 0.2 : symbol.startsWith('WDO') ? 10 : 1;
    const contracts = 1;
    return type === 'Compra'
      ? (exit - entry) * multiplier * contracts
      : (entry - exit) * multiplier * contracts;
  };

  // Cálculo reativo para o Preview enquanto edita
  const liveStats = useMemo(() => {
    if (!trade) return { pl: 0, result: TradeResult.OPEN };

    const currentExit = isEditing ? parseFloat(editExitPrice) || 0 : trade.exitPrice || 0;
    const pl = calculatePL(currentExit, trade.entryPrice, trade.symbol, trade.type);
    const result = pl > 0 ? TradeResult.WIN : pl < 0 ? TradeResult.LOSS : TradeResult.OPEN;

    return { pl, result };
  }, [trade, editExitPrice, isEditing]);

  const handleSaveUpdate = async () => {
    if (!trade || !id) return;
    setIsSaving(true);

    const newExit = parseFloat(editExitPrice) || 0;
    const { pl: newPL, result: newResult } = liveStats;

    try {
      if (!supabase) {
        throw new Error("Supabase não configurado.");
      }

      const { error } = await supabase
        .from(TABLES.TRADES)
        .update({
          exitPrice: newExit,
          netPL: newPL,
          result: newResult
        })
        .eq('id', id);

      if (error) throw error;

      setTrade({
        ...trade,
        exitPrice: newExit,
        netPL: newPL,
        result: newResult
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao salvar atualização:', err);
      // Fallback local para demo
      setTrade({
        ...trade,
        exitPrice: newExit,
        netPL: newPL,
        result: newResult
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!trade) return;
    const shareText = `🚀 Fluxo Real AI\nAtivo: ${trade.symbol}\nPL: R$ ${(trade.netPL || 0).toFixed(2)}\nResultado: ${trade.result}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  if (isLoading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-text-dim text-sm font-black uppercase tracking-[3px]">Sincronizando...</p>
      </div>
    </div>
  );

  if (!trade) return <div className="p-20 text-center font-display text-2xl font-black">Trade não encontrado</div>;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 text-text-dim text-sm font-bold">
        <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Início</button>
        <span>/</span>
        <button onClick={() => navigate('/journal')} className="hover:text-primary transition-colors">Diário</button>
        <span>/</span>
        <span className="text-white">#{trade.id}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white font-display tracking-tight uppercase">
            {trade.symbol} <span className="text-primary italic">Detail</span>
          </h1>
          <div className="flex items-center gap-3 text-text-dim text-[10px] font-black uppercase tracking-widest">
            <span className={`px-2 py-0.5 rounded ${trade.type === 'Compra' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{trade.type}</span>
            <span>•</span>
            <span>{trade.date}, {trade.time}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="h-10 px-6 rounded-xl border border-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUpdate}
                disabled={isSaving}
                className="h-10 px-6 bg-primary text-background-dark rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                {isSaving ? 'Salvando...' : 'Confirmar Saída'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 h-10 px-6 bg-surface-dark border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary/50 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                Editar Saída
              </button>
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${isCopied ? 'bg-success/20 border-success text-success' : 'bg-surface-dark border-white/5 text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{isCopied ? 'check' : 'share'}</span>
                {isCopied ? 'Copiado' : 'Share'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card de P&L com Atualização Live */}
            <div className={`p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group ${liveStats.pl >= 0 ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'
              }`}>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[3px] mb-2 flex items-center gap-2">
                  Resultado Financeiro
                  {isEditing && <span className="size-2 bg-primary rounded-full animate-ping"></span>}
                </p>
                <div className="flex items-baseline gap-3">
                  <span className={`text-4xl font-black font-display tabular-nums ${liveStats.pl >= 0 ? 'text-success' : 'text-danger'}`}>
                    {liveStats.pl >= 0 ? '+' : ''}R$ {(liveStats.pl || 0).toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${liveStats.result === TradeResult.WIN ? 'bg-success/20 text-success' : liveStats.result === TradeResult.LOSS ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
                    }`}>
                    {liveStats.result}
                  </span>
                </div>
                {isEditing && <p className="text-[9px] text-primary font-bold uppercase mt-2 tracking-widest">Calculando Projeção...</p>}
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-all">
                {liveStats.pl >= 0 ? 'trending_up' : 'trending_down'}
              </span>
            </div>

            <div className="p-8 rounded-[32px] bg-surface-dark border border-white/5 group relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[3px] mb-2">Multiplicador B3</p>
                <p className="text-4xl font-black text-white font-display uppercase italic">{trade.symbol}</p>
                <p className="text-[10px] text-primary font-black uppercase mt-2 tracking-widest">
                  {trade.symbol.startsWith('WIN') ? 'R$ 0,20 POR PONTO' : 'R$ 10,00 POR PONTO'}
                </p>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-all">account_balance</span>
            </div>
          </div>

          <div className="p-8 bg-surface-dark border border-white/5 rounded-[40px] space-y-8">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Parâmetros de Execução
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Entrada</p>
                <p className="text-xl font-black text-white tabular-nums">{(trade.entryPrice || 0).toLocaleString()}</p>
              </div>

              <div className="space-y-1 relative group">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                  Saída {isEditing && <span className="material-symbols-outlined text-[14px] animate-pulse">edit</span>}
                </p>
                {isEditing ? (
                  <input
                    autoFocus
                    type="number"
                    value={editExitPrice}
                    onChange={(e) => setEditExitPrice(e.target.value)}
                    className="w-full bg-background-dark border border-primary/40 rounded-xl px-3 py-2 text-xl font-black text-white outline-none focus:border-primary transition-all"
                  />
                ) : (
                  <p className="text-xl font-black text-white tabular-nums">{trade.exitPrice?.toLocaleString() || '---'}</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Setup</p>
                <p className="text-sm font-bold text-white uppercase italic">{trade.setup}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Timeframe</p>
                <p className="text-sm font-bold text-white">{trade.timeframe}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Tamanho</p>
                <p className="text-sm font-bold text-white">1 Contrato</p>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Taxas B3</p>
                <p className="text-sm font-bold text-danger">R$ 4.80</p>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Emoção</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px] fill">sentiment_satisfied</span>
                  <p className="text-sm font-bold text-white uppercase">{trade.emotionPre}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notas Reativas */}
          <div className="p-8 bg-surface-dark border border-white/5 rounded-[40px] relative overflow-hidden">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Notas do Trader</h3>
            <div className="p-6 bg-background-dark/50 rounded-2xl border border-white/5 italic text-text-dim leading-relaxed text-sm">
              "{trade.notes || 'Nenhuma observação técnica registrada para este trade.'}"
            </div>
          </div>
        </div>

        {/* Sidebar IA Insight */}
        <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all scale-150">
              <span className="material-symbols-outlined text-6xl text-primary">auto_awesome</span>
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <h3 className="font-black text-white uppercase tracking-widest">Trade Coach IA</h3>
            </div>
            <div className="h-px w-full bg-white/5 mb-6"></div>
            {isLoadingInsight ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-2 bg-white/10 rounded w-full"></div>
                <div className="h-2 bg-white/10 rounded w-4/5"></div>
              </div>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed font-medium italic relative z-10">
                "{insight}"
              </p>
            )}
            <button className="w-full mt-8 h-12 border border-primary/30 rounded-2xl text-[10px] font-black uppercase tracking-[2px] text-primary hover:bg-primary/10 transition-all">
              Gerar Nova Análise
            </button>
          </div>

          <div className="p-8 bg-surface-dark border border-white/5 rounded-[32px] space-y-6">
            <h3 className="font-black text-white uppercase tracking-widest text-xs">Análise de Risco</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-text-dim uppercase tracking-widest">
                <span>MFE (Máxima Excursão)</span>
                <span className="text-success">+420 pts</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-text-dim uppercase tracking-widest">
                <span>MAE (Máxima Adversa)</span>
                <span className="text-danger">-120 pts</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-danger" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetailPage;
