
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  ReferenceLine,
  ComposedChart,
  Line,
  Bar,
  Tooltip
} from 'recharts';

interface Candle {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  ma: number; // Moving Average
}

const RealTimeFlowPage: React.FC = () => {
  // Função utilitária para arredondar o preço para o tick de 0,5 pontos do dólar (B3)
  const snapToHalf = (val: number) => Math.round(val * 2) / 2;

  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState(snapToHalf(5430.5));
  const [prevPrice, setPrevPrice] = useState(snapToHalf(5430.5));
  const [dailyVolume, setDailyVolume] = useState(125400); // Volume inicial simulado
  const [lastControlPoint, setLastControlPoint] = useState<number>(5431.0);
  
  const timerRef = useRef<number | null>(null);
  const tickCounterRef = useRef(0);
  
  // Níveis de Fibonacci ajustados para o spread de 0,5
  const fibLevels = [
    { level: 5442.0, label: '76.4%', color: '#64748b' },
    { level: 5438.0, label: '61,8%', color: '#334155' },
    { level: 5434.5, label: '50%', color: '#334155' },
    { level: 5431.0, label: '38,2%', color: '#be185d' }, 
    { level: 5427.5, label: '23.6%', color: '#991b1b' }  
  ];

  useEffect(() => {
    // Inicialização com 50 velas mockadas para histórico
    const base = snapToHalf(5430.5);
    const initialCandles: Candle[] = Array.from({ length: 50 }, (_, i) => {
      const open = snapToHalf(base + Math.sin(i * 0.15) * 1.5);
      const close = snapToHalf(open + (Math.random() * 1.0 - 0.5));
      return {
        time: `${i}`,
        open,
        close,
        high: snapToHalf(Math.max(open, close) + 0.5),
        low: snapToHalf(Math.min(open, close) - 0.5),
        ma: base + Math.sin(i * 0.15) * 1.4
      };
    });
    setCandles(initialCandles);

    // Intervalo de atualização de 2000ms
    timerRef.current = window.setInterval(() => {
      setCurrentPrice(prev => {
        setPrevPrice(prev);
        
        // Simulação de mudança de tick
        const rand = Math.random();
        let change = 0;
        if (rand > 0.7) {
          change = 0.5;
          setLastControlPoint(snapToHalf(prev + change));
        }
        else if (rand < 0.3) {
          change = -0.5;
          setLastControlPoint(snapToHalf(prev + change));
        }
        
        const newPrice = snapToHalf(prev + change);

        // Atualiza volume simulado
        setDailyVolume(v => v + Math.floor(Math.random() * 500) + 100);

        setCandles(prevCandles => {
          const lastCandle = prevCandles[prevCandles.length - 1];
          const newCandles = [...prevCandles];
          
          tickCounterRef.current += 1;

          if (tickCounterRef.current >= 5) {
            tickCounterRef.current = 0;
            const newCandle: Candle = {
              time: `${Date.now()}`,
              open: lastCandle.close,
              close: newPrice,
              high: snapToHalf(Math.max(lastCandle.close, newPrice) + 0.5),
              low: snapToHalf(Math.min(lastCandle.close, newPrice) - 0.5),
              ma: lastCandle.ma * 0.985 + newPrice * 0.015
            };
            return [...newCandles.slice(-59), newCandle];
          } else {
            const updatedLast = {
              ...lastCandle,
              close: newPrice,
              high: snapToHalf(Math.max(lastCandle.high, newPrice)),
              low: snapToHalf(Math.min(lastCandle.low, newPrice)),
              ma: lastCandle.ma * 0.997 + newPrice * 0.003 
            };
            newCandles[newCandles.length - 1] = updatedLast;
            return newCandles;
          }
        });

        return newPrice;
      });
    }, 2000); 

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const currentTrend = useMemo(() => {
    if (candles.length < 2) return 'Lateral';
    const firstClose = candles[0].close;
    const diff = currentPrice - firstClose;
    if (Math.abs(diff) < 2.0) return 'Lateral';
    return diff > 0 ? 'Alta' : 'Baixa';
  }, [currentPrice, candles]);

  const Candlestick = (props: any) => {
    const { x, y, width, height, open, close } = props;
    if (x == null || y == null) return null;
    
    const isUp = close >= open;
    const candleColor = isUp ? '#00f074' : '#ff4d4d';
    const centerX = x + width / 2;
    const rectHeight = Math.max(Math.abs(height), 2);
    
    return (
      <g>
        <line x1={centerX} y1={y} x2={centerX} y2={y + height} stroke={candleColor} strokeWidth={1} />
        <rect
          x={x}
          y={isUp ? y : y}
          width={width}
          height={rectHeight}
          fill={candleColor}
          rx={1}
          style={{ transition: 'all 2s ease-in-out' }}
        />
      </g>
    );
  };

  const trendDir = currentPrice > prevPrice ? 'up' : currentPrice < prevPrice ? 'down' : 'stable';

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-1000">
      
      {/* Ticker em tempo real no topo */}
      <div className="w-full bg-background-dark/80 backdrop-blur-sm border-b border-white/5 py-2 px-6 flex items-center justify-between overflow-hidden whitespace-nowrap -mx-4 md:-mx-8 mb-4">
        <div className="flex items-center gap-6 animate-marquee">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">WDOFUT</span>
              <span className={`text-sm font-black tabular-nums ${trendDir === 'up' ? 'text-success' : trendDir === 'down' ? 'text-danger' : 'text-white'}`}>
                {currentPrice.toFixed(1)}
              </span>
              <span className={`material-symbols-outlined text-[16px] ${trendDir === 'up' ? 'text-success' : trendDir === 'down' ? 'text-danger' : 'text-text-dim'}`}>
                {trendDir === 'up' ? 'trending_up' : trendDir === 'down' ? 'trending_down' : 'horizontal_rule'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dashboard de Preço Suavizado */}
      <div className="bg-surface-dark border border-white/5 p-6 rounded-[32px] flex justify-between items-center shadow-2xl relative overflow-hidden group">
        <div className={`absolute inset-0 opacity-5 blur-3xl transition-colors duration-2000 ${trendDir === 'up' ? 'bg-success' : trendDir === 'down' ? 'bg-danger' : 'bg-primary'}`}></div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-white font-display uppercase italic tracking-tighter">WDOFUT</h1>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[9px] text-text-dim font-black uppercase tracking-[2px]">Tick: 0,5 pontos • Fluxo Institucional</span>
            </div>
          </div>
          
          <div className="h-12 w-px bg-white/10"></div>
          
          <div className="flex items-baseline gap-4 group/price cursor-pointer">
            <span className={`text-6xl font-black font-display tabular-nums tracking-tighter transition-all duration-1000 group-hover/price:scale-105 group-hover/price:text-primary ${trendDir === 'up' ? 'text-success' : trendDir === 'down' ? 'text-danger' : 'text-white'}`}>
              {currentPrice.toFixed(1)}
            </span>
            <div className={`flex flex-col transition-transform group-hover/price:translate-x-1 ${trendDir === 'up' ? 'text-success' : trendDir === 'down' ? 'text-danger' : 'text-text-dim'}`}>
              <span className="material-symbols-outlined text-3xl leading-none">
                {trendDir === 'up' ? 'stat_3' : trendDir === 'down' ? 'stat_minus_3' : 'remove'}
              </span>
              <span className="text-[10px] font-black uppercase text-center">{trendDir === 'up' ? '+0.5' : trendDir === 'down' ? '-0.5' : '0.0'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
           <div className="px-6 py-3 rounded-2xl bg-background-dark/50 border border-white/5 backdrop-blur-md">
              <p className="text-[8px] font-black text-text-dim uppercase tracking-[3px] mb-1">Volatilidade IA</p>
              <p className="text-sm font-bold text-primary flex items-center gap-2 text-center">
                <span className="material-symbols-outlined text-[16px]">waves</span>
                ESTÁVEL 0,5
              </p>
           </div>
        </div>
      </div>

      {/* Gráfico Profissional */}
      <div className="p-4 rounded-[40px] bg-[#d1d5db] border border-white/20 relative overflow-hidden h-[480px] shadow-inner">
        <div className="absolute inset-0 bg-[#cbd5e1] opacity-60"></div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={candles} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#94a3b8" strokeDasharray="2 2" vertical={true} horizontal={true} strokeOpacity={0.2} />
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(1)} width={60} interval={0} />
            {fibLevels.map((fib, idx) => (
              <ReferenceLine key={idx} y={fib.level || (fib as any).alt} stroke={fib.color} strokeWidth={1} strokeOpacity={0.3} label={{ value: fib.label, position: 'left', fill: fib.color, fontSize: 9, fontWeight: 'bold', offset: 10, opacity: 0.5 }} />
            ))}
            <Line type="monotone" dataKey="ma" stroke="#1e40af" strokeWidth={3} strokeOpacity={0.6} dot={false} isAnimationActive={true} animationDuration={2000} />
            <Bar dataKey="close" shape={<Candlestick />} isAnimationActive={true} animationDuration={2000} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '11px', fontWeight: 'bold' }} labelStyle={{ display: 'none' }} formatter={(value: any, name: any, props: any) => { const { open, close, high, low } = props.payload; return [`ABER: ${open.toFixed(1)} MÁX: ${high.toFixed(1)} MÍN: ${low.toFixed(1)} FECH: ${close.toFixed(1)}`, 'WDO Tick Precision']; }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
            <div className={`px-4 py-2 rounded-l-xl font-mono text-[13px] font-black shadow-2xl text-white transition-all duration-1000 flex items-center gap-2 ${trendDir === 'up' ? 'bg-success' : trendDir === 'down' ? 'bg-danger' : 'bg-surface-dark border border-white/10'}`}>
              {currentPrice.toFixed(1)}
            </div>
        </div>
      </div>

      {/* Rodapé de Monitoramento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 rounded-[32px] bg-surface-dark border border-white/5 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
            <p className="text-[10px] font-black text-text-dim uppercase tracking-[3px] mb-1">Tendência Atual</p>
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined ${currentTrend === 'Alta' ? 'text-success' : currentTrend === 'Baixa' ? 'text-danger' : 'text-primary'}`}>
                {currentTrend === 'Alta' ? 'trending_up' : currentTrend === 'Baixa' ? 'trending_down' : 'sync'}
              </span>
              <p className={`text-xl font-black uppercase italic ${currentTrend === 'Alta' ? 'text-success' : currentTrend === 'Baixa' ? 'text-danger' : 'text-primary'}`}>
                {currentTrend}
              </p>
            </div>
         </div>
         <div className="p-8 rounded-[32px] bg-surface-dark border border-white/5 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
            <p className="text-[10px] font-black text-text-dim uppercase tracking-[3px] mb-1">Último Ponto de Controle</p>
            <div className="flex items-center gap-2">
               <span className={`material-symbols-outlined ${trendDir === 'up' ? 'text-success' : trendDir === 'down' ? 'text-danger' : 'text-white'}`}>
                 {trendDir === 'up' ? 'arrow_upward' : trendDir === 'down' ? 'arrow_downward' : 'drag_handle'}
               </span>
               <p className={`text-xl font-black italic tabular-nums ${trendDir === 'up' ? 'text-success font-bold' : trendDir === 'down' ? 'text-danger font-bold' : 'text-white'}`}>
                 {lastControlPoint.toFixed(1)}
               </p>
            </div>
         </div>
         <div className="p-8 rounded-[32px] bg-surface-dark border border-white/5 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
            <p className="text-[10px] font-black text-text-dim uppercase tracking-[3px] mb-1">Volume Financeiro do Dia</p>
            <div className={`flex items-center gap-2 text-xl font-black tabular-nums transition-colors duration-500 ${trendDir === 'up' ? 'text-success' : trendDir === 'down' ? 'text-danger' : 'text-primary'}`}>
               <span className="material-symbols-outlined">payments</span>
               {dailyVolume.toLocaleString()}
            </div>
         </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RealTimeFlowPage;
