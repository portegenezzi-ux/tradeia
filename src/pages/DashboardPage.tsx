
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_TRADES } from '../constants';

const data = [
  { name: 'Seg', value: 300 },
  { name: 'Ter', value: 450 },
  { name: 'Qua', value: 400 },
  { name: 'Qui', value: 800 },
  { name: 'Sex', value: 1240 },
];

const DashboardPage: React.FC = () => {
  // Simulando um score para demonstração da lógica
  const disciplineScore = 88;

  const getDisciplineStatus = (score: number) => {
    if (score < 30) return {
      label: 'Indisciplinado',
      color: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/20',
      icon: 'report_problem',
      desc: 'Risco crítico de capital. Pare de operar e revise seu plano imediatamente.'
    };
    if (score < 70) return {
      label: 'Em Evolução',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'trending_up',
      desc: 'Progresso constante. Mantenha o foco na execução técnica.'
    };
    if (score < 95) return {
      label: 'Consistente',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      icon: 'verified',
      desc: 'Execução de alto nível. Você está operando como um profissional.'
    };
    return {
      label: 'Trader de Elite',
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: 'emoji_events',
      desc: 'Desempenho excepcional. Disciplina inabalável e maestria emocional.'
    };
  };

  const status = getDisciplineStatus(disciplineScore);

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black text-white font-display tracking-tight leading-none uppercase">Desempenho <span className="text-primary italic">Ao Vivo</span></h1>
          <p className="text-text-dim mt-4 text-lg font-medium flex items-center gap-2">
            24 de Outubro, 2023
            <span className="px-3 py-1 bg-success/10 text-success text-xs font-black rounded-full border border-success/20 uppercase tracking-widest">Mercado Aberto</span>
          </p>
        </div>
      </div>

      {/* Alerta de Indisciplina Crítica */}
      {disciplineScore < 30 && (
        <div className="p-6 rounded-[32px] bg-danger/10 border border-danger/30 flex items-center gap-6 animate-pulse">
          <div className="size-14 rounded-2xl bg-danger flex items-center justify-center shadow-lg shadow-danger/20">
            <span className="material-symbols-outlined text-white text-3xl font-black">gavel</span>
          </div>
          <div>
            <h4 className="text-danger font-black uppercase tracking-widest">Bloqueio Preventivo Sugerido</h4>
            <p className="text-danger/80 text-sm font-medium">Sua disciplina caiu para {disciplineScore}%. O sistema recomenda 24h de afastamento do terminal para reequilíbrio emocional.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'P&L Diário', value: '+R$ 320,50', change: '+1.2%', icon: 'payments', color: 'success' },
          { label: 'P&L Semanal', value: '+R$ 1.240,00', change: '+5.4%', icon: 'account_balance_wallet', color: 'success' },
          { label: 'Taxa de Acerto', value: '68%', change: '+2%', icon: 'target', color: 'success' },
          { label: 'Expectativa', value: '0.75 R', change: '-0.1 R', icon: 'functions', color: 'danger' },
        ].map((stat, i) => (
          <div key={i} className="group p-6 rounded-3xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">{stat.label}</span>
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-[20px] text-text-dim group-hover:text-primary">{stat.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-black text-white font-display whitespace-nowrap">{stat.value}</p>
            <div className={`flex items-center gap-2 text-[10px] font-black mt-4 ${stat.color === 'success' ? 'text-success' : 'text-danger'}`}>
              <span className="material-symbols-outlined text-[14px]">
                {stat.color === 'success' ? 'trending_up' : 'trending_down'}
              </span>
              {stat.change}
              <span className="text-text-dim font-medium lowercase">vs ontem</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl bg-surface-dark border border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="text-2xl font-black text-white font-display">Curva de Patrimônio</h3>
                <p className="text-sm text-text-dim mt-1">Sua evolução financeira nesta semana</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary font-display">+R$ 1.240,00</p>
                <p className="text-xs text-success font-black uppercase tracking-widest">+15% ROI semanal</p>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0db9f2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0db9f2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2428" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121a1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#0db9f2', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0db9f2" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-surface-dark border border-white/5 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white font-display">Operações Recentes</h3>
              <button className="text-xs font-black text-primary hover:text-white transition-colors uppercase tracking-widest border-b border-primary/30 pb-1">Ver Diário Completo</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] text-text-dim uppercase tracking-[2px] font-black">
                    <th className="pb-6">Ativo</th>
                    <th className="pb-6">Lado</th>
                    <th className="pb-6">Resultado</th>
                    <th className="pb-6 text-right">P&L Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_TRADES.slice(0, 4).map((trade) => (
                    <tr key={trade.id} className="group hover:bg-white/5 transition-all duration-300">
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white group-hover:bg-primary/20 transition-colors">
                            {trade.symbol.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-white block">{trade.symbol}</span>
                            <span className="text-[10px] text-text-dim uppercase font-bold">{trade.asset_class}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${trade.type === 'Compra' ? 'text-success bg-success/10 border border-success/20' : 'text-danger bg-danger/10 border border-danger/20'}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-6">
                        <span className={`flex items-center gap-2 text-sm font-black ${trade.result === 'Ganho' ? 'text-success' : trade.result === 'Perda' ? 'text-danger' : 'text-primary'}`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {trade.result === 'Ganho' ? 'check_circle' : trade.result === 'Perda' ? 'cancel' : 'pending'}
                          </span>
                          {trade.result}
                        </span>
                      </td>
                      <td className={`py-6 text-right font-black text-lg font-display ${trade.netPL >= 0 ? 'text-success' : 'text-danger'}`}>
                        {trade.netPL >= 0 ? '+' : ''}R$ {Math.abs(trade.netPL).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Sessão de Psicologia com Status Dinâmico */}
          <div className={`p-10 rounded-3xl bg-surface-dark border ${status.border} relative overflow-hidden group transition-all duration-500`}>
            {disciplineScore >= 95 && (
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity scale-[2] rotate-12">
                <span className="material-symbols-outlined text-[100px] text-success fill">emoji_events</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <span className={`material-symbols-outlined ${status.color} fill`}>{status.icon}</span>
              <h3 className="text-2xl font-black text-white font-display">Psicologia</h3>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full ${status.bg} ${status.color} text-[10px] font-black uppercase tracking-[2px] mb-8 border ${status.border}`}>
              {status.label}
            </div>

            <div className="flex flex-col items-center justify-center mb-10">
              <div className="size-48 relative flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke={disciplineScore < 30 ? '#ff4d4d' : disciplineScore >= 95 ? '#00f074' : '#0db9f2'} strokeWidth="3" strokeDasharray={`${disciplineScore} 100`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-6xl font-black text-white font-display leading-none">{disciplineScore}</span>
                  <span className="text-[10px] text-text-dim font-black uppercase tracking-[2px] mt-2">Score Disciplina</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-xs text-text-dim italic leading-relaxed">
                "{status.desc}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all text-center">
                <p className="text-2xl font-black text-white font-display">R$ 50</p>
                <p className="text-[10px] text-text-dim font-black uppercase mt-1 tracking-wider">Avg Risco</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all text-center">
                <p className="text-2xl font-black text-white font-display">12</p>
                <p className="text-[10px] text-text-dim font-black uppercase mt-1 tracking-wider">Trades Hoje</p>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-3xl bg-surface-dark border border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white font-display">Gatilhos Mentais</h3>
              <span className="px-3 py-1 bg-danger/20 text-danger text-[10px] font-black rounded-full uppercase border border-danger/30">2 Alertas</span>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Risco de Overtrading', desc: 'Você abriu 3 ordens em 15 min. Respire.', icon: 'warning', color: 'danger' },
                { title: 'Foco no Plano', desc: 'Stop Loss respeitado perfeitamente na última operação.', icon: 'lightbulb', color: 'success' },
                { title: 'Atenção ao FOMO', desc: 'Detectamos entradas próximas a topos históricos.', icon: 'bolt', color: 'primary' },
              ].map((alert, i) => (
                <div key={i} className={`p-6 rounded-2xl flex gap-4 border transition-all duration-300 hover:scale-[1.02] ${alert.color === 'danger' ? 'bg-danger/5 border-danger/20' :
                    alert.color === 'success' ? 'bg-success/5 border-success/20' :
                      'bg-primary/5 border-primary/20'
                  }`}>
                  <span className={`material-symbols-outlined text-[24px] ${alert.color === 'danger' ? 'text-danger' :
                      alert.color === 'success' ? 'text-success' :
                        'text-primary'
                    }`}>{alert.icon}</span>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{alert.title}</p>
                    <p className="text-xs text-text-dim mt-2 leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
