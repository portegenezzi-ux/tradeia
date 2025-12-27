
import React, { useState, useContext } from 'react';
import * as XLSX from 'xlsx';
import { DataContext } from '../App';
import { isSupabaseConfigured } from '../supabaseClient';

const AdminPage: React.FC = () => {
  const { setExcelData, excelData } = useContext(DataContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Estados para configuração do Supabase
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [sbKey, setSbKey] = useState(localStorage.getItem('SUPABASE_ANON_KEY') || '');
  
  // Estados para configuração da OpenAI
  const [oaKey, setOaKey] = useState(localStorage.getItem('OPENAI_API_KEY') || '');
  const [oaAssistantId, setOaAssistantId] = useState(localStorage.getItem('OPENAI_ASSISTANT_ID') || '');
  
  const [isSaved, setIsSaved] = useState(false);
  const [saveType, setSaveType] = useState<'supabase' | 'openai' | null>(null);

  const saveConfig = (type: 'supabase' | 'openai') => {
    if (type === 'supabase') {
      localStorage.setItem('SUPABASE_URL', sbUrl);
      localStorage.setItem('SUPABASE_ANON_KEY', sbKey);
    } else {
      localStorage.setItem('OPENAI_API_KEY', oaKey);
      localStorage.setItem('OPENAI_ASSISTANT_ID', oaAssistantId);
    }
    
    setSaveType(type);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setSaveType(null);
      if (type === 'supabase') window.location.reload(); 
    }, 1500);
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
      
      const normalizedData = data.map((row: any) => ({
        price: row.Preço || row.Price || row.price || 0,
        volume: row.Quantidade || row.Volume || row.Qty || row.size || 0,
        side: (row.Agressor || row.Side || row.side || 'buy').toLowerCase().includes('v') ? 'sell' : 'buy',
        time: row.Horário || row.Time || row.time || new Date().toLocaleTimeString()
      }));

      setExcelData(normalizedData);
      setIsProcessing(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[3px] mb-4">Painel de Controle</div>
          <h1 className="text-5xl font-black text-white font-display tracking-tight leading-none uppercase italic">Configurações <span className="text-primary">Admin</span></h1>
          <p className="text-text-dim mt-4 text-lg font-medium">Gerencie suas chaves de API, banco de dados e fontes de dados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Configuração OpenAI / Psicóloga */}
        <div className="p-10 rounded-[40px] bg-surface-dark border border-primary/20 shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all rotate-12">
            <span className="material-symbols-outlined text-[120px] text-white">psychology</span>
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <span className="material-symbols-outlined text-[32px]">smart_toy</span>
              </div>
              <h3 className="text-2xl font-black text-white font-display">Psicóloga IA (OpenAI)</h3>
            </div>
            {oaAssistantId && (
              <span className="px-3 py-1 bg-success/20 text-success text-[10px] font-bold rounded-full border border-success/30 uppercase tracking-widest">Configurado</span>
            )}
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">OpenAI API Key</label>
              <input 
                type="password" 
                value={oaKey}
                onChange={(e) => setOaKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full h-14 px-6 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white font-mono text-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Assistant ID (Psicóloga)</label>
              <input 
                type="text" 
                value={oaAssistantId}
                onChange={(e) => setOaAssistantId(e.target.value)}
                placeholder="asst_..."
                className="w-full h-14 px-6 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white font-mono text-sm"
              />
            </div>
            
            <button 
              onClick={() => saveConfig('openai')}
              className="w-full h-14 bg-primary text-background-dark rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">{isSaved && saveType === 'openai' ? 'done' : 'save'}</span>
              {isSaved && saveType === 'openai' ? 'Psicóloga Conectada' : 'Salvar Chaves OpenAI'}
            </button>
          </div>
        </div>

        {/* Configuração Supabase */}
        <div className="p-10 rounded-[40px] bg-surface-dark border border-white/5 shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                <span className="material-symbols-outlined text-[32px]">database</span>
              </div>
              <h3 className="text-2xl font-black text-white font-display">Banco de Dados</h3>
            </div>
            {isSupabaseConfigured() && (
              <span className="px-3 py-1 bg-success/20 text-success text-[10px] font-bold rounded-full border border-success/30 uppercase tracking-widest">Ativo</span>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Supabase Project URL</label>
              <input 
                type="text" 
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full h-14 px-6 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white font-mono text-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-[2px]">Supabase Anon Key</label>
              <input 
                type="password" 
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1Ni..."
                className="w-full h-14 px-6 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white font-mono text-sm"
              />
            </div>
            
            <button 
              onClick={() => saveConfig('supabase')}
              className="w-full h-14 bg-success text-background-dark rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-success/20"
            >
              <span className="material-symbols-outlined">{isSaved && saveType === 'supabase' ? 'done' : 'save'}</span>
              {isSaved && saveType === 'supabase' ? 'Supabase Conectado' : 'Salvar Supabase'}
            </button>
          </div>
        </div>

        {/* Fonte de Dados Excel */}
        <div className="p-10 rounded-[40px] bg-surface-dark border border-white/5 shadow-2xl space-y-8 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[32px]">upload_file</span>
            </div>
            <h3 className="text-2xl font-black text-white font-display">Terminal de Fluxo (Plugar Excel)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
              className="md:col-span-2 drop-zone min-h-[180px] rounded-[32px] flex flex-col items-center justify-center p-6 cursor-pointer relative"
            >
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              />
              <span className="material-symbols-outlined text-4xl text-primary/40 mb-3">cloud_upload</span>
              <p className="text-white font-black uppercase tracking-widest text-[10px]">{fileName || 'Arraste seu Excel aqui para o Tape Reading'}</p>
            </div>

            <div className="p-8 bg-background-dark/50 rounded-[32px] border border-white/5 flex flex-col justify-center items-center h-full">
               <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-2">Registros Ativos</p>
               <p className="text-5xl font-black text-white font-display">{excelData.length}</p>
               <div className={`mt-4 flex items-center gap-2 ${excelData.length > 0 ? 'text-success' : 'text-text-dim'}`}>
                 <span className="material-symbols-outlined text-[18px]">
                   {excelData.length > 0 ? 'check_circle' : 'pending'}
                 </span>
                 <span className="text-[10px] font-black uppercase tracking-widest">
                   {excelData.length > 0 ? 'Fluxo Pronto' : 'Aguardando'}
                 </span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
