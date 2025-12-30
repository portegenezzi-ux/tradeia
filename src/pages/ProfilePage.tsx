
import React, { useState, useRef, useEffect } from 'react';

const ProfilePage: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string>('https://picsum.photos/id/64/400/400');
  const [userName, setUserName] = useState<string>('Carlos Silva');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('Carlos Silva');
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  
  // Estados do Modal de Senha
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileDisciplineScore = 98;

  useEffect(() => {
    const savedImage = localStorage.getItem('user_profile_image');
    const savedName = localStorage.getItem('user_name');
    if (savedImage) setProfileImage(savedImage);
    if (savedName) {
      setUserName(savedName);
      setTempName(savedName);
    }
  }, []);

  const handleImageClick = () => {
    setIsEditing(true);
    fileInputRef.current?.click();
  };

  const handleEditName = () => {
    setIsEditing(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (isEditing) {
      setUserName(tempName);
      localStorage.setItem('user_name', tempName);
      localStorage.setItem('user_profile_image', profileImage);
      window.dispatchEvent(new Event('profile_updated'));
      setIsEditing(false);
    } else {
      // Se não estiver editando, apenas foca no primeiro campo ou ativa o modo
      setIsEditing(true);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("As senhas não coincidem!");
      return;
    }
    // Simulação de salvamento
    alert("Senha alterada com sucesso!");
    setShowSecurityModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const getDisciplineDetails = (score: number) => {
    if (score < 30) return { label: 'Indisciplinado', color: 'text-danger', icon: 'gavel' };
    if (score < 70) return { label: 'Em Evolução', color: 'text-amber-500', icon: 'trending_up' };
    if (score < 95) return { label: 'Consistente', color: 'text-primary', icon: 'verified' };
    return { label: 'Trader de Elite', color: 'text-success', icon: 'emoji_events' };
  };

  const status = getDisciplineDetails(profileDisciplineScore);

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Header do Perfil */}
      <div className="relative overflow-hidden rounded-[40px] bg-surface-dark p-12 border border-white/5 shadow-2xl">
        <div className="absolute right-[-50px] top-[-50px] size-80 bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <div 
                className={`size-40 rounded-3xl bg-cover bg-center ring-4 transition-all duration-500 overflow-hidden ${isEditing ? 'ring-success shadow-2xl scale-105' : 'ring-primary/20 rotate-3'}`} 
                style={{ backgroundImage: `url(${profileImage})` }} 
              >
                {/* Overlay sempre disponível no hover ou quando editando */}
                <div className={`absolute inset-0 bg-background-dark/60 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className="material-symbols-outlined text-success text-3xl">edit</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Alterar Foto</span>
                </div>
              </div>
              
              {!isEditing && profileDisciplineScore >= 95 && (
                <div className="absolute -top-4 -right-4 size-12 bg-success rounded-2xl flex items-center justify-center text-background-dark shadow-xl shadow-success/30 rotate-12 z-20">
                  <span className="material-symbols-outlined fill">emoji_events</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                {isEditing ? (
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={tempName}
                      autoFocus
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-3xl font-black text-white bg-background-dark border border-success/30 rounded-xl px-4 py-2 focus:ring-1 focus:ring-success focus:outline-none uppercase font-display"
                      placeholder="Seu Nome"
                    />
                    <span className="material-symbols-outlined text-success ml-2">check_circle</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group cursor-pointer" onClick={handleEditName}>
                    <h2 className="text-5xl font-black text-white font-display tracking-tight uppercase">{userName}</h2>
                    <span className="material-symbols-outlined text-text-dim group-hover:text-success transition-colors text-[24px]">edit</span>
                  </div>
                )}
                <span className="px-4 py-1.5 bg-primary text-background-dark text-[10px] font-black rounded-full shadow-xl shadow-primary/20 tracking-[2px] uppercase">PREMIUM</span>
              </div>
              <p className="text-text-dim text-lg font-medium">Trader de Elite B3 • Mini Índice & Dólar • Desde 2022</p>
              <div className="flex justify-center md:justify-start gap-3">
                <span className="px-4 py-2 bg-success/10 text-success rounded-xl text-[10px] font-black border border-success/20 uppercase tracking-[2px]">Top 5% Performance</span>
                <span className={`px-4 py-2 bg-white/5 ${status.color} rounded-xl text-[10px] font-black border border-white/5 uppercase tracking-[2px] flex items-center gap-2`}>
                   <span className="material-symbols-outlined text-[16px]">{status.icon}</span>
                   {status.label} {profileDisciplineScore}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowSecurityModal(true)}
              className="h-14 px-8 bg-surface-dark border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Segurança
            </button>
            <button 
              onClick={handleSaveProfile} 
              className="h-14 px-8 bg-success text-background-dark rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-success/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-10">
          <div className="p-10 bg-surface-dark border border-white/5 rounded-[32px] shadow-xl text-center">
            <h3 className="text-xs font-black uppercase tracking-[3px] text-text-dim mb-10">Nível de Disciplina Atual</h3>
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="size-48 relative flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke={profileDisciplineScore >= 95 ? '#00f074' : '#0db9f2'} strokeWidth="3" strokeDasharray={`${profileDisciplineScore} 100`} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(0,185,242,0.5)] transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-6xl font-black ${profileDisciplineScore >= 95 ? 'text-success' : 'text-white'} font-display`}>{profileDisciplineScore}</span>
                  <span className="text-[10px] font-black text-text-dim uppercase mt-2 tracking-widest">Score IA</span>
                </div>
              </div>
              <div className={`mt-4 px-6 py-2 rounded-full border ${status.color.replace('text', 'border')}/20 ${status.color.replace('text', 'bg')}/10 ${status.color} font-black uppercase tracking-widest text-sm`}>
                {status.label}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="p-10 bg-surface-dark border border-white/5 rounded-[40px] shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white font-display">Preferências B3</h3>
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">settings_accessibility</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-[2px]">Ativos Operados</label>
                <div className="flex gap-2">
                  <span className="px-5 py-2.5 bg-primary/10 border border-primary/30 rounded-xl text-xs font-black text-primary uppercase">WIN (Índice)</span>
                  <span className="px-5 py-2.5 bg-primary/10 border border-primary/30 rounded-xl text-xs font-black text-primary uppercase">WDO (Dólar)</span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-[2px]">Estilo de Trade</label>
                <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-black text-white uppercase tracking-widest">
                  Day Trade / Scalping
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Segurança (Troca de Senha) */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-xl" onClick={() => setShowSecurityModal(false)}></div>
          <div className="relative w-full max-w-md bg-surface-dark border border-white/10 rounded-[40px] p-10 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight italic">Trocar <span className="text-primary">Senha</span></h3>
                <p className="text-[10px] text-text-dim font-black uppercase tracking-widest">Segurança do Terminal</p>
              </div>
              <button onClick={() => setShowSecurityModal(false)} className="text-text-dim hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">Senha Atual</label>
                <input 
                  type="password" 
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full h-14 bg-background-dark border border-white/10 rounded-2xl px-6 text-white focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nova Senha</label>
                <input 
                  type="password" 
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full h-14 bg-background-dark border border-white/10 rounded-2xl px-6 text-white focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full h-14 bg-background-dark border border-white/10 rounded-2xl px-6 text-white focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-14 bg-primary text-background-dark rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Atualizar Senha
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
