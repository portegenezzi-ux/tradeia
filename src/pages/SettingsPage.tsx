
import React, { useState, useEffect } from 'react';

const SettingsPage: React.FC = () => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [signalAlerts, setSignalAlerts] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    window.Notification ? Notification.permission : 'default'
  );

  useEffect(() => {
    // Service Worker registration removed to avoid origin mismatch errors in preview environment.
    // In a production environment, you would ensure sw.js is hosted on the same origin.
    console.log('Ambiente de Preview: Notificações Push simuladas.');
  }, []);

  const requestNotificationPermission = async () => {
    if (!window.Notification) {
      alert("Seu navegador não suporta notificações push.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        setPushEnabled(true);
        new Notification("Fluxo Real AI", {
          body: "Notificações ativadas com sucesso!",
          icon: "/favicon.ico"
        });
      }
    } catch (err) {
      console.error('Erro ao solicitar permissão de notificação:', err);
    }
  };

  const handleTogglePush = () => {
    if (notificationStatus !== 'granted') {
      requestNotificationPermission();
    } else {
      setPushEnabled(!pushEnabled);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black text-white font-display uppercase tracking-tight">Preferências <span className="text-primary italic">Avançadas</span></h1>
        <p className="text-text-dim mt-2 font-medium">Configure seu terminal e alertas de alta performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Seção de Notificações Push */}
        <div className="p-8 rounded-[32px] bg-surface-dark border border-white/5 shadow-xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
            <span className="material-symbols-outlined text-[100px] text-primary">notifications_active</span>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[32px]">campaign</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-display">Alertas em Tempo Real</h3>
              <p className="text-[10px] text-text-dim font-black uppercase tracking-[2px] mt-1">Notificações via Browser & Desktop</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between p-6 bg-background-dark/50 rounded-2xl border border-white/5 transition-all hover:border-primary/20">
              <div className="space-y-1">
                <p className="text-sm font-black text-white uppercase tracking-tight">Push Global</p>
                <p className="text-xs text-text-dim">Ativar/Desativar todas as comunicações externas.</p>
              </div>
              <button 
                onClick={handleTogglePush}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${pushEnabled ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 size-5 bg-white rounded-full transition-all duration-300 ${pushEnabled ? 'left-8 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'left-1'}`} />
              </button>
            </div>

            <div className={`space-y-4 transition-all duration-500 ${pushEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex items-center justify-between px-6">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Alertas de Preço</p>
                  <p className="text-[10px] text-text-dim italic">Avisar quando WDOFUT atingir níveis críticos.</p>
                </div>
                <button 
                  onClick={() => setPriceAlerts(!priceAlerts)}
                  className={`size-6 rounded-lg border flex items-center justify-center transition-all ${priceAlerts ? 'bg-primary border-primary text-background-dark' : 'border-white/10'}`}
                >
                  {priceAlerts && <span className="material-symbols-outlined text-[16px] font-black">check</span>}
                </button>
              </div>

              <div className="flex items-center justify-between px-6">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Sinais de Fluxo</p>
                  <p className="text-[10px] text-text-dim italic">Notificações de agressão institucional detectada.</p>
                </div>
                <button 
                  onClick={() => setSignalAlerts(!signalAlerts)}
                  className={`size-6 rounded-lg border flex items-center justify-center transition-all ${signalAlerts ? 'bg-primary border-primary text-background-dark' : 'border-white/10'}`}
                >
                  {signalAlerts && <span className="material-symbols-outlined text-[16px] font-black">check</span>}
                </button>
              </div>
            </div>
          </div>
          
          {notificationStatus === 'denied' && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">error</span>
              As notificações estão bloqueadas no seu navegador. Ative nas configurações do site.
            </div>
          )}
        </div>

        {/* Outras Configurações */}
        <div className="p-8 rounded-[32px] bg-surface-dark border border-white/5 space-y-6">
          <h3 className="text-xs font-black text-white/50 uppercase tracking-[3px]">Preferências do Terminal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all text-left group">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Som de Execução</span>
                <span className="material-symbols-outlined text-text-dim group-hover:text-primary transition-colors">volume_up</span>
             </button>
             <button className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all text-left group">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Save Cloud</span>
                <span className="material-symbols-outlined text-text-dim group-hover:text-primary transition-colors">cloud_sync</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
