
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Estados do formulário de registro
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: ''
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de registro
    console.log('Dados de registro:', regData);
    alert('Conta criada com sucesso! Aproveite seus 7 dias de Fluxo Real.');
    setShowRegisterModal(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-background-dark overflow-hidden font-sans">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-10 py-16 lg:px-20 border-r border-white/5 bg-[#0a0f11] relative z-10">
        <div className="max-w-[440px] w-full mx-auto space-y-10">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/20 neon-border">
              <span className="material-symbols-outlined text-primary text-[32px]">candlestick_chart</span>
            </div>
            <h1 className="text-3xl font-black text-white font-display uppercase italic tracking-tighter">Fluxo<span className="text-primary">Real</span></h1>
          </div>

          {/* Welcome Text */}
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white font-display leading-[0.9] tracking-tight">O algoritmo mais vencedor<br/><span className="text-primary italic">do universo do day trade.</span></h2>
            <p className="text-text-dim text-lg">Evolua sua mentalidade e técnica com inteligência artificial de ponta.</p>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(username); }}>
            <div className="space-y-3">
              <label className="text-xs font-black text-white/70 uppercase tracking-[2px]">ID do Usuário</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dim group-focus-within:text-primary transition-colors text-[22px]">person</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário" 
                  className="w-full h-16 pl-14 bg-surface-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white placeholder:text-white/20 font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-xs font-black text-white/70 uppercase tracking-[2px]">Senha</label>
                <a href="#" className="text-xs text-primary font-black hover:text-white transition-colors uppercase">Recuperar</a>
              </div>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dim group-focus-within:text-primary transition-colors text-[22px]">lock</span>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full h-16 pl-14 bg-surface-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white placeholder:text-white/20 font-bold"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-16 bg-primary hover:bg-primary/90 text-background-dark font-black rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20 text-lg uppercase tracking-widest font-display flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 mt-4"
            >
              Entrar no Terminal
              <span className="material-symbols-outlined">bolt</span>
            </button>

            <button 
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-3 text-sm uppercase tracking-wider"
            >
              Criar Conta (7 dias grátis)
            </button>
          </form>
        </div>
      </div>

      {/* Lado Direito - Oferta e Marketing */}
      <div className="hidden lg:flex flex-1 relative bg-background-dark items-center justify-center p-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -mr-96 -mt-96"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success/5 blur-[120px] rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10 w-full max-w-2xl space-y-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-block px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[4px] animate-pulse">Oferta de Lançamento</div>
            <h2 className="text-7xl font-black text-white leading-none font-display tracking-tighter uppercase">Opere como uma<br/><span className="text-primary italic">Instituição.</span></h2>
            <p className="text-text-dim text-xl max-w-lg leading-relaxed">
              O ecossistema completo para traders que buscam a alta performance e consistência no mercado.
            </p>
          </div>

          {/* Pricing Card Re-styled */}
          <div className="grid grid-cols-1 gap-6">
             <div className="p-10 glass rounded-[40px] border border-primary/20 relative shadow-[0_0_50px_rgba(13,185,242,0.15)] overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all rotate-12">
                  <span className="material-symbols-outlined text-[120px] text-primary">verified_user</span>
                </div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-4">
                    <h3 className="font-black text-4xl text-white font-display uppercase italic leading-none">Plano<br/>Performance</h3>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-success/20 text-success text-[10px] font-black rounded-md uppercase border border-success/30 tracking-widest">7 Dias Grátis</span>
                      <span className="text-text-dim text-xs font-bold uppercase tracking-widest">Teste sem compromisso</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-text-dim text-xs font-black uppercase tracking-widest line-through opacity-50 italic">de R$ 197,00</p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                       <span className="text-2xl font-display font-black text-primary self-start mt-1">R$</span>
                       <p className="text-7xl font-black text-primary font-display tracking-tighter leading-none">49</p>
                    </div>
                    <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mt-2">pagamento mensal</p>
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 my-10"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
                   <div className="flex items-center gap-4">
                     <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                       <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight">7 Dias Freemium</span>
                        <span className="text-[10px] text-text-dim font-bold">Teste grátis agora</span>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                     <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <span className="material-symbols-outlined text-[24px]">psychology</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight">Psicóloga Trader IA 24h</span>
                        <span className="text-[10px] text-text-dim font-bold">Suporte emocional full-time</span>
                     </div>
                   </div>

                   <div className="flex items-center gap-4">
                     <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <span className="material-symbols-outlined text-[24px]">book</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight">Registro de Trader</span>
                        <span className="text-[10px] text-text-dim font-bold">Diário automatizado</span>
                     </div>
                   </div>

                   <div className="flex items-center gap-4">
                     <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <span className="material-symbols-outlined text-[24px]">leaderboard</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight">Análise de Desempenho</span>
                        <span className="text-[10px] text-text-dim font-bold">Relatórios ultra detalhados</span>
                     </div>
                   </div>
                </div>
                
                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                         {[1, 2, 3, 4].map(i => (
                           <div key={i} className="size-10 rounded-full border-2 border-background-dark bg-cover bg-center ring-1 ring-primary/20" style={{ backgroundImage: `url(https://picsum.photos/id/${i+30}/100/100)` }} />
                         ))}
                      </div>
                      <p className="text-[10px] text-text-dim font-bold uppercase tracking-[2px]">Junte-se a <span className="text-white">+850</span> traders</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-success">lock</span>
                      <p className="text-[10px] text-success font-black uppercase tracking-[2px]">Pagamento Seguro</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-background-dark/80 backdrop-blur-xl animate-in fade-in duration-300" 
            onClick={() => setShowRegisterModal(false)}
          ></div>
          
          <div className="relative w-full max-w-[500px] bg-surface-dark border border-white/10 rounded-[40px] p-8 md:p-12 shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full -mr-20 -mt-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white font-display uppercase tracking-tight italic">Comece sua <span className="text-primary">Evolução</span></h3>
                  <p className="text-[10px] text-text-dim font-black uppercase tracking-[3px]">7 dias de acesso total ao Fluxo Real</p>
                </div>
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-dim hover:text-white hover:bg-white/10 transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dim group-focus-within:text-primary transition-colors">person</span>
                    <input 
                      type="text" 
                      required
                      value={regData.name}
                      onChange={(e) => setRegData({...regData, name: e.target.value})}
                      placeholder="Ex: Carlos Silva"
                      className="w-full h-14 pl-14 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">E-mail Profissional</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dim group-focus-within:text-primary transition-colors">mail</span>
                    <input 
                      type="email" 
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({...regData, email: e.target.value})}
                      placeholder="contato@exemplo.com"
                      className="w-full h-14 pl-14 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">WhatsApp</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dim group-focus-within:text-primary transition-colors">call</span>
                    <input 
                      type="tel" 
                      required
                      value={regData.whatsapp}
                      onChange={(e) => setRegData({...regData, whatsapp: e.target.value})}
                      placeholder="(00) 00000-0000"
                      className="w-full h-14 pl-14 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Senha do Terminal</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-dim group-focus-within:text-primary transition-colors">lock</span>
                    <input 
                      type="password" 
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({...regData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full h-14 pl-14 bg-background-dark border border-white/5 rounded-2xl focus:border-primary focus:ring-primary transition-all text-white text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full h-16 bg-primary text-background-dark font-black rounded-2xl text-lg uppercase tracking-widest font-display shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Criar Minha Conta
                    <span className="material-symbols-outlined">rocket_launch</span>
                  </button>
                  <p className="text-[9px] text-center text-text-dim mt-4 uppercase tracking-widest">Ao clicar, você concorda com nossos Termos de Uso.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
