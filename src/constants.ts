
import { Trade, TradeResult, TradeType } from './types';

export const MOCK_TRADES: Trade[] = [
  {
    id: 'TRD-2049',
    symbol: 'WINJ24',
    type: TradeType.LONG,
    entryPrice: 125000,
    result: TradeResult.OPEN,
    netPL: 150.00,
    date: '10/05',
    time: '14:30',
    timeframe: '5m',
    asset_class: 'FUT',
    emotion_pre: 'Calmo',
    setup: 'Rompimento de Tendência'
  },
  {
    id: 'TRD-2048',
    symbol: 'WDOJ24',
    type: TradeType.SHORT,
    entryPrice: 5034.50,
    exitPrice: 5012.00,
    result: TradeResult.WIN,
    netPL: 300.00,
    date: '10/05',
    time: '11:15',
    timeframe: '15m',
    asset_class: 'FUT',
    emotion_pre: 'Neutro',
    setup: 'Pullback'
  },
  {
    id: 'TRD-2047',
    symbol: 'WDOJ24',
    type: TradeType.LONG,
    entryPrice: 5000,
    exitPrice: 4990,
    result: TradeResult.LOSS,
    netPL: -100.00,
    date: '09/05',
    time: '16:45',
    timeframe: '5m',
    asset_class: 'FUT',
    emotion_pre: 'Ansioso',
    setup: 'Retorno à Média'
  },
  {
    id: 'TRD-2046',
    symbol: 'WINJ24',
    type: TradeType.LONG,
    entryPrice: 126200,
    exitPrice: 126850,
    result: TradeResult.WIN,
    netPL: 520.00,
    date: '09/05',
    time: '10:20',
    timeframe: 'D',
    asset_class: 'FUT',
    emotion_pre: 'Confiante',
    setup: 'Rompimento'
  }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: 'dashboard', adminOnly: false },
  { id: 'flow', label: 'Terminal Fluxo', icon: 'query_stats', adminOnly: false },
  { id: 'journal', label: 'Diário', icon: 'book', adminOnly: false },
  { id: 'psychologist', label: 'Psicólogo IA', icon: 'psychology', adminOnly: false },
  { id: 'profile', label: 'Perfil', icon: 'person', adminOnly: false },
  { id: 'admin', label: 'Admin', icon: 'admin_panel_settings', adminOnly: true },
  { id: 'settings', label: 'Ajustes', icon: 'settings', adminOnly: false }
];
