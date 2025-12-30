
import { createClient } from '@supabase/supabase-js';

// Tenta obter das variáveis de ambiente ou do localStorage (caso o usuário tenha configurado via Admin)
const getSupabaseConfig = () => {
  const url = (process.env as any).SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || '';
  const key = (process.env as any).SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || '';
  return { url, key };
};

const config = getSupabaseConfig();

// Só inicializa se houver URL. Se não houver, exportamos um cliente nulo que trataremos nas páginas.
export const supabase = config.url 
  ? createClient(config.url, config.key) 
  : null;

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return !!url && !!key;
};

export const TABLES = {
  TRADES: 'trades',
  SETTINGS: 'settings',
  PROFILES: 'profiles'
};
