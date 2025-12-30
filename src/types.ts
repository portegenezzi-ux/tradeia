
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
  quantity?: number;
  entryPrice: number;
  exitPrice?: number;
  result: TradeResult;
  netPL: number;
  date: string;
  time: string;
  exitTime?: string;
  timeframe: string;
  asset_class: 'FUT' | 'STK' | 'CRYPTO' | 'FOREX';
  emotion_pre: string;
  emotion_post?: string;
  notes?: string;
  setup?: string;
  mep?: number;
  men?: number;
}

export interface StatCardData {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: string;
}
