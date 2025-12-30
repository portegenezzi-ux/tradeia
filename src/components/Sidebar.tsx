
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'user';
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole, onLogout }) => {
  const [profileImage, setProfileImage] = useState<string>('https://picsum.photos/id/64/100/100');
  const [userName, setUserName] = useState<string>(userRole === 'admin' ? 'Admin' : 'Carlos Silva');

  useEffect(() => {
    const updateProfile = () => {
      const savedImage = localStorage.getItem('user_profile_image');
      const savedName = localStorage.getItem('user_name');
      if (savedImage) setProfileImage(savedImage);
      if (savedName && userRole !== 'admin') setUserName(savedName);
    };

    updateProfile();
    window.addEventListener('profile_updated', updateProfile);
    window.addEventListener('profile_image_updated', updateProfile);

    return () => {
      window.removeEventListener('profile_updated', updateProfile);
      window.removeEventListener('profile_image_updated', updateProfile);
    };
  }, [userRole]);

  // Filtrar itens de navegação baseado no papel do usuário
  const filteredNavItems = NAV_ITEMS.filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-72 glass border-r border-white/5 z-50 transition-all duration-500 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-2 rounded-xl bg-primary/20 neon-border">
              <span className="material-symbols-outlined text-[32px] text-primary">candlestick_chart</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white font-display uppercase italic">Fluxo<span className="text-primary">Real</span></h1>
          </div>

          <nav className="flex-1 flex flex-col gap-3">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.id === 'dashboard' ? '/' : `/${item.id}`}
                onClick={() => onClose()}
                className={({ isActive }) => `
                  group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300
                  ${isActive
                    ? 'bg-primary text-background-dark font-black shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'text-text-dim hover:bg-white/5 hover:text-white'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-4">
                      <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'fill' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-bold tracking-wide">{item.label}</span>
                    </div>
                    {item.id === 'flow' && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${isActive ? 'bg-background-dark/20 border-background-dark/30 text-background-dark' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                        VIVO
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all duration-300 cursor-pointer">
              <div className="relative">
                <div
                  className="size-12 rounded-2xl bg-cover bg-center ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all"
                  style={{ backgroundImage: `url(${profileImage})` }}
                />
                <div className="absolute -bottom-1 -right-1 size-4 bg-success border-2 border-background-dark rounded-full shadow-lg"></div>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate font-display">{userName}</p>
                <p className="text-[10px] text-primary uppercase font-black tracking-tighter">{userRole === 'admin' ? 'System Operator' : 'Pro Strategist'}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-4 w-full px-5 py-4 mt-6 text-text-dim hover:text-danger transition-colors font-bold text-sm"
            >
              <span className="material-symbols-outlined">logout</span>
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
