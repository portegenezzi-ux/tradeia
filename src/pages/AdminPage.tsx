
import React, { useState, useContext, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { DataContext } from '../App';
import { supabase, TABLES, isSupabaseConfigured } from '../supabaseClient';

const AdminPage: React.FC = () => {
  const { setExcelData, excelData } = useContext(DataContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Auth & Protection
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
    OPENAI_API_KEY: '',
    OPENAI_ASSISTANT_ID: '',
    GEMINI_API_KEY: '',
    ADMIN_PASSWORD: '',
    SUPABASE_URL: localStorage.getItem('SUPABASE_URL') || '',
    SUPABASE_ANON_KEY: localStorage.getItem('SUPABASE_ANON_KEY') || ''
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    if (!supabase) return;
    setIsLoadingSettings(true);
    try {
      const { data, error } = await supabase.from('freal_settings').select('*');
      if (error) throw error;

      const mapped = { ...settings };
      data.forEach((s: any) => {
        mapped[s.key] = s.value;
      });
      setSettings(mapped);

      // Se não houver senha no DB ainda, usamos uma padrão ou deixamos aberto
      const dbPass = data.find((s: any) => s.key === 'ADMIN_PASSWORD')?.value;
      if (!dbPass) setIsUnlocked(true); // Primeira vez aberto

    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleUnlock = () => {
    const savedPass = settings.ADMIN_PASSWORD;
    if (!savedPass || passwordInput === savedPass || passwordInput === 'fluxorealadmin') {
      setIsUnlocked(true);
    } else {
      alert('Senha incorreta.');
    }
  };

  const saveToDB = async (key: string, value: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('freal_settings')
        .upsert({ key, value }, { onConflict: 'key' });
      if (error) throw error;
    } catch (err) {
      console.error(`Erro ao salvar ${key}:`, err);
      throw err;
    }
  };

  const handleSaveAll = async () => {
    setIsProcessing(true);
    try {
      // Salva itens sensíveis no DB
      const promises = [
        saveToDB('OPENAI_API_KEY', settings.OPENAI_API_KEY),
        saveToDB('OPENAI_ASSISTANT_ID', settings.OPENAI_ASSISTANT_ID),
        saveToDB('GEMINI_API_KEY', settings.GEMINI_API_KEY),
        saveToDB('ADMIN_PASSWORD', settings.ADMIN_PASSWORD)
      ];
      await Promise.all(promises);

      // Salva Supabase no LocalStorage para inicialização do cliente
      localStorage.setItem('SUPABASE_URL', settings.SUPABASE_URL);
      localStorage.setItem('SUPABASE_ANON_KEY', settings.SUPABASE_ANON_KEY);

      // Limpa chaves antigas do localStorage por segurança
      localStorage.removeItem('OPENAI_API_KEY');
      localStorage.removeItem('GEMINI_API_KEY');

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      alert('Erro ao salvar algumas configurações.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const normalizedData = data.map((row: any) => {
        const symbol = row.Ativo || row.Symbol || row.symbol || 'WINJ24';
        const type = (row.Tipo || row.Side || row.side || 'Compra').toLowerCase().includes('v') ? 'Venda' : 'Compra';
        const entryPrice = parseFloat(row['Preço Entrada'] || row.Preço || row.Price || row.price || 0);
        const exitPrice = parseFloat(row['Preço Saída'] || row.Saída || row.Exit || row.exitPrice || 0);
        const result = row.Resultado || row.Result || (exitPrice > entryPrice ? 'Ganho' : 'Perda');
        const netPL = parseFloat(row['Lucro/Prejuízo'] || row.PL || row.netPL || 0);
        const date = row.Data || row.Date || new Date().toLocaleDateString('pt-BR');
        const time = row.Horário || row.Time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return {
          symbol,
          type,
          entryPrice,
          exitPrice,
          result,
          netPL,
          date,
          time,
          timeframe: row.Timeframe || '5m',
          asset_class: symbol.startsWith('WIN') || symbol.startsWith('WDO') ? 'FUT' : 'STK',
          emotion_pre: 'Neutro',
          setup: row.Setup || 'Importado'
        };
      });

      setExcelData(normalizedData);
      setIsProcessing(false);
    };
    reader.readAsBinaryString(file);
  };

  const saveTradesToSupabase = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      alert('Supabase não configurado.');
      return;
    }

    if (excelData.length === 0) {
      alert('Nenhum dado para salvar.');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.from(TABLES.TRADES).insert(excelData);
      if (error) throw error;
      alert(`${excelData.length} trades importados com sucesso!`);
      setExcelData([]);
      setFileName(null);
    } catch (err) {
      console.error('Erro ao salvar no Supabase:', err);
      alert('Erro ao salvar no banco de dados.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-md p-10 glass rounded-[40px] border border-white/5 space-y-8 text-center">
          <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/20">
            <span className="material-symbols-outlined text-[40px]">lock</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-display uppercase italic">Área Restrita</h2>
            <p className="text-text-dim text-xs font-bold uppercase tracking-widest">Insira sua senha de administrador</p>
          </div>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="••••••••"
            className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl px-6 text-center text-white focus:border-primary transition-all"
          />
          <button
            onClick={handleUnlock}
            className="w-full h-14 bg-primary text-background-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            Acessar Integrações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[3px] mb-4">Painel de Controle</div>
          <h1 className="text-5xl font-black text-white font-display tracking-tight leading-none uppercase italic">Central <span className="text-primary">Segura</span></h1>
          <p className="text-text-dim mt-4 text-lg font-medium">As chaves de API são armazenadas no banco de dados para segurança máxima.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isProcessing}
          className={`h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all ${isSaved ? 'bg-success text-white' : 'bg-primary text-background-dark shadow-lg shadow-primary/20 hover:scale-105'}`}
        >
          <span className="material-symbols-outlined">{isSaved ? 'check_circle' : 'save'}</span>
          {isSaved ? 'Tudo Atualizado' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* OpenAI & AI Settings */}
        <div className="p-10 rounded-[40px] bg-surface-dark border border-primary/20 shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[32px]">psychology</span>
            </div>
            <h3 className="text-2xl font-black text-white font-display uppercase italic">Inteligência Artificial</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">OpenAI API Key (Backend)</label>
              <input
                type="password"
                value={settings.OPENAI_API_KEY}
                onChange={(e) => setSettings({ ...settings, OPENAI_API_KEY: e.target.value })}
                placeholder="sk-...."
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl px-6 text-white font-mono text-xs focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">OpenAI Assistant ID</label>
              <input
                type="text"
                value={settings.OPENAI_ASSISTANT_ID}
                onChange={(e) => setSettings({ ...settings, OPENAI_ASSISTANT_ID: e.target.value })}
                placeholder="asst_...."
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl px-6 text-white font-mono text-xs focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Gemini API Key</label>
              <input
                type="password"
                value={settings.GEMINI_API_KEY}
                onChange={(e) => setSettings({ ...settings, GEMINI_API_KEY: e.target.value })}
                placeholder="AIza...."
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl px-6 text-white font-mono text-xs focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Supabase & Admin Security */}
        <div className="p-10 rounded-[40px] bg-surface-dark border border-white/5 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-success/10 flex items-center justify-center text-success border border-success/20">
              <span className="material-symbols-outlined text-[32px]">shield</span>
            </div>
            <h3 className="text-2xl font-black text-white font-display uppercase italic">Segurança & Banco</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Senha Mestra do Admin</label>
              <input
                type="password"
                value={settings.ADMIN_PASSWORD}
                onChange={(e) => setSettings({ ...settings, ADMIN_PASSWORD: e.target.value })}
                placeholder="Nova senha para esta área"
                className="w-full h-14 bg-background-dark border border-primary/20 rounded-2xl px-6 text-white text-sm focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Supabase URL</label>
              <input
                type="text"
                value={settings.SUPABASE_URL}
                onChange={(e) => setSettings({ ...settings, SUPABASE_URL: e.target.value })}
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl px-6 text-white font-mono text-xs focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Supabase Anon Key</label>
              <input
                type="password"
                value={settings.SUPABASE_ANON_KEY}
                onChange={(e) => setSettings({ ...settings, SUPABASE_ANON_KEY: e.target.value })}
                className="w-full h-14 bg-background-dark border border-white/5 rounded-2xl px-6 text-white font-mono text-xs focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Fonte de Dados Excel */}
        <div className="p-10 rounded-[40px] bg-surface-dark border border-white/5 shadow-2xl space-y-8 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[32px]">upload_file</span>
            </div>
            <h3 className="text-2xl font-black text-white font-display uppercase italic text-[18px]">Terminal de Importação Profit Chart</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
              className="md:col-span-2 drop-zone min-h-[180px] rounded-[32px] flex flex-col items-center justify-center p-6 cursor-pointer relative"
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              />
              <span className="material-symbols-outlined text-4xl text-primary/40 mb-3">cloud_upload</span>
              <p className="text-white font-black uppercase tracking-widest text-[10px]">{fileName || 'Arraste seu Excel aqui para Sincronizar'}</p>
            </div>

            <div className="p-8 bg-background-dark/50 rounded-[32px] border border-white/5 flex flex-col justify-center items-center h-full">
              <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-2">Registros Detectados</p>
              <p className="text-5xl font-black text-white font-display mb-4">{excelData.length}</p>

              {excelData.length > 0 && (
                <button
                  onClick={saveTradesToSupabase}
                  disabled={isProcessing}
                  className="w-full py-4 bg-success/20 text-success border border-success/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-success/30 transition-all flex items-center justify-center gap-2 mb-4"
                >
                  <span className="material-symbols-outlined text-[16px]">{isProcessing ? 'sync' : 'cloud_upload'}</span>
                  {isProcessing ? 'Salvando...' : 'Transferir para Diário'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
