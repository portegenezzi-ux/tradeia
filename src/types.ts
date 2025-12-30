
export type Page = 'login' | 'dashboard' | 'journal' | 'analytics' | 'reports' | 'profile' | 'settings' | 'new-trade' | 'trade-detail';

export enum TradeResult {
  WIN = 'Ganho',
  LOSS = 'Perda',
  OPEN = 'Aberto'
}

export enum TradeType {
  LONG = 'Compra',
  SHORT = 'Venda'
}

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  entryPrice: number;
  exitPrice?: number;
  result: TradeResult;
  netPL: number;
  date: string;
  time: string;
  timeframe: string;
  assetClass: 'FUT' | 'STK' | 'CRYPTO' | 'FOREX';
  emotionPre: string;
  emotionPost?: string;
  notes?: string;
  setup?: string;
}

export interface StatCardData {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: string;
}
