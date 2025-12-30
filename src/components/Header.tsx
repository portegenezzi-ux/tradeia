
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border-dark bg-background-dark/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-text-secondary hover:text-white transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden sm:flex items-center h-10 w-64 bg-surface-dark border border-border-dark rounded-lg px-3 group focus-within:border-primary transition-all">
          <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Buscar ativo ou operação..." 
            className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-text-secondary w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 mr-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Status do Mercado</span>
            <span className="text-xs text-success font-bold flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success animate-pulse"></span>
              Aberto
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/new-trade')}
          className="flex items-center gap-2 h-10 px-6 bg-primary hover:bg-primary-hover text-background-dark font-bold text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(13,185,242,0.3)]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="hidden sm:inline">Nova Operação</span>
        </button>

        <button className="relative p-2 text-text-secondary hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
