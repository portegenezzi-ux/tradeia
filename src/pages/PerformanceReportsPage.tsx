
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { Trade, TradeResult } from '../types';

const weeklyData = [
  { name: 'Seg', val: -120 },
  { name: 'Ter', val: 340 },
  { name: 'Qua', val: 510 },
  { name: 'Qui', val: 150 },
  { name: 'Sex', val: -40 },
];

const emotionData = [
  { name: 'Confiante', value: 56, color: '#0db9f2' },
  { name: 'Ansioso', value: 24, color: '#eab308' },
  { name: 'Frustrado', value: 20, color: '#ef4444' },
];

const PerformanceReportsPage: React.FC = () => {
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTrades = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      const { data } = await supabase.from(TABLES.TRADES).select('*');
      if (data) setTrades(data);
      setIsLoading(false);
    };
    fetchTrades();
  }, []);

  const emotionStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    trades.forEach(t => {
      const e = t.emotion_pre || 'Neutro';
      counts[e] = (counts[e] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: name === 'Confiante' ? '#0db9f2' : name === 'Ansioso' ? '#eab308' : '#ef4444'
    }));
  }, [trades]);

  const scatterData = trades.map(trade => {
    const [hours, minutes] = (trade.time || '00:00').split(':').map(Number);
    return {
      time: hours + (minutes / 60),
      price: trade.entryPrice,
      pl: Math.abs(trade.netPL),
      rawPL: trade.netPL,
      symbol: trade.symbol,
      result: trade.result,
      displayTime: trade.time,
      emotion_pre: trade.emotion_pre
    };
  });
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-dark border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black text-primary uppercase tracking-[2px] mb-2">{data.symbol}</p>
          <div className="space-y-1.5">
            <p className="text-[10px] text-text-dim font-bold">HORA: <span className="text-white">{data.displayTime}</span></p>
            <p className="text-[10px] text-text-dim font-bold">PONTO: <span className="text-white">{data.price.toLocaleString()}</span></p>
            <p className={`text-[10px] font-black ${data.rawPL >= 0 ? 'text-success' : 'text-danger'}`}>
              RESULTADO: {data.rawPL >= 0 ? '+' : ''}R$ {Math.abs(data.rawPL).toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white font-display uppercase tracking-tight">Performance <span className="text-primary italic italic">Full</span></h1>
          <p className="text-text-dim text-lg font-medium">Análise detalhada de Mini Índice e Mini Dólar.</p>
        </div>
        <div className="flex gap-3">
          <button className="h-12 px-8 rounded-2xl bg-surface-dark border border-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Personalizar</button>
          <button className="h-12 px-8 rounded-2xl bg-primary text-background-dark text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Exportar</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['Esta Semana', 'Este Mês', 'Total Acumulado'].map((filter, i) => (
          <button key={i} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[2px] transition-all ${i === 0 ? 'bg-primary text-background-dark shadow-xl shadow-primary/20' : 'bg-surface-dark border border-white/5 text-text-dim hover:text-white'}`}>
            {filter}
          </button>
        ))}
        <div className="h-10 w-px bg-white/5 mx-4 hidden md:block"></div>
        <button className="px-6 py-3 rounded-full bg-surface-dark border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">account_balance</span> B3 Futuros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Taxa de Acerto',
            value: `${((trades.filter(t => t.netPL > 0).length / Math.max(trades.length, 1)) * 100).toFixed(0)}%`,
            sub: '+5%',
            icon: 'check_circle',
            progress: (trades.filter(t => t.netPL > 0).length / Math.max(trades.length, 1)) * 100,
            color: 'success'
          },
          {
            label: 'Sentimento Predominante',
            value: emotionStats.sort((a, b) => b.value - a.value)[0]?.name || '---',
            sub: 'Baseado em Trades',
            icon: 'psychology',
            color: 'primary'
          },
          {
            label: 'Lucro Líquido',
            value: `R$ ${trades.reduce((sum, t) => sum + (t.netPL || 0), 0).toLocaleString()}`,
            sub: 'Total Histórico',
            icon: 'payments',
            color: 'success'
          },
          {
            label: 'Total de Operações',
            value: trades.length.toString(),
            sub: 'Contagem Real',
            icon: 'analytics',
            color: 'white'
          },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-surface-dark border border-white/5 rounded-[32px] relative overflow-hidden group">
            <span className="material-symbols-outlined absolute right-4 top-4 text-5xl text-white/5 group-hover:text-white/10 transition-all">{stat.icon}</span>
            <p className="text-[10px] font-black text-text-dim uppercase tracking-[2px] mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-display whitespace-nowrap">{stat.value}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${stat.color === 'success' ? 'text-success bg-success/10' : 'text-text-dim bg-white/5'}`}>
                {stat.sub}
              </span>
            </div>
            {stat.progress !== undefined && (
              <div className="mt-4 h-1 w-full bg-background-dark rounded-full overflow-hidden">
                <div className="h-full bg-primary shadow-[0_0_10px_rgba(13,185,242,0.5)]" style={{ width: `${stat.progress}%` }}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 bg-surface-dark border border-white/5 rounded-[40px]">
          <h3 className="text-2xl font-black text-white font-display mb-10 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]">psychology</span>
            Distribuição Emocional
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2428" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#121a1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {emotionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-10 bg-surface-dark border border-white/5 rounded-[40px]">
          <h3 className="text-2xl font-black text-white font-display mb-10 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]">sentiment_very_satisfied</span>
            Sentimento por Resultado
          </h3>
          <div className="space-y-6">
            {['Confiante', 'Ansioso', 'Neutro', 'FOMO'].map(emotion => {
              const emotionTrades = trades.filter(t => (t.emotion_pre || 'Neutro') === emotion);
              const winRate = (emotionTrades.filter(t => t.netPL > 0).length / Math.max(emotionTrades.length, 1)) * 100;
              if (emotionTrades.length === 0 && emotion !== 'Neutro') return null;
              return (
                <div key={emotion} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white uppercase">{emotion}</span>
                    <span className="text-[10px] text-text-dim font-bold">{emotionTrades.length} trades</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black ${winRate >= 50 ? 'text-success' : 'text-danger'}`}>{winRate.toFixed(0)}% WR</span>
                    <div className="w-24 h-1.5 bg-background-dark rounded-full overflow-hidden">
                      <div className={`h-full ${winRate >= 50 ? 'bg-success' : 'bg-danger'}`} style={{ width: `${winRate}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-10 bg-surface-dark border border-white/5 rounded-[40px]">
        <h3 className="text-2xl font-black text-white font-display mb-10 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[32px]">analytics</span>
          Dispersão de Entrada (B3)
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2428" />
              <XAxis
                type="number"
                dataKey="time"
                domain={[9, 18]}
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.floor(v)}h`}
              />
              <YAxis
                type="number"
                dataKey="price"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v > 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <ZAxis type="number" dataKey="pl" range={[150, 1500]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Trades" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.result === TradeResult.WIN ? '#00f074' : '#ff4d4d'}
                    className="drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReportsPage;
